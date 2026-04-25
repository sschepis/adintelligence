# @instinctsai — Package Index

Modular AI packages for trend-driven commerce. All packages share conventions defined in [SHARED_DESIGN.md](./SHARED_DESIGN.md) (models, tool-calls, streaming, errors).

## Foundation

### [@instinctsai/shared](./shared/) — common schemas, errors, constants
Zod schemas (BrandProfile, StreamEvent, ToolDefinition), error classes (`GatewayError`, `ValidationError`, `RateLimitError`, `CreditsExhaustedError`), model name constants (`MODELS.*`), and `extractJSON`/`safeParse` utilities.

### [@instinctsai/gateway-client](./gateway-client/DESIGN.md) — Lovable AI Gateway client
Single client used by every other package. Handles auth, retries, streaming SSE, JSON-mode parsing, and the tool-call loop.

```ts
const gateway = new GatewayClient({ apiKey: process.env.LOVABLE_API_KEY! });
const text = await gateway.chat({ model: MODELS.FAST, messages: [{ role: "user", content: "hi" }] });
const json = await gateway.chatJSON<{ ok: boolean }>({ messages, responseFormat: "json" });
for await (const ev of gateway.stream({ messages })) { /* token | stage | done */ }
```

---

## Brand & Signals

### [@instinctsai/brand-dna-engine](./brand-dna-engine/DESIGN.md) — brand voice, personality, story, scoring
Crawls a website and extracts structured brand DNA; scores arbitrary content for consistency; detects drift.

```ts
const profile = await engine.ingestWebsite("https://acme.com", { stream: true });
const refreshed = await engine.deriveFromRaw(profile.rawProfile);
const voice = await engine.analyzeVoice(["tagline 1", "tagline 2"]);
const score = await engine.scoreConsistency("Buy now…", profile);   // overall + breakdown + violations
const drift = await engine.detectDrift(recent, baseline);            // none|minor|moderate|significant
```

### [@instinctsai/signals-trend-intel](./signals-trend-intel/DESIGN.md) — trends, lifecycle, competitors, gaps
Turns raw social/search signals into trend analyses, lifecycle predictions, competitor reports, market gaps, and share-of-voice.

```ts
const a = await intel.analyzeTrend("mob wife aesthetic", "tiktok", ["#mobwife"]);
const lc = await intel.predictLifecycle(weeklyVolume);   // emerging|rising|peak|declining|dead
const comp = await intel.analyzeCompetitors({ domains, ads, industry });
const gaps = await intel.detectMarketGaps({ trends, inventory });
const sov = await intel.shareOfVoice("acme", ["nike", "adidas"]);
```

---

## Commerce

### [@instinctsai/commerce-demand-ai](./commerce-demand-ai/DESIGN.md) — forecasts, pricing, planning, manufacturing
Hybrid statistical+LLM forecasting, dynamic pricing recommendations, per-SKU demand plans, and tech-pack-ready manufacturing briefs.

```ts
const f = await demand.forecastRevenue({ history, horizonWeeks: 12, trendBoost: 0.15 });
const p = await demand.recommendPrice({ product, demandSignals, competitorPrices, inventoryLevel });
const plan = await demand.planDemand({ skus, salesHistory, trendSignals });
const brief = await demand.generateManufacturingBrief({ trendName, brandDNA, targetMarket });
```

---

## Creative

### [@instinctsai/creative-video-planner](./creative-video-planner/DESIGN.md) — Shotstack-compatible video manifests
Generates strict `ProductionManifest` from a brief + brand DNA, validates, analyzes timing (gaps/overlaps), retiles individual shots, exports to Shotstack JSON.

```ts
const manifest = await planner.plan({ brief, brandDNA, aspectRatio: "9:16", targetDuration: 30 }, { stream: true });
const v = planner.validate(manifest);              // { ok, issues[] }
const issues = planner.analyzeTiming(manifest);    // [{ kind: "overlap"|"gap", betweenShots, deltaSeconds }]
const fixed = planner.retileShot(manifest, 2);     // snap shot 2 to predecessor end + cascade
const ssJson = planner.toShotstack(manifest);
```

### [@instinctsai/creative-copy-forge](./creative-copy-forge/DESIGN.md) — brand-aware text generation
Single generation, axis-driven variants, targeted rewrites, and A/B-ready ad triplets — all with brand-DNA injection and guardrail post-filter.

```ts
const c = await copy.generate({ contentType: "ad-headline", brief, brandDNA, keywords });
const variants = await copy.generateVariants({ baseCopy: c.primary, count: 5, axis: "tone", brandDNA });
const rewritten = await copy.rewrite(text, "make it punchier", brandDNA);
const ads = await copy.smartABVariants({ headline, body, cta }, 4);
```

### [@instinctsai/creative-visual-forge](./creative-visual-forge/DESIGN.md) — image gen + vision analysis
Brand-consistent image generation, storyboard frames with style anchor, retry-only-failed-frames, and vision-based product image analysis.

```ts
const img = await visual.generate({ assetType: "hero", prompt, aspectRatio: "16:9", brandDNA });
const frame = await visual.generateStoryboardFrame({ shotPrompt, styleAnchor, aspectRatio: "9:16", brandDNA });
const retried = await visual.retryFailedFrames(failedShots, { aspectRatio: "9:16", styleAnchor });
const analysis = await visual.analyzeProductImage(url, trendColors); // colors, style, luxuryScore
```

---

## Conversation & Optimization

### [@instinctsai/assistant-conversational](./assistant-conversational/DESIGN.md) — chat, analytics Q&A, voice-to-brief
Glass-box assistant with reasoning + tool-calls visible, NL-to-data analytics with explicit assumptions, and voice → structured creative brief.

```ts
const turn = await assistant.chat(history, { brandDNA, pageContext: "campaign-detail" });
const answer = await assistant.ask("compare CTR by platform last 30d", { schema, rows });
const brief = await assistant.transcribeVoiceToBrief(audioBlob);
```

### [@instinctsai/campaigns-optimizer](./campaigns-optimizer/DESIGN.md) — morphs, simulation, timing, reports
Suggests live campaign morphs ranked by expected lift, simulates persona reactions before launch, recommends posting times, and produces performance reports + competitor digests.

```ts
const morphs = await opt.morphSuggestions({ campaign, recentMetrics, brandDNA });
const sim = await opt.simulateFocusGroup({ ad, personas });
const timing = await opt.optimalTiming({ platform: "instagram", targetAudience, timezone });
const report = await opt.generatePerformanceReport({ campaign, metrics, period: "7d" });
const digest = await opt.sendCompetitorDigest({ competitors, window: "7d" });
```

---

## Putting it together

See [`scripts/trend-to-shelf.ts`](../scripts/trend-to-shelf.ts) for an end-to-end mock flow that wires all nine packages from a trending hashtag to a manufacturing brief, copy, video manifest, and launch plan.
