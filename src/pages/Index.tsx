import { useEffect, useState } from "react";
import { PageContainer, PageHeader, MetricCard, GlassBoxAssistant } from "@/components/shared";
import { ActionCard, ActionCardSkeleton, ActionCardsEmpty } from "@/components/dashboard/ActionCard";
import { TrendingSignals } from "@/components/dashboard/TrendingSignals";
import { MorningBrief } from "@/components/dashboard/MorningBrief";
import { MarketSignalsGrid } from "@/components/dashboard/MarketSignalsGrid";
import { TrendIntelligencePanel } from "@/components/signals/TrendIntelligencePanel";
import { CampaignBriefCard } from "@/components/dashboard/CampaignBriefCard";
import { BrandDNACompletenessWidget } from "@/components/dashboard/BrandDNACompletenessWidget";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useBrand } from "@/contexts/BrandContext";
import { DollarSign, TrendingUp, Package, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SavedTrend } from "@/hooks/useSavedTrends";

const Index = () => {
  const { trackPageView } = useUsageTracking();
  const { activeBrand } = useBrand();
  const { 
    stats, 
    actionCards, 
    liveSignals, 
    profile, 
    loading, 
    hasData,
    savedTrends,
  } = useDashboardStats();

  const [trendPanelOpen, setTrendPanelOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<SavedTrend | null>(null);

  useEffect(() => {
    trackPageView("admin_dashboard");
  }, []);

  // Format stats for display
  const formattedRevenue = stats.potentialRevenue > 0 
    ? `$${Math.round(stats.potentialRevenue / 1000)}K` 
    : "$0";
  const revenueChange = stats.potentialRevenue > 0 
    ? "Based on campaign budgets" 
    : "No campaigns yet";

  const signalsChange = stats.hotOpportunities > 0 
    ? `${stats.hotOpportunities} hot ${stats.hotOpportunities === 1 ? 'opportunity' : 'opportunities'}`
    : "Save trends to track";

  const inventoryChange = stats.matchedSkus > 0 
    ? `${stats.matchedSkus} SKUs aligned`
    : "No active campaigns";

  const speedChange = stats.speedChange < 0 
    ? `${Math.abs(stats.speedChange)}min improvement`
    : "Baseline measurement";

  return (
    <PageContainer>
          <PageHeader
            title={`${activeBrand?.name || 'Brand'} Dashboard command center`}
            description="Brand dashboard • Revenue-ranked opportunities"
          />

          {/* Morning Brief */}
          <section className="mb-8">
            <MorningBrief 
              displayName={profile?.display_name}
              potentialRevenue={stats.potentialRevenue}
              hotOpportunities={stats.hotOpportunities}
              topTrend={savedTrends[0]?.trend_name}
              loading={loading}
            />
          </section>

          {/* Market Signals Grid - Advertising Market Signals */}
          <section className="mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <MarketSignalsGrid 
              signals={[]} 
              loading={loading}
              onViewBrief={(signal) => {
                const savedTrend = savedTrends.find(t => t.trend_name === signal.name);
                if (savedTrend) {
                  setSelectedTrend(savedTrend);
                } else {
                  setSelectedTrend({ 
                    id: signal.name, 
                    trend_name: signal.name, 
                    platform: "TikTok", 
                    velocity: null, 
                    volume: null, 
                    sentiment_score: null, 
                    ai_analysis: null, 
                    saved_at: new Date().toISOString() 
                  });
                }
                setTrendPanelOpen(true);
              }}
            />
          </section>

          {/* Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <MetricCard
              title="Potential Revenue"
              value={formattedRevenue}
              change={revenueChange}
              changeType={stats.potentialRevenue > 0 ? "positive" : "neutral"}
              icon={DollarSign}
              delay={0}
              loading={loading}
            />
            <MetricCard
              title="Active Signals"
              value={stats.activeSignals.toString()}
              change={signalsChange}
              changeType={stats.hotOpportunities > 0 ? "positive" : "neutral"}
              icon={TrendingUp}
              delay={50}
              loading={loading}
            />
            <MetricCard
              title="Inventory Match"
              value={`${stats.inventoryMatchPercent}%`}
              change={inventoryChange}
              changeType="neutral"
              icon={Package}
              delay={100}
              loading={loading}
            />
            <MetricCard
              title="Avg. Speed to Shelf"
              value={`${stats.avgSpeedToShelf}h`}
              change={speedChange}
              changeType={stats.speedChange < 0 ? "positive" : "neutral"}
              icon={Zap}
              delay={150}
              loading={loading}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Action Cards */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl">Priority Actions</h2>
                <span className="text-sm text-muted-foreground">
                  Ranked by revenue potential
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                  <>
                    <ActionCardSkeleton delay={300} />
                    <ActionCardSkeleton delay={400} />
                    <ActionCardSkeleton delay={500} />
                  </>
                ) : actionCards.length > 0 ? (
                  actionCards.map((card, index) => (
                    <ActionCard key={card.id} {...card} delay={300 + index * 100} />
                  ))
                ) : (
                  <ActionCardsEmpty />
                )}
              </div>
            </div>

            {/* Trending Signals & Brand DNA */}
            <div className="lg:col-span-1 space-y-4">
              <TrendingSignals signals={liveSignals} loading={loading} />
              <BrandDNACompletenessWidget />
            </div>
          </div>

      {/* Campaign Brief Cards */}
      {savedTrends.length > 0 && (
        <section className="mt-8 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl">Campaign Briefs</h2>
            <span className="text-sm text-muted-foreground">Based on saved trends</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedTrends.slice(0, 3).map((trend) => (
              <CampaignBriefCard
                key={trend.id}
                trendName={trend.trend_name}
                trendSurge={trend.velocity || "+127%"}
                surgeChange="vs last week"
                products={activeBrand?.products || []}
                brandId={activeBrand?.id}
                onViewBrief={() => {
                  setSelectedTrend(trend);
                  setTrendPanelOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      )}

      <GlassBoxAssistant />

      {/* Trend Intelligence Dialog */}
      <Dialog open={trendPanelOpen} onOpenChange={setTrendPanelOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {selectedTrend && (
            <TrendIntelligencePanel 
              savedTrend={selectedTrend}
              onClose={() => setTrendPanelOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Index;
