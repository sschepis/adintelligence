import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SHOPIFY-SYNC] ${step}${detailsStr}`);
};

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  tags: string;
  images: Array<{
    id: number;
    src: string;
    alt: string | null;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
    inventory_policy: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  try {
    logStep("Function started");

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Get user's org_id
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!profile?.org_id) throw new Error("User has no organization");
    const orgId = profile.org_id;
    logStep("Found organization", { orgId });

    // Get Shopify connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from("shopify_connections")
      .select("shop_domain, access_token")
      .eq("org_id", orgId)
      .single();

    if (connError || !connection) {
      throw new Error("No Shopify connection found. Please connect your store first.");
    }
    logStep("Found Shopify connection", { shop: connection.shop_domain });

    // Fetch products from Shopify
    const shopifyUrl = `https://${connection.shop_domain}/admin/api/2024-01/products.json?limit=250`;
    logStep("Fetching products from Shopify", { url: shopifyUrl });

    const response = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": connection.access_token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Shopify API error", { status: response.status, error: errorText });
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const { products } = await response.json() as { products: ShopifyProduct[] };
    logStep("Fetched products", { count: products.length });

    // Transform products to our format
    const transformedProducts = products.map((product) => ({
      shopify_id: product.id.toString(),
      title: product.title,
      description: product.body_html?.replace(/<[^>]*>/g, '') || '',
      vendor: product.vendor,
      product_type: product.product_type,
      handle: product.handle,
      status: product.status,
      tags: product.tags.split(', ').filter(Boolean),
      image_url: product.images[0]?.src || null,
      images: product.images.map(img => ({ id: img.id, src: img.src, alt: img.alt })),
      variants: product.variants.map(v => ({
        id: v.id,
        title: v.title,
        price: parseFloat(v.price),
        sku: v.sku,
        inventory_quantity: v.inventory_quantity,
      })),
      price_min: Math.min(...product.variants.map(v => parseFloat(v.price))),
      price_max: Math.max(...product.variants.map(v => parseFloat(v.price))),
      total_inventory: product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0),
      published_at: product.published_at,
      shopify_created_at: product.created_at,
      shopify_updated_at: product.updated_at,
    }));

    logStep("Transformed products", { count: transformedProducts.length });

    // Update organization with products
    const { error: updateError } = await supabaseAdmin
      .from("organizations")
      .update({
        products: transformedProducts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgId);

    if (updateError) {
      logStep("Error updating organization", { error: updateError });
      throw updateError;
    }

    logStep("Successfully synced products to organization");

    return new Response(JSON.stringify({ 
      success: true, 
      synced: transformedProducts.length,
      products: transformedProducts.slice(0, 10), // Return first 10 for preview
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
