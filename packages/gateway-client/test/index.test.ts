import { describe, it, expect, vi } from "vitest";
import { GatewayClient } from "../src";

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
  it("chat() rejects in stub state", async () => {
    const c = new GatewayClient({ apiKey: "test" });
    await expect(c.chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow("STUB");
  });
  it("can be mocked for downstream tests", async () => {
    const fake = { chat: vi.fn().mockResolvedValue("ok") } as unknown as GatewayClient;
    await expect(fake.chat({ messages: [] })).resolves.toBe("ok");
  });
});
