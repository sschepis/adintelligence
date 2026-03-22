import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Palette, 
  Music, 
  Type, 
  Image, 
  Layout,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  History,
  FlaskConical,
  BarChart3,
  Percent,
  Calendar,
  Database
} from "lucide-react";
import { useCampaignMorphing, MorphSuggestion } from "@/hooks/useCampaignMorphing";
import { useABTestPersistence } from "@/hooks/useABTestPersistence";
import { MorphHistoryPanel } from "./MorphHistoryPanel";
import { ABTestResultsPanel } from "./ABTestResultsPanel";
import { ABTestScheduler } from "./ABTestScheduler";

interface MorphSetting {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
  value: number;
  description: string;
}

const initialSettings: MorphSetting[] = [
  {
    id: "color",
    name: "Color Grading",
    icon: Palette,
    enabled: true,
    value: 65,
    description: "Auto-adjust color warmth based on trending aesthetics",
  },
  {
    id: "music",
    name: "Background Audio",
    icon: Music,
    enabled: true,
    value: 80,
    description: "Swap tracks to match viral audio trends",
  },
  {
    id: "headlines",
    name: "Dynamic Headlines",
    icon: Type,
    enabled: false,
    value: 50,
    description: "A/B test headline variations in real-time",
  },
];

const typeIcons: Record<string, React.ElementType> = {
  color: Palette,
  audio: Music,
  headline: Type,
  imagery: Image,
  format: Layout
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-muted"
};

interface Campaign {
  id: string;
  name: string;
  status: string;
  platform?: string | null;
  total_budget: number;
  spent: number;
  performance_score?: number | null;
}

interface RealTimeMorphingProps {
  className?: string;
  campaigns?: Campaign[];
  currentTrends?: any[];
}

