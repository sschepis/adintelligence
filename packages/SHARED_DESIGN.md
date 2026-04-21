# @concentrik — Shared Conventions

This document defines the cross-package contracts every `@concentrik/*` package MUST follow. Each package's `DESIGN.md` links here.

## 1. Models — canonical names

Always import from `@concentrik/shared`:

```ts
import { MODELS } from "@concentrik/shared";
gateway.chat({ model: MODELS.PRO, ... });
```

| Constant | Model ID | Use for |
|---|---|---|
| `MODELS.FAST` | `google/gemini-2.5-flash` | Default, short generations, scoring |
| `MODELS.FAST_LITE` | `google/gemini-2.5-flash-lite` | Bulk classification, variant fan-out |
| `MODELS.PRO` | `google/gemini-2.5-pro` | Multi-doc reasoning, structured plans, vision |
| `MODELS.REASONING` | `openai/gpt-5` | SQL/analytics, persona role-play |
| `MODELS.REASONING_MINI` | `openai/gpt-5-mini` | Cost-balanced reasoning |
| `MODELS.IMAGE_FAST` | `google/gemini-3.1-flash-image-preview` | Quick image generation |
| `MODELS.IMAGE_PRO` | `google/gemini-3-pro-image-preview` | Hero/storyboard imagery |

Packages MAY override defaults but MUST NOT hardcode raw model strings.

## 2. Tool-call shape

Every tool definition uses `ToolDefinitionSchema`:

```ts
{ name: "getCampaignMetrics",
  description: "Returns CTR/CPM/conversions for a campaign id over a date range.",
  parameters: { /* JSON Schema */ } }
```

The Gateway client runs the tool-call loop. Domain packages register tools; they do NOT implement the loop themselves.

## 3. Streaming events

All streamed APIs yield `StreamEvent`:

```ts
{ type: "token" | "stage" | "tool_call" | "done" | "error",
  stage?: string,        // domain-defined, kebab-case
  data?: unknown }
```

**Stage naming convention** (kebab-case, past-tense for completion stages):
- `brief-parsed`, `dna-extracted`, `shots-generated`, `validated`, `done`
- Errors: `type: "error"`, `data: { code, message }`

## 4. Errors

Throw typed errors from `@concentrik/shared`:
- `GatewayError(status)` — transport/AI errors
- `RateLimitError` — 429
- `CreditsExhaustedError` — 402 (surface to user)
- `ValidationError(issues[])` — schema/business rule failures
- `ConcentrikError` — base class

Never throw plain `Error` from public APIs.

## 5. Schema validation

All public methods that produce structured data MUST validate output with a Zod schema using `safeParse(schema, data)` before returning. This is what gives consumers the right to trust types at the boundary.

## 6. JSON extraction

Use `extractJSON(content)` from `@concentrik/shared` instead of inline regex. It handles ```json fences and bare object literals.

## 7. Statelessness

Packages are stateless. Persistence (DB, cache, storage) is the host app's concern. Pluggable interfaces (`Cache`, `Logger`) MAY be accepted via constructor.

## 8. Versioning

Semver. Breaking changes to Zod schemas in `@concentrik/shared` bump major across all consumers.
