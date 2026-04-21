// @concentrik/shared — common types, schemas, errors, constants

import { z } from "zod";

// ─── Models ─────────────────────────────────────────────────────────────
export const MODELS = {
  FAST: "google/gemini-2.5-flash",
  FAST_LITE: "google/gemini-2.5-flash-lite",
  PRO: "google/gemini-2.5-pro",
  REASONING: "openai/gpt-5",
  REASONING_MINI: "openai/gpt-5-mini",
  IMAGE_FAST: "google/gemini-3.1-flash-image-preview",
  IMAGE_PRO: "google/gemini-3-pro-image-preview",
} as const;
export type ModelId = (typeof MODELS)[keyof typeof MODELS];

// ─── Aspect ratios ──────────────────────────────────────────────────────
export const AspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

// ─── Brand DNA (canonical) ──────────────────────────────────────────────
export const BrandVoiceSchema = z.object({
  tone: z.array(z.string()),
  vocabulary: z.array(z.string()),
  samplePhrases: z.array(z.string()),
});
export const BrandPersonalitySchema = z.object({
  archetype: z.string(),
  traits: z.array(z.string()),
});
export const BrandStorySchema = z.object({
  mission: z.string(),
  values: z.array(z.string()),
  origin: z.string(),
});
export const BrandGuardrailsSchema = z.object({
  do: z.array(z.string()),
  dont: z.array(z.string()),
  forbiddenTerms: z.array(z.string()),
});
export const BrandTaxonomySchema = z.object({
  categories: z.array(z.string()),
  productTypes: z.array(z.string()),
});
export const BrandProfileSchema = z.object({
  name: z.string(),
  websiteUrl: z.string().url(),
  voice: BrandVoiceSchema.optional(),
  personality: BrandPersonalitySchema.optional(),
  story: BrandStorySchema.optional(),
  guardrails: BrandGuardrailsSchema.optional(),
  taxonomy: BrandTaxonomySchema.optional(),
  rawProfile: z.unknown().optional(),
});
export type BrandProfile = z.infer<typeof BrandProfileSchema>;

// ─── Streaming events ──────────────────────────────────────────────────
export const StreamEventSchema = z.object({
  type: z.enum(["token", "stage", "tool_call", "done", "error"]),
  stage: z.string().optional(),
  data: z.unknown().optional(),
});
export type StreamEvent = z.infer<typeof StreamEventSchema>;

// ─── Tool calls ────────────────────────────────────────────────────────
export const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

// ─── Errors ────────────────────────────────────────────────────────────
export class ConcentrikError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = "ConcentrikError";
  }
}
export class GatewayError extends ConcentrikError {
  constructor(message: string, public status: number, details?: unknown) {
    super(message, "GATEWAY_ERROR", details);
    this.name = "GatewayError";
  }
}
export class ValidationError extends ConcentrikError {
  constructor(message: string, public issues: { path: string; message: string }[]) {
    super(message, "VALIDATION_ERROR", issues);
    this.name = "ValidationError";
  }
}
export class RateLimitError extends GatewayError {
  constructor(message = "Rate limit exceeded") { super(message, 429); this.name = "RateLimitError"; }
}
export class CreditsExhaustedError extends GatewayError {
  constructor(message = "AI credits exhausted") { super(message, 402); this.name = "CreditsExhaustedError"; }
}

// ─── Utilities ─────────────────────────────────────────────────────────
export function extractJSON<T = unknown>(content: string): T {
  const fenced = content.match(/```json\n?([\s\S]*?)\n?```/);
  const bare = content.match(/\{[\s\S]*\}/);
  const raw = fenced?.[1] ?? bare?.[0] ?? content;
  return JSON.parse(raw) as T;
}

export function safeParse<T>(schema: z.ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new ValidationError(
      "Schema validation failed",
      r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  return r.data;
}
