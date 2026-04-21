// @concentrik/assistant-conversational — STUB
import type { GatewayClient, ChatMessage, ToolDefinition } from "@concentrik/gateway-client";

export interface AssistantContext { brandDNA?: unknown; campaignId?: string; pageContext?: string; }
export interface AssistantTurn { reply: string; reasoning?: string; toolCallsUsed: string[]; }

export interface AnalyticsAnswer { answer: string; chart?: { type: "line" | "bar" | "pie"; series: unknown[] }; sql?: string; assumptions: string[]; }

export interface VoiceBrief { rawTranscript: string; brief: { goal: string; audience: string; product: string; tone: string; deliverables: string[] }; }

export class ConversationalAssistant {
  constructor(private _gateway: GatewayClient, private _tools: ToolDefinition[] = []) {}
  async chat(_history: ChatMessage[], _ctx: AssistantContext): Promise<AssistantTurn> { throw new Error("STUB"); }
  async ask(_question: string, _data: { schema: unknown; rows: unknown[] }): Promise<AnalyticsAnswer> { throw new Error("STUB"); }
  async transcribeVoiceToBrief(_audio: Blob | ArrayBuffer): Promise<VoiceBrief> { throw new Error("STUB"); }
}
