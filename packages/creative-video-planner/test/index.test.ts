import { describe, it, expect, vi } from "vitest";
import { VideoPlanner } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";
import type { ProductionManifest } from "../src";

function createMockGateway() {
  return { chat: vi.fn(), chatJSON: vi.fn(), stream: vi.fn() } as unknown as GatewayClient;
}

function validManifest(): ProductionManifest {
  return {
    title: "Test Ad",
    concept: "A compelling test video ad concept",
    totalDurationSeconds: 15,
    aspectRatio: "9:16",
    shots: [
      { index: 0, startSeconds: 0, durationSeconds: 5, cameraMotion: "static", transition: "cut", visualPrompt: "Opening shot with dramatic lighting" },
      { index: 1, startSeconds: 5, durationSeconds: 5, cameraMotion: "zoom-in", transition: "fade", visualPrompt: "Product reveal close-up shot" },
      { index: 2, startSeconds: 10, durationSeconds: 5, cameraMotion: "pan-right", transition: "dissolve", visualPrompt: "Final brand logo with call to action" },
    ],
    soundtrack: { mood: "energetic", description: "upbeat electronic" },
  };
}

describe("@concentrik/creative-video-planner", () => {
  it("instantiates", () => { expect(() => new VideoPlanner(createMockGateway())).not.toThrow(); });

  it("exposes all documented methods", () => {
    const p = new VideoPlanner(createMockGateway());
    for (const m of ["plan", "validate", "analyzeTiming", "retileShot", "toShotstack"]) {
      expect(typeof (p as any)[m]).toBe("function");
    }
  });

  describe("validate", () => {
    it("returns ok:true for a valid manifest", () => {
      const p = new VideoPlanner(createMockGateway());
      const result = p.validate(validManifest());
      expect(result.ok).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("catches missing title", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.title = "";
      const result = p.validate(m);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path === "title")).toBe(true);
    });

    it("catches invalid camera motion", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots[0].cameraMotion = "invalid-motion";
      const result = p.validate(m);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path.includes("cameraMotion"))).toBe(true);
    });

    it("catches gaps between shots", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots[1].startSeconds = 7; // gap of 2s
      const result = p.validate(m);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.path.includes("startSeconds"))).toBe(true);
    });

    it("catches too few shots", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots = m.shots.slice(0, 2);
      const result = p.validate(m);
      expect(result.ok).toBe(false);
    });

    it("catches duration mismatch", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.totalDurationSeconds = 30; // shots only tile to 15
      const result = p.validate(m);
      expect(result.ok).toBe(false);
    });
  });

  describe("analyzeTiming", () => {
    it("returns empty for perfect timeline", () => {
      const p = new VideoPlanner(createMockGateway());
      const issues = p.analyzeTiming(validManifest());
      expect(issues).toHaveLength(0);
    });

    it("detects gap between shots", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots[1].startSeconds = 7; // 2s gap at shot 1; cascades to shot 2
      const issues = p.analyzeTiming(m);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0].kind).toBe("gap");
      expect(issues[0].betweenShots).toEqual([0, 1]);
      expect(issues[0].deltaSeconds).toBeCloseTo(2);
    });

    it("detects overlap between shots", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots[1].startSeconds = 3; // 2s overlap at shot 1
      const issues = p.analyzeTiming(m);
      expect(issues.length).toBeGreaterThanOrEqual(1);
      expect(issues[0].kind).toBe("overlap");
    });
  });

  describe("retileShot", () => {
    it("fixes a gap by snapping and cascading", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      m.shots[1].startSeconds = 7; // gap
      const fixed = p.retileShot(m, 1);
      expect(fixed.shots[1].startSeconds).toBe(5);
      expect(fixed.shots[2].startSeconds).toBe(10);
      expect(fixed.totalDurationSeconds).toBe(15);
    });

    it("returns unchanged manifest for invalid index", () => {
      const p = new VideoPlanner(createMockGateway());
      const m = validManifest();
      const result = p.retileShot(m, 99);
      expect(result).toEqual(m);
    });
  });

  describe("toShotstack", () => {
    it("produces Shotstack-compatible structure", () => {
      const p = new VideoPlanner(createMockGateway());
      const result = p.toShotstack(validManifest()) as any;
      expect(result.timeline.tracks).toHaveLength(1);
      expect(result.timeline.tracks[0].clips).toHaveLength(3);
      expect(result.timeline.tracks[0].clips[0].start).toBe(0);
      expect(result.timeline.tracks[0].clips[0].length).toBe(5);
      expect(result.output.format).toBe("mp4");
      expect(result.output.aspectRatio).toBe("9:16");
    });
  });

  describe("plan", () => {
    it("parses gateway response into manifest", async () => {
      const gw = createMockGateway();
      (gw.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce(JSON.stringify({
        title: "AI Generated Ad",
        concept: "A stunning visual narrative",
        durationSeconds: 15,
        aspectRatio: "9:16",
        shots: [
          { index: 0, startSeconds: 0, durationSeconds: 5, cameraMotion: "static", transition: "cut", visualPrompt: "Dramatic opening with brand colors" },
          { index: 1, startSeconds: 5, durationSeconds: 5, cameraMotion: "zoom-in", transition: "fade", visualPrompt: "Product close-up with lighting" },
          { index: 2, startSeconds: 10, durationSeconds: 5, cameraMotion: "pan-right", transition: "dissolve", visualPrompt: "Brand logo finale reveal" },
        ],
        soundtrack: { mood: "dramatic", description: "orchestral" },
        voiceover: { voice: "narrator", script: "Discover something new" },
      }));
      const p = new VideoPlanner(gw);
      const result = await p.plan({ brief: "Sell shoes", brandDNA: {}, aspectRatio: "9:16", targetDuration: 15 });
      expect(result.title).toBe("AI Generated Ad");
      expect(result.shots).toHaveLength(3);
      expect(result.totalDurationSeconds).toBe(15);
    });
  });
});
