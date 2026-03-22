import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { getHexContrastRatio, getWCAGLevel, getCompliantTextColor, type WCAGLevel } from "@/lib/colorContrast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContrastPair {
  label: string;
  foreground: string;
  background: string;
  onFix?: (suggestedColor: string) => void;
}

interface ContrastWarningProps {
  pairs: ContrastPair[];
  className?: string;
}

const levelColors: Record<WCAGLevel, string> = {
  'AAA': 'text-green-600 bg-green-50 border-green-200',
  'AA': 'text-blue-600 bg-blue-50 border-blue-200',
  'AA-large': 'text-amber-600 bg-amber-50 border-amber-200',
  'fail': 'text-red-600 bg-red-50 border-red-200',
};

const levelIcons: Record<WCAGLevel, typeof CheckCircle> = {
  'AAA': CheckCircle,
  'AA': CheckCircle,
  'AA-large': Info,
  'fail': AlertTriangle,
};

export function ContrastWarning({ pairs, className }: ContrastWarningProps) {
  const results = pairs.map(pair => {
    const ratio = getHexContrastRatio(pair.foreground, pair.background);
    const level = getWCAGLevel(ratio);
    const suggestedColor = getCompliantTextColor(pair.background);
    return { ...pair, ratio, level, suggestedColor };
  });

  const hasIssues = results.some(r => r.level === 'fail' || r.level === 'AA-large');

  if (!hasIssues) {
    return (
      <div className={cn("p-3 rounded-lg border bg-green-50 border-green-200", className)}>
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">All color combinations are ADA compliant (WCAG AA)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-amber-700 mb-3">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">ADA Contrast Issues Detected</span>
      </div>
      
      {results.map((result, i) => {
        const Icon = levelIcons[result.level];
        const isPassing = result.level === 'AAA' || result.level === 'AA';
        
        if (isPassing) return null;
        
        return (
          <div 
            key={i}
            className={cn(
              "p-3 rounded-lg border flex items-center justify-between gap-4",
              levelColors[result.level]
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{result.label}</p>
                <p className="text-xs opacity-80">
                  Contrast ratio: {result.ratio.toFixed(2)}:1 
                  {result.level === 'fail' && ' (needs 4.5:1 for AA)'}
                  {result.level === 'AA-large' && ' (OK for large text, needs 4.5:1 for normal text)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Preview swatch */}
              <div 
                className="w-8 h-8 rounded border flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: result.background, color: result.foreground }}
              >
                Aa
              </div>
              
              {result.onFix && result.level === 'fail' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap"
                  onClick={() => result.onFix?.(result.suggestedColor)}
                >
                  Fix: {result.suggestedColor}
                </Button>
              )}
            </div>
          </div>
        );
      })}
      
      <p className="text-xs text-muted-foreground mt-2">
        WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text (AA) and 7:1 for enhanced readability (AAA).
      </p>
    </div>
  );
}