// Shared helpers for using @sschepis/brand-ingestor with Lovable AI Gateway.
import { ingestBrand, type BrandProfile, type LLMProvider } from "npm:@sschepis/brand-ingestor@1.0.0";
import { z } from "npm:zod@^4.3.6";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

/**
 * Converts a Zod schema into a JSON Schema object the Lovable AI Gateway
 * (OpenAI-compatible) accepts as a `function` tool's `parameters`.
 *
 * brand-ingestor uses zod v4. We do a pragmatic recursive walk producing
 * a valid JSON Schema subset that covers everything brand-ingestor uses.
 */
function zodToJsonSchema(schema: any): any {
  // Unwrap optional / default / nullable wrappers
  const def = schema?._def ?? schema?.def;
  if (!def) return { type: "object", additionalProperties: true };

  const typeName = def.typeName ?? def.type;

  switch (typeName) {
    case "ZodOptional":
    case "optional":
      return zodToJsonSchema(def.innerType ?? def.innerType);
    case "ZodNullable":
    case "nullable": {
      const inner = zodToJsonSchema(def.innerType);
      return { ...inner, nullable: true };
    }
    case "ZodDefault":
    case "default":
      return zodToJsonSchema(def.innerType);
    case "ZodString":
    case "string":
      return { type: "string" };
    case "ZodNumber":
    case "number":
      return { type: "number" };
    case "ZodBoolean":
    case "boolean":
      return { type: "boolean" };
    case "ZodArray":
    case "array":
      return { type: "array", items: zodToJsonSchema(def.type ?? def.element) };
    case "ZodEnum":
    case "enum":
      return { type: "string", enum: def.values ?? def.entries };
    case "ZodRecord":
    case "record":
      return { type: "object", additionalProperties: zodToJsonSchema(def.valueType ?? def.value) };
    case "ZodObject":
    case "object": {
      const shape = typeof def.shape === "function" ? def.shape() : def.shape;
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape ?? {})) {
        const v: any = val;
        properties[key] = zodToJsonSchema(v);
        const innerDef = v?._def ?? v?.def;
        const innerType = innerDef?.typeName ?? innerDef?.type;
        if (innerType !== "ZodOptional" && innerType !== "optional" &&
            innerType !== "ZodDefault" && innerType !== "default") {
          required.push(key);
        }
      }
      const out: any = { type: "object", properties, additionalProperties: false };
      if (required.length) out.required = required;
      return out;
    }
    default:
      return {};
  }
}

/**
 * Builds an LLMProvider that calls Lovable AI Gateway with tool-calling
 * to enforce the schema brand-ingestor passes in.
 */
export function createLovableLLMProvider(opts: {
  apiKey: string;
  model?: string;
}): LLMProvider {
  const model = opts.model ?? DEFAULT_MODEL;
  return {
    generateObject: async <T>(prompt: string, schema: z.ZodType<T>): Promise<T> => {
      const parameters = zodToJsonSchema(schema);
      const body = {
        model,
        messages: [
          {
            role: "system",
            content:
              "You extract structured information from web content. Always respond by calling the provided function with valid arguments matching the schema. Use null/empty arrays when information is unknown.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_result",
              description: "Emit the structured extraction result.",
              parameters,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_result" } },
      };

      const resp = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        if (resp.status === 429) throw new Error("Rate limit exceeded calling Lovable AI Gateway");
        if (resp.status === 402) throw new Error("Lovable AI credits exhausted. Add credits to continue.");
        throw new Error(`Lovable AI Gateway error ${resp.status}: ${text}`);
      }

      const json = await resp.json();
      const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
      const argsString = toolCall?.function?.arguments;
      if (!argsString) {
        // Fallback: model returned plain content
        const content = json?.choices?.[0]?.message?.content ?? "{}";
        return schema.parse(safeParseJson(content));
      }
      const parsedArgs = safeParseJson(argsString);
      return schema.parse(parsedArgs);
    },
  };
}

function safeParseJson(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    // Try to grab the first JSON object substring
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
    return {};
  }
}

export interface ScanResultPayload {
  success: true;
  isBrand: boolean;
  brandName: string;
  confidence: number;
  reason: string;
  branding: {
    logo: string | null;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    colorScheme: "light" | "dark";
  };
  taxonomy: string[];
  products: any[];
  brandDNA: any;
  metadata: Record<string, any>;
  rawProfile?: BrandProfile;
}

const DEFAULT_COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  background: "#0a0a0a",
  text: "#ffffff",
};

