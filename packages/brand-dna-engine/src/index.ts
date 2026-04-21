// @concentrik/brand-dna-engine — STUB
// See ../SHARED_DESIGN.md for cross-package conventions.
import type { GatewayClient } from "@concentrik/gateway-client";
import type { BrandProfile, BrandVoice } from "@concentrik/shared";

export type { BrandProfile, BrandVoice } from "@concentrik/shared";

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
