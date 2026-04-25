// @concentrik/commerce-demand-ai — Revenue forecasting, pricing, demand planning, manufacturing briefs
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, safeParse } from "@concentrik/shared";

export interface RevenueForecast {
  weekly: { week: string; revenue: number; low: number; high: number }[];
  confidence: number;
  drivers: string[];
}

export interface PricingRecommendation {
  recommendedPrice: number;
  priceRange: { floor: number; ceiling: number };
  strategy: "premium" | "competitive" | "penetration" | "dynamic";
  confidence: number;
  reasoning: string;
  projectedImpact: { revenueChange: number; marginChange: number; volumeChange: number };
}

export interface DemandPlan {
  sku: string;
  weeksOfCover: number;
  reorderUnits: number;
  stockoutRisk: number;
  rationale: string;
}

export interface ManufacturingBrief {
  productName: string;
  specs: Record<string, string>;
  materials: string[];
  sizing: string[];
  targetCost: number;
  moq: number;
  leadTimeWeeks: number;
  references: string[];
}

// ── Zod schemas ─────────────────────────────────────────────────────────

const RevenueForecastSchema = z.object({
  weekly: z.array(z.object({
    week: z.string(),
    revenue: z.number(),
    low: z.number(),
    high: z.number(),
  })),
  confidence: z.number().min(0).max(100),
  drivers: z.array(z.string()),
});

const PricingRecommendationSchema = z.object({
  recommendedPrice: z.number(),
  priceRange: z.object({ floor: z.number(), ceiling: z.number() }),
  strategy: z.enum(["premium", "competitive", "penetration", "dynamic"]),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  projectedImpact: z.object({
    revenueChange: z.number(),
    marginChange: z.number(),
    volumeChange: z.number(),
  }),
});

const DemandPlanSchema = z.object({
  sku: z.string(),
  weeksOfCover: z.number(),
  reorderUnits: z.number(),
  stockoutRisk: z.number().min(0).max(1),
  rationale: z.string(),
});

const ManufacturingBriefSchema = z.object({
  productName: z.string(),
  specs: z.record(z.string()),
  materials: z.array(z.string()),
  sizing: z.array(z.string()),
  targetCost: z.number(),
  moq: z.number(),
  leadTimeWeeks: z.number(),
  references: z.array(z.string()),
});

// ── Statistical helpers ─────────────────────────────────────────────────

function ewmaBaseline(
  history: { week?: string; revenue?: number; value?: number }[],
  horizonWeeks: number,
  trendBoost = 0,
): { week: string; revenue: number; low: number; high: number }[] {
  const values = history.map((h) => h.revenue ?? h.value ?? 0);
  if (values.length === 0) {
    return Array.from({ length: horizonWeeks }, (_, i) => ({
      week: `W${i + 1}`,
      revenue: 0,
      low: 0,
      high: 0,
    }));
  }

  const alpha = 0.3;
  let smoothed = values[0];
  for (let i = 1; i < values.length; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed;
  }

  const residuals = values.map((v) => Math.abs(v - smoothed));
  const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;

  const boostMultiplier = 1 + trendBoost;

  return Array.from({ length: horizonWeeks }, (_, i) => {
    const projected = smoothed * boostMultiplier;
    const spread = avgResidual * (1 + i * 0.1);
    return {
      week: `W${i + 1}`,
      revenue: Math.round(projected),
      low: Math.round(projected - spread),
      high: Math.round(projected + spread),
    };
  });
}

// ── Main class ──────────────────────────────────────────────────────────

export class DemandAI {
  constructor(private _gateway: GatewayClient) {}

