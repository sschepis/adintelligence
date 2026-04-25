// @concentrik/signals-trend-intel — Trend analysis, lifecycle prediction, competitive intelligence
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, safeParse } from "@concentrik/shared";

export interface TrendAnalysis {
  summary: string;
  demographics: { primaryAge: string; gender: string; income: string };
  visualElements: string[];
  productCategories: string[];
  peakTiming: string;
  longevity: "short-term" | "medium-term" | "long-term";
  brandOpportunity: string;
  riskFactors: string[];
  confidenceScore: number;
}

export interface LifecyclePrediction {
  stage: "emerging" | "rising" | "peak" | "declining" | "dead";
  weeksToPeak: number | null;
  weeksToDecline: number | null;
  confidence: number;
}

export interface CompetitorReport {
  profiles: unknown[];
  opportunities: unknown[];
  threats: unknown[];
}

export interface MarketGap {
  category: string;
  demandSignals: number;
  competitorCoverage: number;
  opportunity: string;
  priority: "high" | "medium" | "low";
}

// ── Zod schemas ─────────────────────────────────────────────────────────

const TrendAnalysisSchema = z.object({
  summary: z.string(),
  demographics: z.object({
    primaryAge: z.string(),
    gender: z.string(),
    income: z.string(),
  }),
  visualElements: z.array(z.string()),
  productCategories: z.array(z.string()),
  peakTiming: z.string(),
  longevity: z.enum(["short-term", "medium-term", "long-term"]),
  brandOpportunity: z.string(),
  riskFactors: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
});

const LifecyclePredictionSchema = z.object({
  stage: z.enum(["emerging", "rising", "peak", "declining", "dead"]),
  weeksToPeak: z.number().nullable(),
  weeksToDecline: z.number().nullable(),
  confidence: z.number().min(0).max(100),
});

const CompetitorReportSchema = z.object({
  profiles: z.array(z.unknown()),
  opportunities: z.array(z.unknown()),
  threats: z.array(z.unknown()),
});

