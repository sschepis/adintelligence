import { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { getHexContrastRatio, meetsWCAG_AA } from "@/lib/colorContrast";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ColorPairViolation {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
}

export function WCAGAlertBanner() {
  const { activeBrand } = useBrand();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [violations, setViolations] = useState<ColorPairViolation[]>([]);

  useEffect(() => {
    if (!activeBrand) {
      setViolations([]);
      return;
    }

    const theme = (activeBrand.metadata as any)?.theme || {};
    const pairs: { name: string; fg: string; bg: string }[] = [
      {
        name: "Text on Background",
        fg: activeBrand.text_color || "#1a1a2e",
        bg: activeBrand.background_color || "#ffffff",
      },
      {
        name: "CTA Text on CTA",
        fg: theme.ctaText || "#ffffff",
        bg: theme.ctaPrimary || activeBrand.primary_color || "#7c3aed",
      },
      {
        name: "Menu Text on Menu",
        fg: theme.menuText || "#1a1a2e",
        bg: theme.menuBackground || activeBrand.background_color || "#ffffff",
      },
      {
        name: "Link on Background",
        fg: theme.linkColor || activeBrand.primary_color || "#7c3aed",
        bg: activeBrand.background_color || "#ffffff",
      },
      {
        name: "Accent on Background",
        fg: activeBrand.accent_color || "#f97316",
        bg: activeBrand.background_color || "#ffffff",
      },
    ];

    const newViolations: ColorPairViolation[] = [];

    pairs.forEach(({ name, fg, bg }) => {
      if (fg && bg && !meetsWCAG_AA(fg, bg)) {
        const ratio = getHexContrastRatio(fg, bg);
        newViolations.push({
          name,
          foreground: fg,
          background: bg,
          ratio,
        });
      }
    });

    setViolations(newViolations);
    // Reset dismissed state when violations change
    if (newViolations.length > 0) {
      setDismissed(false);
    }
  }, [activeBrand]);

  if (violations.length === 0 || dismissed) {
    return null;
  }

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 animate-fade-in">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-destructive">
              WCAG Accessibility Warning:
            </span>
            <span className="text-sm text-muted-foreground">
              {violations.length} color pair{violations.length > 1 ? "s" : ""} fail
              AA compliance
            </span>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              {violations.slice(0, 3).map((v, i) => (
                <span
                  key={v.name}
                  className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full"
                >
                  {v.name} ({v.ratio.toFixed(1)}:1)
                </span>
              ))}
              {violations.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{violations.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10"
            onClick={() => navigate("/brand-theme")}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Fix Now
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
