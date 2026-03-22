import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN") || "";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APIFY-SOCIAL] ${step}${detailsStr}`);
};

// Actor IDs for different platforms - using currently available actors
const ACTORS = {
  tiktok_hashtag: "therealdude/tiktok-scraper",
  tiktok_search: "therealdude/tiktok-scraper",
  instagram_hashtag: "apify/instagram-scraper",
  instagram_profile: "apify/instagram-scraper",
  pinterest_search: "trudax/pinterest-crawler",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    logStep("Request received", { action });

    if (!APIFY_API_TOKEN) {
      throw new Error("Apify API token not configured");
    }

    let actorId = "";
    let input: any = {};

    switch (action) {
      case "tiktok_hashtag":
        // Scrape TikTok videos by hashtag
        actorId = ACTORS.tiktok_hashtag;
        input = {
          hashtags: params.hashtags,
          maxResults: params.limit || 20,
        };
        break;

      case "tiktok_search":
        // Search TikTok for keywords
        actorId = ACTORS.tiktok_search;
        input = {
          searchQueries: params.queries,
          maxResults: params.limit || 20,
        };
        break;

      case "instagram_hashtag":
        // Scrape Instagram posts by hashtag
        actorId = ACTORS.instagram_hashtag;
        input = {
          hashtags: params.hashtags,
          resultsLimit: params.limit || 20,
        };
        break;

      case "instagram_profile":
        // Get Instagram profile data
        actorId = ACTORS.instagram_profile;
        input = {
          usernames: params.usernames,
          resultsLimit: params.limit || 10,
        };
        break;

      case "pinterest_search":
        // Search Pinterest for visual trends
        actorId = ACTORS.pinterest_search;
        input = {
          query: params.query,
          maxPins: params.limit || 30,
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logStep("Running Apify actor", { actorId });

    // Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      logStep("Run error", { status: runResponse.status, error: errorText });
      throw new Error(`Apify run error: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;
    logStep("Actor started", { runId });

    // Wait for completion (with timeout)
    let status = "RUNNING";
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (status === "RUNNING" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
      );
      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;
    }

    if (status !== "SUCCEEDED") {
      logStep("Run failed or timed out", { status, attempts });
      throw new Error(`Actor run ${status === "RUNNING" ? "timed out" : "failed"}: ${status}`);
    }

    // Get the results from the dataset
    const datasetId = runData.data.defaultDatasetId;
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&limit=${params.limit || 50}`
    );

    if (!resultsResponse.ok) {
      throw new Error("Failed to fetch results");
    }

    const results = await resultsResponse.json();
    logStep("Results fetched", { count: results.length });

    // Transform results based on platform
    const transformedResults = results.map((item: any) => {
      if (action.startsWith("tiktok")) {
        return {
          id: item.id,
          platform: "tiktok",
          description: item.text || item.desc,
          author: item.authorMeta?.name || item.author,
          likes: item.diggCount || item.stats?.diggCount,
          comments: item.commentCount || item.stats?.commentCount,
          shares: item.shareCount || item.stats?.shareCount,
          plays: item.playCount || item.stats?.playCount,
          videoUrl: item.videoUrl || item.video?.downloadAddr,
          coverUrl: item.coverUrl || item.video?.cover,
          hashtags: item.hashtags || [],
          createTime: item.createTime,
        };
      } else if (action.startsWith("instagram")) {
        return {
          id: item.id,
          platform: "instagram",
          description: item.caption,
          author: item.ownerUsername,
          likes: item.likesCount,
          comments: item.commentsCount,
          imageUrl: item.displayUrl,
          hashtags: item.hashtags || [],
          timestamp: item.timestamp,
        };
      } else if (action === "pinterest_search") {
        return {
          id: item.id,
          platform: "pinterest",
          description: item.description,
          imageUrl: item.image?.original?.url || item.images?.orig?.url,
          link: item.link,
          saves: item.aggregatedPinData?.saves,
          domain: item.domain,
        };
      }
      return item;
    });

    return new Response(JSON.stringify({
      success: true,
      platform: action.split("_")[0],
      data: transformedResults,
      runId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Return 200 with empty data and error flag for graceful degradation
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      apiUnavailable: true,
      data: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 so frontend can gracefully handle
    });
  }
});
