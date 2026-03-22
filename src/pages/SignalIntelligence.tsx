import { useState, useEffect } from "react";
import { PageContainer, PageHeader, ApiStatusIndicator, LoadingCards, EmptyState } from "@/components/shared";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlatformFilter } from "@/components/signals/PlatformFilter";
import { TrendCard } from "@/components/signals/TrendCard";
import { VolumeChart, GlassBoxAssistant } from "@/components/shared";
import { SignalDistribution, platformColorMapping } from "@/components/signals/SignalDistribution";
import { SavedTrendsPanel } from "@/components/signals/SavedTrendsPanel";
import { TrendAnalysisModal } from "@/components/signals/TrendAnalysisModal";
import { MediaLightbox } from "@/components/signals/MediaLightbox";
import { TrendLifecycleWidget } from "@/components/signals/TrendLifecycleWidget";
import { CompetitiveIntelWidget } from "@/components/signals/CompetitiveIntelWidget";
import { useAnalyzeTrend } from "@/hooks/useAnalyzeTrend";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useDataForSEO, TrendingSearch } from "@/hooks/useDataForSEO";
import { useApifySocial, SocialPost } from "@/hooks/useApifySocial";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Search, SlidersHorizontal, RefreshCw, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Trend {
  name: string;
  platform: string;
  platformIcon: string;
  volume: string;
  growth: string;
  engagement: string;
  shares: string;
  status: "hot" | "warm" | "rising" | "stable";
  hashtags: string[];
  thumbnail?: string;
  videoUrl?: string;
  author?: string;
}

// No static mock data - we only show real data from APIs

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
};

const getStatusFromTrend = (trend: number): Trend["status"] => {
  if (trend > 150) return "hot";
  if (trend > 80) return "warm";
  if (trend > 30) return "rising";
  return "stable";
};

const transformTrendingSearchToTrend = (item: TrendingSearch, index: number): Trend => ({
  name: item.title || item.query || `Trend ${index + 1}`,
  platform: "Google Trends",
  platformIcon: "🔍",
  volume: formatVolume(item.traffic_volume || 0),
  growth: `+${item.trend || 0}%`,
  engagement: "N/A",
  shares: "N/A",
  status: getStatusFromTrend(item.trend || 0),
  hashtags: item.related_queries?.slice(0, 3) || [],
});

const transformSocialPostToTrend = (post: SocialPost): Trend => {
  const platformIcons: Record<string, string> = { tiktok: "📱", instagram: "📸", pinterest: "📌" };
  const engagement = post.likes || post.plays || 0;
  
  return {
    name: post.hashtags?.[0] ? `#${post.hashtags[0]}` : post.description?.slice(0, 30) || `${post.platform} trend`,
    platform: post.platform.charAt(0).toUpperCase() + post.platform.slice(1),
    platformIcon: platformIcons[post.platform] || "📱",
    volume: formatVolume(post.plays || post.likes || 0),
    growth: post.shares ? `+${formatVolume(post.shares)} shares` : "Trending",
    engagement: `${formatVolume(post.likes || 0)} likes`,
    shares: post.comments ? `${formatVolume(post.comments)} comments` : "N/A",
    status: engagement > 100000 ? "hot" : engagement > 10000 ? "warm" : "rising",
    hashtags: post.hashtags?.slice(0, 3) || [],
    thumbnail: post.imageUrl || post.coverUrl,
    videoUrl: post.videoUrl,
    author: post.author,
  };
};

