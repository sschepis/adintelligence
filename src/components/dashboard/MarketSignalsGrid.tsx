import { cn } from "@/lib/utils";
import { Zap, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductMatch {
  id: string;
  name: string;
  image?: string;
}

interface MarketSignal {
  id: string;
  name: string;
  matchScore: number;
  featured: boolean;
  products: ProductMatch[];
  platform?: string;
  growth?: string;
}

interface MarketSignalsGridProps {
  signals: MarketSignal[];
  onViewBrief?: (signal: MarketSignal) => void;
  loading?: boolean;
}

function SignalCard({ signal, onViewBrief }: { signal: MarketSignal; onViewBrief?: (signal: MarketSignal) => void }) {
  const displayProducts = signal.products.slice(0, 3);
  const remainingCount = signal.products.length - 3;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-base truncate max-w-[140px]">{signal.name}</h3>
          {signal.featured && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
              FEATURED
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-sm font-bold border",
            signal.matchScore >= 90 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
              : signal.matchScore >= 80 
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          )}>
            {signal.matchScore}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Platform & Growth */}
      {(signal.platform || signal.growth) && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Rising on</span>
          {signal.platform && <span className="font-medium">{signal.platform}</span>}
          {signal.growth && <span className="text-emerald-600 font-semibold">{signal.growth}</span>}
        </div>
      )}

      {/* Products */}
      <p className="text-xs text-muted-foreground mb-2">Top Matching Products</p>
      <div className="flex items-center gap-2">
        {displayProducts.map((product) => (
          <div key={product.id} className="flex flex-col items-center gap-1 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border/50 overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground text-center truncate w-full max-w-[64px]">
              {product.name}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl bg-secondary/30 border border-dashed border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground font-medium">+{remainingCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* View Brief Button */}
      {onViewBrief && (
        <Button 
          variant="default" 
          size="sm" 
          className="mt-4 w-full gap-2"
          onClick={() => onViewBrief(signal)}
        >
          View Brief
        </Button>
      )}
    </div>
  );
}

function SignalCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <div className="w-24 h-5 rounded bg-secondary" />
        </div>
        <div className="w-10 h-7 rounded-lg bg-secondary" />
      </div>
      <div className="w-16 h-3 rounded bg-secondary mb-2" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl bg-secondary" />
            <div className="w-12 h-2 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketSignalsGrid({ signals, onViewBrief, loading }: MarketSignalsGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg">ADVERTISING MARKET SIGNALS</h2>
            <p className="text-sm text-muted-foreground">Trending beauty aesthetics & search terms</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SignalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">ADVERTISING MARKET SIGNALS</h2>
          <p className="text-sm text-muted-foreground">Trending beauty aesthetics & search terms</p>
        </div>
      </div>
      {signals.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No market signals yet</p>
          <p className="text-xs text-muted-foreground">
            Save trends from Signal Intelligence to see market signals here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} onViewBrief={onViewBrief} />
          ))}
        </div>
      )}
    </div>
  );
}
