import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Heart, Star, TrendingUp } from "lucide-react";

interface BrandColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

interface BrandColorPreviewProps {
  colors: BrandColors;
}

export function BrandColorPreview({ colors }: BrandColorPreviewProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Live Preview</h4>
      <div
        className="p-4 rounded-xl border border-border/50 space-y-4"
        style={{ backgroundColor: colors.background_color }}
      >
        {/* Sample Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: colors.text_color }}>
            Sample Dashboard
          </h3>
          <div className="flex gap-2">
            <Badge
              style={{
                backgroundColor: colors.primary_color,
                color: colors.text_color,
              }}
            >
              Primary
            </Badge>
            <Badge
              style={{
                backgroundColor: colors.secondary_color,
                color: colors.text_color,
              }}
            >
              Secondary
            </Badge>
            <Badge
              style={{
                backgroundColor: colors.accent_color,
                color: colors.text_color,
              }}
            >
              Accent
            </Badge>
          </div>
        </div>

        {/* Sample Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: colors.primary_color + "40",
              backgroundColor: colors.primary_color + "10",
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: colors.primary_color }} />
              <span className="text-sm font-medium" style={{ color: colors.text_color }}>
                Trending
              </span>
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.primary_color }}>
              +24%
            </p>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{
              borderColor: colors.accent_color + "40",
              backgroundColor: colors.accent_color + "10",
            }}
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" style={{ color: colors.accent_color }} />
              <span className="text-sm font-medium" style={{ color: colors.text_color }}>
                Engagement
              </span>
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.accent_color }}>
              89%
            </p>
          </div>
        </div>

        {/* Sample Buttons */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: colors.primary_color,
              color: colors.background_color,
            }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-90"
            style={{
              borderColor: colors.secondary_color,
              color: colors.secondary_color,
              backgroundColor: "transparent",
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: colors.accent_color,
              color: colors.background_color,
            }}
          >
            Accent
          </button>
        </div>

        {/* Sample Alert */}
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            backgroundColor: colors.secondary_color + "20",
            borderLeft: `3px solid ${colors.secondary_color}`,
          }}
        >
          <Bell className="h-4 w-4" style={{ color: colors.secondary_color }} />
          <span className="text-sm" style={{ color: colors.text_color }}>
            This is how notifications will appear
          </span>
        </div>

        {/* Sample Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="h-5 w-5"
              style={{
                color: i <= 4 ? colors.accent_color : colors.text_color + "30",
                fill: i <= 4 ? colors.accent_color : "transparent",
              }}
            />
          ))}
          <span className="text-sm ml-2" style={{ color: colors.text_color + "80" }}>
            4.0 rating
          </span>
        </div>
      </div>
    </div>
  );
}
