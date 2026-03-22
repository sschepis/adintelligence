import { Badge } from "./badge";
import { CheckCircle2, Clock, Eye, Loader2, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeContrastColors, BadgeColorConfig } from "@/lib/colorContrast";

type StatusType = 
  | "pending" 
  | "in-progress" 
  | "review" 
  | "revision" 
  | "completed" 
  | "active" 
  | "paused"
  | "live"
  | "cached"
  | "hot"
  | "warm"
  | "rising"
  | "stable";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  icon: typeof CheckCircle2;
  colors: BadgeColorConfig;
  label: string;
  iconAnimation?: string;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  pending: { 
    icon: Clock, 
    colors: badgeContrastColors.gray,
    label: "Pending" 
  },
  "in-progress": { 
    icon: Loader2, 
    colors: badgeContrastColors.blue,
    label: "In Progress",
    iconAnimation: "animate-spin"
  },
  review: { 
    icon: Eye, 
    colors: badgeContrastColors.amber,
    label: "In Review" 
  },
  revision: { 
    icon: MessageSquare, 
    colors: badgeContrastColors.purple,
    label: "Revision" 
  },
  completed: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.green,
    label: "Completed" 
  },
  active: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.green,
    label: "Active" 
  },
  paused: { 
    icon: Clock, 
    colors: badgeContrastColors.amber,
    label: "Paused" 
  },
  live: { 
    icon: Wifi, 
    colors: badgeContrastColors.green,
    label: "Live" 
  },
  cached: { 
    icon: WifiOff, 
    colors: badgeContrastColors.gray,
    label: "Cached" 
  },
  hot: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.red,
    label: "Hot" 
  },
  warm: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.orange,
    label: "Warm" 
  },
  rising: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.blue,
    label: "Rising" 
  },
  stable: { 
    icon: CheckCircle2, 
    colors: badgeContrastColors.gray,
    label: "Stable" 
  },
};

const defaultConfig: StatusConfig = {
  icon: Clock,
  colors: badgeContrastColors.gray,
  label: "Unknown"
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    ...defaultConfig,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };

  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        "gap-1.5 font-medium border",
        config.colors.bg,
        config.colors.text,
        config.colors.border,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn("w-3 h-3", config.iconAnimation)} />
      )}
      {config.label}
    </Badge>
  );
}
