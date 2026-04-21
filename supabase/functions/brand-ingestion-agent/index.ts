import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runBrandIngestion } from "../_shared/brand-ingestor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
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
 * Agentic ingestion endpoint, backed by @sschepis/brand-ingestor.
 *
 * Modes:
 *  - When the client sends `Accept: text/event-stream`, the response is a
 *    streamed SSE feed of progress events ending with a final `result` event.
 *  - Otherwise (legacy / `continue`), it returns a single JSON response.
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

    // No-op continuation
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

    const wantsSSE = (req.headers.get("accept") ?? "").includes("text/event-stream");
    console.log("[INGESTION-AGENT]", { url: normalizedUrl, sse: wantsSSE });

    if (wantsSSE) {
      return streamIngestion(normalizedUrl, apiKey);
    }

    // Non-streaming fallback path
    const phaseEvents: Array<{ step: string; message: string; progress: number }> = [];
    const result = await runBrandIngestion({
      url: normalizedUrl,
      apiKey,
      maxPages: 20,
      concurrency: 2,
      onPhase: (p) => phaseEvents.push(p),
    });

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
        progressUpdates: phaseEvents.map((p) => ({ type: "progress", ...p })),
        conversationMessages: [{ role: "assistant", content: summary }],
        rawProfile: result.rawProfile,
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

/**
 * Streams ingestion progress as SSE. Emits one `phase` event per step,
 * a final `result` event with the full state, and closes.
 */
function streamIngestion(url: string, apiKey: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      // Heartbeat so intermediaries don't buffer the stream
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(`: ping\n\n`)); } catch { /* ignore */ }
      }, 15_000);

      try {
        send("phase", { step: "initializing", message: `Starting ingestion for ${url}`, progress: 5 });

        const result = await runBrandIngestion({
          url,
          apiKey,
          maxPages: 20,
          concurrency: 2,
          onPhase: (p) => send("phase", p),
        });

        const newState: IngestionState = {
          url,
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

        send("phase", { step: "complete", message: "Ingestion complete.", progress: 100 });
        send("result", {
          success: true,
          state: newState,
          rawProfile: result.rawProfile,
          scanResult: result,
          completeSummary:
            `Ingested ${result.brandName}: ${result.products.length} products, ` +
            `${result.taxonomy.length} categories, brand colors and DNA extracted.`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[INGESTION-AGENT] SSE error:", message);
        send("error", { message });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
