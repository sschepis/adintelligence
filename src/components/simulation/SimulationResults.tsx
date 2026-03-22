import { cn } from "@/lib/utils";
import { TrendingUp, Users, ThumbsUp, DollarSign, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulationResultsProps {
  overallScore: number;
  engagementRate: number;
  purchaseIntent: number;
  estimatedRevenue: string;
  recommendation?: string;
  className?: string;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function SimulationResults({
  overallScore,
  engagementRate,
  purchaseIntent,
  estimatedRevenue,
  recommendation,
  className,
  onSave,
  isSaving,
  isSaved,
}: SimulationResultsProps) {
  const metrics = [
    {
      label: "Overall Score",
      value: `${overallScore}%`,
      icon: TrendingUp,
      color: overallScore >= 70 ? "text-signal-rising" : overallScore >= 50 ? "text-accent" : "text-destructive",
    },
    {
      label: "Engagement Rate",
      value: `${engagementRate}%`,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Purchase Intent",
      value: `${purchaseIntent}%`,
      icon: ThumbsUp,
      color: purchaseIntent >= 60 ? "text-signal-rising" : "text-accent",
    },
    {
      label: "Est. Revenue Impact",
      value: estimatedRevenue,
      icon: DollarSign,
      color: "text-accent",
    },
  ];

  const defaultRecommendation = "Strong positive sentiment detected. Consider extending the hero shot at 0:15 by 2 seconds where peak engagement was recorded. Address price objection with value proposition overlay.";

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)} style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">Simulation Results</h3>
        {onSave && (
          <Button
            variant="glass"
            size="sm"
            className="gap-2"
            onClick={onSave}
            disabled={isSaving || isSaved}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <Save className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Results
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="p-4 rounded-lg bg-secondary/50 animate-scale-in"
            style={{ animationDelay: `${400 + index * 50}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-md bg-secondary", metric.color)}>
                <metric.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <p className={cn("text-2xl font-display font-bold", metric.color)}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
        <p className="text-sm font-medium mb-1">AI Recommendation</p>
        <p className="text-xs text-muted-foreground">
          {recommendation || defaultRecommendation}
        </p>
      </div>
    </div>
  );
}
