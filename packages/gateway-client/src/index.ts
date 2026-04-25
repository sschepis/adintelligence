// @concentrik/gateway-client — Lovable AI Gateway client
// See ../SHARED_DESIGN.md for cross-package conventions.

import {
  MODELS,
  extractJSON,
  GatewayError,
  RateLimitError,
  CreditsExhaustedError,
} from "@concentrik/shared";
import type { StreamEvent, ToolDefinition } from "@concentrik/shared";

export type { StreamEvent, ToolDefinition } from "@concentrik/shared";

export interface GatewayClientConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export type ChatRole = "system" | "user" | "assistant" | "tool";
export interface ChatMessage {
  role: ChatRole;
  content: string | Array<{ type: string; [key: string]: unknown }>;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  responseFormat?: "text" | "json";
  tools?: ToolDefinition[];
  toolChoice?: unknown;
  signal?: AbortSignal;
  modalities?: string[];
}

const DEFAULT_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MAX_TOOL_HOPS = 5;
const STREAM_TIMEOUT_MS = 120_000;

export class GatewayClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: GatewayClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.defaultModel = config.defaultModel ?? MODELS.FAST;
    this.timeoutMs = config.timeoutMs ?? 60_000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async chat(opts: ChatCompletionOptions): Promise<string> {
    const body = this._buildBody(opts);
    const data = await this._request(body, opts.signal);

    const message = data.choices?.[0]?.message;
    if (!message) throw new GatewayError("No choices in response", 502);

    if (message.tool_calls?.length && opts.tools?.length) {
      return this._handleToolCallLoop(message, opts);
    }

    return message.content ?? "";
  }

  async chatJSON<T>(opts: ChatCompletionOptions): Promise<T> {
    const body = this._buildBody(opts);
    body.response_format = { type: "json_object" };
    const data = await this._request(body, opts.signal);

    const message = data.choices?.[0]?.message;
    if (!message) throw new GatewayError("No choices in response", 502);

    if (message.tool_calls?.length && opts.tools?.length) {
      const content = await this._handleToolCallLoop(message, opts);
      return extractJSON<T>(content);
    }

    return extractJSON<T>(message.content ?? "{}");
  }

  async *stream(opts: ChatCompletionOptions): AsyncIterable<StreamEvent> {
    const body = this._buildBody(opts);
    body.stream = true;

    const timeout = opts.signal
      ? undefined
      : setTimeout(() => {}, STREAM_TIMEOUT_MS);
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    const composedSignal = opts.signal
      ? this._composeSignals(opts.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: composedSignal,
      });

      if (!response.ok) {
        this._throwForStatus(response.status, await response.text());
      }

      if (!response.body) {
        throw new GatewayError("No response body for stream", 502);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex: number;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          const events = parseSSE(rawEvent);
          for (const event of events) {
            yield event;
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
      if (timeout) clearTimeout(timeout);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private _buildBody(opts: ChatCompletionOptions): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: opts.model ?? this.defaultModel,
      messages: opts.messages,
    };
    if (opts.temperature !== undefined) body.temperature = opts.temperature;
    if (opts.tools?.length) {
      body.tools = opts.tools.map((t) => ({
        type: "function",
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }));
    }
    if (opts.toolChoice) body.tool_choice = opts.toolChoice;
    if (opts.modalities) body.modalities = opts.modalities;
    return body;
  }

  private async _request(
    body: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      const composedSignal = signal
        ? this._composeSignals(signal, controller.signal)
        : controller.signal;

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: composedSignal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return (await response.json()) as Record<string, unknown>;
        }

        const errorText = await response.text();
        const status = response.status;

        if (status === 402) {
          throw new CreditsExhaustedError();
        }

        if (status === 429) {
          lastError = new RateLimitError();
          if (attempt < this.maxRetries) {
            await this._backoff(attempt);
            continue;
          }
          throw lastError;
        }

        if (status >= 500) {
          lastError = new GatewayError(`Server error: ${status}`, status, errorText);
          if (attempt < this.maxRetries) {
            await this._backoff(attempt);
            continue;
          }
          throw lastError;
        }

        throw new GatewayError(`Request failed: ${status}`, status, errorText);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof CreditsExhaustedError) throw err;
        if (err instanceof RateLimitError && attempt >= this.maxRetries) throw err;
        if (err instanceof GatewayError && (err as GatewayError).status < 500 && (err as GatewayError).status !== 429) throw err;

        if ((err as Error).name === "AbortError") {
          throw new GatewayError("Request timed out", 408);
        }

        lastError = err as Error;
        if (attempt >= this.maxRetries) break;
        await this._backoff(attempt);
      }
    }

    throw lastError ?? new GatewayError("Request failed after retries", 500);
  }

  private async _handleToolCallLoop(
    message: Record<string, unknown>,
    opts: ChatCompletionOptions,
  ): Promise<string> {
    const messages = [...opts.messages, message as unknown as ChatMessage];

    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const toolCalls = (messages[messages.length - 1] as ChatMessage).tool_calls;
      if (!toolCalls?.length) {
        return (messages[messages.length - 1] as ChatMessage).content as string ?? "";
      }

      for (const tc of toolCalls) {
        messages.push({
          role: "tool",
          content: JSON.stringify({ status: "ok", note: "Tool execution handled by host" }),
          tool_call_id: tc.id,
        });
      }

      const body = this._buildBody({ ...opts, messages });
      const data = await this._request(body, opts.signal);
      const nextMessage = (data.choices as unknown[])?.[0] as Record<string, unknown> | undefined;
      const msg = (nextMessage as Record<string, unknown>)?.message as Record<string, unknown> | undefined;

      if (!msg) throw new GatewayError("No message in tool-call response", 502);
      messages.push(msg as unknown as ChatMessage);

      if (!(msg.tool_calls as unknown[])?.length) {
        return (msg.content as string) ?? "";
      }
    }

    const last = messages[messages.length - 1] as ChatMessage;
    return (last.content as string) ?? "";
  }

  private async _backoff(attempt: number): Promise<void> {
    const base = Math.min(1000 * Math.pow(2, attempt), 16000);
    const jitter = Math.random() * base * 0.5;
    await new Promise((r) => setTimeout(r, base + jitter));
  }

  private _composeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
    if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
      return (AbortSignal as unknown as { any: (s: AbortSignal[]) => AbortSignal }).any([a, b]);
    }
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    a.addEventListener("abort", onAbort);
    b.addEventListener("abort", onAbort);
    if (a.aborted || b.aborted) controller.abort();
    return controller.signal;
  }

  private _throwForStatus(status: number, body: string): never {
    if (status === 402) throw new CreditsExhaustedError();
    if (status === 429) throw new RateLimitError();
    throw new GatewayError(`Request failed: ${status}`, status, body);
  }
}

export function parseSSE(chunk: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  let eventType = "message";
  const dataLines: string[] = [];

  for (const line of chunk.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return events;

  const dataStr = dataLines.join("\n");

  if (dataStr === "[DONE]") {
    events.push({ type: "done" });
    return events;
  }

  try {
    const parsed = JSON.parse(dataStr);

    if (eventType === "stage") {
      events.push({ type: "stage", stage: parsed.stage ?? parsed.phase, data: parsed });
    } else if (eventType === "error") {
      events.push({ type: "error", data: parsed });
    } else {
      const delta = parsed.choices?.[0]?.delta;
      if (delta?.content) {
        events.push({ type: "token", data: delta.content });
      }
      if (delta?.tool_calls) {
        events.push({ type: "tool_call", data: delta.tool_calls });
      }
      if (parsed.choices?.[0]?.finish_reason === "stop") {
        events.push({ type: "done" });
      }
    }
  } catch {
    events.push({ type: "token", data: dataStr });
  }

  return events;
}
