import { cn } from "@/lib/utils";
import { TrendingUp, Eye, MessageCircle, Share2, Sparkles, Loader2, Bookmark, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeContrastColors } from "@/lib/colorContrast";

interface TrendCardProps {
  name: string;
  platform: string;
  platformIcon: string;
  volume: string;
  growth: string;
  engagement: string;
  shares: string;
  status: "hot" | "warm" | "rising" | "stable";
  hashtags: string[];
  thumbnail?: string;
  videoUrl?: string;
  author?: string;
  delay?: number;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onMediaClick?: () => void;
}

const statusColors = {
  hot: "from-red-50 to-red-100/50 border-red-200 dark:from-red-900/20 dark:to-red-800/10 dark:border-red-800/30",
  warm: "from-orange-50 to-orange-100/50 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/10 dark:border-orange-800/30",
  rising: "from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/10 dark:border-blue-800/30",
  stable: "from-gray-50 to-gray-100/50 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/10 dark:border-gray-700/30",
};

const statusBadgeColors = {
  hot: badgeContrastColors.red,
  warm: badgeContrastColors.orange,
  rising: badgeContrastColors.blue,
  stable: badgeContrastColors.gray,
};

const statusLabels = {
  hot: "Hot",
  warm: "Warm",
  rising: "Rising",
  stable: "Stable",
};

export function TrendCard({
  name,
  platform,
  platformIcon,
  volume,
  growth,
  engagement,
  shares,
  status,
  hashtags,
  thumbnail,
  videoUrl,
  author,
  delay = 0,
  onAnalyze,
  isAnalyzing,
  onSave,
  isSaved,
  isSaving,
  onMediaClick,
}: TrendCardProps) {
  const hasMedia = thumbnail || videoUrl;
  const isClickable = hasMedia && onMediaClick;
  return (
    <div
      className={cn(
        "bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden animate-slide-up group border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300",
        `bg-gradient-to-br ${statusColors[status]}`
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Visual Preview */}
      <div 
        className={cn(
          "relative h-36 bg-secondary/40 overflow-hidden",
          isClickable && "cursor-pointer"
        )}
        onClick={isClickable ? onMediaClick : undefined}
      >
        {hasMedia ? (
          <>
            <img 
              src={thumbnail} 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-primary fill-primary ml-0.5" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-5xl opacity-30">{platformIcon}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        
        {/* Status Badge */}
        <div className={cn(
          "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
          statusBadgeColors[status].bg,
          statusBadgeColors[status].text,
          statusBadgeColors[status].border
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            status === "hot" && "bg-red-500",
            status === "warm" && "bg-orange-500",
            status === "rising" && "bg-blue-500",
            status === "stable" && "bg-gray-500"
          )} />
          <span className="text-xs font-semibold">{statusLabels[status]}</span>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <span>{platformIcon}</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{platform}</span>
        </div>

        {/* Author Badge */}
        {author && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">@{author}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
            {name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 flex-shrink-0 transition-colors",
              isSaved 
                ? "text-primary hover:text-primary/80" 
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            )}
          </Button>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hashtags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-semibold text-sm">{volume}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-signal-rising" />
            <div>
              <p className="text-xs text-muted-foreground">Growth</p>
              <p className="font-semibold text-sm text-signal-rising">{growth}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className="font-semibold text-sm">{engagement}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Shares</p>
              <p className="font-semibold text-sm">{shares}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="glass" 
          className="w-full gap-2"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              AI Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
