// @concentrik/creative-copy-forge — Brand-aware text generation
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, safeParse } from "@concentrik/shared";

export type ContentType = "blog" | "product-description" | "email" | "ad-headline" | "ad-body" | "social-post" | "landing-hero";

export interface CopyRequest {
  contentType: ContentType;
  brief: string;
  tone?: string;
  targetAudience?: string;
  keywords?: string[];
  brandDNA?: unknown;
  lengthHint?: "short" | "medium" | "long";
}

export interface GeneratedCopy {
  primary: string;
  alternates: string[];
  metadata: { wordCount: number; readingLevel: string };
}

export interface VariantRequest {
  baseCopy: string;
  count: number;
  axis: "tone" | "length" | "angle" | "cta";
  brandDNA?: unknown;
}

// ── Schemas ─────────────────────────────────────────────────────────────

const GeneratedCopySchema = z.object({
  primary: z.string(),
  alternates: z.array(z.string()),
  metadata: z.object({
    wordCount: z.number(),
    readingLevel: z.string(),
  }),
});

const ABVariantSchema = z.object({
  headline: z.string(),
  body: z.string(),
  cta: z.string(),
});

// ── Prompt templates ────────────────────────────────────────────────────

const LONG_FORM_TYPES: ContentType[] = ["blog", "email"];

const CONTENT_TYPE_PROMPTS: Record<ContentType, string> = {
  "blog": "Write a blog post. Use headers, paragraphs, and a conversational tone. 800-1500 words.",
  "product-description": "Write a compelling product description. 100-200 words. Focus on benefits over features.",
  "email": "Write a marketing email. Include subject line, preview text, and body. 200-400 words.",
  "ad-headline": "Write a punchy ad headline. Maximum 10 words. Must grab attention immediately.",
  "ad-body": "Write ad body copy. 20-50 words. Clear value proposition and urgency.",
  "social-post": "Write a social media post. 50-150 words. Include hooks and engagement triggers.",
  "landing-hero": "Write landing page hero copy. Headline (8 words max) + subheadline (20 words max) + CTA text.",
};

function buildBrandContext(brandDNA: unknown): string {
  if (!brandDNA || typeof brandDNA !== "object") return "";

  const dna = brandDNA as Record<string, unknown>;
  const sections: string[] = [];

  if (dna.voice && typeof dna.voice === "object") {
    const voice = dna.voice as Record<string, unknown>;
    if (Array.isArray(voice.tone)) sections.push(`Voice tone: ${voice.tone.join(", ")}`);
    if (Array.isArray(voice.vocabulary)) sections.push(`Preferred vocabulary: ${voice.vocabulary.join(", ")}`);
    if (Array.isArray(voice.samplePhrases)) sections.push(`Sample phrases: ${voice.samplePhrases.join("; ")}`);
  }

  if (dna.personality && typeof dna.personality === "object") {
    const p = dna.personality as Record<string, unknown>;
    if (p.archetype) sections.push(`Brand archetype: ${p.archetype}`);
    if (Array.isArray(p.traits)) sections.push(`Personality traits: ${p.traits.join(", ")}`);
  }

  if (dna.guardrails && typeof dna.guardrails === "object") {
    const g = dna.guardrails as Record<string, unknown>;
    if (Array.isArray(g.forbiddenTerms) && g.forbiddenTerms.length) {
      sections.push(`FORBIDDEN TERMS (never use): ${g.forbiddenTerms.join(", ")}`);
    }
    if (Array.isArray(g.dont)) sections.push(`Avoid: ${g.dont.join("; ")}`);
  }

  return sections.length ? `\n\nBRAND GUIDELINES:\n${sections.join("\n")}` : "";
}

function getForbiddenTerms(brandDNA: unknown): string[] {
  if (!brandDNA || typeof brandDNA !== "object") return [];
  const dna = brandDNA as Record<string, unknown>;
  const guardrails = dna.guardrails as Record<string, unknown> | undefined;
  if (!guardrails || !Array.isArray(guardrails.forbiddenTerms)) return [];
  return guardrails.forbiddenTerms as string[];
}

function containsForbiddenTerm(text: string, terms: string[]): string | null {
  const lower = text.toLowerCase();
  for (const term of terms) {
    if (lower.includes(term.toLowerCase())) return term;
  }
  return null;
}

// ── Main class ──────────────────────────────────────────────────────────

