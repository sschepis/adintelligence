// @concentrik/signals-trend-intel — STUB
import type { GatewayClient } from "@concentrik/gateway-client";

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

export interface CompetitorReport { profiles: unknown[]; opportunities: unknown[]; threats: unknown[]; }
export interface MarketGap { category: string; demandSignals: number; competitorCoverage: number; opportunity: string; priority: "high" | "medium" | "low"; }

export class TrendIntel {
  constructor(private _gateway: GatewayClient) {}
  async analyzeTrend(_name: string, _platform: string, _hashtags?: string[]): Promise<TrendAnalysis> { throw new Error("STUB"); }
  async predictLifecycle(_history: { week: string; volume: number }[]): Promise<LifecyclePrediction> { throw new Error("STUB"); }
  async analyzeCompetitors(_input: { domains: string[]; ads: unknown[]; industry: string }): Promise<CompetitorReport> { throw new Error("STUB"); }
  async detectMarketGaps(_input: { trends: unknown[]; inventory: unknown[] }): Promise<MarketGap[]> { throw new Error("STUB"); }
  async shareOfVoice(_brand: string, _competitors: string[]): Promise<Record<string, number>> { throw new Error("STUB"); }
}
