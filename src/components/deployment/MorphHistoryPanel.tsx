import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Undo2, 
  Palette, 
  Music, 
  Type, 
  Image, 
  Layout,
  ArrowRight,
  TrendingUp,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MorphHistoryEntry } from "@/hooks/useCampaignMorphing";
import { useState } from "react";

interface MorphHistoryPanelProps {
  history: MorphHistoryEntry[];
  onRevert: (historyId: string) => Promise<boolean>;
  onClear: () => void;
  className?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  color: Palette,
  audio: Music,
  headline: Type,
  imagery: Image,
  format: Layout
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-muted"
};

export function MorphHistoryPanel({ history, onRevert, onClear, className }: MorphHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reverting, setReverting] = useState<string | null>(null);

  const handleRevert = async (id: string) => {
    setReverting(id);
    await onRevert(id);
    setReverting(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className={cn("glass-card rounded-xl p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Morph History</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No morphs applied yet</p>
          <p className="text-xs mt-1">Applied morphs will appear here with before/after comparisons</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card rounded-xl p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Morph History</h3>
          <Badge variant="secondary" className="text-xs">{history.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-xs">
          <Trash2 className="h-3 w-3" />
          Clear
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {history.map((entry) => {
            const Icon = typeIcons[entry.suggestion.type] || History;
            const isExpanded = expandedId === entry.id;
            
            return (
              <div 
                key={entry.id}
                className="rounded-lg border border-border bg-secondary/30 overflow-hidden"
              >
                <div 
                  className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {entry.suggestion.suggestion.slice(0, 40)}...
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] capitalize shrink-0", priorityColors[entry.suggestion.priority])}
                        >
                          {entry.suggestion.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(entry.appliedAt)}</span>
                        <span>•</span>
                        <span>{entry.campaignName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">{entry.beforeState.overallScore}%</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-signal-rising font-medium">{entry.afterState.overallScore}%</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/50 pt-3 animate-slide-up">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-medium text-destructive">BEFORE</span>
                          <TrendingUp className="h-3 w-3 text-destructive" />
                          <span className="text-[10px] text-destructive">{entry.beforeState.overallScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.beforeState.description}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-signal-rising/5 border border-signal-rising/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-medium text-signal-rising">AFTER</span>
                          <TrendingUp className="h-3 w-3 text-signal-rising" />
                          <span className="text-[10px] text-signal-rising">{entry.afterState.overallScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.afterState.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground">
                        <span>Impact: </span>
                        <span className="text-signal-rising">{entry.suggestion.expectedImpact}</span>
                        <span> • Source: {entry.suggestion.trendSource}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevert(entry.id);
                        }}
                        disabled={reverting === entry.id}
                        className="gap-1.5 text-xs h-7 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Undo2 className="h-3 w-3" />
                        {reverting === entry.id ? "Reverting..." : "Revert"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}