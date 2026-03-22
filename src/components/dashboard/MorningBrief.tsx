import { Play, Calendar, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MorningBriefProps {
  displayName?: string | null;
  potentialRevenue?: number;
  hotOpportunities?: number;
  topTrend?: string | null;
  loading?: boolean;
}

export function MorningBrief({ 
  displayName,
  potentialRevenue = 0,
  hotOpportunities = 0,
  topTrend,
  loading = false,
}: MorningBriefProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const greeting = getGreeting();
  const name = displayName || "Strategist";
  const formattedRevenue = potentialRevenue > 0 
    ? `$${Math.round(potentialRevenue / 1000)}K` 
    : null;

  if (loading) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 animate-slide-up relative overflow-hidden border border-border/40 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-4 w-full max-w-lg mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 animate-slide-up relative overflow-hidden border border-border/40 shadow-sm">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{today}</span>
          </div>
          
          <h2 className="font-display font-bold text-2xl mb-2 text-foreground">
            {greeting}, <span className="text-foreground">{name}</span>
          </h2>
          
          {hotOpportunities > 0 || formattedRevenue ? (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mb-4">
              {hotOpportunities > 0 && (
                <>
                  {hotOpportunities} high-priority {hotOpportunities === 1 ? 'opportunity' : 'opportunities'} detected
                </>
              )}
              {formattedRevenue && (
                <>
                  {hotOpportunities > 0 ? ' with ' : 'Potential '}
                  <span className="text-accent font-medium">{formattedRevenue}</span>
                  {' combined revenue potential. '}
                </>
              )}
              {topTrend && (
                <>
                  Top trend: "<span className="text-primary font-medium">{topTrend}</span>"
                </>
              )}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mb-4">
              Ready to discover today's opportunities. Head to Signal Intelligence to 
              find trending topics and save them for analysis.
            </p>
          )}

          <div className="flex items-center gap-4">
            <Button variant="gradient" className="gap-2">
              <Play className="h-4 w-4" />
              Watch AI Brief
            </Button>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              <span>2 min summary</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        {(hotOpportunities > 0 || formattedRevenue) && (
          <div className="hidden lg:flex h-32 w-48 rounded-xl bg-secondary/60 flex-col items-center justify-center border border-border/40 group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold text-foreground">{hotOpportunities}</span>
            <span className="text-xs text-muted-foreground">Hot Opportunities</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
