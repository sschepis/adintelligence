import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Play, Pause, MoreVertical, TrendingUp, DollarSign, Eye, 
  Target, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Rocket 
} from "lucide-react";
import { Campaign } from "@/hooks/useCampaigns";

interface CampaignCardProps {
  campaign: Campaign;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeploy?: () => void;
  delay?: number;
}

const statusStyles = {
  active: "bg-signal-rising/10 text-signal-rising border-signal-rising/20",
  paused: "bg-accent/10 text-accent border-accent/20",
  scheduled: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-muted",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function CampaignCard({ campaign, onToggle, onEdit, onDelete, onDeploy, delay = 0 }: CampaignCardProps) {
  const budgetProgress = campaign.total_budget > 0 
    ? (campaign.spent / campaign.total_budget) * 100 
    : 0;
  
  const ctr = campaign.impressions > 0 
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) 
    : "0.00";

  return (
    <div
      className="glass-card rounded-xl p-5 animate-slide-up hover:border-primary/30 transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg">{campaign.name}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
              statusStyles[campaign.status]
            )}>
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {campaign.platform ? `Platform: ${campaign.platform}` : "No platform set"} • Daily: ${campaign.daily_budget.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status !== "draft" && campaign.status !== "scheduled" && (
            <Button
              variant="glass"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              {campaign.status === "active" ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onDeploy && (campaign.status === "draft" || campaign.status === "paused") && (
                <DropdownMenuItem onClick={onDeploy}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">
            ${campaign.spent.toLocaleString()} / ${campaign.total_budget.toLocaleString()}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              budgetProgress > 90 ? "bg-destructive" :
              budgetProgress > 70 ? "bg-accent" : "bg-primary"
            )}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">Impressions</span>
          </div>
          <p className="font-semibold">{formatNumber(campaign.impressions)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs">Clicks</span>
          </div>
          <p className="font-semibold">{formatNumber(campaign.clicks)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">CTR</span>
          </div>
          <p className="font-semibold">{ctr}%</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="text-xs">Conversions</span>
          </div>
          <div className="flex items-center gap-1">
            <p className="font-semibold">{campaign.conversions}</p>
            {campaign.performance_score !== 0 && (
              <span className={cn(
                "flex items-center text-xs",
                campaign.performance_score >= 0 ? "text-signal-rising" : "text-destructive"
              )}>
                {campaign.performance_score >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(campaign.performance_score)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export the old interface for backwards compatibility
export type { Campaign };
