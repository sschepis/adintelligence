import { describe, it, expect } from "vitest";
import { ConversationalAssistant } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/assistant-conversational", () => {
  it("instantiates with empty tool registry", () => {
    expect(() => new ConversationalAssistant(mockGateway)).not.toThrow();
  });
  it("instantiates with tools", () => {
    expect(() => new ConversationalAssistant(mockGateway, [{ name: "t", description: "d", parameters: {} }])).not.toThrow();
  });
  it("exposes all documented methods", () => {
    const a = new ConversationalAssistant(mockGateway);
    for (const m of ["chat", "ask", "transcribeVoiceToBrief"]) {
      expect(typeof (a as any)[m]).toBe("function");
    }
  });
});
