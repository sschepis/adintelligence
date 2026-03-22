import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  Trophy,
  Target,
  MousePointer,
  Eye,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import { ABTestConfig, MorphSuggestion } from "@/hooks/useCampaignMorphing";
import { formatDistanceToNow } from "date-fns";

interface ABTestResultsPanelProps {
  tests: ABTestConfig[];
  suggestions: MorphSuggestion[];
  onConclude: (suggestionId: string) => void;
  onCancel: (suggestionId: string) => void;
  className?: string;
}

export function ABTestResultsPanel({ 
  tests, 
  suggestions, 
  onConclude, 
  onCancel,
  className 
}: ABTestResultsPanelProps) {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [showConcluded, setShowConcluded] = useState(true);

  const runningTests = tests.filter(t => t.status === "running");
  const concludedTests = tests.filter(t => t.status === "concluded");
  const cancelledTests = tests.filter(t => t.status === "cancelled");

  const getSuggestionForTest = (test: ABTestConfig) => 
    suggestions.find(s => s.id === test.suggestionId);

  const calculateSignificance = (control: number, variant: number, sampleSize: number) => {
    // Simplified statistical significance calculation
    const pooled = (control + variant) / 2;
    const se = Math.sqrt(pooled * (1 - pooled) * (2 / sampleSize));
    const zScore = Math.abs(control - variant) / (se || 1);
    
    if (zScore >= 2.58) return { level: "99%", confident: true };
    if (zScore >= 1.96) return { level: "95%", confident: true };
    if (zScore >= 1.65) return { level: "90%", confident: true };
    return { level: "<90%", confident: false };
  };

  const getWinnerDisplay = (winner: "control" | "variant" | "inconclusive" | undefined) => {
    switch (winner) {
      case "variant":
        return { icon: Trophy, color: "text-signal-rising", label: "Variant Wins", bg: "bg-signal-rising/10" };
      case "control":
        return { icon: Target, color: "text-accent", label: "Control Wins", bg: "bg-accent/10" };
      default:
        return { icon: Minus, color: "text-muted-foreground", label: "Inconclusive", bg: "bg-muted" };
    }
  };

  const formatLift = (control: number, variant: number) => {
    if (control === 0) return "+∞%";
    const lift = ((variant - control) / control) * 100;
    const sign = lift >= 0 ? "+" : "";
    return `${sign}${lift.toFixed(1)}%`;
  };

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-lg">A/B Test Results</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {runningTests.length} Running
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {concludedTests.length} Concluded
          </Badge>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No A/B tests yet</p>
          <p className="text-xs mt-1">Start a test from the morphing suggestions above</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Running Tests */}
            {runningTests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent animate-pulse" />
                  Running Tests ({runningTests.length})
                </h4>
                {runningTests.map(test => {
                  const suggestion = getSuggestionForTest(test);
                  const isExpanded = expandedTest === test.suggestionId;
                  
                  return (
                    <div 
                      key={test.suggestionId}
                      className="p-4 rounded-lg border border-accent/30 bg-accent/5"
                    >
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedTest(isExpanded ? null : test.suggestionId)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent">
                              {test.trafficPercent}% Traffic
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Started {formatDistanceToNow(new Date(test.startedAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{suggestion?.suggestion || "Unknown morph"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onConclude(test.suggestionId); }}
                            className="h-7 text-xs gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Conclude
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onCancel(test.suggestionId); }}
                            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium">Control</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Eye className="h-3 w-3" /> Impressions
                                  </span>
                                  <span>{test.controlMetrics.impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <MousePointer className="h-3 w-3" /> Clicks
                                  </span>
                                  <span>{test.controlMetrics.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3" /> Conversions
                                  </span>
                                  <span>{test.controlMetrics.conversions}</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-accent/10">
                              <div className="flex items-center gap-2 mb-2">
                                <FlaskConical className="h-4 w-4 text-accent" />
                                <span className="text-xs font-medium">Variant</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Eye className="h-3 w-3" /> Impressions
                                  </span>
                                  <span>{test.variantMetrics.impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <MousePointer className="h-3 w-3" /> Clicks
                                  </span>
                                  <span>{test.variantMetrics.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3" /> Conversions
                                  </span>
                                  <span>{test.variantMetrics.conversions}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            Collecting data... Conclude test when ready to analyze.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Concluded Tests */}
            {concludedTests.length > 0 && (
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowConcluded(!showConcluded)}
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-signal-rising" />
                    Concluded Tests ({concludedTests.length})
                  </h4>
                  {showConcluded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                
                {showConcluded && concludedTests.map(test => {
                  const suggestion = getSuggestionForTest(test);
                  const isExpanded = expandedTest === test.suggestionId;
                  const winnerInfo = getWinnerDisplay(test.winner);
                  const WinnerIcon = winnerInfo.icon;
                  const significance = calculateSignificance(
                    test.controlMetrics.ctr / 100,
                    test.variantMetrics.ctr / 100,
                    test.controlMetrics.impressions + test.variantMetrics.impressions
                  );
                  const ctrLift = formatLift(test.controlMetrics.ctr, test.variantMetrics.ctr);
                  const convLift = formatLift(test.controlMetrics.conversions, test.variantMetrics.conversions);
                  
                  return (
                    <div 
                      key={test.suggestionId}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        winnerInfo.bg, 
                        test.winner === "variant" ? "border-signal-rising/30" : 
                        test.winner === "control" ? "border-accent/30" : "border-border/50"
                      )}
                    >
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedTest(isExpanded ? null : test.suggestionId)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("text-[10px]", winnerInfo.bg, winnerInfo.color)}>
                              <WinnerIcon className="h-3 w-3 mr-1" />
                              {winnerInfo.label}
                            </Badge>
                            {significance.confident && (
                              <Badge variant="outline" className="text-[10px] bg-signal-rising/10 text-signal-rising">
                                {significance.level} Confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{suggestion?.suggestion || "Unknown morph"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            CTR Lift: <span className={cn(
                              test.variantMetrics.ctr > test.controlMetrics.ctr ? "text-signal-rising" : "text-destructive"
                            )}>{ctrLift}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          {/* Metrics Comparison */}
                          <div className="space-y-3">
                            {/* CTR Comparison */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Click-Through Rate (CTR)</span>
                                <span className={cn(
                                  "text-xs font-medium",
                                  test.variantMetrics.ctr > test.controlMetrics.ctr ? "text-signal-rising" : "text-destructive"
                                )}>
                                  {ctrLift}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-14">Control</span>
                                  <Progress value={test.controlMetrics.ctr * 10} className="h-2 flex-1" />
                                  <span className="text-xs w-12 text-right">{test.controlMetrics.ctr.toFixed(2)}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-accent w-14">Variant</span>
                                  <Progress value={test.variantMetrics.ctr * 10} className="h-2 flex-1 [&>div]:bg-accent" />
                                  <span className="text-xs w-12 text-right">{test.variantMetrics.ctr.toFixed(2)}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Conversions Comparison */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Conversions</span>
                                <span className={cn(
                                  "text-xs font-medium",
                                  test.variantMetrics.conversions > test.controlMetrics.conversions ? "text-signal-rising" : "text-destructive"
                                )}>
                                  {convLift}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-14">Control</span>
                                  <Progress value={(test.controlMetrics.conversions / Math.max(test.controlMetrics.conversions, test.variantMetrics.conversions)) * 100} className="h-2 flex-1" />
                                  <span className="text-xs w-12 text-right">{test.controlMetrics.conversions}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-accent w-14">Variant</span>
                                  <Progress value={(test.variantMetrics.conversions / Math.max(test.controlMetrics.conversions, test.variantMetrics.conversions)) * 100} className="h-2 flex-1 [&>div]:bg-accent" />
                                  <span className="text-xs w-12 text-right">{test.variantMetrics.conversions}</span>
                                </div>
                              </div>
                            </div>

                            {/* Statistical Significance */}
                            <div className="p-3 rounded-lg bg-secondary/50 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium">Statistical Analysis</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                  <p className="text-lg font-bold">{(test.controlMetrics.impressions + test.variantMetrics.impressions).toLocaleString()}</p>
                                  <p className="text-[10px] text-muted-foreground">Total Impressions</p>
                                </div>
                                <div>
                                  <p className={cn(
                                    "text-lg font-bold",
                                    significance.confident ? "text-signal-rising" : "text-muted-foreground"
                                  )}>{significance.level}</p>
                                  <p className="text-[10px] text-muted-foreground">Confidence Level</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">{test.trafficPercent}%</p>
                                  <p className="text-[10px] text-muted-foreground">Traffic Split</p>
                                </div>
                              </div>
                              {!significance.confident && (
                                <div className="flex items-center gap-2 mt-3 p-2 rounded bg-destructive/10 text-destructive text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Results may not be statistically significant. Consider running longer tests.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cancelled Tests */}
            {cancelledTests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Cancelled ({cancelledTests.length})
                </h4>
                {cancelledTests.map(test => {
                  const suggestion = getSuggestionForTest(test);
                  return (
                    <div 
                      key={test.suggestionId}
                      className="p-3 rounded-lg border border-border/30 bg-secondary/20 opacity-60"
                    >
                      <p className="text-sm text-muted-foreground">{suggestion?.suggestion || "Unknown morph"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started {formatDistanceToNow(new Date(test.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
