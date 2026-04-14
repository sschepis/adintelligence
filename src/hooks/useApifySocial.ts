import { useCallback } from "react";
import { useSupabaseFunction } from "./useSupabaseFunction";

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
  const { loading, error, apiUnavailable, invoke } = useSupabaseFunction({
    functionName: "apify-social",
    serviceName: "Apify",
    onError: "return-empty-array",
    enableSysadminAlerts: true,
  });

  const fetchTikTokHashtag = useCallback(
    (hashtags: string[], limit = 20) =>
      invoke<{ data: SocialPost[] }>("tiktok_hashtag", { hashtags, limit }).then(
        (r) => (r && "data" in r ? r.data : (r as SocialPost[]))
      ),
    [invoke]
  );

  const fetchTikTokSearch = useCallback(
    (queries: string[], limit = 20) =>
      invoke<{ data: SocialPost[] }>("tiktok_search", { queries, limit }).then(
        (r) => (r && "data" in r ? r.data : (r as SocialPost[]))
      ),
    [invoke]
  );

  const fetchInstagramHashtag = useCallback(
    (hashtags: string[], limit = 20) =>
      invoke<{ data: SocialPost[] }>("instagram_hashtag", { hashtags, limit }).then(
        (r) => (r && "data" in r ? r.data : (r as SocialPost[]))
      ),
    [invoke]
  );

  const fetchPinterestSearch = useCallback(
    (query: string, limit = 30) =>
      invoke<{ data: SocialPost[] }>("pinterest_search", { query, limit }).then(
        (r) => (r && "data" in r ? r.data : (r as SocialPost[]))
      ),
    [invoke]
  );

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
