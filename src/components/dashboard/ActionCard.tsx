import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingUp, Package, Zap, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionCardProps {
  id?: string;
  trend: string;
  trendSignal: "hot" | "warm" | "rising" | "stable";
  potentialRevenue: string;
  inventoryMatch: number;
  suggestedBundle: string[];
  delay?: number;
}

const signalLabels = {
  hot: "Hot",
  warm: "Warm",
  rising: "Rising",
  stable: "Stable",
};

export function ActionCard({
  id,
  trend,
  trendSignal,
  potentialRevenue,
  inventoryMatch,
  suggestedBundle,
  delay = 0,
}: ActionCardProps) {
  return (
    <div
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up group border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("signal-dot", `signal-${trendSignal}`)} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {signalLabels[trendSignal]} Signal
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-accent/15 to-primary/10 text-accent">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{potentialRevenue}</span>
        </div>
      </div>

      {/* Trend Name */}
      <h3 className="font-display font-bold text-xl mb-4 group-hover:text-primary transition-colors">
        "{trend}"
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Inventory Match</p>
            <p className="font-semibold text-sm">{inventoryMatch} SKUs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Speed to Shelf</p>
            <p className="font-semibold text-sm text-primary">&lt; 2 hrs</p>
          </div>
        </div>
      </div>

      {/* Suggested Bundle */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">Suggested Bundle</p>
        <div className="flex flex-wrap gap-2">
          {suggestedBundle.map((item, index) => (
            <span
              key={index}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary/80 text-secondary-foreground border border-border/30"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Link to="/deployment">
        <Button variant="gradient" className="w-full group/btn">
          Deploy Campaign
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}

export function ActionCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-4" />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="mb-5">
        <Skeleton className="h-3 w-24 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function ActionCardsEmpty() {
  return (
    <div className="col-span-full bg-card/80 backdrop-blur-sm rounded-2xl p-8 animate-slide-up border border-border/40 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">No priority actions yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Start by exploring Signal Intelligence to discover trending topics, 
          then save them to generate actionable opportunities here.
        </p>
        <Link to="/signals">
          <Button variant="gradient" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Explore Signals
          </Button>
        </Link>
      </div>
    </div>
  );
}
