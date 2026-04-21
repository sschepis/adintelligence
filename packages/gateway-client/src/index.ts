// @concentrik/gateway-client — STUB
// See ../SHARED_DESIGN.md for cross-package conventions (models, streaming, errors).

import type { StreamEvent, ToolDefinition } from "@concentrik/shared";

export type { StreamEvent, ToolDefinition } from "@concentrik/shared";

export interface GatewayClientConfig {
  apiKey: string;
  baseUrl?: string; // defaults to https://ai.gateway.lovable.dev/v1
  defaultModel?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export type ChatRole = "system" | "user" | "assistant" | "tool";
export interface ChatMessage { role: ChatRole; content: string; name?: string; tool_call_id?: string; }

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  responseFormat?: "text" | "json";
  tools?: ToolDefinition[];
  signal?: AbortSignal;
}

export class GatewayClient {
  constructor(_config: GatewayClientConfig) { /* STUB */ }
  async chat(_opts: ChatCompletionOptions): Promise<string> { throw new Error("STUB"); }
  async chatJSON<T>(_opts: ChatCompletionOptions): Promise<T> { throw new Error("STUB"); }
  stream(_opts: ChatCompletionOptions): AsyncIterable<StreamEvent> { throw new Error("STUB"); }
}

export function parseSSE(_chunk: string): StreamEvent[] { throw new Error("STUB"); }