const SignalIntelligence = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzingTrend, setAnalyzingTrend] = useState<string | null>(null);
  const [savingTrend, setSavingTrend] = useState<string | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [lightboxTrend, setLightboxTrend] = useState<Trend | null>(null);

  const { analyzeTrend, isLoading, analysis } = useAnalyzeTrend();
  const { saveTrend, isTrendSaved } = useSavedTrends();
  const { fetchTrendingSearches, fetchSearchVolume, loading: seoLoading, apiUnavailable: seoUnavailable } = useDataForSEO();
  const { fetchTikTokHashtag, fetchInstagramHashtag, fetchPinterestSearch, loading: socialLoading, apiUnavailable: apifyUnavailable } = useApifySocial();
  const { trackPageView, trackAIGeneration } = useUsageTracking();

  useEffect(() => {
    trackPageView("signal_intelligence");
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const allTrends: Trend[] = [];
    
    try {
      const [trendingData, tiktokData, instagramData, pinterestData] = await Promise.allSettled([
        fetchTrendingSearches(),
        fetchTikTokHashtag(["fashion", "style", "trend"], 10),
        fetchInstagramHashtag(["fashion", "style"], 10),
        fetchPinterestSearch("fashion trends 2024", 10),
      ]);

      if (trendingData.status === "fulfilled" && trendingData.value?.length) {
        allTrends.push(...trendingData.value.slice(0, 4).map(transformTrendingSearchToTrend));
      }

      if (tiktokData.status === "fulfilled" && tiktokData.value?.length) {
        allTrends.push(...tiktokData.value.slice(0, 4).map(transformSocialPostToTrend));
      }

      if (instagramData.status === "fulfilled" && instagramData.value?.length) {
        allTrends.push(...instagramData.value.slice(0, 4).map(transformSocialPostToTrend));
      }

      if (pinterestData.status === "fulfilled" && pinterestData.value?.length) {
        allTrends.push(...pinterestData.value.slice(0, 4).map(transformSocialPostToTrend));
      }

      if (allTrends.length > 0) {
        setIsLive(true);
        setLastRefresh(new Date());
        setTrends(allTrends);
        toast.success(`Fetched ${allTrends.length} live trends from multiple sources`);
      } else {
        setIsLive(false);
        setTrends([]);
        toast.info("No trend data available - APIs may be unavailable");
      }
    } catch (err) {
      setIsLive(false);
      setTrends([]);
      toast.error("Could not fetch live data");
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  const handleSearchKeywords = async () => {
    if (!searchQuery.trim()) return;
    
    setRefreshing(true);
    try {
      const volumeData = await fetchSearchVolume([searchQuery]);
      
      if (volumeData?.length) {
        const searchResult = volumeData[0];
        const newTrend: Trend = {
          name: searchResult.keyword,
          platform: "Search Data",
          platformIcon: "🔍",
          volume: formatVolume(searchResult.searchVolume),
          growth: searchResult.competitionLevel === "HIGH" ? "+High" : 
                  searchResult.competitionLevel === "MEDIUM" ? "+Med" : "+Low",
          engagement: `$${searchResult.cpc.toFixed(2)} CPC`,
          shares: `${(searchResult.competition * 100).toFixed(0)}% comp`,
          status: searchResult.searchVolume > 100000 ? "hot" : 
                  searchResult.searchVolume > 10000 ? "warm" : "rising",
          hashtags: [],
        };
        
        setTrends(prev => [newTrend, ...prev.filter(t => t.name !== searchResult.keyword)]);
        toast.success(`Found search data for "${searchResult.keyword}"`);
      } else {
        toast.info("No search volume data found for this keyword");
      }
    } catch {
      toast.error("Failed to search keyword volume");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTrends = trends.filter((trend) => {
    const matchesPlatform = selectedPlatform === "all" || trend.platform.toLowerCase() === selectedPlatform;
    const matchesSearch = trend.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleAnalyzeTrend = async (trend: Trend) => {
    setSelectedTrend(trend);
    setAnalyzingTrend(trend.name);
    setIsModalOpen(true);
    trackAIGeneration("signal_intelligence", "trend_analysis", { trendName: trend.name });
    await analyzeTrend(trend.name, trend.platform, trend.hashtags);
    setAnalyzingTrend(null);
  };

  const handleSaveTrend = async (trend: Trend) => {
    setSavingTrend(trend.name);
    await saveTrend({ name: trend.name, platform: trend.platform, velocity: trend.growth, volume: trend.volume });
    setSavingTrend(null);
  };

  const apiStatuses = [
    { name: "DataForSEO", available: !seoUnavailable, icon: "🔍" },
    { name: "TikTok (Apify)", available: !apifyUnavailable, icon: "📱" },
    { name: "Instagram (Apify)", available: !apifyUnavailable, icon: "📸" },
    { name: "Pinterest (Apify)", available: !apifyUnavailable, icon: "📌" },
  ];

  // Derive chart data from actual trends
  const volumeChartData = trends.length > 0 
    ? trends.slice(0, 7).map((trend, index) => ({
        time: trend.name.slice(0, 8),
        volume: parseInt(trend.volume.replace(/[KM]/g, '')) * (trend.volume.includes('M') ? 1000000 : trend.volume.includes('K') ? 1000 : 1),
        engagement: parseInt(trend.engagement?.replace(/[KM]/g, '') || '0') * (trend.engagement?.includes('M') ? 1000000 : trend.engagement?.includes('K') ? 1000 : 1),
      }))
    : [];

  // Derive platform distribution from actual trends
  const platformCounts = trends.reduce((acc, trend) => {
    const platformKey = trend.platform.toLowerCase().replace(/\s+/g, '');
    // Map platform names to filter IDs
    const platformId = platformKey.includes('tiktok') ? 'tiktok' :
                       platformKey.includes('instagram') ? 'instagram' :
                       platformKey.includes('pinterest') ? 'pinterest' :
                       platformKey.includes('youtube') ? 'youtube' :
                       platformKey.includes('google') ? 'google' : platformKey;
    acc[platformId] = (acc[platformId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  platformCounts.all = trends.length;

  const platformDistribution = trends.reduce((acc, trend) => {
    const existing = acc.find(p => p.name === trend.platform);
    if (existing) {
      existing.signals++;
    } else {
      acc.push({ 
        name: trend.platform, 
        signals: 1, 
        colorVar: platformColorMapping[trend.platform] || 'primary' 
      });
    }
    return acc;
  }, [] as { name: string; signals: number; colorVar: string }[]).sort((a, b) => b.signals - a.signals);

  const headerActions = (
    <>
      <ApiStatusIndicator apis={apiStatuses} />
      <Button variant="glass" size="sm" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
        {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
      <Button variant="gradient" size="sm" className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Configure Alerts
      </Button>
    </>
  );

  return (
    <PageContainer>
      <PageHeader
            title="Signal Intelligence"
            description="Real-time trend detection • AI-powered analysis • DataForSEO + Apify"
            badge={<StatusBadge status={isLive ? "live" : "cached"} />}
            actions={headerActions}
          />

          {/* Search & Filters */}
          <section className="mb-6 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchKeywords()}
                  placeholder="Search keyword volume or filter trends..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 shadow-sm"
                />
              </div>
              <Button variant="glass" size="sm" onClick={handleSearchKeywords} disabled={!searchQuery.trim() || refreshing} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Lookup Volume
              </Button>
            </div>
            {lastRefresh && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
            <PlatformFilter selected={selectedPlatform} onSelect={setSelectedPlatform} counts={platformCounts} />
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <VolumeChart 
              title="Signal Volume (24h)" 
              subtitle="Combined trend mentions over time" 
              className="lg:col-span-2"
              data={volumeChartData}
              loading={refreshing || initialLoading}
            />
            <SignalDistribution 
              data={platformDistribution}
              loading={refreshing || initialLoading}
            />
          </section>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl">Active Trends</h2>
                <span className="text-sm text-muted-foreground">{filteredTrends.length} signals detected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {refreshing || initialLoading ? (
                  <LoadingCards count={6} columns={3} />
                ) : filteredTrends.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={TrendingUp}
                      title="No trends found"
                      description={searchQuery ? "Try adjusting your search or filters" : "Click Refresh to fetch live trend data from APIs"}
                      action={
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Trends
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  filteredTrends.map((trend, index) => (
                    <TrendCard 
                      key={trend.name} 
                      {...trend} 
                      delay={index * 100}
                      onAnalyze={() => handleAnalyzeTrend(trend)}
                      isAnalyzing={analyzingTrend === trend.name}
                      onSave={() => handleSaveTrend(trend)}
                      isSaved={isTrendSaved(trend.name)}
                      isSaving={savingTrend === trend.name}
                      onMediaClick={() => (trend.thumbnail || trend.videoUrl) && setLightboxTrend(trend)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <SavedTrendsPanel />
              <TrendLifecycleWidget 
                trendName={filteredTrends[0]?.name}
                platform={filteredTrends[0]?.platform}
              />
              <CompetitiveIntelWidget brandName="Your Brand" />
            </div>
          </div>

      <GlassBoxAssistant />

      <TrendAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trendName={selectedTrend?.name || ""}
        analysis={analysis}
        isLoading={isLoading}
      />

      <MediaLightbox
        isOpen={!!lightboxTrend}
        onClose={() => setLightboxTrend(null)}
        imageUrl={lightboxTrend?.thumbnail}
        videoUrl={lightboxTrend?.videoUrl}
        title={lightboxTrend?.name}
        platform={lightboxTrend?.platform}
        author={lightboxTrend?.author}
      />
    </PageContainer>
  );
};

export default SignalIntelligence;
