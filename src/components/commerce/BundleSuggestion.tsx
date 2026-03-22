import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

interface BundleItem {
  name: string;
  price: number;
  matchScore: number;
}

interface BundleSuggestionProps {
  trendName: string;
  items: BundleItem[];
  totalPrice: number;
  bundlePrice: number;
  projectedRevenue: string;
  confidence: number;
  delay?: number;
}

export function BundleSuggestion({
  trendName,
  items,
  totalPrice,
  bundlePrice,
  projectedRevenue,
  confidence,
  delay = 0,
}: BundleSuggestionProps) {
  const savings = ((totalPrice - bundlePrice) / totalPrice * 100).toFixed(0);

  return (
    <div
      className="glass-card rounded-xl overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">AI Suggested Bundle</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 text-accent">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-semibold">{projectedRevenue}</span>
          </div>
        </div>
        <h3 className="font-display font-bold text-lg">"{trendName}" Bundle</h3>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-8 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.matchScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.matchScore}% match</span>
                </div>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">${item.price}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="p-4 bg-secondary/30 border-t border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Original Price</span>
          <span className="text-sm text-muted-foreground line-through">${totalPrice}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Bundle Price</span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-signal-rising/10 text-signal-rising text-xs font-medium">
              Save {savings}%
            </span>
            <span className="font-bold text-lg">${bundlePrice}</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">AI Confidence</span>
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium text-primary">{confidence}%</span>
        </div>

        <Button variant="gradient" className="w-full group">
          Create Bundle
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
