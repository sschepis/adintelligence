import { describe, it, expect, vi } from "vitest";
import { BrandDNAEngine } from "../src";
import type { GatewayClient } from "@concentrik/gateway-client";

const MOCK_PROFILE = {
  name: "Acme Corp",
  websiteUrl: "https://acme.com",
  voice: { tone: ["bold"], vocabulary: ["innovative"], samplePhrases: ["Think bigger"] },
  personality: { archetype: "Hero", traits: ["bold", "confident"] },
  story: { mission: "Empower creators", values: ["innovation"], origin: "Founded in 2020" },
  guardrails: { do: ["be bold"], dont: ["be boring"], forbiddenTerms: ["cheap"] },
  taxonomy: { categories: ["tech"], productTypes: ["SaaS"] },
};

const MOCK_CONSISTENCY = {
  overall: 85,
  voiceAlignment: 90,
  personalityAlignment: 80,
  guardrailsCompliance: 85,
  violations: ["Used informal greeting"],
  suggestions: ["Align tone with brand voice"],
  driftLevel: "minor" as const,
};

function createMockGateway() {
  return {
    chat: vi.fn(),
    chatJSON: vi.fn(),
    stream: vi.fn(),
  } as unknown as GatewayClient;
}

describe("@concentrik/brand-dna-engine", () => {
  it("instantiates with a GatewayClient", () => {
    const gw = createMockGateway();
    expect(() => new BrandDNAEngine(gw)).not.toThrow();
  });

  it("exposes documented public methods", () => {
    const gw = createMockGateway();
    const e = new BrandDNAEngine(gw);
    for (const m of ["ingestWebsite", "deriveFromRaw", "analyzeVoice", "scoreConsistency", "detectDrift"]) {
      expect(typeof (e as any)[m]).toBe("function");
    }
  });

  describe("ingestWebsite", () => {
    it("returns a validated BrandProfile with rawProfile", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_PROFILE);
      const e = new BrandDNAEngine(gw);
      const result = await e.ingestWebsite("https://acme.com");
      expect(result.name).toBe("Acme Corp");
      expect(result.websiteUrl).toBe("https://acme.com");
      expect(result.rawProfile).toBeDefined();
      expect(result.voice?.tone).toContain("bold");
    });

    it("throws ValidationError on malformed LLM output", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ invalid: true });
      const e = new BrandDNAEngine(gw);
      await expect(e.ingestWebsite("https://bad.com")).rejects.toThrow("Schema validation failed");
    });
  });

  describe("deriveFromRaw", () => {
    it("re-derives a profile from raw data", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_PROFILE);
      const e = new BrandDNAEngine(gw);
      const result = await e.deriveFromRaw({ raw: "some data" });
      expect(result.name).toBe("Acme Corp");
    });
  });

  describe("analyzeVoice", () => {
    it("returns a validated BrandVoice", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_PROFILE.voice);
      const e = new BrandDNAEngine(gw);
      const result = await e.analyzeVoice(["Sample text one", "Sample text two"]);
      expect(result.tone).toContain("bold");
      expect(result.vocabulary).toContain("innovative");
    });
  });

  describe("scoreConsistency", () => {
    it("returns a validated ConsistencyScore", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_CONSISTENCY);
      const e = new BrandDNAEngine(gw);
      const result = await e.scoreConsistency("Some content to score", MOCK_PROFILE as any);
      expect(result.overall).toBe(85);
      expect(result.violations).toHaveLength(1);
      expect(result.driftLevel).toBe("minor");
    });
  });

  describe("detectDrift", () => {
    it("returns drift level string", async () => {
      const gw = createMockGateway();
      (gw.chatJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ driftLevel: "moderate" });
      const e = new BrandDNAEngine(gw);
      const result = await e.detectDrift(MOCK_PROFILE as any, MOCK_PROFILE as any);
      expect(result).toBe("moderate");
    });
  });
});
