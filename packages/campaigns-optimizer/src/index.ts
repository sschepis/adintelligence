// @concentrik/campaigns-optimizer — Campaign optimization, simulation, timing, reporting
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, safeParse } from "@concentrik/shared";

export interface MorphSuggestion {
  type: "headline" | "body" | "cta" | "image" | "audience" | "budget";
  current: string;
  suggested: string;
  rationale: string;
  expectedLift: number;
  confidence: number;
}

export interface SimulationPersona {
  id: string;
  name: string;
  age: string;
  income: string;
  traits: string[];
  buyingBehavior?: string;
}

export interface PersonaReaction {
  personaId: string;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  quote: string;
  objections: string[];
  intentToBuy: number;
}

export interface SimulationResult {
  personas: SimulationPersona[];
  reactions: PersonaReaction[];
  overallScore: number;
  recommendation: string;
}

export interface TimingRecommendation {
  platform: string;
  optimalTimes: { day: string; time: string; engagementPrediction: number; confidence: number }[];
  peakWindow: { start: string; end: string; days: string[] };
  avoidTimes: { day: string; time: string; reason: string }[];
}

export interface PerformanceReport {
  summary: string;
  wins: string[];
  losses: string[];
  nextActions: string[];
}

// ── Schemas ─────────────────────────────────────────────────────────────

const MorphSuggestionSchema = z.object({
  type: z.enum(["headline", "body", "cta", "image", "audience", "budget"]),
  current: z.string(),
  suggested: z.string(),
  rationale: z.string(),
  expectedLift: z.number(),
  confidence: z.number().min(0).max(100),
});

const PersonaReactionSchema = z.object({
  personaId: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  score: z.number().min(0).max(100),
  quote: z.string(),
  objections: z.array(z.string()),
  intentToBuy: z.number().min(0).max(100),
});

const SimulationResultSchema = z.object({
  reactions: z.array(PersonaReactionSchema),
  overallScore: z.number().min(0).max(100),
  recommendation: z.string(),
});

const TimingRecommendationSchema = z.object({
  platform: z.string(),
  optimalTimes: z.array(z.object({
    day: z.string(),
    time: z.string(),
    engagementPrediction: z.number(),
    confidence: z.number(),
  })),
  peakWindow: z.object({
    start: z.string(),
    end: z.string(),
    days: z.array(z.string()),
  }),
  avoidTimes: z.array(z.object({
    day: z.string(),
    time: z.string(),
    reason: z.string(),
  })),
});

const PerformanceReportSchema = z.object({
  summary: z.string(),
  wins: z.array(z.string()),
  losses: z.array(z.string()),
  nextActions: z.array(z.string()),
});

// ── Main class ──────────────────────────────────────────────────────────

export class CampaignsOptimizer {
  constructor(private _gateway: GatewayClient) {}

