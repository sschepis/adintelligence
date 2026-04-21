import { describe, it, expect } from "vitest";
import { CopyForge } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const mockGateway = {} as GatewayClient;

describe("@concentrik/creative-copy-forge", () => {
  it("instantiates", () => { expect(() => new CopyForge(mockGateway)).not.toThrow(); });
  it("exposes all documented methods", () => {
    const c = new CopyForge(mockGateway);
    for (const m of ["generate", "generateVariants", "rewrite", "smartABVariants"]) {
      expect(typeof (c as any)[m]).toBe("function");
    }
  });
});
