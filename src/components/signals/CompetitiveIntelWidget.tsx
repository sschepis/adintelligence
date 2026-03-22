import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { Target, TrendingUp, TrendingDown, Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface CompetitiveIntelWidgetProps {
  brandName: string;
  competitors?: string[];
  className?: string;
}

export function CompetitiveIntelWidget({ 
  brandName,
  competitors = [],
  className 
}: CompetitiveIntelWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { calculateShareOfVoice, shareOfVoice, isLoading } = useCompetitiveIntelligence();

  const handleAnalyze = async () => {
    await calculateShareOfVoice(brandName, competitors);
    setExpanded(true);
  };

  const getSentimentIcon = (trend?: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "declining": return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className={`bg-card/60 backdrop-blur-sm border-border/40 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Share of Voice
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : shareOfVoice ? (
              expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!shareOfVoice && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Track your brand's share of voice vs competitors
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing market presence...
          </div>
        )}

        {shareOfVoice && (
          <div className="space-y-3">
            {/* Main Share */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{brandName}</span>
                <span className="font-semibold text-primary">
                  {shareOfVoice.overallShareOfVoice?.brand}%
                </span>
              </div>
              <Progress value={shareOfVoice.overallShareOfVoice?.brand || 0} className="h-2" />
            </div>

            {/* Sentiment */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sentiment</span>
              <div className="flex items-center gap-1">
                {getSentimentIcon(shareOfVoice.sentiment?.trend)}
                <span className="text-green-500">{shareOfVoice.sentiment?.positive}% positive</span>
              </div>
            </div>

            {expanded && (
              <div className="pt-2 border-t border-border/40 space-y-2 animate-in slide-in-from-top-2">
                {/* Competitor Comparison */}
                {shareOfVoice.competitorComparison?.slice(0, 3).map((comp, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">{comp.competitor}</span>
                    <div className="flex items-center gap-2">
                      <span>{comp.shareOfVoice}%</span>
                      <Badge 
                        variant={comp.trend === "losing" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {comp.trend}
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Alerts */}
                {shareOfVoice.alerts?.slice(0, 2).map((alert, i) => (
                  <div 
                    key={i} 
                    className={`text-xs p-2 rounded ${
                      alert.type === "threat" ? "bg-destructive/10 text-destructive" :
                      alert.type === "opportunity" ? "bg-green-500/10 text-green-600" :
                      "bg-primary/10 text-primary"
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            )}

            {!expanded && shareOfVoice && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setExpanded(true)}
              >
                View competitor breakdown
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
