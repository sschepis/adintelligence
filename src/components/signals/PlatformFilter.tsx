import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  icon: string;
}

const platformConfig: Platform[] = [
  { id: "all", name: "All Platforms", icon: "🌐" },
  { id: "tiktok", name: "TikTok", icon: "📱" },
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "youtube", name: "YouTube", icon: "▶️" },
];

interface PlatformFilterProps {
  selected: string;
  onSelect: (id: string) => void;
  counts?: Record<string, number>;
}

export function PlatformFilter({ selected, onSelect, counts = {} }: PlatformFilterProps) {
  const totalCount = counts.all ?? Object.values(counts).reduce((sum, c) => sum + c, 0);
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {platformConfig.map((platform) => {
        const count = platform.id === "all" ? totalCount : (counts[platform.id] ?? 0);
        
        return (
          <button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              selected === platform.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <span>{platform.icon}</span>
            <span>{platform.name}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-xs",
              selected === platform.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
