import { describe, it, expect, vi } from "vitest";
import { ConversationalAssistant } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

describe("@concentrik/assistant-conversational", () => {
  it("instantiates with empty tool registry", () => {
    expect(() => new ConversationalAssistant(createMockGateway())).not.toThrow();
  });

  it("instantiates with tools", () => {
    expect(() => new ConversationalAssistant(createMockGateway(), [
      { name: "t", description: "d", parameters: {} },
    ])).not.toThrow();
  });

  it("exposes all documented methods", () => {
    const a = new ConversationalAssistant(createMockGateway());
    for (const m of ["chat", "ask", "transcribeVoiceToBrief"]) {
      expect(typeof (a as any)[m]).toBe("function");
    }
  });

  describe("chat", () => {
    it("returns AssistantTurn with reply and reasoning", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        reply: "Here is your answer",
        reasoning: "I analyzed the data and found...",
        toolCallsUsed: [],
      });
      const a = new ConversationalAssistant(gw);
      const result = await a.chat(
        [{ role: "user", content: "What are today's trends?" }],
        { pageContext: "dashboard" },
      );
      expect(result.reply).toBe("Here is your answer");
      expect(result.reasoning).toContain("analyzed");
      expect(result.toolCallsUsed).toEqual([]);
    });

    it("passes tools to gateway when configured", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        reply: "Done", reasoning: "", toolCallsUsed: ["search"],
      });
      const tools = [{ name: "search", description: "Search trends", parameters: {} }];
      const a = new ConversationalAssistant(gw, tools);
      await a.chat([{ role: "user", content: "Search" }], {});
      const call = (gw.chatJSON as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.tools).toEqual(tools);
    });
  });

  describe("ask", () => {
    it("returns analytics answer with assumptions", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        answer: "Revenue increased by 15%",
        assumptions: ["Assumed Q1 baseline"],
        sql: "SELECT SUM(revenue) FROM sales",
      });
      const a = new ConversationalAssistant(gw);
      const result = await a.ask("How much did revenue grow?", {
        schema: { columns: ["date", "revenue"] },
        rows: [{ date: "2026-01", revenue: 100 }],
      });
      expect(result.answer).toContain("15%");
      expect(result.assumptions).toHaveLength(1);
    });
  });

  describe("transcribeVoiceToBrief", () => {
    it("returns transcript and structured brief", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce("I want to create a shoe ad for young women");
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        goal: "sell shoes",
        audience: "women 18-25",
        product: "sneakers",
        tone: "energetic",
        deliverables: ["video ad", "social posts"],
      });
      const a = new ConversationalAssistant(gw);
      const audio = new ArrayBuffer(8);
      const result = await a.transcribeVoiceToBrief(audio);
      expect(result.rawTranscript).toContain("shoe ad");
      expect(result.brief.goal).toBe("sell shoes");
      expect(result.brief.deliverables).toHaveLength(2);
    });
  });
});
