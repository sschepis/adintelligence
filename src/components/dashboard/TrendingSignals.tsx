import { cn } from "@/lib/utils";
import { TrendingUp, Eye, Clock, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Signal {
  id: string;
  name: string;
  platform: string;
  volume: string;
  growth: string;
  timeAgo: string;
  status: "hot" | "warm" | "rising" | "stable";
}

interface TrendingSignalsProps {
  signals?: Signal[];
  loading?: boolean;
}

export function TrendingSignals({ signals = [], loading = false }: TrendingSignalsProps) {
  if (loading) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 border border-border/30">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-foreground">Live Signals</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No signals yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Save trends from Signal Intelligence to see them here
          </p>
          <Link 
            to="/signals" 
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Explore Signals →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg text-foreground">Live Signals</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-signal-rising animate-pulse" />
          <span>Real-time</span>
        </div>
      </div>

      <div className="space-y-3">
        {signals.map((signal, index) => (
          <div
            key={signal.id}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary/80 border border-border/30 hover:border-primary/20 transition-all duration-200 cursor-pointer group animate-slide-in-right"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn("signal-dot", `signal-${signal.status}`)} />
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {signal.name}
                </p>
                <p className="text-xs text-muted-foreground">{signal.platform}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">{signal.volume}</span>
              </div>
              <div className="flex items-center gap-1.5 text-signal-rising">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{signal.growth}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">{signal.timeAgo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link 
        to="/signals"
        className="block w-full mt-4 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors text-center"
      >
        View All Signals →
      </Link>
    </div>
  );
}
