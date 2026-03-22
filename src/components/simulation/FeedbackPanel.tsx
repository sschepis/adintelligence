import { cn } from "@/lib/utils";
import type { Persona } from "./PersonaCard";
import { MessageCircle, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

interface FeedbackItem {
  persona: Persona;
  sentiment: "positive" | "neutral" | "negative";
  feedback: string;
  timestamp: string;
  keyMoment?: string;
  objection?: string;
}

interface FeedbackPanelProps {
  feedbackItems: FeedbackItem[];
  className?: string;
}

const sentimentIcons = {
  positive: ThumbsUp,
  neutral: MessageCircle,
  negative: ThumbsDown,
};

const sentimentColors = {
  positive: "text-signal-rising bg-signal-rising/10",
  neutral: "text-primary bg-primary/10",
  negative: "text-destructive bg-destructive/10",
};

export function FeedbackPanel({ feedbackItems, className }: FeedbackPanelProps) {
  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)} style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-lg">Focus Group Feedback</h3>
          <p className="text-sm text-muted-foreground">Qualitative insights from AI personas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-signal-rising" />
            <span className="text-muted-foreground">Positive</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Concerns</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {feedbackItems.map((item, index) => {
          const Icon = sentimentIcons[item.sentiment];
          
          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors animate-slide-in-right"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-xl shrink-0">
                  {item.persona.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.persona.name}</span>
                      <div className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                        sentimentColors[item.sentiment]
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    "{item.feedback}"
                  </p>

                  {/* Key Moment */}
                  {item.keyMoment && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 mb-2">
                      <span className="text-xs font-medium text-primary">Key Moment:</span>
                      <span className="text-xs text-muted-foreground">{item.keyMoment}</span>
                    </div>
                  )}

                  {/* Objection */}
                  {item.objection && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/5 border border-destructive/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{item.objection}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { FeedbackItem };
