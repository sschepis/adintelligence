import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runBrandIngestion } from "../_shared/brand-ingestor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestionState {
  url: string;
  phase: string;
  brandName: string | null;
  colors: Record<string, string>;
  products: any[];
  taxonomy: string[];
  brandDNA: any;
  metadata: Record<string, any>;
  pagesScanned: number;
  errors: string[];
}

/**
 * Agentic ingestion endpoint, now backed by @sschepis/brand-ingestor.
 *
 * The library handles its own multi-step crawl + LLM extraction, so this
 * endpoint runs in a single call but preserves the response contract used
 * by `useBrandIngestion` (assistantMessage, progressUpdates, state, etc.).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, url, state: incomingState } = body as {
      action: "start" | "continue";
      url?: string;
      state?: IngestionState | null;
    };

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // If we're "continuing" but the state already shows completion, no-op.
    if (action === "continue" && incomingState?.phase === "complete") {
      return new Response(
        JSON.stringify({
          success: true,
          state: incomingState,
          assistantMessage: "Ingestion already complete.",
          requiresUserAction: false,
          isComplete: true,
          completeSummary: "Brand ingestion complete.",
          progressUpdates: [],
          conversationMessages: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const targetUrl = url ?? incomingState?.url;
    if (!targetUrl) throw new Error("A URL is required to start ingestion");

    let normalizedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;

    console.log("[INGESTION-AGENT] Running brand-ingestor for", normalizedUrl);

    const progressUpdates = [
      { type: "progress", step: "scraping", message: "Crawling site and extracting brand data...", progress: 25 },
    ];

    const result = await runBrandIngestion({
      url: normalizedUrl,
      apiKey,
      maxPages: 20,
      concurrency: 2,
    });

    progressUpdates.push(
      { type: "progress", step: "analyzing", message: "Analyzing brand identity and products...", progress: 70 },
      { type: "progress", step: "complete", message: "Ingestion complete.", progress: 100 },
    );

    const newState: IngestionState = {
      url: normalizedUrl,
      phase: "complete",
      brandName: result.brandName,
      colors: result.branding.colors,
      products: result.products,
      taxonomy: result.taxonomy,
      brandDNA: result.brandDNA,
      metadata: result.metadata,
      pagesScanned: result.metadata?.pagesScanned ?? result.products.length + 1,
      errors: [],
    };

    const summary = `Ingested ${result.brandName}: ${result.products.length} products, ` +
      `${result.taxonomy.length} categories, brand colors and DNA extracted.`;

    return new Response(
      JSON.stringify({
        success: true,
        state: newState,
        assistantMessage: summary,
        toolResults: [],
        requiresUserAction: false,
        reviewRequest: null,
        isComplete: true,
        completeSummary: summary,
        progressUpdates,
        conversationMessages: [
          { role: "assistant", content: summary },
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[INGESTION-AGENT] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
