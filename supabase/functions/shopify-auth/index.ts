import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID") || "";
const SHOPIFY_CLIENT_SECRET = Deno.env.get("SHOPIFY_CLIENT_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const SCOPES = [
  "read_products",
  "read_inventory",
  "read_orders",
  "read_customers",
].join(",");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  try {
    const { action, shop, code, state } = await req.json();
    const origin = req.headers.get("origin") || "https://smlcnrwkhiyvwkpjxhjs.lovable.app";

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;

    // Get user's org_id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!profile?.org_id) throw new Error("User has no organization");
    const orgId = profile.org_id;

    if (action === "init") {
      // Step 1: Generate OAuth URL
      if (!shop) throw new Error("Shop domain required");
      if (!SHOPIFY_CLIENT_ID) throw new Error("Shopify client ID not configured");

      const redirectUri = `${origin}/settings?shopify_callback=true`;
      const stateParam = btoa(JSON.stringify({ orgId, userId }));
      
      const authUrl = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
        client_id: SHOPIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: redirectUri,
        state: stateParam,
      }).toString();

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      // Step 2: Exchange code for access token
      if (!code || !shop) throw new Error("Code and shop required");
      if (!SHOPIFY_CLIENT_SECRET) throw new Error("Shopify client secret not configured");

      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Store the connection
      const { error: upsertError } = await supabaseAdmin
        .from("shopify_connections")
        .upsert({
          org_id: orgId,
          shop_domain: shop,
          access_token: tokenData.access_token,
          scope: tokenData.scope,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "org_id",
        });

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ success: true, shop }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      // Remove the connection
      const { error: deleteError } = await supabaseAdmin
        .from("shopify_connections")
        .delete()
        .eq("org_id", orgId);

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Shopify auth error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
