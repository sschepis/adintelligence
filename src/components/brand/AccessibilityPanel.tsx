import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  getHexContrastRatio, 
  getWCAGLevel, 
  WCAGLevel,
  suggestCompliantColor 
} from "@/lib/colorContrast";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface ColorPair {
  name: string;
  description: string;
  foreground: string;
  background: string;
  category: 'text' | 'cta' | 'menu' | 'link' | 'accent';
}

interface AccessibilityPanelProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    ctaPrimary: string;
    ctaHover: string;
    ctaText: string;
    linkDefault: string;
    linkHover: string;
    linkVisited: string;
    menuBackground: string;
    menuText: string;
    menuHover: string;
    menuActive: string;
  };
  onFixColor?: (colorKey: string, newValue: string) => void;
}

const getStatusIcon = (level: WCAGLevel) => {
  switch (level) {
    case 'AAA':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'AA':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'AA-large':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
};

const getStatusBadge = (level: WCAGLevel) => {
  const variants: Record<WCAGLevel, { className: string; label: string }> = {
    'AAA': { className: 'bg-green-100 text-green-700 border-green-200', label: 'AAA' },
    'AA': { className: 'bg-green-50 text-green-600 border-green-200', label: 'AA' },
    'AA-large': { className: 'bg-amber-50 text-amber-600 border-amber-200', label: 'AA Large Only' },
    'fail': { className: 'bg-red-50 text-red-600 border-red-200', label: 'Fail' }
  };
  const config = variants[level];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const AccessibilityPanel = ({ colors, onFixColor }: AccessibilityPanelProps) => {
  const colorPairs = useMemo<ColorPair[]>(() => [
    // Text on backgrounds
    { 
      name: 'Primary Text', 
      description: 'Main body text on page background',
      foreground: colors.text, 
      background: colors.background,
      category: 'text'
    },
    { 
      name: 'Primary on Background', 
      description: 'Primary brand color elements on page background',
      foreground: colors.primary, 
      background: colors.background,
      category: 'accent'
    },
    { 
      name: 'Secondary on Background', 
      description: 'Secondary color elements on page background',
      foreground: colors.secondary, 
      background: colors.background,
      category: 'accent'
    },
    { 
      name: 'Accent on Background', 
      description: 'Accent color elements on page background',
      foreground: colors.accent, 
      background: colors.background,
      category: 'accent'
    },
    // CTA colors
    { 
      name: 'CTA Button Text', 
      description: 'Text on primary CTA buttons',
      foreground: colors.ctaText, 
      background: colors.ctaPrimary,
      category: 'cta'
    },
    { 
      name: 'CTA Hover Text', 
      description: 'Text on CTA buttons during hover state',
      foreground: colors.ctaText, 
      background: colors.ctaHover,
      category: 'cta'
    },
    // Link colors
    { 
      name: 'Default Links', 
      description: 'Standard link color on page background',
      foreground: colors.linkDefault, 
      background: colors.background,
      category: 'link'
    },
    { 
      name: 'Hover Links', 
      description: 'Link color on hover state',
      foreground: colors.linkHover, 
      background: colors.background,
      category: 'link'
    },
    { 
      name: 'Visited Links', 
      description: 'Previously visited link color',
      foreground: colors.linkVisited, 
      background: colors.background,
      category: 'link'
    },
    // Menu colors
    { 
      name: 'Menu Text', 
      description: 'Navigation menu text on menu background',
      foreground: colors.menuText, 
      background: colors.menuBackground,
      category: 'menu'
    },
    { 
      name: 'Menu Active State', 
      description: 'Active menu item indicator on menu background',
      foreground: colors.menuActive, 
      background: colors.menuBackground,
      category: 'menu'
    },
    { 
      name: 'Menu Hover State', 
      description: 'Menu item hover indicator on menu background',
      foreground: colors.menuHover, 
      background: colors.menuBackground,
      category: 'menu'
    },
  ], [colors]);

  const analysisResults = useMemo(() => {
    return colorPairs.map(pair => {
      const ratio = getHexContrastRatio(pair.foreground, pair.background);
      const level = getWCAGLevel(ratio);
      const suggestedFix = level === 'fail' || level === 'AA-large' 
        ? suggestCompliantColor(pair.foreground, pair.background)
        : null;
      return { ...pair, ratio, level, suggestedFix };
    });
  }, [colorPairs]);

  const summary = useMemo(() => {
    const passing = analysisResults.filter(r => r.level === 'AA' || r.level === 'AAA').length;
    const warnings = analysisResults.filter(r => r.level === 'AA-large').length;
    const failing = analysisResults.filter(r => r.level === 'fail').length;
    return { passing, warnings, failing, total: analysisResults.length };
  }, [analysisResults]);

  const categoryLabels: Record<string, { label: string; color: string }> = {
    text: { label: 'Text', color: 'bg-blue-100 text-blue-700' },
    cta: { label: 'CTA', color: 'bg-purple-100 text-purple-700' },
    menu: { label: 'Menu', color: 'bg-green-100 text-green-700' },
    link: { label: 'Link', color: 'bg-amber-100 text-amber-700' },
    accent: { label: 'Accent', color: 'bg-pink-100 text-pink-700' },
  };

  const handleAutoFix = (result: typeof analysisResults[0]) => {
    if (result.suggestedFix && onFixColor) {
      // Determine which color key to update based on the pair name
      const colorKeyMap: Record<string, string> = {
        'Primary Text': 'text',
        'CTA Button Text': 'ctaText',
        'CTA Hover Text': 'ctaText',
        'Default Links': 'linkDefault',
        'Hover Links': 'linkHover',
        'Visited Links': 'linkVisited',
        'Menu Text': 'menuText',
      };
      const colorKey = colorKeyMap[result.name];
      if (colorKey) {
        onFixColor(colorKey, result.suggestedFix);
        toast.success(`Fixed ${result.name} contrast`);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Accessibility Audit</CardTitle>
          </div>
        </div>
        <CardDescription>
          WCAG 2.1 color contrast compliance for all color pairs in your theme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-green-50 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.passing}</div>
            <div className="text-sm text-green-600">Passing</div>
          </div>
          <div className="rounded-lg border bg-amber-50 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{summary.warnings}</div>
            <div className="text-sm text-amber-600">Large Text Only</div>
          </div>
          <div className="rounded-lg border bg-red-50 p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.failing}</div>
            <div className="text-sm text-red-600">Failing</div>
          </div>
        </div>

        {/* Color Pairs List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {analysisResults.map((result, index) => (
              <div 
                key={index}
                className={`rounded-lg border p-4 transition-colors ${
                  result.level === 'fail' ? 'border-red-200 bg-red-50/50' : 
                  result.level === 'AA-large' ? 'border-amber-200 bg-amber-50/50' : 
                  'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.level)}
                      <span className="font-medium">{result.name}</span>
                      <Badge variant="outline" className={categoryLabels[result.category].color}>
                        {categoryLabels[result.category].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                    
                    {/* Color Preview */}
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium"
                        style={{ 
                          backgroundColor: result.background,
                          color: result.foreground,
                          minWidth: '120px'
                        }}
                      >
                        Sample Text
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div 
                          className="h-4 w-4 rounded border" 
                          style={{ backgroundColor: result.foreground }}
                          title={`Foreground: ${result.foreground}`}
                        />
                        <span>on</span>
                        <div 
                          className="h-4 w-4 rounded border" 
                          style={{ backgroundColor: result.background }}
                          title={`Background: ${result.background}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(result.level)}
                    <span className="text-sm font-mono text-muted-foreground">
                      {result.ratio.toFixed(2)}:1
                    </span>
                    {result.suggestedFix && onFixColor && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleAutoFix(result)}
                      >
                        <Sparkles className="h-3 w-3" />
                        Fix
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* WCAG Legend */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="font-medium mb-2">WCAG 2.1 Contrast Requirements</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span><strong>AAA</strong> (7:1) - Enhanced contrast</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span><strong>AA</strong> (4.5:1) - Normal text minimum</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span><strong>AA Large</strong> (3:1) - Large text only</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span><strong>Fail</strong> (&lt;3:1) - Not accessible</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
