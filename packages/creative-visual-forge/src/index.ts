// @concentrik/creative-visual-forge — STUB
// See ../SHARED_DESIGN.md for cross-package conventions.
import type { GatewayClient } from "@concentrik/gateway-client";
import type { AspectRatio } from "@concentrik/shared";

export type AssetType = "hero" | "product-shot" | "lifestyle" | "social-post" | "storyboard-frame" | "ad-creative";
export interface ImageRequest { assetType: AssetType; prompt: string; aspectRatio: AspectRatio; brandDNA?: unknown; referenceImages?: string[]; quality?: "fast" | "standard" | "premium"; }
export interface GeneratedImage { url: string; width: number; height: number; prompt: string; }

export interface ProductImageAnalysis { dominantColors: string[]; colorHexCodes: string[]; aestheticStyle: string; patterns: string[]; luxuryScore: number; trendColors?: string[]; colorMatchScore?: number; }

export class VisualForge {
  constructor(private _gateway: GatewayClient) {}
  async generate(_req: ImageRequest): Promise<GeneratedImage> { throw new Error("STUB"); }
  async generateStoryboardFrame(_input: { shotPrompt: string; styleAnchor?: string; aspectRatio: AspectRatio; brandDNA?: unknown }): Promise<GeneratedImage> { throw new Error("STUB"); }
  async retryFailedFrames(_inputs: { shotIndex: number; shotPrompt: string }[], _opts: { aspectRatio: AspectRatio; styleAnchor?: string }): Promise<{ shotIndex: number; result: GeneratedImage | { error: string } }[]> { throw new Error("STUB"); }
  async analyzeProductImage(_imageUrl: string, _trendColors?: string[]): Promise<ProductImageAnalysis> { throw new Error("STUB"); }
}
