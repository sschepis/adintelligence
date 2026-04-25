import { describe, it, expect, vi } from "vitest";
import { VisualForge } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

describe("@concentrik/creative-visual-forge", () => {
  it("instantiates", () => { expect(() => new VisualForge(createMockGateway())).not.toThrow(); });

  it("exposes all documented methods", () => {
    const v = new VisualForge(createMockGateway());
    for (const m of ["generate", "generateStoryboardFrame", "retryFailedFrames", "analyzeProductImage"]) {
      expect(typeof (v as any)[m]).toBe("function");
    }
  });

  describe("generate", () => {
    it("returns GeneratedImage with correct dimensions", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce("https://img.example.com/hero.png");
      const v = new VisualForge(gw);
      const result = await v.generate({
        assetType: "hero",
        prompt: "bold luxury handbag",
        aspectRatio: "16:9",
      });
      expect(result.url).toBe("https://img.example.com/hero.png");
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });

    it("uses IMAGE_PRO for premium quality", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce("url");
      const v = new VisualForge(gw);
      await v.generate({ assetType: "hero", prompt: "test", aspectRatio: "1:1", quality: "premium" });
      const call = (gw.chat as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.model).toContain("gemini-3-pro");
    });

    it("uses IMAGE_FAST for standard/fast quality", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce("url");
      const v = new VisualForge(gw);
      await v.generate({ assetType: "hero", prompt: "test", aspectRatio: "1:1", quality: "fast" });
      const call = (gw.chat as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call.model).toContain("flash");
    });
  });

  describe("retryFailedFrames", () => {
    it("handles mixed success and failure", async () => {
      const gw = createMockGateway();
      const chatFn = gw.chat as ReturnType<typeof vi.fn>;
      chatFn
        .mockResolvedValueOnce("https://img.example.com/frame1.png")
        .mockRejectedValueOnce(new Error("Generation failed"));
      const v = new VisualForge(gw);
      const results = await v.retryFailedFrames(
        [{ shotIndex: 0, shotPrompt: "opener" }, { shotIndex: 2, shotPrompt: "climax" }],
        { aspectRatio: "9:16" },
      );
      expect(results).toHaveLength(2);
      expect(results[0].shotIndex).toBe(0);
      expect((results[0].result as any).url).toBe("https://img.example.com/frame1.png");
      expect(results[1].shotIndex).toBe(2);
      expect((results[1].result as any).error).toContain("failed");
    });
  });

  describe("analyzeProductImage", () => {
    it("returns analysis with color match score", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        dominantColors: ["gold", "burgundy", "black"],
        colorHexCodes: ["#FFD700", "#800020", "#000000"],
        aestheticStyle: "luxury maximalist",
        patterns: ["metallic", "solid"],
        luxuryScore: 88,
      });
      const v = new VisualForge(gw);
      const result = await v.analyzeProductImage("https://img.example.com/product.jpg", ["gold", "navy"]);
      expect(result.luxuryScore).toBe(88);
      expect(result.trendColors).toEqual(["gold", "navy"]);
      expect(result.colorMatchScore).toBe(50); // 1 of 2 trend colors matched
    });
  });
});