export function RealTimeMorphing({ className, campaigns = [], currentTrends = [] }: RealTimeMorphingProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [autoMorph, setAutoMorph] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showABResults, setShowABResults] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [abTestTraffic, setAbTestTraffic] = useState(50);
  const [showTrafficSlider, setShowTrafficSlider] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Select first active campaign by default
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      const activeCampaign = campaigns.find(c => c.status === "active") || campaigns[0];
      setSelectedCampaignId(activeCampaign.id);
    }
  }, [campaigns, selectedCampaignId]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const campaignName = selectedCampaign?.name || "Current Campaign";
  
  const { 
    morphData, 
    morphHistory,
    abTests,
    isLoading, 
    isApplying, 
    generateSuggestions, 
    applySuggestion, 
    applyAllHighPriority,
    clearHistory,
    revertMorph,
    startABTest,
    concludeABTest,
    cancelABTest,
    getABTestForSuggestion
  } = useCampaignMorphing();

  const { 
    savedTests,
    schedules,
    saveTest, 
    updateTestResults,
    checkActiveSchedules 
  } = useABTestPersistence();

  // Save test results when a test is concluded
  useEffect(() => {
    const concludedTests = abTests.filter(t => t.status === "concluded");
    concludedTests.forEach(test => {
      const suggestion = morphData?.morphSuggestions.find(s => s.id === test.suggestionId);
      if (suggestion) {
        saveTest(test, suggestion, campaignName);
      }
    });
  }, [abTests, morphData, campaignName, saveTest]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const updateValue = (id: string, value: number) => {
    setSettings(prev => prev.map(s =>
      s.id === id ? { ...s, value } : s
    ));
  };

  const handleGenerateSuggestions = () => {
    // Use saved trends or current trends, fall back to data-driven suggestions
    const trendsToUse = currentTrends.length > 0 ? currentTrends : [];
    
    // Add campaign performance context for smarter suggestions
    const campaignContext = selectedCampaign ? {
      performanceScore: selectedCampaign.performance_score || 50,
      platform: selectedCampaign.platform,
      budgetUtilization: selectedCampaign.total_budget > 0 
        ? (selectedCampaign.spent / selectedCampaign.total_budget) * 100 
        : 0
    } : undefined;

    generateSuggestions(campaignName, trendsToUse, selectedCampaign?.platform || undefined, campaignContext);
    setShowSuggestions(true);
  };

  const highPrioritySuggestions = morphData?.morphSuggestions?.filter(s => s.priority === "high") || [];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="glass-card rounded-xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-lg">Real-Time Morphing</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScheduler(!showScheduler)}
              className="gap-1.5 relative"
              title="A/B Test Scheduler"
            >
              <Calendar className="h-4 w-4" />
              {schedules.filter(s => s.enabled).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-signal-rising text-background text-[10px] flex items-center justify-center">
                  {schedules.filter(s => s.enabled).length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowABResults(!showABResults)}
              className="gap-1.5 relative"
              title="A/B Test Results"
            >
              <FlaskConical className="h-4 w-4" />
              {abTests.filter(t => t.status === "running").length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center animate-pulse">
                  {abTests.filter(t => t.status === "running").length}
                </span>
              )}
            </Button>
            {savedTests.length > 0 && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Database className="h-3 w-3" />
                {savedTests.length} saved
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-1.5 relative"
            >
              <History className="h-4 w-4" />
              {morphHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {morphHistory.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              AI Suggest
            </Button>
            <Button
              variant={autoMorph ? "gradient" : "glass"}
              size="sm"
              onClick={() => setAutoMorph(!autoMorph)}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-4 w-4", autoMorph && "animate-spin")} />
              {autoMorph ? "Active" : "Paused"}
            </Button>
          </div>
        </div>

        {/* A/B Test Traffic Slider */}
        <div className="mb-5 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowTrafficSlider(!showTrafficSlider)}
          >
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">A/B Test Traffic Allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-accent/10 text-accent">
                {abTestTraffic}% to Variant
              </Badge>
              {showTrafficSlider ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
          
          {showTrafficSlider && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[abTestTraffic]}
                    onValueChange={(value) => setAbTestTraffic(value[0])}
                    min={10}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Control: {100 - abTestTraffic}%</span>
                <span>Variant: {abTestTraffic}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 90].map(percent => (
                  <Button
                    key={percent}
                    variant={abTestTraffic === percent ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setAbTestTraffic(percent)}
                    className="text-xs h-7"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Set the percentage of traffic to route to the variant during A/B tests. 
                Higher percentages mean faster results but more risk.
              </p>
            </div>
          )}
        </div>

      {/* AI Score Banner */}
      {morphData && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Trend Alignment Score</span>
            </div>
            <span className={cn(
              "text-lg font-bold",
              morphData.overallScore >= 70 ? "text-signal-rising" : 
              morphData.overallScore >= 50 ? "text-accent" : "text-destructive"
            )}>
              {morphData.overallScore}%
            </span>
          </div>
          {highPrioritySuggestions.filter(s => !s.applied).length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                <span>{highPrioritySuggestions.filter(s => !s.applied).length} high-priority adjustments pending</span>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => applyAllHighPriority(undefined, campaignName || "Current Campaign")}
                disabled={isApplying === "all"}
                className="gap-1.5 text-xs h-7"
              >
                {isApplying === "all" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                Apply All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Status Banner - only show when no morphData */}
      {!morphData && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/50 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Click "AI Suggest" to get trend-aligned recommendations
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI will analyze current trends and suggest creative adjustments
          </p>
        </div>
      )}

      {/* AI Suggestions */}
      {morphData && showSuggestions && (
        <div className="mb-5">
          <div 
            className="flex items-center justify-between cursor-pointer mb-2"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <span className="text-sm font-medium">AI Suggestions ({morphData.morphSuggestions?.length || 0})</span>
            {showSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {morphData.morphSuggestions?.map((suggestion: MorphSuggestion) => {
                const Icon = typeIcons[suggestion.type] || Sparkles;
                const isApplyingThis = isApplying === suggestion.id;
                return (
                  <div 
                    key={suggestion.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      suggestion.applied 
                        ? "bg-signal-rising/10 border-signal-rising/30" 
                        : "bg-secondary/50 border-border/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "p-1.5 rounded",
                        suggestion.applied ? "bg-signal-rising/20" : "bg-primary/10"
                      )}>
                        {suggestion.applied ? (
                          <Check className="h-3 w-3 text-signal-rising" />
                        ) : (
                          <Icon className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] capitalize", priorityColors[suggestion.priority])}
                          >
                            {suggestion.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{suggestion.trendSource}</span>
                          {suggestion.applied && (
                            <Badge variant="secondary" className="text-[10px] text-signal-rising bg-signal-rising/10">
                              Applied
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium">{suggestion.suggestion}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{suggestion.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-[10px] text-signal-rising">
                          {suggestion.expectedImpact}
                        </Badge>
                        {suggestion.abTestActive ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent">
                              <FlaskConical className="h-2.5 w-2.5 mr-1" />
                              A/B {suggestion.abTestTrafficPercent}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => concludeABTest(suggestion.id)}
                              disabled={!!isApplying}
                              className="h-6 text-xs gap-1 hover:bg-signal-rising/10"
                            >
                              <BarChart3 className="h-3 w-3" />
                              End
                            </Button>
                          </div>
                        ) : !suggestion.applied && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startABTest(suggestion.id, abTestTraffic, undefined, campaignName || "Current Campaign")}
                              disabled={!!isApplying}
                              className="h-6 text-xs gap-1 hover:bg-accent/10"
                              title="Start A/B test"
                            >
                              <FlaskConical className="h-3 w-3" />
                              Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applySuggestion(suggestion.id, undefined, campaignName || "Current Campaign")}
                              disabled={!!isApplying}
                              className="h-6 text-xs gap-1 hover:bg-primary/10"
                            >
                              {isApplyingThis ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className={cn(
              "p-4 rounded-lg border transition-all",
              setting.enabled 
                ? "bg-secondary/50 border-border" 
                : "bg-secondary/20 border-transparent opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  setting.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <setting.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{setting.name}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors",
                  setting.enabled ? "bg-primary" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-background transition-transform",
                  setting.enabled ? "left-5" : "left-1"
                )} />
              </button>
            </div>

            {setting.enabled && (
              <div className="flex items-center gap-3">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={setting.value}
                  onChange={(e) => updateValue(setting.id, parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <span className="text-sm font-medium w-10 text-right">{setting.value}%</span>
              </div>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <MorphHistoryPanel 
          history={morphHistory}
          onRevert={revertMorph}
          onClear={clearHistory}
        />
      )}

      {/* A/B Test Results Panel */}
      {showABResults && (
        <ABTestResultsPanel
          tests={abTests}
          suggestions={morphData?.morphSuggestions || []}
          onConclude={concludeABTest}
          onCancel={cancelABTest}
        />
      )}

      {/* A/B Test Scheduler Panel */}
      {showScheduler && (
        <ABTestScheduler />
      )}
    </div>
  );
}
