import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runBrandIngestion } from "../_shared/brand-ingestor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
};

const failurePayload = (message: string, sourceUrl: string) => ({
  success: false,
  error: message,
  isBrand: false,
  brandName: "Unknown",
  confidence: 0,
  reason: "Scan failed",
  branding: {
    logo: null,
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      background: "#0a0a0a",
      text: "#ffffff",
    },
    colorScheme: "dark",
  },
  taxonomy: [],
  products: [],
  metadata: { title: null, description: null, url: sourceUrl },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;

    const wantsSSE = (req.headers.get("accept") ?? "").includes("text/event-stream");
    console.log("[SCAN-WEBSITE]", { url: normalizedUrl, sse: wantsSSE });

    if (wantsSSE) {
      return streamScan(normalizedUrl, apiKey);
    }

    const result = await runBrandIngestion({
      url: normalizedUrl,
      apiKey,
      maxPages: 20,
      concurrency: 2,
    });

    console.log("[SCAN-WEBSITE] Done", {
      brand: result.brandName,
      isBrand: result.isBrand,
      products: result.products.length,
      taxonomy: result.taxonomy.length,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[SCAN-WEBSITE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify(failurePayload(message, "")),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

/**
 * Streams scan progress as SSE so the landing-page onboarding can show
 * the same live progress phases as the BrandIngestion page.
 */
function streamScan(url: string, apiKey: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(`: ping\n\n`)); } catch { /* ignore */ }
      }, 15_000);

      try {
        send("phase", { step: "initializing", message: `Starting scan for ${url}`, progress: 5 });

        const result = await runBrandIngestion({
          url,
          apiKey,
          maxPages: 20,
          concurrency: 2,
          onPhase: (p) => send("phase", p),
          onPartial: (partial) => send("partial", partial),
        });

        send("phase", { step: "complete", message: "Scan complete.", progress: 100 });
        send("result", result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[SCAN-WEBSITE] SSE error:", message);
        send("error", { message });
        send("result", failurePayload(message, url));
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
