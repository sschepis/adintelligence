import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Play, 
  Hash, 
  Palette, 
  Volume2, 
  MapPin,
  BarChart3,
  Package,
  Loader2,
  RefreshCw,
  GitCompare
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
  ReferenceLine,
} from "recharts";
import { useAnalyzeTrend } from "@/hooks/useAnalyzeTrend";
import { SavedTrend, useSavedTrends } from "@/hooks/useSavedTrends";
import { TrendComparisonPanel } from "./TrendComparisonPanel";

interface TrendIntelligenceData {
  name: string;
  featured?: boolean;
  sourceData: {
    thumbnails: string[];
    hashtags: { tag: string; engagement: string }[];
    nlpPhrases: number;
    visionAI: { dominantColor: string; percentage: number };
    trendingSounds: number;
  };
  contentSignals: string[];
  classification: string[];
  metrics: {
    videos: { value: string; change: string };
    views: { value: string; change: string };
    growthRate: { value: string; comparison: string };
    engagementRate: { value: string; change: string };
    creatorCount: { value: string; change: string };
    lifecycleStage: string;
  };
  audience: {
    thumbnails: string[];
    ageGroup: string;
    gender: string;
    topRegions: string[];
    creators: { micro: number; mid: number };
  };
  productMapping: {
    finish: string;
    color: string;
    product: string;
    occasion: string;
  };
  channelGrowth: { month: string; tiktok: number; instagram: number; pinterest: number; youtube: number }[];
  // New prediction data
  predictedROAS?: { week: string; predicted: number; actual?: number }[];
  channelGrowthRatio?: { month: string; tiktok: number; instagram: number; pinterest: number; youtube: number; google: number }[];
}

interface TrendIntelligencePanelProps {
  data?: TrendIntelligenceData;
  savedTrend?: SavedTrend;
  onClose?: () => void;
}

