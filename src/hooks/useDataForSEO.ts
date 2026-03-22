import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Track if we've already notified about API issues to avoid spam
let dataForSeoAlertSent = false;

const notifySysadmin = async (error: string, action: string) => {
  if (dataForSeoAlertSent) return;
  dataForSeoAlertSent = true;

  try {
    await supabase.from("system_alerts").insert({
      service_name: "DataForSEO",
      alert_type: "api_error",
      message: `DataForSEO API error during ${action}: ${error}`,
      severity: error.includes("401") || error.includes("402") ? "critical" : "error",
      details: { action, error, timestamp: new Date().toISOString() },
    });
    console.log("[DataForSEO] System alert created for sysadmin");
  } catch (e) {
    console.error("[DataForSEO] Failed to create system alert:", e);
  }
};

export interface TrendData {
  keyword: string;
  values: Array<{ date: string; value: number }>;
}

export interface SearchVolumeData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: string;
  monthlySearches?: Array<{ year: number; month: number; search_volume: number }>;
}

export interface RelatedKeyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
}

export interface TrendingSearch {
  title: string;
  query: string;
  traffic_volume: number;
  trend: number;
  related_queries: string[];
  news_url?: string;
  image_url?: string;
}

export function useDataForSEO() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const fetchGoogleTrends = useCallback(async (keywords: string[], timeRange?: string) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "google_trends",
          params: { 
            keywords, 
            time_range: timeRange || "past_12_months" 
          },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch trends");

      return data.data as TrendData[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch Google Trends";
      console.warn("[DataForSEO] Google Trends error (failing gracefully):", message);
      
      await notifySysadmin(message, "google_trends");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchSearchVolume = useCallback(async (keywords: string[]) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "search_volume",
          params: { keywords },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch search volume");

      return data.data as SearchVolumeData[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch search volume";
      console.warn("[DataForSEO] Search volume error (failing gracefully):", message);
      
      await notifySysadmin(message, "search_volume");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchRelatedKeywords = useCallback(async (keywords: string[]) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "related_keywords",
          params: { keywords },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch related keywords");

      return data.data as RelatedKeyword[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch related keywords";
      console.warn("[DataForSEO] Related keywords error (failing gracefully):", message);
      
      await notifySysadmin(message, "related_keywords");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchTrendingSearches = useCallback(async (locationCode?: number) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "trending_searches",
          params: { location_code: locationCode },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch trending searches");

      return data.data as TrendingSearch[];
    } catch (err: any) {
      const message = err.message || "Failed to fetch trending searches";
      console.warn("[DataForSEO] Trending searches error (failing gracefully):", message);
      
      await notifySysadmin(message, "trending_searches");
      setApiUnavailable(true);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUnavailable]);

  const fetchKeywordIdeas = useCallback(async (targetUrl: string) => {
    if (apiUnavailable) return [];
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dataforseo", {
        body: {
          action: "keyword_ideas",
          params: { target: targetUrl },
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch keyword ideas");

      return data.data;
    } catch (err: any) {
      const message = err.message || "Failed to fetch keyword ideas";
      console.warn("[DataForSEO] Keyword ideas error (failing gracefully):", message);
      
      await notifySysadmin(message, "keyword_ideas");
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
    fetchGoogleTrends,
    fetchSearchVolume,
    fetchRelatedKeywords,
    fetchTrendingSearches,
    fetchKeywordIdeas,
  };
}
