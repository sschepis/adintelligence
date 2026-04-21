# @concentrik/campaigns-optimizer — Design Doc

## Purpose
Closed-loop campaign optimization: simulate before launch, suggest live changes after launch, recommend when to post, and summarize what happened.

## Edge functions consolidated
- `campaign-morph-suggestions`
- `simulate-focus-group`
- `optimal-timing`
- `generate-performance-report`
- `send-competitor-digest`

## Public API
```ts
const opt = new CampaignsOptimizer(gateway);
const morphs = await opt.morphSuggestions({ campaign, recentMetrics, brandDNA });
const sim = await opt.simulateFocusGroup({ ad, personas });
const timing = await opt.optimalTiming({ platform: "instagram", targetAudience, timezone });
const report = await opt.generatePerformanceReport({ campaign, metrics, period: "7d" });
```

## Architecture
- **Morph suggestions**: takes recent perf snapshot + brand DNA, returns ranked changes per axis (`headline`, `body`, `cta`, `image`, `audience`, `budget`) with `expectedLift` for UI sorting. Designed to feed an A/B scheduler.
- **Focus-group simulation**: persona-based reaction model. Each persona produces a `quote`, `intentToBuy` score, and `objections[]`. Aggregated into `overallScore` + `recommendation`. Personas can be hand-built or pulled from `personas` table.
- **Optimal timing**: hybrid — historical data drives a per-day/per-hour heatmap; LLM produces explanation and platform-specific best practices (e.g. IG Reels late evening, LinkedIn weekday mornings).
- **Performance report**: scheduled summary writer; outputs wins/losses/next-actions structured for email or in-app inbox.
- **Competitor digest**: weekly summary of competitor activity using outputs from `@concentrik/signals-trend-intel`.

## Why grouped
All five operate on a single conceptual entity — *a live or planned campaign* — and share inputs (campaign config, metrics, personas, brand DNA). Splitting forces the host to wire the same context 5 times.

## Models
- Morph: `gemini-2.5-pro` (multi-factor reasoning)
- Simulation: `gpt-5` (persona role-play quality)
- Timing: `gemini-2.5-flash`
- Reports: `gemini-2.5-flash`

## Out of scope
- Ad platform APIs (Meta/Google) — host app's deployment layer.
- Budget pacing math (could become `@concentrik/pacing` if it grows).

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
