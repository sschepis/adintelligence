import { describe, it, expect, vi } from "vitest";
import { CampaignsOptimizer } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

describe("@concentrik/campaigns-optimizer", () => {
  it("instantiates", () => { expect(() => new CampaignsOptimizer(createMockGateway())).not.toThrow(); });

  it("exposes all documented methods", () => {
    const o = new CampaignsOptimizer(createMockGateway());
    for (const m of ["morphSuggestions", "simulateFocusGroup", "optimalTiming", "generatePerformanceReport", "sendCompetitorDigest"]) {
      expect(typeof (o as any)[m]).toBe("function");
    }
  });

  describe("morphSuggestions", () => {
    it("returns ranked suggestions", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { type: "headline", current: "Old headline", suggested: "New headline", rationale: "More engaging", expectedLift: 12, confidence: 80 },
        { type: "cta", current: "Buy", suggested: "Shop Now", rationale: "More action-oriented", expectedLift: 8, confidence: 75 },
      ]);
      const o = new CampaignsOptimizer(gw);
      const result = await o.morphSuggestions({ campaign: {}, recentMetrics: {} });
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("headline");
      expect(result[0].expectedLift).toBe(12);
    });
  });

  describe("simulateFocusGroup", () => {
    it("returns personas with reactions and overall score", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        reactions: [
          { personaId: "p1", sentiment: "positive", score: 82, quote: "Love it!", objections: [], intentToBuy: 75 },
          { personaId: "p2", sentiment: "neutral", score: 55, quote: "Not for me", objections: ["too expensive"], intentToBuy: 30 },
        ],
        overallScore: 68,
        recommendation: "Adjust messaging for price-sensitive segments",
      });
      const o = new CampaignsOptimizer(gw);
      const result = await o.simulateFocusGroup({
        ad: { headline: "Premium Shoes" },
        personas: [
          { id: "p1", name: "Sarah", age: "25-34", income: "high", traits: ["trendy"] },
          { id: "p2", name: "Mike", age: "35-44", income: "middle", traits: ["practical"] },
        ],
      });
      expect(result.overallScore).toBe(68);
      expect(result.reactions).toHaveLength(2);
      expect(result.personas).toHaveLength(2);
    });
  });

  describe("optimalTiming", () => {
    it("returns timing recommendations", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        platform: "instagram",
        optimalTimes: [{ day: "Tuesday", time: "10:00 AM", engagementPrediction: 85, confidence: 80 }],
        peakWindow: { start: "10:00 AM", end: "2:00 PM", days: ["Tuesday", "Thursday"] },
        avoidTimes: [{ day: "Sunday", time: "3:00 AM", reason: "Low engagement" }],
      });
      const o = new CampaignsOptimizer(gw);
      const result = await o.optimalTiming({ platform: "instagram" });
      expect(result.platform).toBe("instagram");
      expect(result.optimalTimes).toHaveLength(1);
      expect(result.peakWindow.days).toContain("Tuesday");
    });
  });

  describe("generatePerformanceReport", () => {
    it("returns structured report", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        summary: "Strong performance overall",
        wins: ["CTR up 25%"],
        losses: ["CPA increased 10%"],
        nextActions: ["Optimize audience targeting"],
      });
      const o = new CampaignsOptimizer(gw);
      const result = await o.generatePerformanceReport({ campaign: {}, metrics: {}, period: "last 7 days" });
      expect(result.wins).toContain("CTR up 25%");
      expect(result.nextActions).toHaveLength(1);
    });
  });

  describe("sendCompetitorDigest", () => {
    it("returns digest summary and items", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        summary: "Competitors launched 3 new campaigns this week",
        items: [{ competitor: "Rival", activity: "New product launch" }],
      });
      const o = new CampaignsOptimizer(gw);
      const result = await o.sendCompetitorDigest({ competitors: ["Rival"], window: "7 days" });
      expect(result.summary).toContain("3 new campaigns");
      expect(result.items).toHaveLength(1);
    });
  });
});
