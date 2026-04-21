import { describe, it, expect } from "vitest";
import { CampaignsOptimizer } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/campaigns-optimizer", () => {
  it("instantiates", () => { expect(() => new CampaignsOptimizer(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const o = new CampaignsOptimizer(mockGateway);
    for (const m of ["morphSuggestions", "simulateFocusGroup", "optimalTiming", "generatePerformanceReport", "sendCompetitorDigest"]) {
      expect(typeof (o as any)[m]).toBe("function");
    }
  });
});
