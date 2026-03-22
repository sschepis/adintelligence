import { useState } from "react";
import { PageContainer } from "@/components/shared";
import { usePredictiveIntelligence } from "@/hooks/usePredictiveIntelligence";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useBrand } from "@/contexts/BrandContext";
import { TrendLifecyclePanel } from "@/components/ai-insights/TrendLifecyclePanel";
import { RevenueForecastPanel } from "@/components/ai-insights/RevenueForecastPanel";
import { DemandPlanningPanel } from "@/components/ai-insights/DemandPlanningPanel";
import { AIInsightsHeader } from "@/components/ai-insights/AIInsightsHeader";
import { ConversationalAnalyticsPanel } from "@/components/ai-insights/ConversationalAnalyticsPanel";
import { VoiceToBriefPanel } from "@/components/ai-insights/VoiceToBriefPanel";
import { AutoReportPanel } from "@/components/ai-insights/AutoReportPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Package, MessageSquare, Mic, FileText } from "lucide-react";

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState("conversational");
  const { activeBrand } = useBrand();
  const { savedTrends } = useSavedTrends();
  const {
    trendPredictions,
    revenueForecast,
    demandPlan,
    isLoadingPredictions,
    isLoadingForecast,
    isLoadingDemandPlan,
    predictTrendLifecycle,
    forecastRevenue,
    planDemand,
  } = usePredictiveIntelligence();

  // Get inventory from brand products
  const inventory = activeBrand?.products as Array<{
    name: string;
    stock: number;
    price?: number;
    category?: string;
  }> || [];

  // Transform saved trends for prediction
  const trendsForPrediction = savedTrends.map(t => ({
    name: t.trend_name,
    volume: t.volume || undefined,
    velocity: t.velocity || undefined,
    platform: t.platform || undefined,
    sentiment_score: t.sentiment_score || undefined,
  }));

  return (
    <PageContainer>
      <div className="space-y-6">
        <AIInsightsHeader 
          trendCount={savedTrends.length}
          inventoryCount={inventory.length}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="conversational" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice Brief</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Lifecycle</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="demand" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Demand</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversational" className="mt-6">
            <ConversationalAnalyticsPanel />
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            <VoiceToBriefPanel />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AutoReportPanel />
          </TabsContent>

          <TabsContent value="lifecycle" className="mt-6">
            <TrendLifecyclePanel
              trends={trendsForPrediction}
              predictions={trendPredictions}
              isLoading={isLoadingPredictions}
              onAnalyze={() => predictTrendLifecycle(trendsForPrediction, { brand: activeBrand?.name })}
            />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <RevenueForecastPanel
              savedTrends={savedTrends}
              inventory={inventory}
              forecast={revenueForecast}
              isLoading={isLoadingForecast}
              onForecast={(matches, weeks) => forecastRevenue(matches, weeks)}
            />
          </TabsContent>

          <TabsContent value="demand" className="mt-6">
            <DemandPlanningPanel
              inventory={inventory}
              trends={trendsForPrediction}
              demandPlan={demandPlan}
              isLoading={isLoadingDemandPlan}
              onPlanDemand={(inv, trends, leadTime) => planDemand(inv, trends, leadTime)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default AIInsights;
