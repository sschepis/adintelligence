import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, AlertTriangle, Zap, Target, Loader2 } from "lucide-react";
import { TrendPredictionResult, TrendPrediction } from "@/hooks/usePredictiveIntelligence";

interface TrendLifecyclePanelProps {
  trends: Array<{ name: string; volume?: string; velocity?: string; platform?: string; sentiment_score?: number }>;
  predictions: TrendPredictionResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const stageColors: Record<string, string> = {
  emerging: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  growing: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  peak: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  declining: "bg-red-500/20 text-red-700 border-red-500/30",
  stable: "bg-slate-500/20 text-slate-700 border-slate-500/30",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-red-600",
};

function PredictionCard({ prediction }: { prediction: TrendPrediction }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{prediction.trendName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={stageColors[prediction.currentStage]}>
                {prediction.currentStage}
              </Badge>
              <span className={`text-xs font-medium ${riskColors[prediction.riskLevel]}`}>
                {prediction.riskLevel} risk
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{prediction.confidence}%</div>
            <div className="text-xs text-muted-foreground">confidence</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Days to Peak
            </div>
            <div className="text-lg font-semibold">
              {prediction.daysUntilPeak !== null ? prediction.daysUntilPeak : "Peaked"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Relevance
            </div>
            <div className="text-lg font-semibold">{prediction.daysOfRelevance} days</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Confidence</div>
          <Progress value={prediction.confidence} className="h-2" />
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-primary mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-medium">{prediction.recommendedAction}</div>
              <div className="text-xs text-muted-foreground">{prediction.optimalActionWindow}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {prediction.keyFactors.slice(0, 3).map((factor, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {factor}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendLifecyclePanel({ trends, predictions, isLoading, onAnalyze }: TrendLifecyclePanelProps) {
  if (trends.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Trends to Analyze</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Save some trends from Signal Intelligence to get AI-powered lifecycle predictions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Trend Lifecycle Prediction
              </CardTitle>
              <CardDescription>
                AI predicts when trends will peak and decline based on velocity, volume, and historical patterns
              </CardDescription>
            </div>
            <Button onClick={onAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze {trends.length} Trends
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {predictions && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Hottest Trend</div>
                    <div className="font-semibold">{predictions.summary.hottest}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Most Urgent</div>
                    <div className="font-semibold">{predictions.summary.mostUrgent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Best Long-Term</div>
                    <div className="font-semibold">{predictions.summary.bestLongTerm}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prediction Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predictions.predictions.map((prediction, i) => (
              <PredictionCard key={i} prediction={prediction} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
