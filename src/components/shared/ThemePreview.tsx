import { useState } from "react";
import { Eye, EyeOff, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsSection } from "./SettingsSection";
import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  animationDelay?: string;
}

export function ThemePreview({ animationDelay = "0ms" }: ThemePreviewProps) {
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const { organization } = useOrganization();

  const brandColors = {
    primary: organization?.primary_color || "#E85A4F",
    secondary: organization?.secondary_color || "#F5E6D3",
    accent: organization?.accent_color || "#8E8C99",
    background: organization?.background_color || "#FDFBF7",
    text: organization?.text_color || "#2D2A32",
  };

  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
    
    if (!isPreviewActive) {
      // Apply brand colors to CSS variables
      document.documentElement.style.setProperty('--preview-primary', brandColors.primary);
      document.documentElement.style.setProperty('--preview-secondary', brandColors.secondary);
      document.documentElement.style.setProperty('--preview-accent', brandColors.accent);
      document.body.classList.add('theme-preview-active');
    } else {
      // Remove preview styles
      document.body.classList.remove('theme-preview-active');
    }
  };

  return (
    <SettingsSection icon={Palette} title="Theme Preview" animationDelay={animationDelay}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Preview how your brand colors will appear across the platform.
        </p>

        {/* Color Swatches */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(brandColors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="w-full h-10 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground capitalize mt-1 block">
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-3">
            {isPreviewActive ? (
              <Eye className="h-5 w-5 text-primary" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">Live Preview</p>
              <p className="text-xs text-muted-foreground">
                {isPreviewActive ? "Preview active - colors applied" : "Toggle to see brand colors in action"}
              </p>
            </div>
          </div>
          <Button
            variant={isPreviewActive ? "gradient" : "glass"}
            size="sm"
            onClick={togglePreview}
          >
            {isPreviewActive ? "Disable" : "Enable"}
          </Button>
        </div>

        {/* Sample UI Elements */}
        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sample Elements
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              className={cn(
                "transition-colors",
                isPreviewActive && "bg-[var(--preview-primary)] text-white"
              )}
            >
              Primary Badge
            </Badge>
            <Badge 
              variant="secondary"
              className={cn(
                "transition-colors",
                isPreviewActive && "bg-[var(--preview-secondary)] text-foreground"
              )}
            >
              Secondary Badge
            </Badge>
            <Badge 
              variant="outline"
              className={cn(
                "transition-colors",
                isPreviewActive && "border-[var(--preview-accent)] text-[var(--preview-accent)]"
              )}
            >
              Accent Badge
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm"
              className={cn(
                "transition-colors",
                isPreviewActive && "bg-[var(--preview-primary)] hover:bg-[var(--preview-primary)]/90"
              )}
            >
              Primary Button
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "transition-colors",
                isPreviewActive && "border-[var(--preview-accent)] text-[var(--preview-accent)]"
              )}
            >
              Outline Button
            </Button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          To update brand colors, go to <span className="font-medium">Brand Settings</span>.
        </p>
      </div>
    </SettingsSection>
  );
}
