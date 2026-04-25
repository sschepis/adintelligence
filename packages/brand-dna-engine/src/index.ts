// @concentrik/brand-dna-engine — Brand DNA extraction, scoring, and drift detection
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import {
  MODELS,
  BrandProfileSchema,
  BrandVoiceSchema,
  safeParse,
} from "@concentrik/shared";
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

const ConsistencyScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  voiceAlignment: z.number().min(0).max(100),
  personalityAlignment: z.number().min(0).max(100),
  guardrailsCompliance: z.number().min(0).max(100),
  violations: z.array(z.string()),
  suggestions: z.array(z.string()),
  driftLevel: z.enum(["none", "minor", "moderate", "significant"]),
});

const DriftResultSchema = z.object({
  driftLevel: z.enum(["none", "minor", "moderate", "significant"]),
});

export class BrandDNAEngine {
  constructor(private _gateway: GatewayClient) {}

  async ingestWebsite(url: string, _opts?: { stream?: boolean }): Promise<BrandProfile> {
    const raw = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        { role: "system", content: INGEST_SYSTEM_PROMPT },
        { role: "user", content: `Analyze the brand at this URL: ${url}\n\nExtract and return a complete brand profile as JSON.` },
      ],
      temperature: 0.4,
    });

    const profile = safeParse(BrandProfileSchema, raw);
    return { ...profile, rawProfile: raw };
  }

  async deriveFromRaw(raw: unknown): Promise<BrandProfile> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        { role: "system", content: DERIVE_SYSTEM_PROMPT },
        { role: "user", content: `Given this raw brand data, extract a structured brand profile:\n\n${JSON.stringify(raw, null, 2)}` },
      ],
      temperature: 0.3,
    });

    return safeParse(BrandProfileSchema, result);
  }

  async analyzeVoice(samples: string[]): Promise<BrandVoice> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        { role: "system", content: VOICE_SYSTEM_PROMPT },
        { role: "user", content: `Analyze the brand voice from these text samples:\n\n${samples.map((s, i) => `Sample ${i + 1}:\n"${s}"`).join("\n\n")}` },
      ],
      temperature: 0.3,
    });

    return safeParse(BrandVoiceSchema, result);
  }

  async scoreConsistency(content: string, profile: BrandProfile): Promise<ConsistencyScore> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a brand consistency analyst. Score the provided content against the brand profile for voice alignment, personality alignment, and guardrails compliance.

BRAND PROFILE:
${JSON.stringify(profile, null, 2)}

Return a JSON object with this exact structure:
{
  "overall": <0-100>,
  "voiceAlignment": <0-100>,
  "personalityAlignment": <0-100>,
  "guardrailsCompliance": <0-100>,
  "violations": ["list of specific guideline violations found"],
  "suggestions": ["list of improvement suggestions"],
  "driftLevel": "none" | "minor" | "moderate" | "significant"
}`,
        },
        { role: "user", content: `Score this content for brand consistency:\n\n${content}` },
      ],
      temperature: 0.2,
    });

    return safeParse(ConsistencyScoreSchema, result);
  }

  async detectDrift(recent: BrandProfile, baseline: BrandProfile): Promise<ConsistencyScore["driftLevel"]> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a brand drift detector. Compare two brand profiles and determine the level of drift between them. Consider voice, personality, story, and guardrails changes.

Return a JSON object: { "driftLevel": "none" | "minor" | "moderate" | "significant" }

- "none": profiles are essentially identical
- "minor": small differences in tone or vocabulary
- "moderate": noticeable shifts in personality or messaging
- "significant": major changes in brand identity or guardrails`,
        },
        {
          role: "user",
          content: `Compare these two brand profiles for drift:\n\nBASELINE:\n${JSON.stringify(baseline, null, 2)}\n\nRECENT:\n${JSON.stringify(recent, null, 2)}`,
        },
      ],
      temperature: 0.1,
    });

    const parsed = safeParse(DriftResultSchema, result);
    return parsed.driftLevel;
  }
}

// ── Prompt templates ────────────────────────────────────────────────────

const INGEST_SYSTEM_PROMPT = `You are an expert brand analyst. Given a website URL, analyze the brand and extract a structured brand DNA profile. Always respond with valid JSON.

Return a JSON object with this exact structure:
{
  "name": "Brand Name",
  "websiteUrl": "https://...",
  "voice": {
    "tone": ["list of 3-5 tone descriptors"],
    "vocabulary": ["list of 5-10 characteristic words/phrases"],
    "samplePhrases": ["3-5 phrases that capture the brand voice"]
  },
  "personality": {
    "archetype": "primary brand archetype (e.g., Hero, Creator, Explorer)",
    "traits": ["list of 4-6 personality traits"]
  },
  "story": {
    "mission": "brand mission statement",
    "values": ["list of 3-5 core values"],
    "origin": "brief origin story"
  },
  "guardrails": {
    "do": ["list of 3-5 things the brand should do"],
    "dont": ["list of 3-5 things the brand should avoid"],
    "forbiddenTerms": ["terms the brand should never use"]
  },
  "taxonomy": {
    "categories": ["product/service categories"],
    "productTypes": ["specific product types"]
  }
}`;

const DERIVE_SYSTEM_PROMPT = `You are an expert brand analyst. Given raw brand data (possibly unstructured), extract and organize it into a clean, structured brand profile. Always respond with valid JSON.

Return a JSON object with this exact structure:
{
  "name": "Brand Name",
  "websiteUrl": "https://...",
  "voice": { "tone": [], "vocabulary": [], "samplePhrases": [] },
  "personality": { "archetype": "", "traits": [] },
  "story": { "mission": "", "values": [], "origin": "" },
  "guardrails": { "do": [], "dont": [], "forbiddenTerms": [] },
  "taxonomy": { "categories": [], "productTypes": [] }
}`;

const VOICE_SYSTEM_PROMPT = `You are a linguist specializing in brand voice analysis. Analyze the provided text samples to extract the brand's voice characteristics. Always respond with valid JSON.

Return a JSON object with this exact structure:
{
  "tone": ["list of 3-5 tone descriptors that characterize the voice"],
  "vocabulary": ["list of 5-10 characteristic words/phrases used"],
  "samplePhrases": ["3-5 phrases that best capture the brand voice"]
}`;
