import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePredictiveIntelligence } from "@/hooks/usePredictiveIntelligence";
import { TrendingUp, Clock, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface TrendLifecycleWidgetProps {
  trendName: string;
  currentVolume?: string;
  platform?: string;
  className?: string;
}

export function TrendLifecycleWidget({ 
  trendName, 
  className 
}: TrendLifecycleWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { predictTrendLifecycle, trendPredictions, isLoading } = usePredictiveIntelligence();

  const handlePredict = async () => {
    await predictTrendLifecycle([{ name: trendName, volume: "1000", velocity: "rising" }]);
    setExpanded(true);
  };

  const prediction = trendPredictions?.predictions?.[0];

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case "emerging": return "bg-blue-500";
      case "growing": return "bg-green-500";
      case "peak": return "bg-yellow-500";
      case "declining": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <Card className={`bg-card/60 backdrop-blur-sm border-border/40 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Lifecycle Prediction
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handlePredict} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : prediction ? (expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <Zap className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!prediction && !isLoading && (
          <p className="text-xs text-muted-foreground">Click to predict when "{trendName}" will peak</p>
        )}
        {isLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Analyzing...</div>}
        {prediction && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={`${getPhaseColor(prediction.currentStage)} text-white text-xs`}>{prediction.currentStage}</Badge>
              <span className="text-xs text-muted-foreground">{prediction.confidence}% confidence</span>
            </div>
            <Progress value={prediction.currentStage === "emerging" ? 20 : prediction.currentStage === "growing" ? 40 : prediction.currentStage === "peak" ? 70 : 90} className="h-2" />
            {expanded && (
              <div className="pt-2 border-t border-border/40 space-y-2 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Days to Peak</p><p className="font-medium">{prediction.daysUntilPeak ?? "At peak"}</p></div>
                  <div><p className="text-muted-foreground">Relevance</p><p className="font-medium">{prediction.daysOfRelevance} days</p></div>
                </div>
                <p className="text-xs"><TrendingUp className="h-3 w-3 inline text-primary mr-1" />{prediction.recommendedAction}</p>
              </div>
            )}
            {!expanded && <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setExpanded(true)}>Show details</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
