import { describe, it, expect, vi } from "vitest";
import { DemandAI } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

describe("@concentrik/commerce-demand-ai", () => {
  it("instantiates", () => { expect(() => new DemandAI(createMockGateway())).not.toThrow(); });

  it("exposes all documented methods", () => {
    const d = new DemandAI(createMockGateway());
    for (const m of ["forecastRevenue", "recommendPrice", "planDemand", "generateManufacturingBrief"]) {
      expect(typeof (d as any)[m]).toBe("function");
    }
  });

  describe("forecastRevenue", () => {
    it("returns validated forecast", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        weekly: [{ week: "W1", revenue: 1000, low: 800, high: 1200 }],
        confidence: 80,
        drivers: ["seasonal demand"],
      });
      const d = new DemandAI(gw);
      const result = await d.forecastRevenue({ history: [{ revenue: 900 }], horizonWeeks: 4 });
      expect(result.weekly).toHaveLength(1);
      expect(result.confidence).toBe(80);
      expect(result.drivers).toContain("seasonal demand");
    });
  });

  describe("recommendPrice", () => {
    it("returns validated pricing recommendation", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        recommendedPrice: 49.99,
        priceRange: { floor: 39.99, ceiling: 59.99 },
        strategy: "competitive",
        confidence: 85,
        reasoning: "Competitive positioning based on market analysis",
        projectedImpact: { revenueChange: 15, marginChange: -2, volumeChange: 20 },
      });
      const d = new DemandAI(gw);
      const result = await d.recommendPrice({
        product: { name: "Tee", cost: 15 },
        demandSignals: { high: true },
        competitorPrices: [45, 55],
        inventoryLevel: 500,
      });
      expect(result.strategy).toBe("competitive");
      expect(result.recommendedPrice).toBe(49.99);
    });

    it("clamps price to floor if below", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        recommendedPrice: 10,
        priceRange: { floor: 20, ceiling: 50 },
        strategy: "penetration",
        confidence: 60,
        reasoning: "test",
        projectedImpact: { revenueChange: 0, marginChange: 0, volumeChange: 0 },
      });
      const d = new DemandAI(gw);
      const result = await d.recommendPrice({
        product: { name: "X" },
        demandSignals: {},
        competitorPrices: [],
        inventoryLevel: 100,
      });
      expect(result.recommendedPrice).toBe(20);
    });
  });

  describe("planDemand", () => {
    it("returns demand plans array", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { sku: "SKU-001", weeksOfCover: 6, reorderUnits: 200, stockoutRisk: 0.15, rationale: "Steady demand" },
      ]);
      const d = new DemandAI(gw);
      const result = await d.planDemand({ skus: [], salesHistory: [], trendSignals: [] });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe("SKU-001");
    });
  });

  describe("generateManufacturingBrief", () => {
    it("returns tech-pack brief", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        productName: "Mob Wife Tote",
        specs: { material: "vegan leather" },
        materials: ["vegan leather", "gold hardware"],
        sizing: ["One size"],
        targetCost: 25,
        moq: 500,
        leadTimeWeeks: 8,
        references: ["mob wife aesthetic trend"],
      });
      const d = new DemandAI(gw);
      const result = await d.generateManufacturingBrief({
        trendName: "mob wife",
        brandDNA: {},
        targetMarket: "women 18-34",
      });
      expect(result.productName).toBe("Mob Wife Tote");
      expect(result.moq).toBe(500);
    });
  });
});
