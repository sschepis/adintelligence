import { describe, it, expect } from "vitest";
import { VisualForge } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/creative-visual-forge", () => {
  it("instantiates", () => { expect(() => new VisualForge(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const v = new VisualForge(mockGateway);
    for (const m of ["generate", "generateStoryboardFrame", "retryFailedFrames", "analyzeProductImage"]) {
      expect(typeof (v as any)[m]).toBe("function");
    }
  });
});
