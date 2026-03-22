import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Star, TrendingUp, Palette } from "lucide-react";

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface BrandColorPreviewProps {
  colors: BrandColors;
  className?: string;
  showSwatches?: boolean;
  showSampleUI?: boolean;
  compact?: boolean;
}

export function BrandColorPreview({ 
  colors, 
  className,
  showSwatches = true,
  showSampleUI = true,
  compact = false,
}: BrandColorPreviewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Color Swatches */}
      {showSwatches && (
        <div className={cn("grid gap-2", compact ? "grid-cols-5" : "grid-cols-5 gap-3")}>
          {Object.entries(colors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className={cn(
                  "w-full rounded-lg border border-border shadow-sm",
                  compact ? "h-8" : "h-10"
                )}
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground capitalize mt-1 block">
                {name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sample UI Preview */}
      {showSampleUI && (
        <div
          className={cn(
            "rounded-xl border border-border/50",
            compact ? "p-3 space-y-3" : "p-4 space-y-4"
          )}
          style={{ backgroundColor: colors.background }}
        >
          {/* Sample Header */}
          <div className="flex items-center justify-between">
            <h3 
              className={cn("font-bold", compact ? "text-sm" : "text-lg")} 
              style={{ color: colors.text }}
            >
              Sample Dashboard
            </h3>
            <div className="flex gap-1.5">
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                Primary
              </Badge>
              {!compact && (
                <>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.text,
                    }}
                  >
                    Secondary
                  </Badge>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.background,
                    }}
                  >
                    Accent
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Sample Cards */}
          <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 gap-3")}>
            <div
              className="p-3 rounded-lg border"
              style={{
                borderColor: colors.primary + "40",
                backgroundColor: colors.primary + "10",
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: colors.primary }} />
                <span className="text-xs font-medium" style={{ color: colors.text }}>
                  Trending
                </span>
              </div>
              <p 
                className={cn("font-bold mt-1", compact ? "text-lg" : "text-2xl")} 
                style={{ color: colors.primary }}
              >
                +24%
              </p>
            </div>
            <div
              className="p-3 rounded-lg border"
              style={{
                borderColor: colors.accent + "40",
                backgroundColor: colors.accent + "10",
              }}
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" style={{ color: colors.accent }} />
                <span className="text-xs font-medium" style={{ color: colors.text }}>
                  Engagement
                </span>
              </div>
              <p 
                className={cn("font-bold mt-1", compact ? "text-lg" : "text-2xl")} 
                style={{ color: colors.accent }}
              >
                89%
              </p>
            </div>
          </div>

          {/* Sample Buttons */}
          <div className="flex gap-2">
            <button
              className={cn(
                "rounded-lg font-medium transition-opacity hover:opacity-90",
                compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
              )}
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              Primary
            </button>
            <button
              className={cn(
                "rounded-lg font-medium border transition-opacity hover:opacity-90",
                compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
              )}
              style={{
                borderColor: colors.secondary,
                color: colors.text,
                backgroundColor: "transparent",
              }}
            >
              Secondary
            </button>
            {!compact && (
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.background,
                }}
              >
                Accent
              </button>
            )}
          </div>

          {/* Sample Alert - only in non-compact mode */}
          {!compact && (
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: colors.secondary + "20",
                borderLeft: `3px solid ${colors.secondary}`,
              }}
            >
              <Bell className="h-4 w-4" style={{ color: colors.secondary }} />
              <span className="text-sm" style={{ color: colors.text }}>
                Notification preview
              </span>
            </div>
          )}

          {/* Sample Rating - only in non-compact mode */}
          {!compact && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  style={{
                    color: i <= 4 ? colors.accent : colors.text + "30",
                    fill: i <= 4 ? colors.accent : "transparent",
                  }}
                />
              ))}
              <span className="text-xs ml-2" style={{ color: colors.text + "80" }}>
                4.0 rating
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Color swatch only component for inline use
export function ColorSwatchRow({ colors, className }: { colors: BrandColors; className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      {Object.entries(colors).map(([name, color]) => (
        <div
          key={name}
          className="h-6 w-6 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: color }}
          title={`${name}: ${color}`}
        />
      ))}
    </div>
  );
}