const MarketGapSchema = z.object({
  category: z.string(),
  demandSignals: z.number(),
  competitorCoverage: z.number(),
  opportunity: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

// ── Statistical helpers ─────────────────────────────────────────────────

function computeLifecycleStats(history: { week: string; volume: number }[]): {
  preliminaryStage: string;
  slope: number;
  maxVolume: number;
} {
  if (history.length < 2) {
    return { preliminaryStage: "emerging", slope: 0, maxVolume: history[0]?.volume ?? 0 };
  }

  const volumes = history.map((h) => h.volume);
  const maxVolume = Math.max(...volumes);
  const recentHalf = volumes.slice(Math.floor(volumes.length / 2));
  const earlyHalf = volumes.slice(0, Math.floor(volumes.length / 2));

  const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
  const earlyAvg = earlyHalf.length > 0 ? earlyHalf.reduce((a, b) => a + b, 0) / earlyHalf.length : 0;
  const slope = earlyAvg > 0 ? (recentAvg - earlyAvg) / earlyAvg : 0;

  const lastVolume = volumes[volumes.length - 1];
  const atPeak = lastVolume >= maxVolume * 0.9;

  let preliminaryStage: string;
  if (slope > 0.5) preliminaryStage = "emerging";
  else if (slope > 0.1) preliminaryStage = "rising";
  else if (atPeak && Math.abs(slope) <= 0.1) preliminaryStage = "peak";
  else if (slope < -0.1) preliminaryStage = "declining";
  else if (slope < -0.5 && lastVolume < maxVolume * 0.2) preliminaryStage = "dead";
  else preliminaryStage = "peak";

  return { preliminaryStage, slope, maxVolume };
}

// ── Main class ──────────────────────────────────────────────────────────

export class TrendIntel {
  constructor(private _gateway: GatewayClient) {}

  async analyzeTrend(name: string, platform: string, hashtags?: string[]): Promise<TrendAnalysis> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are an expert trend analyst for fashion and commerce. Analyze cultural trends and provide actionable insights for brands. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze this trending topic for a fashion brand:

Trend: "${name}"
Platform: ${platform}
Related hashtags: ${hashtags?.join(", ") || "N/A"}

Provide analysis in this exact JSON format:
{
  "summary": "2-3 sentence summary of what this trend means",
  "demographics": { "primaryAge": "age range", "gender": "primary gender appeal", "income": "income bracket" },
  "visualElements": ["list of 3-4 key visual elements/aesthetics"],
  "productCategories": ["list of 3-5 product categories that align"],
  "peakTiming": "when this trend is likely to peak",
  "longevity": "short-term" | "medium-term" | "long-term",
  "brandOpportunity": "specific opportunity for brands",
  "riskFactors": ["2-3 potential risks"],
  "confidenceScore": 85
}`,
        },
      ],
      temperature: 0.7,
    });

    return safeParse(TrendAnalysisSchema, result);
  }

  async predictLifecycle(history: { week: string; volume: number }[]): Promise<LifecyclePrediction> {
    const stats = computeLifecycleStats(history);

    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST_LITE,
      messages: [
        {
          role: "system",
          content: `You are a trend lifecycle analyst. Given weekly volume data and statistical indicators, predict the trend's lifecycle stage and timing.

Return a JSON object:
{
  "stage": "emerging" | "rising" | "peak" | "declining" | "dead",
  "weeksToPeak": <number or null if already past peak>,
  "weeksToDecline": <number or null if already declining>,
  "confidence": <0-100>
}`,
        },
        {
          role: "user",
          content: `Weekly volume data:\n${JSON.stringify(history)}\n\nStatistical indicators:\n- Preliminary stage: ${stats.preliminaryStage}\n- Slope (rate of change): ${stats.slope.toFixed(3)}\n- Max volume observed: ${stats.maxVolume}`,
        },
      ],
      temperature: 0.3,
    });

    return safeParse(LifecyclePredictionSchema, result);
  }

  async analyzeCompetitors(input: { domains: string[]; ads: unknown[]; industry: string }): Promise<CompetitorReport> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: `You are a competitive intelligence analyst for fashion and commerce. Analyze competitors and identify opportunities and threats.

Return a JSON object:
{
  "profiles": [{ "domain": "", "positioning": "", "strengths": [], "weaknesses": [], "themes": [], "ctas": [] }],
  "opportunities": [{ "area": "", "description": "", "urgency": "high|medium|low" }],
  "threats": [{ "competitor": "", "threat": "", "severity": "high|medium|low" }]
}`,
        },
        {
          role: "user",
          content: `Analyze these competitors in the ${input.industry} industry:\n\nDomains: ${input.domains.join(", ")}\n\nAd samples:\n${JSON.stringify(input.ads, null, 2)}`,
        },
      ],
      temperature: 0.5,
    });

    return safeParse(CompetitorReportSchema, result);
  }

  async detectMarketGaps(input: { trends: unknown[]; inventory: unknown[] }): Promise<MarketGap[]> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a market gap analyst. Cross-reference trending categories against existing inventory to identify unmet demand.

Return a JSON array:
[{
  "category": "product category with unmet demand",
  "demandSignals": <1-100 demand score>,
  "competitorCoverage": <0-100 how well competitors cover this>,
  "opportunity": "description of the gap",
  "priority": "high" | "medium" | "low"
}]`,
        },
        {
          role: "user",
          content: `Current trends:\n${JSON.stringify(input.trends, null, 2)}\n\nExisting inventory:\n${JSON.stringify(input.inventory, null, 2)}`,
        },
      ],
      temperature: 0.4,
    });

    const arr = Array.isArray(result) ? result : (result as Record<string, unknown>).gaps ?? [];
    return safeParse(z.array(MarketGapSchema), arr);
  }

  async shareOfVoice(brand: string, competitors: string[]): Promise<Record<string, number>> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a share-of-voice analyst. Estimate the share of voice for each brand as a percentage that sums to 100.

Return a JSON object where keys are brand names and values are percentages:
{ "BrandA": 35, "BrandB": 25, ... }`,
        },
        {
          role: "user",
          content: `Calculate share of voice for "${brand}" against competitors: ${competitors.join(", ")}`,
        },
      ],
      temperature: 0.3,
    });

    return safeParse(z.record(z.number()), result);
  }
}