  async forecastRevenue(input: {
    history: unknown[];
    horizonWeeks: number;
    trendBoost?: number;
  }): Promise<RevenueForecast> {
    const baseline = ewmaBaseline(
      input.history as { week?: string; revenue?: number; value?: number }[],
      input.horizonWeeks,
      input.trendBoost ?? 0,
    );

    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a revenue forecasting expert. Given a statistical baseline forecast and historical data, provide a refined forecast with key revenue drivers.

Return JSON:
{
  "weekly": [{ "week": "W1", "revenue": 1000, "low": 800, "high": 1200 }, ...],
  "confidence": <0-100>,
  "drivers": ["key driver 1", "key driver 2", ...]
}`,
        },
        {
          role: "user",
          content: `Historical data:\n${JSON.stringify(input.history)}\n\nStatistical baseline (EWMA):\n${JSON.stringify(baseline)}\n\nHorizon: ${input.horizonWeeks} weeks\nTrend boost: ${input.trendBoost ?? 0}`,
        },
      ],
      temperature: 0.4,
    });

    return safeParse(RevenueForecastSchema, result);
  }

  async recommendPrice(input: {
    product: unknown;
    demandSignals: unknown;
    competitorPrices: unknown[];
    inventoryLevel: number;
    trendData?: unknown;
  }): Promise<PricingRecommendation> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: `You are a pricing optimization AI. Recommend an optimal price given product data, demand signals, competitor pricing, and inventory levels. Never recommend a price that would result in a negative margin.

Return JSON:
{
  "recommendedPrice": <number>,
  "priceRange": { "floor": <number>, "ceiling": <number> },
  "strategy": "premium" | "competitive" | "penetration" | "dynamic",
  "confidence": <0-100>,
  "reasoning": "explanation of the pricing strategy",
  "projectedImpact": { "revenueChange": <percent>, "marginChange": <percent>, "volumeChange": <percent> }
}`,
        },
        {
          role: "user",
          content: `Product: ${JSON.stringify(input.product)}\nDemand signals: ${JSON.stringify(input.demandSignals)}\nCompetitor prices: ${JSON.stringify(input.competitorPrices)}\nInventory level: ${input.inventoryLevel}\nTrend data: ${JSON.stringify(input.trendData ?? null)}`,
        },
      ],
      temperature: 0.3,
    });

    const rec = safeParse(PricingRecommendationSchema, result);

    if (rec.priceRange.floor > rec.recommendedPrice) {
      rec.recommendedPrice = rec.priceRange.floor;
    }

    return rec;
  }

  async planDemand(input: {
    skus: unknown[];
    salesHistory: unknown[];
    trendSignals: unknown[];
  }): Promise<DemandPlan[]> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a demand planning specialist. For each SKU, calculate weeks of cover, reorder quantities, and stockout risk based on sales history and trend signals.

Return a JSON array:
[{
  "sku": "SKU-001",
  "weeksOfCover": <number>,
  "reorderUnits": <number>,
  "stockoutRisk": <0-1 probability>,
  "rationale": "explanation"
}]`,
        },
        {
          role: "user",
          content: `SKUs:\n${JSON.stringify(input.skus)}\n\nSales history:\n${JSON.stringify(input.salesHistory)}\n\nTrend signals:\n${JSON.stringify(input.trendSignals)}`,
        },
      ],
      temperature: 0.3,
    });

    const arr = Array.isArray(result) ? result : (result as Record<string, unknown>).plans ?? [];
    return safeParse(z.array(DemandPlanSchema), arr);
  }

  async generateManufacturingBrief(input: {
    trendName: string;
    brandDNA: unknown;
    targetMarket: string;
    constraints?: unknown;
  }): Promise<ManufacturingBrief> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: `You are a product development specialist. Generate a tech-pack-ready manufacturing brief based on trend data, brand identity, and target market.

Return JSON:
{
  "productName": "Trend-aligned product name",
  "specs": { "key": "value" },
  "materials": ["material 1", "material 2"],
  "sizing": ["S", "M", "L", "XL"],
  "targetCost": <number>,
  "moq": <minimum order quantity>,
  "leadTimeWeeks": <number>,
  "references": ["visual/trend reference URLs or descriptions"]
}`,
        },
        {
          role: "user",
          content: `Trend: ${input.trendName}\nBrand DNA: ${JSON.stringify(input.brandDNA)}\nTarget market: ${input.targetMarket}\nConstraints: ${JSON.stringify(input.constraints ?? null)}`,
        },
      ],
      temperature: 0.5,
    });

    return safeParse(ManufacturingBriefSchema, result);
  }
}
