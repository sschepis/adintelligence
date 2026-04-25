// @concentrik/assistant-conversational — Glass-box assistant, analytics, voice-to-brief
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient, ChatMessage } from "@concentrik/gateway-client";
import type { ToolDefinition } from "@concentrik/shared";
import { MODELS, safeParse } from "@concentrik/shared";

export interface AssistantContext {
  brandDNA?: unknown;
  campaignId?: string;
  pageContext?: string;
}

export interface AssistantTurn {
  reply: string;
  reasoning?: string;
  toolCallsUsed: string[];
}

export interface AnalyticsAnswer {
  answer: string;
  chart?: { type: "line" | "bar" | "pie"; series: unknown[] };
  sql?: string;
  assumptions: string[];
}

export interface VoiceBrief {
  rawTranscript: string;
  brief: { goal: string; audience: string; product: string; tone: string; deliverables: string[] };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const AssistantTurnSchema = z.object({
  reply: z.string(),
  reasoning: z.string().optional(),
  toolCallsUsed: z.array(z.string()),
});

const AnalyticsAnswerSchema = z.object({
  answer: z.string(),
  chart: z.object({
    type: z.enum(["line", "bar", "pie"]),
    series: z.array(z.unknown()),
  }).optional(),
  sql: z.string().optional(),
  assumptions: z.array(z.string()),
});

const VoiceBriefSchema = z.object({
  goal: z.string(),
  audience: z.string(),
  product: z.string(),
  tone: z.string(),
  deliverables: z.array(z.string()),
});

// ── Main class ──────────────────────────────────────────────────────────

export class ConversationalAssistant {
  constructor(
    private _gateway: GatewayClient,
    private _tools: ToolDefinition[] = [],
  ) {}

  async chat(history: ChatMessage[], ctx: AssistantContext): Promise<AssistantTurn> {
    const systemParts = [
      "You are an AI assistant for a commerce intelligence platform. Be helpful, concise, and transparent about your reasoning.",
      "Always explain your reasoning process so the user can understand how you arrived at your answer.",
    ];

    if (ctx.brandDNA) {
      systemParts.push(`\nActive brand context:\n${JSON.stringify(ctx.brandDNA)}`);
    }
    if (ctx.pageContext) {
      systemParts.push(`\nUser is currently on: ${ctx.pageContext}`);
    }
    if (ctx.campaignId) {
      systemParts.push(`\nActive campaign: ${ctx.campaignId}`);
    }

    systemParts.push(`\nRespond with JSON: { "reply": "your response", "reasoning": "your reasoning process", "toolCallsUsed": ["list of tools used, if any"] }`);

    const messages: ChatMessage[] = [
      { role: "system", content: systemParts.join("\n") },
      ...history,
    ];

    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages,
      tools: this._tools.length ? this._tools : undefined,
      temperature: 0.7,
    });

    return safeParse(AssistantTurnSchema, result);
  }

  async ask(question: string, data: { schema: unknown; rows: unknown[] }): Promise<AnalyticsAnswer> {
    const sampleRows = data.rows.slice(0, 20);

    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.REASONING,
      messages: [
        {
          role: "system",
          content: `You are an AI analytics assistant. Answer questions about tabular data by analyzing the provided schema and rows. Generate internal SQL-style queries to answer, but return natural language answers.

Return JSON:
{
  "answer": "natural language answer to the question",
  "chart": { "type": "line|bar|pie", "series": [...data points...] } (optional, include if data is best shown visually),
  "sql": "the internal query you used" (optional),
  "assumptions": ["list any assumptions you made about the data"]
}`,
        },
        {
          role: "user",
          content: `Data schema:\n${JSON.stringify(data.schema)}\n\nSample rows (${sampleRows.length} of ${data.rows.length}):\n${JSON.stringify(sampleRows)}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.3,
    });

    return safeParse(AnalyticsAnswerSchema, result);
  }

  async transcribeVoiceToBrief(audio: Blob | ArrayBuffer): Promise<VoiceBrief> {
    const buffer = audio instanceof Blob ? await audio.arrayBuffer() : audio;
    const bytes = new Uint8Array(buffer);
    const chunks: string[] = [];
    for (let i = 0; i < bytes.length; i += 8192) {
      chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
    }
    const audioData = btoa(chunks.join(""));

    const transcriptResult = await this._gateway.chat({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: "Transcribe the audio content. Return only the raw transcript text.",
        },
        {
          role: "user",
          content: `[Audio data provided as base64: ${audioData.slice(0, 100)}...]\n\nPlease transcribe this audio.`,
        },
      ],
      temperature: 0.1,
    });

    const briefResult = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `Extract a structured campaign brief from this spoken transcript. Return JSON:
{
  "goal": "campaign objective",
  "audience": "target audience description",
  "product": "product or service being promoted",
  "tone": "desired creative tone",
  "deliverables": ["list of requested deliverables"]
}`,
        },
        {
          role: "user",
          content: `Transcript:\n"${transcriptResult}"`,
        },
      ],
      temperature: 0.3,
    });

    const brief = safeParse(VoiceBriefSchema, briefResult);
    return { rawTranscript: transcriptResult, brief };
  }
}
