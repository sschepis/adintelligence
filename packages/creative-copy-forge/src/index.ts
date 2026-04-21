// @concentrik/creative-copy-forge — STUB
import type { GatewayClient } from "@concentrik/gateway-client";

export type ContentType = "blog" | "product-description" | "email" | "ad-headline" | "ad-body" | "social-post" | "landing-hero";
export interface CopyRequest { contentType: ContentType; brief: string; tone?: string; targetAudience?: string; keywords?: string[]; brandDNA?: unknown; lengthHint?: "short" | "medium" | "long"; }
export interface GeneratedCopy { primary: string; alternates: string[]; metadata: { wordCount: number; readingLevel: string; }; }
export interface VariantRequest { baseCopy: string; count: number; axis: "tone" | "length" | "angle" | "cta"; brandDNA?: unknown; }

export class CopyForge {
  constructor(private _gateway: GatewayClient) {}
  async generate(_req: CopyRequest): Promise<GeneratedCopy> { throw new Error("STUB"); }
  async generateVariants(_req: VariantRequest): Promise<string[]> { throw new Error("STUB"); }
  async rewrite(_text: string, _instruction: string, _brandDNA?: unknown): Promise<string> { throw new Error("STUB"); }
  async smartABVariants(_baseAd: { headline: string; body: string; cta: string }, _count?: number): Promise<{ headline: string; body: string; cta: string }[]> { throw new Error("STUB"); }
}
