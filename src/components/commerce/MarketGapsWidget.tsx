import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompetitiveIntelligence, MarketGap } from "@/hooks/useCompetitiveIntelligence";
import { Lightbulb, Loader2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface MarketGapsWidgetProps {
  industry?: string;
  currentInventory?: { category: string; count: number }[];
  className?: string;
}

export function MarketGapsWidget({ 
  industry = "E-commerce",
  currentInventory = [],
  className 
}: MarketGapsWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { detectMarketGaps, marketGaps, isLoading } = useCompetitiveIntelligence();

  const handleDetect = async () => {
    await detectMarketGaps(industry, undefined, undefined, currentInventory);
    setExpanded(true);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: MarketGap["type"]) => {
    switch (type) {
      case "product": return "📦";
      case "price": return "💰";
      case "feature": return "✨";
      case "service": return "🛎️";
      case "audience": return "👥";
      default: return "💡";
    }
  };

  return (
    <Card className={`bg-card/60 backdrop-blur-sm border-border/40 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Market Gaps
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDetect}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : marketGaps ? (
              expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!marketGaps && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Discover opportunities competitors are missing
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Scanning market landscape...
          </div>
        )}

        {marketGaps && (
          <div className="space-y-3">
            {/* Gap Count Summary */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Opportunities found</span>
              <Badge variant="default">{marketGaps.gaps?.length || 0}</Badge>
            </div>

            {/* Top Gaps */}
            {marketGaps.gaps?.slice(0, expanded ? 4 : 2).map((gap, i) => (
              <div key={i} className="bg-muted/50 rounded p-2 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <span>{getTypeIcon(gap.type)}</span>
                    <span className="text-xs font-medium">{gap.title}</span>
                  </div>
                  <Badge variant={getUrgencyColor(gap.urgency)} className="text-[10px]">
                    {gap.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {gap.description}
                </p>
                {expanded && (
                  <div className="text-xs text-muted-foreground">
                    <span>Market size: </span>
                    <span className="font-medium text-foreground">{gap.marketSize}</span>
                    <span className="mx-2">•</span>
                    <span>{gap.confidence}% confidence</span>
                  </div>
                )}
              </div>
            ))}

            {expanded && marketGaps.priorityMatrix && (
              <div className="pt-2 border-t border-border/40 space-y-2 animate-in slide-in-from-top-2">
                {/* Quick Wins */}
                {marketGaps.priorityMatrix.quickWins?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">⚡ Quick Wins</p>
                    <ul className="text-xs space-y-0.5">
                      {marketGaps.priorityMatrix.quickWins.slice(0, 2).map((win, i) => (
                        <li key={i} className="text-muted-foreground">• {win}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emerging Opportunities */}
                {marketGaps.emergingOpportunities?.slice(0, 1).map((opp, i) => (
                  <div key={i} className="text-xs bg-primary/10 rounded p-2">
                    <span className="font-medium text-primary">🚀 {opp.opportunity}</span>
                    <p className="text-muted-foreground">
                      {opp.timeframe} • {opp.investmentLevel} investment
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!expanded && marketGaps && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setExpanded(true)}
              >
                Show all opportunities
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
