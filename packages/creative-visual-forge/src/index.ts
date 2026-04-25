// @concentrik/creative-visual-forge — Image generation and vision analysis
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, safeParse } from "@concentrik/shared";
import type { AspectRatio } from "@concentrik/shared";

export type AssetType = "hero" | "product-shot" | "lifestyle" | "social-post" | "storyboard-frame" | "ad-creative";

export interface ImageRequest {
  assetType: AssetType;
  prompt: string;
  aspectRatio: AspectRatio;
  brandDNA?: unknown;
  referenceImages?: string[];
  quality?: "fast" | "standard" | "premium";
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  prompt: string;
}

export interface ProductImageAnalysis {
  dominantColors: string[];
  colorHexCodes: string[];
  aestheticStyle: string;
  patterns: string[];
  luxuryScore: number;
  trendColors?: string[];
  colorMatchScore?: number;
}

// ── Schemas ─────────────────────────────────────────────────────────────

const ProductImageAnalysisSchema = z.object({
  dominantColors: z.array(z.string()),
  colorHexCodes: z.array(z.string()),
  aestheticStyle: z.string(),
  patterns: z.array(z.string()),
  luxuryScore: z.number().min(0).max(100),
  trendColors: z.array(z.string()).optional(),
  colorMatchScore: z.number().min(0).max(100).optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

const ASSET_TYPE_HINTS: Record<AssetType, string> = {
  "hero": "high-impact hero banner image, bold composition, brand-forward",
  "product-shot": "clean product photography, studio lighting, white or contextual background",
  "lifestyle": "lifestyle photography showing the product in real-world context",
  "social-post": "eye-catching social media visual optimized for engagement",
  "storyboard-frame": "cinematic storyboard frame, film-quality composition",
  "ad-creative": "performance ad creative, clear focal point, designed to convert",
};

function buildImagePrompt(req: ImageRequest): string {
  const parts = [ASSET_TYPE_HINTS[req.assetType], req.prompt];

  if (req.brandDNA && typeof req.brandDNA === "object") {
    const dna = req.brandDNA as Record<string, unknown>;
    if (dna.personality && typeof dna.personality === "object") {
      const p = dna.personality as Record<string, unknown>;
      if (p.archetype) parts.push(`brand archetype: ${p.archetype}`);
    }
    const guardrails = dna.guardrails as Record<string, unknown> | undefined;
    if (guardrails && Array.isArray(guardrails.dont)) {
      parts.push(`avoid: ${(guardrails.dont as string[]).join(", ")}`);
    }
  }

  return parts.join(". ");
}

function computeColorMatchScore(imageColors: string[], trendColors: string[]): number {
  if (!trendColors.length || !imageColors.length) return 0;
  const normalizedImage = imageColors.map((c) => c.toLowerCase());
  const normalizedTrend = trendColors.map((c) => c.toLowerCase());
  const matches = normalizedTrend.filter((tc) =>
    normalizedImage.some((ic) => ic.includes(tc) || tc.includes(ic)),
  ).length;
  return Math.round((matches / normalizedTrend.length) * 100);
}

// ── Main class ──────────────────────────────────────────────────────────

export class VisualForge {
  constructor(private _gateway: GatewayClient) {}

  async generate(req: ImageRequest): Promise<GeneratedImage> {
    const model = req.quality === "premium" ? MODELS.IMAGE_PRO : MODELS.IMAGE_FAST;
    const prompt = buildImagePrompt(req);
    const dims = ASPECT_DIMENSIONS[req.aspectRatio] ?? ASPECT_DIMENSIONS["16:9"];

    const content = await this._gateway.chat({
      model,
      messages: [
        { role: "user", content: `Generate an image: ${prompt}. Aspect ratio: ${req.aspectRatio}.` },
      ],
      modalities: ["image", "text"],
      temperature: 0.8,
    });

    return { url: content, width: dims.width, height: dims.height, prompt };
  }

  async generateStoryboardFrame(input: {
    shotPrompt: string;
    styleAnchor?: string;
    aspectRatio: AspectRatio;
    brandDNA?: unknown;
  }): Promise<GeneratedImage> {
    const dims = ASPECT_DIMENSIONS[input.aspectRatio] ?? ASPECT_DIMENSIONS["16:9"];
    const parts = [
      `Cinematic storyboard frame, ${input.aspectRatio} aspect ratio`,
      input.shotPrompt,
    ];
    if (input.styleAnchor) parts.push(`Style reference: ${input.styleAnchor}`);

    if (input.brandDNA && typeof input.brandDNA === "object") {
      const dna = input.brandDNA as Record<string, unknown>;
      if (dna.personality && typeof dna.personality === "object") {
        const p = dna.personality as Record<string, unknown>;
        if (p.archetype) parts.push(`brand archetype: ${p.archetype}`);
      }
    }

    const prompt = parts.join(". ");
    const content = await this._gateway.chat({
      model: MODELS.IMAGE_FAST,
      messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
      modalities: ["image", "text"],
      temperature: 0.8,
    });

    return { url: content, width: dims.width, height: dims.height, prompt };
  }

  async retryFailedFrames(
    inputs: { shotIndex: number; shotPrompt: string }[],
    opts: { aspectRatio: AspectRatio; styleAnchor?: string },
  ): Promise<{ shotIndex: number; result: GeneratedImage | { error: string } }[]> {
    const results = await Promise.allSettled(
      inputs.map((input) =>
        this.generateStoryboardFrame({
          shotPrompt: input.shotPrompt,
          styleAnchor: opts.styleAnchor,
          aspectRatio: opts.aspectRatio,
        }),
      ),
    );

    return results.map((r, i) => ({
      shotIndex: inputs[i].shotIndex,
      result:
        r.status === "fulfilled"
          ? r.value
          : { error: r.reason instanceof Error ? r.reason.message : String(r.reason) },
    }));
  }

  async analyzeProductImage(imageUrl: string, trendColors?: string[]): Promise<ProductImageAnalysis> {
    const result = await this._gateway.chatJSON<unknown>({
      model: MODELS.PRO,
      messages: [
        {
          role: "system",
          content: `You are an expert color and style analyst for fashion and product imagery. Analyze the provided product image.

Return JSON:
{
  "dominantColors": ["color name 1", "color name 2"],
  "colorHexCodes": ["#hex1", "#hex2"],
  "aestheticStyle": "description of overall aesthetic",
  "patterns": ["pattern 1", "pattern 2"],
  "luxuryScore": <0-100 luxury perception score>
}`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this product image.${trendColors?.length ? ` Current trend colors: ${trendColors.join(", ")}` : ""}` },
            { type: "image_url", image_url: { url: imageUrl } },
          ] as unknown as string,
        },
      ],
      temperature: 0.3,
    });

    const analysis = safeParse(ProductImageAnalysisSchema, result);

    if (trendColors?.length) {
      analysis.trendColors = trendColors;
      analysis.colorMatchScore = computeColorMatchScore(analysis.dominantColors, trendColors);
    }

    return analysis;
  }
}
