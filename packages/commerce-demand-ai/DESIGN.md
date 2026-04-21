# @concentrik/commerce-demand-ai — Design Doc

## Purpose
Commerce decisions powered by AI: how much will we sell, at what price, when do we reorder, and what should the factory build next.

## Edge functions consolidated
- `forecast-revenue`
- `dynamic-pricing`
- `plan-demand`
- `generate-manufacturing-brief`

## Public API
```ts
const ai = new DemandAI(gateway);
const f = await ai.forecastRevenue({ history, horizonWeeks: 12, trendBoost: 0.15 });
const p = await ai.recommendPrice({ product, demandSignals, competitorPrices, inventoryLevel });
const plan = await ai.planDemand({ skus, salesHistory, trendSignals });
const brief = await ai.generateManufacturingBrief({ trendName, brandDNA, targetMarket });
```

## Architecture
- **Hybrid forecasting**: classical (Holt-Winters / EWMA) baseline computed locally, then an LLM "context layer" adjusts for trend/competitor/seasonal narratives. Confidence intervals derived from baseline residuals.
- **Pricing engine**: rule pre-filter (margin floor, MAP) → LLM strategy selection → projected impact returned with explicit `factor[]` weights. Refuses to recommend below cost.
- **Demand planning**: per-SKU weeks-of-cover calc + lead-time-aware reorder; LLM produces human-readable rationale for ops.
- **Manufacturing brief**: structured generator producing tech-pack-ready spec; references attached from `signals-trend-intel` outputs when wired.

## Inputs/outputs
All schemas mirror current edge function contracts to make migration mechanical.

## Models
- Forecasting narrative: `gemini-2.5-flash`
- Pricing strategy: `gemini-2.5-pro` (high-stakes)
- Manufacturing brief: `gemini-2.5-pro`

## Out of scope
- Inventory sync (Shopify) — host app concern.
- Order placement / supplier APIs.

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
