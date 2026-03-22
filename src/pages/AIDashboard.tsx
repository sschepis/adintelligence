import { useState } from "react";
import { PageContainer } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Target, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { usePredictiveIntelligence } from "@/hooks/usePredictiveIntelligence";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { useAutomatedOptimization } from "@/hooks/useAutomatedOptimization";
import { useBrand } from "@/contexts/BrandContext";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { Link } from "react-router-dom";

export default function AIDashboard() {
  const { activeBrand } = useBrand();
  const { savedTrends } = useSavedTrends();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    trendPredictions, 
    revenueForecast, 
    demandPlan,
    isLoadingPredictions,
    isLoadingForecast,
    isLoadingDemandPlan,
    predictTrendLifecycle,
    forecastRevenue,
    planDemand
  } = usePredictiveIntelligence();
  
  const { 
    competitorAnalysis, 
    shareOfVoice, 
    marketGaps,
    isLoading: isLoadingCompetitive
  } = useCompetitiveIntelligence();
  
  const {
    abVariants,
    pricingResult,
    timingResult,
    isLoading: isLoadingOptimization
  } = useAutomatedOptimization();

  const handleRefreshAll = async () => {
    if (!activeBrand?.products) return;
    setIsRefreshing(true);
    
    try {
      const trends = savedTrends?.map(t => ({
        name: t.trend_name,
        volume: t.volume || undefined,
        velocity: t.velocity || undefined,
        platform: t.platform || undefined,
        sentiment_score: t.sentiment_score || undefined
      })) || [];
      
      if (trends.length > 0) {
        await predictTrendLifecycle(trends);
      }
      
      const inventory = activeBrand.products.map((p: { name: string; stock?: number; price?: number; category?: string }) => ({
        name: p.name,
        stock: p.stock || 100,
        price: p.price,
        category: p.category
      }));
      
      if (inventory.length > 0) {
        await planDemand(inventory, trends);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const isAnyLoading = isLoadingPredictions || isLoadingForecast || isLoadingDemandPlan || 
                        isLoadingCompetitive || isLoadingOptimization;

  // Summary metrics
  const criticalAlerts = demandPlan?.alerts?.filter(a => a.severity === "critical").length || 0;
  const highUrgencyGaps = marketGaps?.gaps?.filter(g => g.urgency === "high").length || 0;
  const pendingOptimizations = (abVariants?.variants?.length || 0) + (pricingResult ? 1 : 0);
  const trendCount = trendPredictions?.predictions?.length || 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified view of all AI predictions, optimizations, and competitive insights
            </p>
          </div>
          <Button 
            onClick={handleRefreshAll} 
            disabled={isRefreshing || !activeBrand?.products}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All Insights
          </Button>
        </div>

        {/* Alert Banner */}
        {(criticalAlerts > 0 || highUrgencyGaps > 0) && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    {criticalAlerts > 0 && `${criticalAlerts} critical inventory alert${criticalAlerts > 1 ? 's' : ''}`}
                    {criticalAlerts > 0 && highUrgencyGaps > 0 && ' • '}
                    {highUrgencyGaps > 0 && `${highUrgencyGaps} high-urgency market gap${highUrgencyGaps > 1 ? 's' : ''}`}
                  </p>
                </div>
                <Button variant="destructive" size="sm" asChild>
                  <Link to="/ai-insights">View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trends Analyzed</p>
                  <p className="text-2xl font-bold">{trendCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected Revenue</p>
                  <p className="text-2xl font-bold">
                    ${(revenueForecast?.summary?.totalProjectedRevenue?.moderate || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Optimizations Ready</p>
                  <p className="text-2xl font-bold">{pendingOptimizations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Gaps</p>
                  <p className="text-2xl font-bold">{marketGaps?.gaps?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Predictive Intelligence */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Predictive Intelligence
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-insights" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPredictions ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : trendPredictions?.predictions?.length ? (
                <>
                  {trendPredictions.predictions.slice(0, 3).map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{pred.trendName}</p>
                        <p className="text-xs text-muted-foreground">
                          Stage: {pred.currentStage} • {pred.daysOfRelevance} days relevance
                        </p>
                      </div>
                      <Badge variant={pred.riskLevel === "high" ? "destructive" : pred.riskLevel === "medium" ? "secondary" : "outline"}>
                        {pred.riskLevel} risk
                      </Badge>
                    </div>
                  ))}
                  {trendPredictions.summary && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        Hottest: <span className="font-medium text-foreground">{trendPredictions.summary.hottest}</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No predictions yet</p>
                  <p className="text-xs">Run analysis to see trend predictions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demand Planning */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                Demand Planning
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-insights" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingDemandPlan ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : demandPlan?.recommendations?.length ? (
                <>
                  {demandPlan.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Action: {rec.recommendedAction} • Stock: {rec.currentStock}
                        </p>
                      </div>
                      <Badge variant={rec.urgency === "critical" ? "destructive" : rec.urgency === "high" ? "secondary" : "outline"}>
                        {rec.urgency}
                      </Badge>
                    </div>
                  ))}
                  {demandPlan.summary && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <span className="text-destructive font-medium">{demandPlan.summary.criticalActions}</span> critical actions •
                      Potential loss: <span className="text-destructive font-medium">${demandPlan.summary.potentialStockoutLoss?.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No demand plan yet</p>
                  <p className="text-xs">Run analysis to see inventory recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitive Intelligence */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Competitive Intelligence
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/competitive" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCompetitive ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : shareOfVoice ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Share of Voice</p>
                      <p className="text-xs text-muted-foreground">Your brand visibility</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{shareOfVoice.overallShareOfVoice?.brand || 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Sentiment</p>
                      <p className="text-xs text-muted-foreground">Overall brand perception</p>
                    </div>
                    <Badge variant={shareOfVoice.sentiment?.trend === "improving" ? "default" : "secondary"}>
                      {shareOfVoice.sentiment?.trend || "stable"}
                    </Badge>
                  </div>
                  {shareOfVoice.alerts?.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {shareOfVoice.alerts.length} alert{shareOfVoice.alerts.length > 1 ? 's' : ''} requiring attention
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No competitive data yet</p>
                  <p className="text-xs">Run analysis to see market position</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimization Opportunities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Optimization Opportunities
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/optimization" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingOptimization ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (abVariants || pricingResult || timingResult) ? (
                <>
                  {abVariants?.variants?.slice(0, 1).map((variant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">A/B Variant Ready</p>
                        <p className="text-xs text-muted-foreground truncate">{variant.headline}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-700">
                        +{variant.predictedLift}% lift
                      </Badge>
                    </div>
                  ))}
                  {pricingResult && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Pricing Recommendation</p>
                        <p className="text-xs text-muted-foreground">
                          Suggested: ${pricingResult.recommendedPrice}
                        </p>
                      </div>
                      <Badge variant="secondary">{pricingResult.strategy}</Badge>
                    </div>
                  )}
                  {timingResult?.recommendations?.slice(0, 1).map((timing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">Optimal Timing</p>
                        <p className="text-xs text-muted-foreground">
                          {timing.platform}: {timing.peakWindow?.start} - {timing.peakWindow?.end}
                        </p>
                      </div>
                      <Badge variant="outline">{timing.optimalTimes?.[0]?.confidence}% conf</Badge>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No optimizations yet</p>
                  <p className="text-xs">Run optimization analysis to see suggestions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/ai-insights">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Run Trend Analysis</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/optimization">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Generate A/B Variants</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/competitive">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Analyze Competitors</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/commerce">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Plan Inventory</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
