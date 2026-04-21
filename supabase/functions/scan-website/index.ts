import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runBrandIngestion } from "../_shared/brand-ingestor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log("[SCAN-WEBSITE] Ingesting via @sschepis/brand-ingestor:", normalizedUrl);
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
      JSON.stringify({
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
        metadata: { title: null, description: null, url: "" },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
