import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { mapProfileToScanResult } from "../_shared/brand-ingestor.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Re-runs mapProfileToScanResult against a brand's stored raw_profile to
 * refresh derived fields (colors, taxonomy, brand DNA) without re-scanning
 * the live website. Updates the brand row in place and returns the new
 * scan-shaped payload to the client for previewing.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ success: false, error: "Missing authorization" }, 401);
    }

    const { brandId, applyToBrand = true } = await req.json();
    if (!brandId || typeof brandId !== "string") {
      return jsonResponse({ success: false, error: "brandId is required" }, 400);
    }

    // Authenticated client (RLS enforced) — verifies caller can read the brand
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: brand, error: brandErr } = await supabase
      .from("brands")
      .select("id, website_url, raw_profile")
      .eq("id", brandId)
      .maybeSingle();

    if (brandErr) throw brandErr;
    if (!brand) return jsonResponse({ success: false, error: "Brand not found" }, 404);
    if (!brand.raw_profile) {
      return jsonResponse(
        { success: false, error: "No raw_profile stored. Run a fresh website scan first." },
        409,
      );
    }

    // Re-derive the scan result from the persisted profile.
    const scanResult = mapProfileToScanResult(
      brand.raw_profile as any,
      brand.website_url ?? "",
    );

    if (applyToBrand) {
      const updatePayload: Record<string, any> = {
        primary_color: scanResult.branding.colors.primary,
        secondary_color: scanResult.branding.colors.secondary,
        accent_color: scanResult.branding.colors.accent,
        background_color: scanResult.branding.colors.background,
        text_color: scanResult.branding.colors.text,
        taxonomy: scanResult.taxonomy,
        products: scanResult.products,
        brand_voice: { ...scanResult.brandDNA.voice, analyzedAt: new Date().toISOString() },
        brand_personality: scanResult.brandDNA.personality,
        brand_story: scanResult.brandDNA.story,
        brand_guardrails: { ...scanResult.brandDNA.guardrails, enabled: true },
      };
      if (scanResult.branding.logo) updatePayload.logo_url = scanResult.branding.logo;

      const { error: updateErr } = await supabase
        .from("brands")
        .update(updatePayload)
        .eq("id", brandId);
      if (updateErr) throw updateErr;
    }

    return jsonResponse({ success: true, scanResult });
  } catch (error) {
    console.error("[REDERIVE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ success: false, error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
