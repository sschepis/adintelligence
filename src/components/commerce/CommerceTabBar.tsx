import { Button } from "@/components/ui/button";
import { BookmarkCheck, Eye, Rocket, Loader2 } from "lucide-react";
import { Trend } from "@/components/commerce/TrendSelector";

interface CommerceTabBarProps {
  activeTab: "inventory" | "market" | "saved";
  onTabChange: (tab: "inventory" | "market" | "saved") => void;
  inventoryCount: number;
  marketCount: number;
  savedCount: number;
  onAnalyzeAll: () => void;
  isAnalyzingAll: boolean;
  selectedTrend: Trend | null;
  onDeployCampaign: () => void;
}

export function CommerceTabBar({
  activeTab,
  onTabChange,
  inventoryCount,
  marketCount,
  savedCount,
  onAnalyzeAll,
  isAnalyzingAll,
  selectedTrend,
  onDeployCampaign,
}: CommerceTabBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant={activeTab === "inventory" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("inventory")}
      >
        Matched Inventory ({inventoryCount})
      </Button>
      <Button
        variant={activeTab === "market" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("market")}
      >
        Market Products ({marketCount})
      </Button>
      <Button
        variant={activeTab === "saved" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("saved")}
        className="gap-1"
      >
        <BookmarkCheck className="h-3 w-3" />
        Saved Trends ({savedCount})
      </Button>
      <div className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onAnalyzeAll}
        disabled={isAnalyzingAll || !selectedTrend}
      >
        {isAnalyzingAll ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        Analyze All
      </Button>
      <Button
        variant="gradient"
        size="sm"
        className="gap-2"
        onClick={onDeployCampaign}
        disabled={!selectedTrend}
      >
        <Rocket className="h-4 w-4" />
        Deploy Campaign
      </Button>
    </div>
  );
}