function isLight(hex: string): boolean {
  const m = hex.replace("#", "").match(/^[0-9a-f]{6}$/i);
  if (!m) return false;
  const n = parseInt(m[0], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // Perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

/**
 * Map a BrandProfile from @sschepis/brand-ingestor onto the legacy
 * scan-website ScanResult shape the frontend expects.
 */
export function mapProfileToScanResult(
  profile: BrandProfile,
  sourceUrl: string,
): ScanResultPayload {
  const company = profile.company ?? {};
  const brand = profile.brand ?? {};
  const taxonomyData = profile.taxonomy ?? {};
  const products = profile.products ?? [];

  // Pick brand colors
  const colorList = (brand.colors ?? []).map((c) => c.hex).filter(Boolean);
  const primary = colorList[0] ?? DEFAULT_COLORS.primary;
  const secondary = colorList[1] ?? DEFAULT_COLORS.secondary;
  const accent = colorList[2] ?? DEFAULT_COLORS.accent;
  const background = colorList[3] ?? DEFAULT_COLORS.background;
  const text = isLight(background) ? "#0a0a0a" : "#ffffff";
  const colorScheme: "light" | "dark" = isLight(background) ? "light" : "dark";

  // Pick a logo
  const logo = brand.logos?.find((l) => l.context !== "favicon")?.url
    ?? brand.logos?.[0]?.url
    ?? null;

  // Taxonomy: collection titles + product types + tags
  const taxonomy = Array.from(new Set([
    ...(taxonomyData.collections ?? []).map((c) => c.title).filter(Boolean),
    ...(taxonomyData.productTypes ?? []),
    ...(taxonomyData.tags ?? []).slice(0, 30),
  ])).slice(0, 30);

  // Map products to legacy shape
  const mappedProducts = products.map((p) => {
    const firstVariant = p.variants?.[0];
    const priceNum = firstVariant?.price ? Number(firstVariant.price) : undefined;
    const compareAtNum = firstVariant?.compareAtPrice ? Number(firstVariant.compareAtPrice) : undefined;
    const images = (p.images ?? []).map((i) => i.url).filter(Boolean);
    return {
      name: p.name,
      category: p.productType ?? taxonomy[0] ?? "Uncategorized",
      price: Number.isFinite(priceNum as number) ? priceNum : undefined,
      currency: taxonomyData.priceRange?.currency ?? "USD",
      originalPrice: Number.isFinite(compareAtNum as number) ? compareAtNum : undefined,
      description: p.description,
      image: images[0],
      images,
      inStock: firstVariant?.available,
      variants: p.variants?.map((v) => v.title).filter(Boolean),
      tags: p.tags ?? [],
      url: p.url,
    };
  });

  // Brand DNA mapping (best-effort from brand-ingestor's flat fields)
  const brandDNA = {
    voice: {
      toneSpectrum: { formal: 50, casual: 50, professional: 50, friendly: 50, authoritative: 50, playful: 50 },
      vocabulary: { preferred: brand.brandValues ?? [], avoided: [] },
      emotionalSignature: brand.brandPersonality ? [brand.brandPersonality] : [],
      communicationPatterns: brand.voiceTone ? [brand.voiceTone] : [],
      sentenceStyle: "medium",
    },
    personality: {
      archetype: null as string | null,
      secondaryArchetype: null as string | null,
      traits: brand.brandValues ?? [],
      values: brand.brandValues ?? [],
      emotionalTone: brand.brandPersonality ?? null,
    },
    story: {
      mission: company.description ?? null,
      vision: null,
      tagline: company.tagline ?? brand.taglines?.[0] ?? null,
      origin: company.foundedYear ? `Founded in ${company.foundedYear}` : null,
      enemyStatement: null,
      transformationPromise: null,
    },
    guardrails: {
      forbiddenWords: [],
      avoidTopics: [],
      toneAvoid: [],
      visualAvoid: [],
      competitorMentions: false,
      enabled: true,
    },
  };

  const brandName = company.name ?? company.legalName ?? new URL(sourceUrl).hostname.replace(/^www\./, "");
  const isBrand = mappedProducts.length > 0 || !!company.name;
  const confidence = mappedProducts.length > 0 ? 85 : (company.name ? 60 : 30);

  return {
    success: true,
    isBrand,
    brandName,
    confidence,
    reason: isBrand
      ? `Found ${mappedProducts.length} products and brand identity for ${brandName}`
      : "We couldn't identify this as a brand with products or services for sale.",
    branding: {
      logo,
      colors: { primary, secondary, accent, background, text },
      colorScheme,
    },
    taxonomy,
    products: mappedProducts.slice(0, 50),
    brandDNA,
    metadata: {
      title: company.name,
      description: company.description,
      url: sourceUrl,
      productCount: mappedProducts.length,
      platform: profile.platform,
      ingestedAt: profile.ingestedAt,
    },
    rawProfile: profile,
  };
}

/**
 * Run the full brand ingestion pipeline against a URL using the
 * Lovable AI Gateway as the LLM backend.
 */
export async function runBrandIngestion(opts: {
  url: string;
  apiKey: string;
  model?: string;
  maxPages?: number;
  concurrency?: number;
}): Promise<ScanResultPayload> {
  const llmProvider = createLovableLLMProvider({ apiKey: opts.apiKey, model: opts.model });
  const profile = await ingestBrand(opts.url, {
    llmProvider,
    maxPages: opts.maxPages ?? 20,
    concurrency: opts.concurrency ?? 2,
  });
  return mapProfileToScanResult(profile, opts.url);
}
