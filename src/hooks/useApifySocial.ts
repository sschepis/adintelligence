import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Track if we've already notified about API issues to avoid spam
let apifyAlertSent = false;

const notifySysadmin = async (error: string, action: string) => {
  if (apifyAlertSent) return;
  apifyAlertSent = true;

  try {
    await supabase.from("system_alerts").insert({
      service_name: "Apify",
      alert_type: "api_error",
      message: `Apify API error during ${action}: ${error}`,
      severity: error.includes("404") || error.includes("402") ? "critical" : "error",
      details: { action, error, timestamp: new Date().toISOString() },
    });
    console.log("[Apify] System alert created for sysadmin");
  } catch (e) {
    console.error("[Apify] Failed to create system alert:", e);
  }
};

export interface SocialPost {
  id: string;
  platform: string;
  description: string;
  author: string;
  likes?: number;
  comments?: number;
  shares?: number;
  plays?: number;
  videoUrl?: string;
  coverUrl?: string;
  imageUrl?: string;
  hashtags?: string[];
  createTime?: string;
  timestamp?: string;
}

export function useApifySocial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const fetchTikTokHashtag = useCallback(async (hashtags: string[], limit = 20) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("apify-social", {
        body: {
          action: "tiktok_hashtag",
          params: { hashtags, limit },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch TikTok data");

      return data.data as SocialPost[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch TikTok hashtag data";
      console.warn("[Apify] TikTok hashtag error (failing gracefully):", message);
      
      // Notify sysadmin and mark API as unavailable
      await notifySysadmin(message, "tiktok_hashtag");
      setApiUnavailable(true);
      
      // Return empty array instead of null for graceful degradation
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchTikTokSearch = useCallback(async (queries: string[], limit = 20) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("apify-social", {
        body: {
          action: "tiktok_search",
          params: { queries, limit },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to search TikTok");

      return data.data as SocialPost[];
    } catch (err: any) {
      const message = err.message || "Failed to search TikTok";
      console.warn("[Apify] TikTok search error (failing gracefully):", message);
      
      await notifySysadmin(message, "tiktok_search");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchInstagramHashtag = useCallback(async (hashtags: string[], limit = 20) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("apify-social", {
        body: {
          action: "instagram_hashtag",
          params: { hashtags, limit },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch Instagram data");

      return data.data as SocialPost[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch Instagram hashtag data";
      console.warn("[Apify] Instagram hashtag error (failing gracefully):", message);
      
      await notifySysadmin(message, "instagram_hashtag");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchPinterestSearch = useCallback(async (query: string, limit = 30) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("apify-social", {
        body: {
          action: "pinterest_search",
          params: { query, limit },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to search Pinterest");

      return data.data as SocialPost[];
    } catch (err: any) {
      const message = err.message || "Failed to search Pinterest";
      console.warn("[Apify] Pinterest search error (failing gracefully):", message);
      
      await notifySysadmin(message, "pinterest_search");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  return {
    loading,
    error,
    apiUnavailable,
    fetchTikTokHashtag,
    fetchTikTokSearch,
    fetchInstagramHashtag,
    fetchPinterestSearch,
  };
}
