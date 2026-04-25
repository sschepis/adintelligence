import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GatewayClient, parseSSE } from "../src";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CHAT_RESPONSE = {
  choices: [{ message: { role: "assistant", content: "Hello there!" } }],
};

describe("@concentrik/gateway-client", () => {
  it("constructs with config", () => {
    expect(() => new GatewayClient({ apiKey: "test" })).not.toThrow();
  });

  it("exposes the documented public surface", () => {
    const c = new GatewayClient({ apiKey: "test" });
    expect(typeof c.chat).toBe("function");
    expect(typeof c.chatJSON).toBe("function");
    expect(typeof c.stream).toBe("function");
  });

  describe("chat()", () => {
    it("extracts content from response", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(CHAT_RESPONSE));
      const c = new GatewayClient({ apiKey: "test-key" });
      const result = await c.chat({ messages: [{ role: "user", content: "hi" }] });
      expect(result).toBe("Hello there!");
      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain("/chat/completions");
      expect(init.headers.Authorization).toBe("Bearer test-key");
    });

    it("uses custom model when specified", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(CHAT_RESPONSE));
      const c = new GatewayClient({ apiKey: "key" });
      await c.chat({ model: "custom-model", messages: [{ role: "user", content: "hi" }] });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("custom-model");
    });
  });

  describe("chatJSON()", () => {
    it("parses JSON from fenced content", async () => {
      const resp = {
        choices: [{ message: { content: '```json\n{"name":"Acme"}\n```' } }],
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(resp));
      const c = new GatewayClient({ apiKey: "key" });
      const result = await c.chatJSON<{ name: string }>({
        messages: [{ role: "user", content: "test" }],
      });
      expect(result).toEqual({ name: "Acme" });
    });

    it("parses bare JSON from content", async () => {
      const resp = {
        choices: [{ message: { content: '{"value": 42}' } }],
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(resp));
      const c = new GatewayClient({ apiKey: "key" });
      const result = await c.chatJSON<{ value: number }>({
        messages: [{ role: "user", content: "test" }],
      });
      expect(result).toEqual({ value: 42 });
    });
  });

  describe("error handling", () => {
    it("throws CreditsExhaustedError on 402 without retry", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response("credits gone", { status: 402 }),
      );
      const c = new GatewayClient({ apiKey: "key", maxRetries: 3 });
      await expect(
        c.chat({ messages: [{ role: "user", content: "hi" }] }),
      ).rejects.toThrow("AI credits exhausted");
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it("retries on 429 then succeeds", async () => {
      mockFetch
        .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
        .mockResolvedValueOnce(jsonResponse(CHAT_RESPONSE));
      const c = new GatewayClient({ apiKey: "key", maxRetries: 3 });
      const result = await c.chat({ messages: [{ role: "user", content: "hi" }] });
      expect(result).toBe("Hello there!");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("retries on 500 then succeeds", async () => {
      mockFetch
        .mockResolvedValueOnce(new Response("server error", { status: 500 }))
        .mockResolvedValueOnce(jsonResponse(CHAT_RESPONSE));
      const c = new GatewayClient({ apiKey: "key", maxRetries: 3 });
      const result = await c.chat({ messages: [{ role: "user", content: "hi" }] });
      expect(result).toBe("Hello there!");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("throws GatewayError on 400 without retry", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response("bad request", { status: 400 }),
      );
      const c = new GatewayClient({ apiKey: "key", maxRetries: 3 });
      await expect(
        c.chat({ messages: [{ role: "user", content: "hi" }] }),
      ).rejects.toThrow("Request failed: 400");
      expect(mockFetch).toHaveBeenCalledOnce();
    });
  });

  describe("parseSSE()", () => {
    it("parses content delta", () => {
      const chunk = `data: {"choices":[{"delta":{"content":"Hello"}}]}`;
      const events = parseSSE(chunk);
      expect(events).toEqual([{ type: "token", data: "Hello" }]);
    });

    it("handles [DONE] signal", () => {
      const events = parseSSE("data: [DONE]");
      expect(events).toEqual([{ type: "done" }]);
    });

    it("skips comment lines", () => {
      const chunk = ": ping\ndata: [DONE]";
      const events = parseSSE(chunk);
      expect(events).toEqual([{ type: "done" }]);
    });

    it("handles stage events", () => {
      const chunk = 'event: stage\ndata: {"stage":"crawl-progress","data":{"percent":50}}';
      const events = parseSSE(chunk);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("stage");
      expect(events[0].stage).toBe("crawl-progress");
    });

    it("returns empty for no data lines", () => {
      expect(parseSSE(": just a comment")).toEqual([]);
    });

    it("handles finish_reason stop", () => {
      const chunk = `data: {"choices":[{"delta":{},"finish_reason":"stop"}]}`;
      const events = parseSSE(chunk);
      expect(events).toEqual([{ type: "done" }]);
    });
  });

  it("can be mocked for downstream tests", async () => {
    const fake = { chat: vi.fn().mockResolvedValue("ok") } as unknown as GatewayClient;
    await expect(fake.chat({ messages: [] })).resolves.toBe("ok");
  });
});
