# @concentrik/signals-trend-intel — Design Doc

## Purpose
Turns raw social/search signals into actionable intelligence: what trend is this, where in its lifecycle, who else is playing, where are the gaps.

## Edge functions consolidated
- `analyze-trend`
- `predict-trend-lifecycle`
- `competitor-analysis`
- `market-gap-detection`
- `share-of-voice`

## Public API
```ts
const intel = new TrendIntel(gateway);
const a = await intel.analyzeTrend("mob wife aesthetic", "tiktok", ["#mobwife"]);
const lc = await intel.predictLifecycle(weeklyVolume);
const comp = await intel.analyzeCompetitors({ domains, ads, industry });
const gaps = await intel.detectMarketGaps({ trends, inventory });
const sov = await intel.shareOfVoice("acme", ["nike", "adidas"]);
```

## Architecture
- **Signal adapters**: thin wrappers over Apify (TikTok/IG/X), DataForSeo (search), Rainforest (Amazon). Adapters are injected — package stays unopinionated about data source.
- **Lifecycle classifier**: hybrid of statistical (rolling slope, z-score on weekly volume) + LLM judge for narrative context. Statistical-only fast path when `gateway` is omitted.
- **Competitor analysis**: deduped LLM pass over ad copy / domains, returns positioning, common themes, dominant CTAs, and differentiation opportunities (mirrors current `competitor-analysis` schema).
- **Gap detection**: cross-references trend categories vs inventory taxonomy; LLM ranks opportunities; returns `priority` for UI sorting.
- **Share of voice**: counts mentions across adapter outputs, normalizes to 100%.

## Why one package
All five share the same data sources and prompt scaffolding around "fashion/commerce trend reasoning." Splitting further would force every consumer to import 4 packages.

## Models
- Trend analysis: `gemini-2.5-flash` (fast iteration)
- Competitor analysis: `gemini-2.5-pro` (multi-doc reasoning)
- Lifecycle: statistical first; `gemini-2.5-flash-lite` for narrative wrap

## Caching
Trend analyses are cached for 24h keyed by `(trendName, platform)`. Lifecycle predictions invalidate when new weekly data arrives.

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
