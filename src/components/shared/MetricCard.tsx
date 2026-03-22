import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
  loading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  delay = 0,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div 
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="mt-2 text-3xl font-display font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "mt-1.5 text-sm font-medium",
              changeType === "positive" && "text-signal-rising",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
