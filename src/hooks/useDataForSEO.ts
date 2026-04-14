import { useCallback } from "react";
import { useSupabaseFunction } from "./useSupabaseFunction";

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
  const { loading, error, apiUnavailable, invoke } = useSupabaseFunction({
    functionName: "dataforseo",
    serviceName: "DataForSEO",
    onError: "return-empty-array",
    enableSysadminAlerts: true,
  });

  const fetchGoogleTrends = useCallback(
    (keywords: string[], timeRange?: string) =>
      invoke<{ data: TrendData[] }>("google_trends", {
        keywords,
        time_range: timeRange || "past_12_months",
      }).then((r) => (r && "data" in r ? r.data : (r as TrendData[]))),
    [invoke]
  );

  const fetchSearchVolume = useCallback(
    (keywords: string[]) =>
      invoke<{ data: SearchVolumeData[] }>("search_volume", { keywords }).then(
        (r) => (r && "data" in r ? r.data : (r as SearchVolumeData[]))
      ),
    [invoke]
  );

  const fetchRelatedKeywords = useCallback(
    (keywords: string[]) =>
      invoke<{ data: RelatedKeyword[] }>("related_keywords", { keywords }).then(
        (r) => (r && "data" in r ? r.data : (r as RelatedKeyword[]))
      ),
    [invoke]
  );

  const fetchTrendingSearches = useCallback(
    (locationCode?: number) =>
      invoke<{ data: TrendingSearch[] }>("trending_searches", {
        location_code: locationCode,
      }).then((r) => (r && "data" in r ? r.data : (r as TrendingSearch[]))),
    [invoke]
  );

  const fetchKeywordIdeas = useCallback(
    (targetUrl: string) =>
      invoke<{ data: unknown[] }>("keyword_ideas", { target: targetUrl }).then(
        (r) => (r && "data" in r ? r.data : (r as unknown[]))
      ),
    [invoke]
  );

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
