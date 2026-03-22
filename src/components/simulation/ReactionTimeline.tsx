import { cn } from "@/lib/utils";
import type { Persona } from "./PersonaCard";

interface TimelinePoint {
  time: number; // seconds
  emotion: "joy" | "interest" | "surprise" | "neutral" | "confusion" | "skepticism";
  intensity: number; // 0-100
}

interface PersonaReaction {
  persona: Persona;
  timeline: TimelinePoint[];
  overallSentiment: number;
  likelyToBuy: number;
  feedback: string;
}

const emotionColors = {
  joy: "bg-signal-rising",
  interest: "bg-primary",
  surprise: "bg-accent",
  neutral: "bg-muted-foreground",
  confusion: "bg-amber-500",
  skepticism: "bg-destructive",
};

const emotionEmojis = {
  joy: "😊",
  interest: "🤔",
  surprise: "😮",
  neutral: "😐",
  confusion: "😕",
  skepticism: "🤨",
};

interface ReactionTimelineProps {
  reactions: PersonaReaction[];
  duration: number; // total duration in seconds
  currentTime: number;
  isPlaying: boolean;
}

export function ReactionTimeline({ reactions, duration, currentTime, isPlaying }: ReactionTimelineProps) {
  const timeMarkers = Array.from({ length: 7 }, (_, i) => Math.round((i / 6) * duration));

  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-lg">Micro-Expression Timeline</h3>
          <p className="text-sm text-muted-foreground">Real-time emotional responses</p>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(emotionEmojis).slice(0, 4).map(([emotion, emoji]) => (
            <div key={emotion} className="flex items-center gap-1.5">
              <span className="text-sm">{emoji}</span>
              <span className="text-xs text-muted-foreground capitalize">{emotion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Axis */}
      <div className="relative mb-4 h-8">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(time / duration) * 100}%` }}
          >
            <div className="w-px h-3 bg-border" />
            <span className="text-xs text-muted-foreground mt-1">
              {time}s
            </span>
          </div>
        ))}
        {/* Playhead */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 transition-all duration-100"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
          </div>
        )}
      </div>

      {/* Persona Timelines */}
      <div className="space-y-4">
        {reactions.map((reaction, index) => (
          <div
            key={reaction.persona.id}
            className="animate-slide-in-right"
            style={{ animationDelay: `${200 + index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-lg">
                {reaction.persona.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{reaction.persona.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className={cn(
                    "font-medium",
                    reaction.overallSentiment >= 70 ? "text-signal-rising" :
                    reaction.overallSentiment >= 40 ? "text-accent" : "text-destructive"
                  )}>
                    {reaction.overallSentiment}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Buy Intent:</span>
                  <span className={cn(
                    "font-medium",
                    reaction.likelyToBuy >= 70 ? "text-signal-rising" :
                    reaction.likelyToBuy >= 40 ? "text-accent" : "text-destructive"
                  )}>
                    {reaction.likelyToBuy}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="relative h-10 bg-secondary/50 rounded-lg overflow-hidden">
              {reaction.timeline.map((point, pointIndex) => {
                const width = pointIndex < reaction.timeline.length - 1
                  ? ((reaction.timeline[pointIndex + 1].time - point.time) / duration) * 100
                  : ((duration - point.time) / duration) * 100;

                return (
                  <div
                    key={pointIndex}
                    className={cn(
                      "absolute top-0 bottom-0 flex items-center justify-center transition-opacity",
                      emotionColors[point.emotion]
                    )}
                    style={{
                      left: `${(point.time / duration) * 100}%`,
                      width: `${width}%`,
                      opacity: point.intensity / 100,
                    }}
                  >
                    <span className="text-lg">{emotionEmojis[point.emotion]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { PersonaReaction, TimelinePoint };