  async morphSuggestions(input: {
    campaign: unknown;
    recentMetrics: unknown;
    brandDNA?: unknown;
  }): Promise<MorphSuggestion[]> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: `You are an expert creative director specializing in real-time ad optimization. Analyze campaign performance and suggest specific changes to improve results. Rank by expected lift.

Return a JSON array:
[{
  "type": "headline" | "body" | "cta" | "image" | "audience" | "budget",
  "current": "current value or description",
  "suggested": "suggested change",
  "rationale": "why this change should improve performance",
  "expectedLift": <percentage expected improvement>,
  "confidence": <0-100>
}]`,
        },
        {
          role: "user",
          content: `Campaign:\n${JSON.stringify(input.campaign)}\n\nRecent metrics:\n${JSON.stringify(input.recentMetrics)}\n\nBrand DNA:\n${JSON.stringify(input.brandDNA ?? null)}`,
        },
      ],
      temperature: 0.5,
    });

    const arr = Array.isArray(result) ? result : (result as Record<string, unknown>).suggestions ?? [];
    return safeParse(z.array(MorphSuggestionSchema), arr);
  }

  async simulateFocusGroup(input: {
    ad: { headline: string; body?: string; imageUrl?: string };
    personas: SimulationPersona[];
  }): Promise<SimulationResult> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.REASONING,
      messages: [
        {
          role: "system",
          content: `You are simulating realistic consumer focus group responses. For each persona, generate an authentic reaction to the ad based on their demographics, traits, and buying behavior.

Return JSON:
{
  "reactions": [{
    "personaId": "matching the input persona id",
    "sentiment": "positive" | "neutral" | "negative",
    "score": <0-100>,
    "quote": "what this persona would say about the ad",
    "objections": ["any concerns they would raise"],
    "intentToBuy": <0-100>
  }],
  "overallScore": <0-100 weighted average>,
  "recommendation": "overall recommendation based on the focus group"
}`,
        },
        {
          role: "user",
          content: `Ad to evaluate:\nHeadline: "${input.ad.headline}"\nBody: "${input.ad.body ?? "N/A"}"\nImage: ${input.ad.imageUrl ?? "N/A"}\n\nPersonas:\n${JSON.stringify(input.personas, null, 2)}`,
        },
      ],
      temperature: 0.6,
    });

    const parsed = safeParse(SimulationResultSchema, result);
    return { ...parsed, personas: input.personas };
  }

  async optimalTiming(input: {
    platform: string;
    targetAudience?: string;
    contentType?: string;
    historicalPerformance?: unknown[];
    timezone?: string;
  }): Promise<TimingRecommendation> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a social media timing optimization AI. Recommend optimal posting times based on platform best practices, audience behavior, and historical data.

Return JSON:
{
  "platform": "platform name",
  "optimalTimes": [{ "day": "Monday", "time": "10:00 AM", "engagementPrediction": 85, "confidence": 80 }],
  "peakWindow": { "start": "10:00 AM", "end": "2:00 PM", "days": ["Tuesday", "Thursday"] },
  "avoidTimes": [{ "day": "Sunday", "time": "3:00 AM", "reason": "Low engagement period" }]
}`,
        },
        {
          role: "user",
          content: `Platform: ${input.platform}\nTarget audience: ${input.targetAudience ?? "general"}\nContent type: ${input.contentType ?? "general"}\nTimezone: ${input.timezone ?? "UTC"}\nHistorical data: ${JSON.stringify(input.historicalPerformance ?? [])}`,
        },
      ],
      temperature: 0.4,
    });

    return safeParse(TimingRecommendationSchema, result);
  }

  async generatePerformanceReport(input: {
    campaign: unknown;
    metrics: unknown;
    period: string;
  }): Promise<PerformanceReport> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a campaign performance analyst. Summarize campaign results into wins, losses, and next actions.

Return JSON:
{
  "summary": "2-3 sentence executive summary",
  "wins": ["specific positive outcomes"],
  "losses": ["areas that underperformed"],
  "nextActions": ["recommended next steps"]
}`,
        },
        {
          role: "user",
          content: `Campaign:\n${JSON.stringify(input.campaign)}\n\nMetrics:\n${JSON.stringify(input.metrics)}\n\nPeriod: ${input.period}`,
        },
      ],
      temperature: 0.3,
    });

    return safeParse(PerformanceReportSchema, result);
  }

  async sendCompetitorDigest(input: {
    competitors: string[];
    window: string;
  }): Promise<{ summary: string; items: unknown[] }> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a competitive intelligence analyst. Summarize competitor activity over the specified time window.

Return JSON:
{
  "summary": "executive summary of competitor activity",
  "items": [{ "competitor": "name", "activity": "what they did", "impact": "potential impact", "urgency": "high|medium|low" }]
}`,
        },
        {
          role: "user",
          content: `Competitors: ${input.competitors.join(", ")}\nTime window: ${input.window}`,
        },
      ],
      temperature: 0.4,
    });

    return safeParse(
      z.object({ summary: z.string(), items: z.array(z.unknown()) }),
      result,
    );
  }
}
