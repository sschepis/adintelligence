import { describe, it, expect, vi } from "vitest";
import { TrendIntel } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return {
    chat: vi.fn(),
    chatJSON: vi.fn(),
    stream: vi.fn(),
  } as unknown as GatewayClient;
}

const MOCK_TREND = {
  summary: "Mob wife aesthetic embraces bold luxury",
  demographics: { primaryAge: "18-34", gender: "female", income: "middle" },
  visualElements: ["gold jewelry", "fur coats"],
  productCategories: ["jewelry", "outerwear"],
  peakTiming: "Q1 2026",
  longevity: "medium-term" as const,
  brandOpportunity: "Launch bold accessories line",
  riskFactors: ["Cultural sensitivity"],
  confidenceScore: 82,
};

describe("@concentrik/signals-trend-intel", () => {
  it("instantiates", () => {
    expect(() => new TrendIntel(createMockGateway())).not.toThrow();
  });

  it("exposes all documented methods", () => {
    const t = new TrendIntel(createMockGateway());
    for (const m of ["analyzeTrend", "predictLifecycle", "analyzeCompetitors", "detectMarketGaps", "shareOfVoice"]) {
      expect(typeof (t as any)[m]).toBe("function");
    }
  });

  describe("analyzeTrend", () => {
    it("returns validated TrendAnalysis", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_TREND);
      const t = new TrendIntel(gw);
      const result = await t.analyzeTrend("mob wife", "tiktok", ["#mobwife"]);
      expect(result.summary).toContain("Mob wife");
      expect(result.confidenceScore).toBe(82);
      expect(result.longevity).toBe("medium-term");
    });
  });

  describe("predictLifecycle", () => {
    it("returns lifecycle prediction with statistical pre-pass", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        stage: "rising",
        weeksToPeak: 4,
        weeksToDecline: 12,
        confidence: 75,
      });
      const t = new TrendIntel(gw);
      const result = await t.predictLifecycle([
        { week: "2026-01", volume: 100 },
        { week: "2026-02", volume: 200 },
        { week: "2026-03", volume: 350 },
        { week: "2026-04", volume: 500 },
      ]);
      expect(result.stage).toBe("rising");
      expect(result.weeksToPeak).toBe(4);
    });
  });

  describe("analyzeCompetitors", () => {
    it("returns competitor report", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        profiles: [{ domain: "rival.com" }],
        opportunities: [{ area: "pricing" }],
        threats: [{ competitor: "rival.com" }],
      });
      const t = new TrendIntel(gw);
      const result = await t.analyzeCompetitors({
        domains: ["rival.com"],
        ads: [],
        industry: "fashion",
      });
      expect(result.profiles).toHaveLength(1);
      expect(result.opportunities).toHaveLength(1);
    });
  });

  describe("detectMarketGaps", () => {
    it("returns market gaps array", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { category: "luxury bags", demandSignals: 80, competitorCoverage: 30, opportunity: "High demand, low supply", priority: "high" },
      ]);
      const t = new TrendIntel(gw);
      const result = await t.detectMarketGaps({ trends: [], inventory: [] });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe("high");
    });
  });

  describe("shareOfVoice", () => {
    it("returns percentage map", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ Acme: 45, Rival: 35, Other: 20 });
      const t = new TrendIntel(gw);
      const result = await t.shareOfVoice("Acme", ["Rival", "Other"]);
      expect(result.Acme).toBe(45);
      expect(result.Rival + result.Other).toBe(55);
    });
  });
});
