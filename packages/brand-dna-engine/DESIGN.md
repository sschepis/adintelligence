# @concentrik/brand-dna-engine — Design Doc

## Purpose
End-to-end Brand DNA pipeline: crawl a website → extract voice, personality, story, guardrails, taxonomy → persist a re-derivable raw profile → score new content for consistency and detect drift over time.

## Edge functions consolidated
- `scan-website`
- `brand-ingestion-agent`
- `analyze-brand-voice`
- `score-brand-consistency`
- `rederive-from-raw-profile`

## Public API
```ts
const engine = new BrandDNAEngine(gateway);

// Initial ingestion (streamed stages: crawl → parse → voice → personality → story → done)
const profile = await engine.ingestWebsite("https://acme.com", { stream: true });

// Re-derive new fields without re-crawling (uses persisted rawProfile)
const updated = await engine.deriveFromRaw(profile.rawProfile);

// Score generated copy against the brand
const score = await engine.scoreConsistency("Buy now…", profile);

// Periodic drift check (compare last week vs baseline)
const level = await engine.detectDrift(recent, baseline);
```

## Architecture
1. **Crawler adapter**: wraps `@sschepis/brand-ingestor` or `firecrawl` behind a `Crawler` interface. Returns `RawProfile` (HTML, text blocks, images, meta).
2. **Stage pipeline**: each stage is a pure function `(input, gateway) -> output`, allowing reuse and unit testing. Stages emit progress events via the gateway's stream channel.
3. **Persistence-friendly**: `rawProfile` is JSON-serializable so the host app can store it (in this app: `brands.raw_profile` JSONB) and call `deriveFromRaw` later when prompts evolve — no recrawl needed.
4. **Scoring**: structured JSON output validated by Zod. Returns granular sub-scores so UI can render breakdowns.
5. **Drift detection**: vector-free heuristic (token overlap + LLM judge) by default; pluggable embedding strategy when `embeddings` adapter is provided.

## Streaming stages
`brief-parsed`, `crawl-progress`, `voice-extracted`, `personality-extracted`, `story-extracted`, `guardrails-extracted`, `taxonomy-extracted`, `done`.

## Models
- Crawl-summary: `gemini-2.5-flash`
- Voice/personality extraction: `gemini-2.5-pro` (nuance matters)
- Consistency scoring: `gemini-2.5-flash`

## Out of scope
- Color/theme extraction (lives in host app's brand theme module — could become `@concentrik/brand-theme` later).
- Storage; package is stateless.

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
