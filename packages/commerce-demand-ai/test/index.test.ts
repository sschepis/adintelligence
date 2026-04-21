import { describe, it, expect } from "vitest";
import { DemandAI } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/commerce-demand-ai", () => {
  it("instantiates", () => { expect(() => new DemandAI(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const d = new DemandAI(mockGateway);
    for (const m of ["forecastRevenue", "recommendPrice", "planDemand", "generateManufacturingBrief"]) {
      expect(typeof (d as any)[m]).toBe("function");
    }
  });
});