export class CopyForge {
  constructor(private _gateway: GatewayClient) {}

  async generate(req: CopyRequest): Promise<GeneratedCopy> {
    const isLongForm = LONG_FORM_TYPES.includes(req.contentType);
    const model = isLongForm ? MODELS.PRO : MODELS.FAST;
    const brandContext = buildBrandContext(req.brandDNA);
    const typePrompt = CONTENT_TYPE_PROMPTS[req.contentType];

    const systemPrompt = `You are an expert copywriter. ${typePrompt}${brandContext}

Return JSON:
{
  "primary": "the main copy",
  "alternates": ["2-3 alternate versions"],
  "metadata": { "wordCount": <number>, "readingLevel": "grade level" }
}`;

    const parts = [`Brief: ${req.brief}`];
    if (req.tone) parts.push(`Tone: ${req.tone}`);
    if (req.targetAudience) parts.push(`Target audience: ${req.targetAudience}`);
    if (req.keywords?.length) parts.push(`Keywords to include: ${req.keywords.join(", ")}`);
    if (req.lengthHint) parts.push(`Length preference: ${req.lengthHint}`);

    let result = await this._gateway.chatJSON<unknown>({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parts.join("\n") },
      ],
      temperature: 0.7,
    });

    const copy = safeParse(GeneratedCopySchema, result);

    const forbidden = getForbiddenTerms(req.brandDNA);
    const violatedTerm = containsForbiddenTerm(copy.primary, forbidden);
    if (violatedTerm) {
      result = await this._gateway.chatJSON<unknown>({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: parts.join("\n") },
          { role: "assistant", content: JSON.stringify(copy) },
          { role: "user", content: `The output contained the forbidden term "${violatedTerm}". Rewrite without it, maintaining the same quality and intent.` },
        ],
        temperature: 0.7,
      });
      return safeParse(GeneratedCopySchema, result);
    }

    return copy;
  }

  async generateVariants(req: VariantRequest): Promise<string[]> {
    const axisDescriptions: Record<string, string> = {
      tone: "different emotional registers (e.g., urgent vs. calm, playful vs. serious)",
      length: "the same message at meaningfully different lengths",
      angle: "different selling points or value propositions",
      cta: "different calls-to-action approaches",
    };

    const brandContext = buildBrandContext(req.brandDNA);

    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST_LITE,
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter generating variants. Create ${req.count} meaningfully different versions along the "${req.axis}" axis: ${axisDescriptions[req.axis]}.${brandContext}

Return a JSON array of strings: ["variant 1", "variant 2", ...]`,
        },
        { role: "user", content: `Base copy:\n"${req.baseCopy}"\n\nGenerate ${req.count} variants.` },
      ],
      temperature: 0.8,
    });

    const arr = Array.isArray(result) ? result : (result as Record<string, unknown>).variants ?? [];
    return safeParse(z.array(z.string()).min(1), arr);
  }

  async rewrite(text: string, instruction: string, brandDNA?: unknown): Promise<string> {
    const brandContext = buildBrandContext(brandDNA);

    return this._gateway.chat({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter. Rewrite the provided text according to the instruction. Return only the rewritten text, no explanations.${brandContext}`,
        },
        { role: "user", content: `Instruction: ${instruction}\n\nOriginal text:\n"${text}"` },
      ],
      temperature: 0.6,
    });
  }

  async smartABVariants(
    baseAd: { headline: string; body: string; cta: string },
    count = 3,
  ): Promise<{ headline: string; body: string; cta: string }[]> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.FAST,
      messages: [
        {
          role: "system",
          content: `You are a marketing creative optimizer. Generate ${count} A/B test ad variants. Each variant should take a distinct approach (e.g., emotional appeal, social proof, urgency, curiosity).

Return a JSON array:
[{ "headline": "...", "body": "...", "cta": "..." }, ...]`,
        },
        {
          role: "user",
          content: `Baseline ad:\nHeadline: "${baseAd.headline}"\nBody: "${baseAd.body}"\nCTA: "${baseAd.cta}"\n\nGenerate ${count} distinct variants.`,
        },
      ],
      temperature: 0.8,
    });

    const arr = Array.isArray(result) ? result : (result as Record<string, unknown>).variants ?? [];
    return safeParse(z.array(ABVariantSchema).min(1), arr);
  }
}
