import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAINFOREST_API_KEY = Deno.env.get("RAINFOREST_API_KEY") || "";
const BASE_URL = "https://api.rainforestapi.com/request";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAINFOREST] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    logStep("Request received", { action });

    if (!RAINFOREST_API_KEY) {
      throw new Error("Rainforest API key not configured");
    }

    const queryParams = new URLSearchParams({
      api_key: RAINFOREST_API_KEY,
      amazon_domain: params.amazon_domain || "amazon.com",
      output: "json",
    });

    switch (action) {
      case "search":
        // Search for products by keyword
        queryParams.set("type", "search");
        queryParams.set("search_term", params.search_term);
        if (params.category_id) queryParams.set("category_id", params.category_id);
        if (params.sort_by) queryParams.set("sort_by", params.sort_by);
        queryParams.set("page", String(params.page || 1));
        break;

      case "bestsellers":
        // Get best sellers in a category
        queryParams.set("type", "bestsellers");
        queryParams.set("category_id", params.category_id || "aps"); // "aps" = all departments
        queryParams.set("page", String(params.page || 1));
        break;

      case "product":
        // Get product details by ASIN
        queryParams.set("type", "product");
        queryParams.set("asin", params.asin);
        break;

      case "deals":
        // Get current deals
        queryParams.set("type", "deals");
        if (params.deal_types) queryParams.set("deal_types", params.deal_types);
        queryParams.set("page", String(params.page || 1));
        break;

      case "category":
        // Get category listing
        queryParams.set("type", "category");
        queryParams.set("category_id", params.category_id);
        queryParams.set("page", String(params.page || 1));
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${BASE_URL}?${queryParams.toString()}`;
    logStep("Calling Rainforest API", { action });

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      logStep("API error", { status: response.status, error: errorText });
      throw new Error(`Rainforest API error: ${response.status}`);
    }

    const data = await response.json();
    logStep("API response received");

    if (data.request_info?.success === false) {
      throw new Error(data.request_info?.message || "Rainforest API error");
    }

    // Transform results based on action type
    let results: any[] = [];
    
    if (action === "search" && data.search_results) {
      results = data.search_results.map((item: any) => ({
        asin: item.asin,
        title: item.title,
        link: item.link,
        image: item.image,
        price: item.price?.value,
        currency: item.price?.currency,
        rating: item.rating,
        ratingsTotal: item.ratings_total,
        isPrime: item.is_prime,
        isBestSeller: item.is_best_seller,
        categories: item.categories,
        delivery: item.delivery?.tagline,
      }));
    } else if (action === "bestsellers" && data.bestsellers) {
      results = data.bestsellers.map((item: any) => ({
        rank: item.rank,
        asin: item.asin,
        title: item.title,
        link: item.link,
        image: item.image,
        price: item.price?.value,
        currency: item.price?.currency,
        rating: item.rating,
        ratingsTotal: item.ratings_total,
      }));
    } else if (action === "product" && data.product) {
      results = [{
        asin: data.product.asin,
        title: data.product.title,
        link: data.product.link,
        description: data.product.description,
        images: data.product.images,
        price: data.product.buybox_winner?.price?.value,
        currency: data.product.buybox_winner?.price?.currency,
        rating: data.product.rating,
        ratingsTotal: data.product.ratings_total,
        availability: data.product.buybox_winner?.availability?.raw,
        categories: data.product.categories,
        features: data.product.feature_bullets,
        attributes: data.product.attributes,
      }];
    } else if (action === "deals" && data.deals) {
      results = data.deals.map((item: any) => ({
        asin: item.asin,
        title: item.title,
        link: item.link,
        image: item.image,
        dealPrice: item.deal_price?.value,
        listPrice: item.list_price?.value,
        currency: item.deal_price?.currency,
        percentOff: item.savings_percentage,
        dealBadge: item.deal_badge,
        endsAt: item.ends_at,
      }));
    } else if (action === "category" && data.category_results) {
      results = data.category_results.map((item: any) => ({
        asin: item.asin,
        title: item.title,
        link: item.link,
        image: item.image,
        price: item.price?.value,
        currency: item.price?.currency,
        rating: item.rating,
        ratingsTotal: item.ratings_total,
      }));
    }

    logStep("Results transformed", { count: results.length });

    return new Response(JSON.stringify({
      success: true,
      action,
      data: results,
      pagination: {
        currentPage: data.request_info?.page || 1,
        totalPages: data.pagination?.total_pages,
        totalResults: data.pagination?.total_results,
      },
      categories: data.categories,
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
