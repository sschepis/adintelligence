import { CampaignCard } from "@/components/deployment/CampaignCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Campaign } from "@/hooks/useCampaigns";
import { Rocket } from "lucide-react";

interface CampaignListProps {
  campaigns: Campaign[];
  loading?: boolean;
  onToggle: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onDeploy?: (campaign: Campaign) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

function CampaignCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="glass-card rounded-xl p-5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignList({
  campaigns,
  loading = false,
  onToggle,
  onEdit,
  onDelete,
  onDeploy,
  emptyTitle = "No campaigns yet",
  emptyDescription = "Create your first campaign to get started",
  emptyAction,
}: CampaignListProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        <CampaignCardSkeleton delay={0} />
        <CampaignCardSkeleton delay={100} />
        <CampaignCardSkeleton delay={200} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((campaign, index) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onToggle={() => onToggle(campaign)}
          onEdit={() => onEdit(campaign)}
          onDelete={() => onDelete(campaign)}
          onDeploy={onDeploy ? () => onDeploy(campaign) : undefined}
          delay={index * 100}
        />
      ))}
    </div>
  );
}
