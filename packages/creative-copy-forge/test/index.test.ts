import { describe, it, expect, vi } from "vitest";
import { CopyForge } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

describe("@concentrik/creative-copy-forge", () => {
  it("instantiates", () => { expect(() => new CopyForge(createMockGateway())).not.toThrow(); });

  it("exposes all documented methods", () => {
    const c = new CopyForge(createMockGateway());
    for (const m of ["generate", "generateVariants", "rewrite", "smartABVariants"]) {
      expect(typeof (c as any)[m]).toBe("function");
    }
  });

  describe("generate", () => {
    it("returns validated copy", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        primary: "Bold headline here",
        alternates: ["Alt 1", "Alt 2"],
        metadata: { wordCount: 3, readingLevel: "Grade 5" },
      });
      const c = new CopyForge(gw);
      const result = await c.generate({ contentType: "ad-headline", brief: "Sell shoes" });
      expect(result.primary).toBe("Bold headline here");
      expect(result.alternates).toHaveLength(2);
    });

    it("re-prompts when forbidden term detected", async () => {
      const gw = createMockGateway();
      const chatJSON = gw.chatJSON as ReturnType<typeof vi.fn>;
      chatJSON
        .mockResolvedValueOnce({
          primary: "This is a cheap deal",
          alternates: [],
          metadata: { wordCount: 5, readingLevel: "Grade 5" },
        })
        .mockResolvedValueOnce({
          primary: "This is an affordable deal",
          alternates: [],
          metadata: { wordCount: 5, readingLevel: "Grade 5" },
        });
      const c = new CopyForge(gw);
      const result = await c.generate({
        contentType: "ad-headline",
        brief: "Sell shoes",
        brandDNA: { guardrails: { forbiddenTerms: ["cheap"], do: [], dont: [] } },
      });
      expect(chatJSON).toHaveBeenCalledTimes(2);
      expect(result.primary).toBe("This is an affordable deal");
    });
  });

  describe("generateVariants", () => {
    it("returns string array", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(["Variant 1", "Variant 2"]);
      const c = new CopyForge(gw);
      const result = await c.generateVariants({ baseCopy: "Original", count: 2, axis: "tone" });
      expect(result).toEqual(["Variant 1", "Variant 2"]);
    });
  });

  describe("rewrite", () => {
    it("returns rewritten text", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce("Punchier version here!");
      const c = new CopyForge(gw);
      const result = await c.rewrite("Original text", "make it punchier");
      expect(result).toBe("Punchier version here!");
    });
  });

  describe("smartABVariants", () => {
    it("returns ad variant triplets", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
        { headline: "H1", body: "B1", cta: "Buy Now" },
        { headline: "H2", body: "B2", cta: "Shop Today" },
      ]);
      const c = new CopyForge(gw);
      const result = await c.smartABVariants({ headline: "H", body: "B", cta: "C" }, 2);
      expect(result).toHaveLength(2);
      expect(result[0].headline).toBe("H1");
    });
  });
});
