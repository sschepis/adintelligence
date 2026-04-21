import { describe, it, expect } from "vitest";
import { BrandDNAEngine } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/brand-dna-engine", () => {
  it("instantiates with a GatewayClient", () => {
    expect(() => new BrandDNAEngine(mockGateway)).not.toThrow();
  });
  it("exposes documented public methods", () => {
    const e = new BrandDNAEngine(mockGateway);
    for (const m of ["ingestWebsite", "deriveFromRaw", "analyzeVoice", "scoreConsistency", "detectDrift"]) {
      expect(typeof (e as any)[m]).toBe("function");
    }
  });
  it("ingestWebsite returns a Promise", () => {
    const e = new BrandDNAEngine(mockGateway);
    expect(e.ingestWebsite("https://acme.com")).toBeInstanceOf(Promise);
  });
});
