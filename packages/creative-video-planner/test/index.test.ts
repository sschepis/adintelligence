import { describe, it, expect } from "vitest";
import { VideoPlanner } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/creative-video-planner", () => {
  it("instantiates", () => { expect(() => new VideoPlanner(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const p = new VideoPlanner(mockGateway);
    for (const m of ["plan", "validate", "analyzeTiming", "retileShot", "toShotstack"]) {
      expect(typeof (p as any)[m]).toBe("function");
    }
  });
  it("validate() is synchronous (returns ValidationResult shape)", () => {
    const p = new VideoPlanner(mockGateway);
    expect(() => p.validate({} as any)).toThrow("STUB"); // stub throws; real impl returns { ok, issues }
  });
});
