import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/shared";
import { UserMenu } from "@/components/layout/UserMenu";
import { Package, Sparkles, TrendingUp, Loader2 } from "lucide-react";

interface CommerceHeaderProps {
  onFetchBestSellers: () => void;
  loadingAmazon: boolean;
}

export function CommerceHeader({ onFetchBestSellers, loadingAmazon }: CommerceHeaderProps) {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Commerce Loop
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered trend-to-inventory matching • Market intelligence via Rainforest API
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="glass" 
            size="sm" 
            className="gap-2"
            onClick={onFetchBestSellers}
            disabled={loadingAmazon}
          >
            {loadingAmazon ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            Best Sellers
          </Button>
          <Button variant="glass" size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Sync Inventory
          </Button>
          <Button variant="gradient" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Auto-Generate Bundles
          </Button>
          <NotificationCenter />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
