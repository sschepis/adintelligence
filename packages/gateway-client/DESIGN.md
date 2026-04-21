# @concentrik/gateway-client — Design Doc

## Purpose
Single, opinionated client for the Lovable AI Gateway used by every other `@concentrik/*` package. Centralizes auth, retries, streaming, JSON-mode parsing, tool-call orchestration, and observability so domain packages stay focused on prompts and schemas.

## Why a separate package
- Avoids duplicating fetch/SSE/JSON-extraction code across 8+ edge-function-derived packages.
- One place to swap models, add caching, add cost accounting, or rotate to another provider.
- Domain packages depend only on `GatewayClient` interface — easy to mock in tests.

## Public API
- `GatewayClient(config)` — constructed with `LOVABLE_API_KEY`.
- `.chat(opts) -> string` — non-streaming text completion.
- `.chatJSON<T>(opts) -> T` — enforces `response_format: json_object`, runs a tolerant JSON extractor (handles ```json fences, leading prose), validates with optional Zod schema.
- `.stream(opts) -> AsyncIterable<StreamEvent>` — SSE parser yielding `{type: 'token'|'tool_call'|'stage'|'done'|'error'}`. `stage` events are domain-defined (e.g. brand ingestion stages).
- `parseSSE(chunk)` — pure function for consumers wiring their own transports.

## Cross-cutting concerns
1. **Retries**: exponential backoff on 429/5xx, surface 402 (out of credits) immediately.
2. **Timeouts**: per-request `AbortController`; default 60s, streaming 120s.
3. **Cost accounting**: optional `onUsage(tokens, model)` hook for billing/usage analytics.
4. **Caching**: pluggable `cache: KVStore` interface, keyed by `(model, hash(messages))`.
5. **Tool-calls**: built-in loop that auto-invokes registered tool handlers and feeds results back to the model up to `maxToolHops` (default 5).
6. **Logging**: structured logger interface; default no-op.

## Models
Defaults to `google/gemini-2.5-flash`. Domain packages override per-task (e.g. `gemini-2.5-pro` for video planning, `gemini-2.5-flash-lite` for classification).

## Edge-function compatibility
Designed to run in **both** Deno (Supabase edge functions) and Node/browser. Uses `globalThis.fetch` and Web Streams only — no Node-specific imports.

## Testing
- Mock transport via `{ fetch }` injection.
- Golden-file tests for SSE parser against captured Gateway responses.

## Out of scope
- Provider routing / fallback (handled by Gateway itself).
- Embeddings (separate `@concentrik/embeddings` if ever needed).

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