export function TrendIntelligencePanel({ data: providedData, savedTrend, onClose }: TrendIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState("source");
  const { analyzeTrend, isLoading: isAnalyzing, analysis } = useAnalyzeTrend();
  const { savedTrends: allSavedTrends } = useSavedTrends();
  const [enrichedData, setEnrichedData] = useState<TrendIntelligenceData | null>(providedData || null);
  const [comparisonTrends, setComparisonTrends] = useState<SavedTrend[]>(savedTrend ? [savedTrend] : []);

  // Build data from saved trend + AI analysis
  useEffect(() => {
    if (savedTrend && !providedData) {
      // Auto-analyze saved trend
      analyzeTrend(savedTrend.trend_name, savedTrend.platform || "TikTok");
    }
  }, [savedTrend]);

  useEffect(() => {
    if (analysis && savedTrend) {
      // Enrich with AI analysis
      setEnrichedData({
        name: savedTrend.trend_name,
        featured: (savedTrend.sentiment_score || 0) > 0.7,
        sourceData: {
          thumbnails: [],
          hashtags: [
            { tag: `#${savedTrend.trend_name.toLowerCase().replace(/\s+/g, '')}`, engagement: "+8.4%" },
            { tag: `#${savedTrend.platform?.toLowerCase() || 'trend'}`, engagement: "+5.2%" },
          ],
          nlpPhrases: analysis.visualElements?.length || 12,
          visionAI: { dominantColor: analysis.visualElements?.[0] || "Golden", percentage: 72 },
          trendingSounds: 8,
        },
        contentSignals: analysis.visualElements || [],
        classification: analysis.productCategories || [],
        metrics: {
          videos: { value: savedTrend.volume || "24K", change: "+142%" },
          views: { value: "8.2M", change: "+89%" },
          growthRate: { value: "+62%", comparison: "industry avg 12%" },
          engagementRate: { value: "4.8%", change: "+0.8%" },
          creatorCount: { value: "1.2K", change: "+34%" },
          lifecycleStage: analysis.longevity === "3-6 months" ? "Rising" : 
                          analysis.longevity === "6-12 months" ? "Breakout" : "Emerging",
        },
        audience: {
          thumbnails: [],
          ageGroup: analysis.demographics?.primaryAge || "18-34",
          gender: analysis.demographics?.gender || "Female 78%",
          topRegions: ["US", "UK", "CA"],
          creators: { micro: 65, mid: 35 },
        },
        productMapping: {
          finish: analysis.visualElements?.[0] || "Shimmer",
          color: analysis.visualElements?.[1] || "Gold",
          product: analysis.productCategories?.[0] || "Lip Gloss",
          occasion: analysis.peakTiming || "Evening",
        },
        channelGrowth: [
          { month: "Jan", tiktok: 20, instagram: 15, pinterest: 10, youtube: 5 },
          { month: "Feb", tiktok: 35, instagram: 25, pinterest: 18, youtube: 10 },
          { month: "Mar", tiktok: 55, instagram: 40, pinterest: 28, youtube: 18 },
          { month: "Apr", tiktok: 80, instagram: 58, pinterest: 40, youtube: 25 },
        ],
        predictedROAS: [
          { week: "W1", predicted: 2.1, actual: 2.3 },
          { week: "W2", predicted: 2.4, actual: 2.2 },
          { week: "W3", predicted: 2.8, actual: 2.9 },
          { week: "W4", predicted: 3.2, actual: 3.1 },
          { week: "W5", predicted: 3.6 },
          { week: "W6", predicted: 4.0 },
        ],
        channelGrowthRatio: [
          { month: "Jan", tiktok: 15, instagram: 12, pinterest: 8, youtube: 5, google: 10 },
          { month: "Feb", tiktok: 28, instagram: 20, pinterest: 14, youtube: 10, google: 16 },
          { month: "Mar", tiktok: 45, instagram: 32, pinterest: 22, youtube: 18, google: 25 },
          { month: "Apr", tiktok: 68, instagram: 48, pinterest: 32, youtube: 26, google: 38 },
          { month: "May", tiktok: 85, instagram: 62, pinterest: 42, youtube: 35, google: 52 },
          { month: "Jun", tiktok: 100, instagram: 78, pinterest: 55, youtube: 45, google: 68 },
        ],
      });
    }
  }, [analysis, savedTrend]);

  const handleRefreshAnalysis = () => {
    if (savedTrend) {
      analyzeTrend(savedTrend.trend_name, savedTrend.platform || "TikTok");
    }
  };

  const data = enrichedData || providedData;

  if (!data && !isAnalyzing) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
        <p className="text-muted-foreground">No trend data available</p>
      </div>
    );
  }

  if (isAnalyzing && !data) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing trend intelligence...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl">{data.name} — TREND INTELLIGENCE</h2>
              {data.featured && (
                <Badge className="bg-foreground text-background">FEATURED</Badge>
              )}
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {analysis?.summary || "Derived intelligence layer from visual similarity, language patterns, engagement velocity & creator behavior"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefreshAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0 h-auto overflow-x-auto">
          <TabsTrigger 
            value="source" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            1. Source Data
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            2. Content Signals
          </TabsTrigger>
          <TabsTrigger 
            value="metrics" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            3. Metrics
          </TabsTrigger>
          <TabsTrigger 
            value="audience" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            4. Audience
          </TabsTrigger>
          <TabsTrigger 
            value="mapping" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            5. Product Mapping
          </TabsTrigger>
          <TabsTrigger 
            value="predictions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            6. Predictions
          </TabsTrigger>
          <TabsTrigger 
            value="compare" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm gap-1"
          >
            <GitCompare className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          {/* Source-Level Data */}
          <TabsContent value="source" className="m-0 space-y-6">
            <h3 className="font-semibold">1. Source-Level Data</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Thumbnails */}
              <div className="flex gap-2">
                {data.sourceData.thumbnails.slice(0, 4).map((thumb, i) => (
                  <div key={i} className="relative w-32 h-24 rounded-xl overflow-hidden bg-secondary">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                    {i === 3 && (
                      <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs">
                        📷 4
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground"># Hashtags</p>
                    <p className="font-bold text-lg">{data.sourceData.hashtags[0]?.tag || "#goldenmakeup"}</p>
                    <p className="text-xs text-emerald-600">{data.sourceData.hashtags[0]?.engagement || "+8.42%"} eng</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">NLP Phrases</p>
                    <p className="font-bold text-lg">{data.sourceData.nlpPhrases}</p>
                    <p className="text-xs text-muted-foreground">extracted</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Vision AI</p>
                    <p className="font-bold text-lg">{data.sourceData.visionAI.dominantColor}</p>
                    <p className="text-xs text-muted-foreground">{data.sourceData.visionAI.percentage}% dominant</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Audio</p>
                    <p className="font-bold text-lg">{data.sourceData.trendingSounds}</p>
                    <p className="text-xs text-muted-foreground">trending sounds</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Content Signals */}
          <TabsContent value="content" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">2. Content Signals</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-secondary overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                        <span className="text-2xl opacity-50">✨</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">3. Classification</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={cn(
                      "aspect-square rounded-lg bg-secondary overflow-hidden",
                      i <= 2 && "col-span-1 row-span-1"
                    )}>
                      <div className="w-full h-full bg-gradient-to-br from-amber-200/50 to-amber-100/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Metrics */}
          <TabsContent value="metrics" className="m-0 space-y-6">
            <h3 className="font-semibold">4. Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Videos (30 days)</p>
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {data.metrics.videos.change}
                    </span>
                  </div>
                  <p className="font-bold text-3xl">{data.metrics.videos.value}</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-sm bg-primary/20" 
                        style={{ height: `${20 + Math.random() * 20}px` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Views</p>
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {data.metrics.views.change}
                    </span>
                  </div>
                  <p className="font-bold text-3xl">{data.metrics.views.value}</p>
                  <div className="h-8 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{ v: 20 }, { v: 40 }, { v: 35 }, { v: 50 }, { v: 45 }, { v: 60 }]}>
                        <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Growth Rate MoM</p>
                  <p className="font-bold text-3xl text-emerald-600">{data.metrics.growthRate.value}</p>
                  <div className="mt-2">
                    <Progress value={62} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">vs {data.metrics.growthRate.comparison}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <span className="text-xs text-emerald-600">{data.metrics.engagementRate.change}</span>
                  </div>
                  <p className="font-bold text-3xl">{data.metrics.engagementRate.value}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Creator Count</p>
                    <span className="text-xs text-emerald-600">{data.metrics.creatorCount.change}</span>
                  </div>
                  <p className="font-bold text-3xl">{data.metrics.creatorCount.value}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Lifecycle Stage</p>
                  <p className="font-bold text-2xl text-amber-600">{data.metrics.lifecycleStage}</p>
                  <div className="flex gap-0.5 mt-2">
                    {["Emerging", "Rising", "Breakout", "Peak", "Decline"].map((stage, i) => (
                      <div 
                        key={stage} 
                        className={cn(
                          "flex-1 h-2 rounded-sm",
                          stage === data.metrics.lifecycleStage 
                            ? "bg-amber-500" 
                            : i < ["Emerging", "Rising", "Breakout", "Peak", "Decline"].indexOf(data.metrics.lifecycleStage)
                              ? "bg-amber-200"
                              : "bg-secondary"
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience */}
          <TabsContent value="audience" className="m-0 space-y-6">
            <h3 className="font-semibold">5. Audience</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-32 h-24 rounded-xl bg-secondary overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-50" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Age Group</p>
                    <p className="font-bold text-xl">{data.audience.ageGroup}</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-bold text-xl">{data.audience.gender}</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Top Regions</p>
                    <p className="font-bold text-lg">{data.audience.topRegions.join(", ")}</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Creators</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{data.audience.creators.micro}% Micro</Badge>
                      <Badge variant="secondary">{data.audience.creators.mid}% Mid</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Product Mapping */}
          <TabsContent value="mapping" className="m-0 space-y-6">
            <h3 className="font-semibold">6. Product Mapping</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Finish</p>
                  <p className="font-bold text-lg">{data.productMapping.finish}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Color</p>
                  <p className="font-bold text-lg">{data.productMapping.color}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Product</p>
                  <p className="font-bold text-lg">{data.productMapping.product}</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Occasion</p>
                  <p className="font-bold text-lg">{data.productMapping.occasion}</p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{data.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Growth Ratio Across Channels</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.channelGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="tiktok" stroke="#ef4444" strokeWidth={2} name="TikTok" />
                      <Line type="monotone" dataKey="instagram" stroke="#f97316" strokeWidth={2} name="Instagram" />
                      <Line type="monotone" dataKey="pinterest" stroke="#eab308" strokeWidth={2} name="Pinterest" />
                      <Line type="monotone" dataKey="youtube" stroke="#a855f7" strokeWidth={2} name="YouTube" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab - ROAS & Growth Ratio Charts */}
          <TabsContent value="predictions" className="m-0 space-y-6">
            <h3 className="font-semibold">6. Campaign Predictions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predicted Campaign ROAS */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Predicted Campaign ROAS</CardTitle>
                  <p className="text-xs text-muted-foreground">6-week projection based on trend momentum</p>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.predictedROAS || [
                        { week: "W1", predicted: 2.1, actual: 2.3 },
                        { week: "W2", predicted: 2.4, actual: 2.2 },
                        { week: "W3", predicted: 2.8, actual: 2.9 },
                        { week: "W4", predicted: 3.2, actual: 3.1 },
                        { week: "W5", predicted: 3.6 },
                        { week: "W6", predicted: 4.0 },
                      ]}>
                        <defs>
                          <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 5]} tickFormatter={(v) => `${v}x`} />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)}x`, ""]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <ReferenceLine y={2.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "Target ROAS", position: "right", fontSize: 10 }} />
                        <Area 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          fill="url(#roasGradient)"
                          name="Predicted"
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="hsl(142, 76%, 36%)" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 0 }}
                          name="Actual"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-primary" style={{ borderStyle: "dashed" }} />
                      <span className="text-xs text-muted-foreground">Predicted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
                      <span className="text-xs text-muted-foreground">Actual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROAS Summary Stats */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-signal-rising/10 to-transparent">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Predicted Peak ROAS</p>
                    <p className="font-bold text-4xl text-signal-rising">4.0x</p>
                    <p className="text-xs text-muted-foreground mt-1">Week 6 projection</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Current ROAS</p>
                    <p className="font-bold text-3xl">3.1x</p>
                    <div className="flex items-center gap-1 text-signal-rising text-sm mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +0.3x vs last week
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Confidence Level</p>
                    <Progress value={78} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">78% based on historical accuracy</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Growth Ratio Across Channels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Growth Ratio Across Channels</CardTitle>
                <p className="text-xs text-muted-foreground">Multi-channel trend momentum comparison</p>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.channelGrowthRatio || [
                      { month: "Jan", tiktok: 15, instagram: 12, pinterest: 8, youtube: 5, google: 10 },
                      { month: "Feb", tiktok: 28, instagram: 20, pinterest: 14, youtube: 10, google: 16 },
                      { month: "Mar", tiktok: 45, instagram: 32, pinterest: 22, youtube: 18, google: 25 },
                      { month: "Apr", tiktok: 68, instagram: 48, pinterest: 32, youtube: 26, google: 38 },
                      { month: "May", tiktok: 85, instagram: 62, pinterest: 42, youtube: 35, google: 52 },
                      { month: "Jun", tiktok: 100, instagram: 78, pinterest: 55, youtube: 45, google: 68 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="tiktok" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="TikTok" />
                      <Line type="monotone" dataKey="instagram" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Instagram" />
                      <Line type="monotone" dataKey="pinterest" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} name="Pinterest" />
                      <Line type="monotone" dataKey="youtube" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} name="YouTube" />
                      <Line type="monotone" dataKey="google" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Google" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="m-0">
            <TrendComparisonPanel
              trends={comparisonTrends}
              availableTrends={allSavedTrends}
              onAddTrend={(trend) => setComparisonTrends(prev => [...prev, trend])}
              onRemoveTrend={(trendId) => setComparisonTrends(prev => prev.filter(t => t.id !== trendId))}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

