# @concentrik/assistant-conversational — Design Doc

## Purpose
Conversational surfaces of the platform: the in-app "Glass Box" assistant, natural-language analytics ("why did revenue drop last week?"), and voice → structured brief transcription.

## Edge functions consolidated
- `glass-box-chat`
- `conversational-analytics`
- `voice-to-brief`

## Public API
```ts
const assistant = new ConversationalAssistant(gateway, tools);
const turn = await assistant.chat(history, { brandDNA, pageContext: "campaign-detail" });
const answer = await assistant.ask("compare CTR by platform last 30d", { schema, rows });
const brief = await assistant.transcribeVoiceToBrief(audioBlob);
```

## Architecture
- **Glass-box transparency**: every reply includes `reasoning` and `toolCallsUsed` so the UI can show *why* the assistant said what it said. Builds user trust and aids debugging.
- **Tool registry**: callers pass `ToolDefinition[]` (e.g. `getCampaignMetrics`, `searchTrends`). Gateway client handles the tool-call loop; this package owns the registry surface.
- **Conversational analytics**: takes a tabular dataset + schema, generates an SQL-style query (or pandas-style transform) internally, and returns a natural-language answer with optional chart spec. Returns explicit `assumptions[]` so the user can correct.
- **Voice-to-brief**: 2-stage — (1) STT via Gateway audio endpoint, (2) LLM extracts structured fields. Output ready to feed into `@concentrik/creative-video-planner` or `@concentrik/creative-copy-forge`.

## Models
- Chat: `gemini-2.5-pro` (reasoning + tools)
- Analytics: `gpt-5` (best at SQL/data reasoning)
- STT: Gateway-hosted STT (Whisper-class)
- Brief extraction: `gemini-2.5-flash`

## Out of scope
- Persistent conversation storage (host app DB).
- Authentication (gateway handles).

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
