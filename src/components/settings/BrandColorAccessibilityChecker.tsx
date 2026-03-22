import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoticeState } from "@/components/shared";
import { 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Lightbulb
} from "lucide-react";
import { 
  hslToRgb, 
  getLuminance, 
  getContrastRatio,
  parseHSL 
} from "@/lib/colorContrast";

interface BrandColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

interface ContrastResult {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  suggestion?: string;
}

interface BrandColorAccessibilityCheckerProps {
  colors: BrandColors;
  onApplySuggestion?: (colorType: string, color: string) => void;
}

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Lighten or darken a color to meet contrast
const adjustColorForContrast = (
  fgHex: string, 
  bgHex: string, 
  targetRatio: number = 4.5
): string | null => {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;

  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);
  const isDarkBg = bgLuminance < 0.5;

  // Try adjusting the foreground color
  for (let i = 0; i <= 100; i++) {
    const factor = isDarkBg ? 1 + (i / 100) : 1 - (i / 100);
    const newR = fg.r * factor;
    const newG = fg.g * factor;
    const newB = fg.b * factor;
    
    const newLuminance = getLuminance(newR, newG, newB);
    const ratio = getContrastRatio(newLuminance, bgLuminance);
    
    if (ratio >= targetRatio) {
      return rgbToHex(newR, newG, newB);
    }
  }

  // If adjustment didn't work, suggest black or white
  return isDarkBg ? '#ffffff' : '#000000';
};

export function BrandColorAccessibilityChecker({ 
  colors, 
  onApplySuggestion 
}: BrandColorAccessibilityCheckerProps) {
  const contrastResults = useMemo(() => {
    const results: ContrastResult[] = [];
    
    const colorPairs = [
      { pair: "Text on Background", foreground: "text_color", background: "background_color" },
      { pair: "Primary on Background", foreground: "primary_color", background: "background_color" },
      { pair: "Secondary on Background", foreground: "secondary_color", background: "background_color" },
      { pair: "Accent on Background", foreground: "accent_color", background: "background_color" },
      { pair: "Text on Primary", foreground: "text_color", background: "primary_color" },
      { pair: "Text on Secondary", foreground: "text_color", background: "secondary_color" },
      { pair: "Text on Accent", foreground: "text_color", background: "accent_color" },
    ];

    colorPairs.forEach(({ pair, foreground, background }) => {
      const fgColor = colors[foreground as keyof BrandColors];
      const bgColor = colors[background as keyof BrandColors];
      
      if (!fgColor || !bgColor) return;

      const fgRgb = hexToRgb(fgColor);
      const bgRgb = hexToRgb(bgColor);
      
      if (!fgRgb || !bgRgb) return;

      const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
      const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
      const ratio = getContrastRatio(fgLuminance, bgLuminance);

      const passesAA = ratio >= 4.5;
      const passesAAA = ratio >= 7;
      const passesAALarge = ratio >= 3;

      let suggestion: string | undefined;
      if (!passesAA) {
        suggestion = adjustColorForContrast(fgColor, bgColor) || undefined;
      }

      results.push({
        pair,
        foreground: fgColor,
        background: bgColor,
        ratio,
        passesAA,
        passesAAA,
        passesAALarge,
        suggestion,
      });
    });

    return results;
  }, [colors]);

  const overallScore = useMemo(() => {
    if (contrastResults.length === 0) return 0;
    const passingCount = contrastResults.filter(r => r.passesAA).length;
    return Math.round((passingCount / contrastResults.length) * 100);
  }, [contrastResults]);

  const getStatusIcon = (result: ContrastResult) => {
    if (result.passesAAA) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (result.passesAA) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (result.passesAALarge) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (result: ContrastResult) => {
    if (result.passesAAA) return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">AAA</Badge>;
    if (result.passesAA) return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">AA</Badge>;
    if (result.passesAALarge) return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">AA Large</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            WCAG Accessibility Check
          </span>
          <Badge 
            variant={overallScore >= 80 ? "default" : overallScore >= 50 ? "secondary" : "destructive"}
            className={
              overallScore >= 80 
                ? "bg-green-500/10 text-green-600 border-green-500/20" 
                : overallScore >= 50 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : ""
            }
          >
            {overallScore}% Pass
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          WCAG 2.1 requires minimum contrast ratios for accessible text. AA level (4.5:1) is recommended, AAA level (7:1) is optimal.
        </p>

        <div className="space-y-2">
          {contrastResults.map((result, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result)}
                <div>
                  <p className="text-sm font-medium">{result.pair}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 rounded border border-border/50"
                      style={{ backgroundColor: result.foreground }}
                    />
                    <span className="text-xs text-muted-foreground">on</span>
                    <div 
                      className="w-4 h-4 rounded border border-border/50"
                      style={{ backgroundColor: result.background }}
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      {result.ratio.toFixed(2)}:1
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(result)}
                {result.suggestion && onApplySuggestion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => {
                      // Determine which color type to update based on the pair
                      const colorType = result.pair.includes("Text on") 
                        ? "text_color" 
                        : result.pair.split(" on ")[0].toLowerCase().replace(" ", "_") + "_color";
                      onApplySuggestion(colorType, result.suggestion!);
                    }}
                  >
                    <Lightbulb className="h-3 w-3" />
                    Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {contrastResults.some(r => !r.passesAA) && (
          <NoticeState
            type="warning"
            message="Some color combinations don't meet WCAG AA standards. Click 'Fix' to apply suggested improvements."
            icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
            className="p-3"
          />
        )}

        {contrastResults.every(r => r.passesAA) && (
          <NoticeState
            type="success"
            message="All color combinations meet WCAG AA accessibility standards!"
            className="p-3"
          />
        )}
      </CardContent>
    </Card>
  );
}
