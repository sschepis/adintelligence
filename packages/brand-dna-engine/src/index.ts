// @concentrik/brand-dna-engine — STUB
import type { GatewayClient } from "@concentrik/gateway-client";

export interface BrandProfile {
  name: string;
  websiteUrl: string;
  voice?: BrandVoice;
  personality?: BrandPersonality;
  story?: BrandStory;
  guardrails?: BrandGuardrails;
  taxonomy?: BrandTaxonomy;
  rawProfile?: unknown;
}
export interface BrandVoice { tone: string[]; vocabulary: string[]; samplePhrases: string[]; }
export interface BrandPersonality { archetype: string; traits: string[]; }
export interface BrandStory { mission: string; values: string[]; origin: string; }
export interface BrandGuardrails { do: string[]; dont: string[]; forbiddenTerms: string[]; }
export interface BrandTaxonomy { categories: string[]; productTypes: string[]; }

export interface ConsistencyScore {
  overall: number;
  voiceAlignment: number;
  personalityAlignment: number;
  guardrailsCompliance: number;
  violations: string[];
  suggestions: string[];
  driftLevel: "none" | "minor" | "moderate" | "significant";
}

export class BrandDNAEngine {
  constructor(private _gateway: GatewayClient) {}
  async ingestWebsite(_url: string, _opts?: { stream?: boolean }): Promise<BrandProfile> { throw new Error("STUB"); }
  async deriveFromRaw(_raw: unknown): Promise<BrandProfile> { throw new Error("STUB"); }
  async analyzeVoice(_samples: string[]): Promise<BrandVoice> { throw new Error("STUB"); }
  async scoreConsistency(_content: string, _profile: BrandProfile): Promise<ConsistencyScore> { throw new Error("STUB"); }
  async detectDrift(_recent: BrandProfile, _baseline: BrandProfile): Promise<ConsistencyScore["driftLevel"]> { throw new Error("STUB"); }
}
