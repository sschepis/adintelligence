import { describe, it, expect } from "vitest";
import { TrendIntel } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/signals-trend-intel", () => {
  it("instantiates", () => { expect(() => new TrendIntel(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const t = new TrendIntel(mockGateway);
    for (const m of ["analyzeTrend", "predictLifecycle", "analyzeCompetitors", "detectMarketGaps", "shareOfVoice"]) {
      expect(typeof (t as any)[m]).toBe("function");
    }
  });
});
