// Shared brand-related TypeScript interfaces
// Consolidates types previously scattered across hooks and components

// Re-export BrandDNA types from useBrandDNA (canonical source)
export type {
  ToneSpectrum,
  BrandVoice,
  BrandPersonality,
  BrandStory,
  BrandGuardrails,
  BrandDNAScore,
  BrandDNA,
} from "@/hooks/useBrandDNA";

// Product interface for brand catalog items stored in the brands.products JSON column
export interface Product {
  id?: string;
  name: string;
  sku?: string;
  image_url?: string;
  image?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  category?: string;
  description?: string;
  url?: string;
  stock?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  variants?: string[];
  tags?: string[];
  trending?: boolean;
  channel?: "online" | "retail" | string;
  created_at?: string;
}

// Brand metadata stored in the brands.metadata JSON column
export interface BrandMetadata {
  avgOrderValue?: number;
  industry?: string;
  targetAudience?: string;
  [key: string]: unknown;
}
