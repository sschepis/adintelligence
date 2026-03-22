import { Crown, Loader2, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  'prod_TWIzz2xXPK3WZo': { label: 'Starter', color: 'text-emerald-400' },
  'prod_TWJ0LawpqGMsLt': { label: 'Growth', color: 'text-primary' },
  'prod_TWJ0fZJZ5f2hJx': { label: 'Enterprise', color: 'text-amber-400' },
};

interface SubscriptionStatusProps {
  collapsed?: boolean;
}

export function SubscriptionStatus({ collapsed = false }: SubscriptionStatusProps) {
  const { subscribed, productId, loading, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {!collapsed && <span className="text-xs">Loading...</span>}
        </div>
      </div>
    );
  }

  const tierInfo = productId ? TIER_CONFIG[productId] : null;

  if (!subscribed) {
    return (
      <div className={cn("px-3 py-2", collapsed && "px-2")}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Crown className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-xs">No active plan</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("px-3 py-2 space-y-2", collapsed && "px-2")}>
      <div className="flex items-center gap-2">
        <Crown className={cn("h-4 w-4 shrink-0", tierInfo?.color || "text-primary")} />
        {!collapsed && (
          <div className="flex flex-col">
            <span className={cn("text-xs font-medium", tierInfo?.color || "text-primary")}>
              {tierInfo?.label || 'Active'} Plan
            </span>
          </div>
        )}
      </div>
      {!collapsed && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-8 text-muted-foreground hover:text-foreground"
          onClick={() => openCustomerPortal()}
        >
          <CreditCard className="h-3.5 w-3.5 mr-2" />
          Manage Subscription
        </Button>
      )}
    </div>
  );
}
