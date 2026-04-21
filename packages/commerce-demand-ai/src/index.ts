// @concentrik/commerce-demand-ai — STUB
import type { GatewayClient } from "@concentrik/gateway-client";

export interface RevenueForecast { weekly: { week: string; revenue: number; low: number; high: number }[]; confidence: number; drivers: string[]; }
export interface PricingRecommendation { recommendedPrice: number; priceRange: { floor: number; ceiling: number }; strategy: "premium" | "competitive" | "penetration" | "dynamic"; confidence: number; reasoning: string; projectedImpact: { revenueChange: number; marginChange: number; volumeChange: number }; }
export interface DemandPlan { sku: string; weeksOfCover: number; reorderUnits: number; stockoutRisk: number; rationale: string; }
export interface ManufacturingBrief { productName: string; specs: Record<string, string>; materials: string[]; sizing: string[]; targetCost: number; moq: number; leadTimeWeeks: number; references: string[]; }

export class DemandAI {
  constructor(private _gateway: GatewayClient) {}
  async forecastRevenue(_input: { history: unknown[]; horizonWeeks: number; trendBoost?: number }): Promise<RevenueForecast> { throw new Error("STUB"); }
  async recommendPrice(_input: { product: unknown; demandSignals: unknown; competitorPrices: unknown[]; inventoryLevel: number; trendData?: unknown }): Promise<PricingRecommendation> { throw new Error("STUB"); }
  async planDemand(_input: { skus: unknown[]; salesHistory: unknown[]; trendSignals: unknown[] }): Promise<DemandPlan[]> { throw new Error("STUB"); }
  async generateManufacturingBrief(_input: { trendName: string; brandDNA: unknown; targetMarket: string; constraints?: unknown }): Promise<ManufacturingBrief> { throw new Error("STUB"); }
}
