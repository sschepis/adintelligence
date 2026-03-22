import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SavedTrend {
  id: string;
  trend_name: string;
  platform?: string | null;
  velocity?: string | null;
  volume?: string | null;
  ai_analysis?: string | null;
}

interface SavedTrendCardProps {
  trend: SavedTrend;
  delay?: number;
  onClick: () => void;
}

export function SavedTrendCard({ trend, delay = 0, onClick }: SavedTrendCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
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
  );
}
