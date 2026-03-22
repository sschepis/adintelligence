import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkCheck, Loader2, Zap } from "lucide-react";

interface SavedTrend {
  id: string;
  trend_name: string;
  platform?: string | null;
  velocity?: string | null;
  volume?: string | null;
  ai_analysis?: string | null;
}

interface SavedTrendsTabProps {
  savedTrends: SavedTrend[];
  loading: boolean;
  onSelectTrend: (trend: SavedTrend) => void;
}

export function SavedTrendsTab({ savedTrends, loading, onSelectTrend }: SavedTrendsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (savedTrends.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">No saved trends yet</p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Save trends from Signal Intelligence to match with inventory
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Saved Trends</h2>
        <span className="text-sm text-muted-foreground">
          From Signal Intelligence
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedTrends.map((trend, index) => (
          <Card 
            key={trend.id}
            className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onSelectTrend(trend)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{trend.trend_name}</h3>
                {trend.velocity && (
                  <Badge variant="secondary" className="text-xs">
                    {trend.velocity}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                {trend.platform && <span>{trend.platform}</span>}
                {trend.volume && <span>Vol: {trend.volume}</span>}
              </div>
              {trend.ai_analysis && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {trend.ai_analysis}
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 gap-2"
              >
                <Zap className="h-3 w-3" />
                Match to Inventory
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
