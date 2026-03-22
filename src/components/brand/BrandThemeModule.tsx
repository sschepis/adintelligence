import { useState, useEffect, useMemo } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPickerField, isValidHexColor } from "@/components/shared";
import { toast } from "sonner";
import { 
  Palette, Type, Eye, Download, Save, Loader2, 
  Copy, Check, Sparkles, History, ShieldCheck
} from "lucide-react";
import { ThemePresets, ThemePreset } from "./ThemePresets";
import { ThemeAISuggestions } from "./ThemeAISuggestions";
import { ThemeVersionHistory, ThemeVersion } from "./ThemeVersionHistory";
import { ThemePreviewMode } from "./ThemePreviewMode";
import { ContrastWarning } from "./ContrastWarning";
import { AccessibilityPanel } from "./AccessibilityPanel";

// Font options - system fonts first, then Google Fonts
const FONT_OPTIONS = [
  // System fonts (no loading required)
  { name: "Helvetica Neue", category: "sans-serif", isSystem: true },
  { name: "Arial", category: "sans-serif", isSystem: true },
  { name: "Georgia", category: "serif", isSystem: true },
  { name: "Times New Roman", category: "serif", isSystem: true },
  // Google Fonts
  { name: "Inter", category: "sans-serif", isSystem: false },
  { name: "Roboto", category: "sans-serif", isSystem: false },
  { name: "Open Sans", category: "sans-serif", isSystem: false },
  { name: "Lato", category: "sans-serif", isSystem: false },
  { name: "Montserrat", category: "sans-serif", isSystem: false },
  { name: "Poppins", category: "sans-serif", isSystem: false },
  { name: "Nunito", category: "sans-serif", isSystem: false },
  { name: "Raleway", category: "sans-serif", isSystem: false },
  { name: "Syne", category: "sans-serif", isSystem: false },
  { name: "Space Grotesk", category: "sans-serif", isSystem: false },
  { name: "DM Sans", category: "sans-serif", isSystem: false },
  { name: "Plus Jakarta Sans", category: "sans-serif", isSystem: false },
  { name: "Playfair Display", category: "serif", isSystem: false },
  { name: "Merriweather", category: "serif", isSystem: false },
  { name: "Lora", category: "serif", isSystem: false },
  { name: "Source Serif Pro", category: "serif", isSystem: false },
  { name: "Crimson Text", category: "serif", isSystem: false },
  { name: "Libre Baskerville", category: "serif", isSystem: false },
];

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    ctaPrimary: string;
    ctaHover: string;
    ctaText: string;
    ctaGradientStart: string;
    ctaGradientEnd: string;
    ctaGradientEnabled: boolean;
    ctaGradientAngle: number;
    ctaGradientHoverEffect: 'none' | 'shift' | 'shimmer' | 'pulse';
    // Link colors
    linkDefault: string;
    linkHover: string;
    linkVisited: string;
    // Menu colors
    menuBackground: string;
    menuText: string;
    menuHover: string;
    menuActive: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    headingWeight: string;
    bodyWeight: string;
    lineHeight: number;
  };
  spacing: {
    baseUnit: number;
    borderRadius: number;
  };
  effects: {
    enableGradients: boolean;
    enableShadows: boolean;
    shadowIntensity: number;
  };
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    background: "#ffffff",
    text: "#0a0a0a",
    ctaPrimary: "#6366f1",
    ctaHover: "#4f46e5",
    ctaText: "#ffffff",
    ctaGradientStart: "#6366f1",
    ctaGradientEnd: "#8b5cf6",
    ctaGradientEnabled: false,
    ctaGradientAngle: 135,
    ctaGradientHoverEffect: 'none',
    // Link colors
    linkDefault: "#6366f1",
    linkHover: "#4f46e5",
    linkVisited: "#8b5cf6",
    // Menu colors
    menuBackground: "#1a1a2e",
    menuText: "#e4e4e7",
    menuHover: "#2a2a4e",
    menuActive: "#6366f1",
  },
  typography: {
    headingFont: "Syne",
    bodyFont: "Inter",
    baseFontSize: 16,
    headingWeight: "600",
    bodyWeight: "400",
    lineHeight: 1.6,
  },
  spacing: {
    baseUnit: 4,
    borderRadius: 8,
  },
  effects: {
    enableGradients: true,
    enableShadows: true,
    shadowIntensity: 50,
  },
};

export function BrandThemeModule() {
  const { activeBrand, refetchBrands } = useBrand();
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | undefined>();
  const [versionHistory, setVersionHistory] = useState<ThemeVersion[]>([]);

  // Load theme from brand metadata
  useEffect(() => {
    if (activeBrand) {
      const metadata = activeBrand.metadata as any || {};
      const savedTheme = metadata.theme as ThemeSettings | undefined;
      const savedPresets = metadata.themePresets as ThemePreset[] | undefined;
      const savedVersions = metadata.themeVersionHistory as ThemeVersion[] | undefined;
      
      const savedColors = savedTheme?.colors || {} as any;
      setTheme({
        colors: {
          primary: activeBrand.primary_color || defaultTheme.colors.primary,
          secondary: activeBrand.secondary_color || defaultTheme.colors.secondary,
          accent: activeBrand.accent_color || defaultTheme.colors.accent,
          background: activeBrand.background_color || defaultTheme.colors.background,
          text: activeBrand.text_color || defaultTheme.colors.text,
          ctaPrimary: savedColors.ctaPrimary || defaultTheme.colors.ctaPrimary,
          ctaHover: savedColors.ctaHover || defaultTheme.colors.ctaHover,
          ctaText: savedColors.ctaText || defaultTheme.colors.ctaText,
          ctaGradientStart: savedColors.ctaGradientStart || defaultTheme.colors.ctaGradientStart,
          ctaGradientEnd: savedColors.ctaGradientEnd || defaultTheme.colors.ctaGradientEnd,
          ctaGradientEnabled: savedColors.ctaGradientEnabled ?? defaultTheme.colors.ctaGradientEnabled,
          ctaGradientAngle: savedColors.ctaGradientAngle ?? defaultTheme.colors.ctaGradientAngle,
          ctaGradientHoverEffect: savedColors.ctaGradientHoverEffect || defaultTheme.colors.ctaGradientHoverEffect,
          linkDefault: savedColors.linkDefault || defaultTheme.colors.linkDefault,
          linkHover: savedColors.linkHover || defaultTheme.colors.linkHover,
          linkVisited: savedColors.linkVisited || defaultTheme.colors.linkVisited,
          menuBackground: savedColors.menuBackground || defaultTheme.colors.menuBackground,
          menuText: savedColors.menuText || defaultTheme.colors.menuText,
          menuHover: savedColors.menuHover || defaultTheme.colors.menuHover,
          menuActive: savedColors.menuActive || defaultTheme.colors.menuActive,
        },
        typography: savedTheme?.typography || defaultTheme.typography,
        spacing: savedTheme?.spacing || defaultTheme.spacing,
        effects: savedTheme?.effects || defaultTheme.effects,
      });

      setPresets(savedPresets || []);
      setActivePresetId(metadata.activePresetId);
      setVersionHistory(savedVersions || []);
    }
  }, [activeBrand]);

  // Load fonts when typography changes (skip system fonts)
  useEffect(() => {
    const systemFonts = ['Helvetica Neue', 'Arial', 'Georgia', 'Times New Roman'];
    
    const loadFont = (fontName: string) => {
      // Skip loading for system fonts
      if (systemFonts.includes(fontName)) return;
      
      const link = document.getElementById(`font-${fontName}`) as HTMLLinkElement;
      if (!link) {
        const newLink = document.createElement('link');
        newLink.id = `font-${fontName}`;
        newLink.rel = 'stylesheet';
        newLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(newLink);
      }
    };
    
    loadFont(theme.typography.headingFont);
    loadFont(theme.typography.bodyFont);
  }, [theme.typography.headingFont, theme.typography.bodyFont]);

  // Apply preview to document
  useEffect(() => {
    if (!previewActive) return;

    const root = document.documentElement;

    const vars: Array<[string, string]> = [
      ['--primary', theme.colors.primary],
      ['--secondary', theme.colors.secondary],
      ['--accent', theme.colors.accent],
      ['--background', theme.colors.background],
      ['--foreground', theme.colors.text],
      ['--sidebar-background', theme.colors.menuBackground],
      ['--sidebar-foreground', theme.colors.menuText],
      ['--sidebar-accent', theme.colors.menuHover],
      ['--sidebar-primary', theme.colors.menuActive],
      ['--cta-primary', theme.colors.ctaPrimary],
      ['--cta-hover', theme.colors.ctaHover],
      ['--cta-text', theme.colors.ctaText],
      ['--link-default', theme.colors.linkDefault],
      ['--link-hover', theme.colors.linkHover],
      ['--link-visited', theme.colors.linkVisited],
      ['--radius', `${theme.spacing.borderRadius}px`],
    ];

    const prev = new Map<string, string>();
    vars.forEach(([name]) => {
      prev.set(name, root.style.getPropertyValue(name));
    });

    vars.forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });

    root.style.setProperty('--preview-heading-font', theme.typography.headingFont);
    root.style.setProperty('--preview-body-font', theme.typography.bodyFont);
    root.style.setProperty('--preview-base-font-size', `${theme.typography.baseFontSize}px`);
    root.style.setProperty('--preview-radius', `${theme.spacing.borderRadius}px`);

    return () => {
      vars.forEach(([name]) => {
        const v = prev.get(name);
        if (v) root.style.setProperty(name, v);
        else root.style.removeProperty(name);
      });
      root.style.removeProperty('--preview-heading-font');
      root.style.removeProperty('--preview-body-font');
      root.style.removeProperty('--preview-base-font-size');
      root.style.removeProperty('--preview-radius');
    };
  }, [previewActive, theme]);

  const saveVersionHistory = (currentTheme: ThemeSettings) => {
    const newVersion: ThemeVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...currentTheme,
    };
    
    // Keep only last 20 versions
    const updatedHistory = [newVersion, ...versionHistory].slice(0, 20);
    setVersionHistory(updatedHistory);
    return updatedHistory;
  };

  const handleSave = async () => {
    if (!activeBrand) return;
    
    setSaving(true);
    try {
      const currentMetadata = (activeBrand.metadata as any) || {};
      const updatedVersionHistory = saveVersionHistory(theme);
      
      const { error } = await supabase
        .from('brands')
        .update({
          primary_color: theme.colors.primary,
          secondary_color: theme.colors.secondary,
          accent_color: theme.colors.accent,
          background_color: theme.colors.background,
          text_color: theme.colors.text,
          metadata: {
            ...currentMetadata,
            theme: {
              colors: {
                ctaPrimary: theme.colors.ctaPrimary,
                ctaHover: theme.colors.ctaHover,
                ctaText: theme.colors.ctaText,
                ctaGradientStart: theme.colors.ctaGradientStart,
                ctaGradientEnd: theme.colors.ctaGradientEnd,
                ctaGradientEnabled: theme.colors.ctaGradientEnabled,
                ctaGradientAngle: theme.colors.ctaGradientAngle,
                ctaGradientHoverEffect: theme.colors.ctaGradientHoverEffect,
                linkDefault: theme.colors.linkDefault,
                linkHover: theme.colors.linkHover,
                linkVisited: theme.colors.linkVisited,
                menuBackground: theme.colors.menuBackground,
                menuText: theme.colors.menuText,
                menuHover: theme.colors.menuHover,
                menuActive: theme.colors.menuActive,
              },
              typography: theme.typography,
              spacing: theme.spacing,
              effects: theme.effects,
            },
            themePresets: presets,
            activePresetId,
            themeVersionHistory: updatedVersionHistory,
          },
        })
        .eq('id', activeBrand.id);

      if (error) throw error;
      
      await refetchBrands();
      toast.success("Brand theme saved successfully");
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreset = (preset: Omit<ThemePreset, 'id' | 'createdAt'>) => {
    const newPreset: ThemePreset = {
      ...preset,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setPresets([...presets, newPreset]);
    setActivePresetId(newPreset.id);
  };

  const handleApplyPreset = (preset: ThemePreset) => {
    const presetColors = preset.colors as any;
    setTheme({
      colors: {
        ...preset.colors,
        ctaPrimary: presetColors.ctaPrimary || defaultTheme.colors.ctaPrimary,
        ctaHover: presetColors.ctaHover || defaultTheme.colors.ctaHover,
        ctaText: presetColors.ctaText || defaultTheme.colors.ctaText,
        ctaGradientStart: presetColors.ctaGradientStart || defaultTheme.colors.ctaGradientStart,
        ctaGradientEnd: presetColors.ctaGradientEnd || defaultTheme.colors.ctaGradientEnd,
        ctaGradientEnabled: presetColors.ctaGradientEnabled ?? defaultTheme.colors.ctaGradientEnabled,
        ctaGradientAngle: presetColors.ctaGradientAngle ?? defaultTheme.colors.ctaGradientAngle,
        ctaGradientHoverEffect: presetColors.ctaGradientHoverEffect || defaultTheme.colors.ctaGradientHoverEffect,
        linkDefault: presetColors.linkDefault || defaultTheme.colors.linkDefault,
        linkHover: presetColors.linkHover || defaultTheme.colors.linkHover,
        linkVisited: presetColors.linkVisited || defaultTheme.colors.linkVisited,
        menuBackground: presetColors.menuBackground || defaultTheme.colors.menuBackground,
        menuText: presetColors.menuText || defaultTheme.colors.menuText,
        menuHover: presetColors.menuHover || defaultTheme.colors.menuHover,
        menuActive: presetColors.menuActive || defaultTheme.colors.menuActive,
      },
      typography: preset.typography,
      spacing: preset.spacing,
      effects: preset.effects,
    });
    setActivePresetId(preset.id);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(presets.filter(p => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(undefined);
    }
    toast.success("Preset deleted");
  };

  const handleSetDefaultPreset = (presetId: string) => {
    setPresets(presets.map(p => ({
      ...p,
      isDefault: p.id === presetId,
    })));
    toast.success("Default preset updated");
  };

  const handleApplyAISuggestion = (suggestion: { name: string; colors: { primary: string; secondary: string; accent: string; background: string; text: string }; typography: { headingFont: string; bodyFont: string } }) => {
    setTheme(t => ({
      ...t,
      colors: {
        ...t.colors,
        ...suggestion.colors,
        ctaPrimary: suggestion.colors.primary,
        ctaHover: suggestion.colors.secondary,
        ctaGradientStart: suggestion.colors.primary,
        ctaGradientEnd: suggestion.colors.secondary,
      },
      typography: {
        ...t.typography,
        headingFont: suggestion.typography.headingFont,
        bodyFont: suggestion.typography.bodyFont,
      },
    }));
    setActivePresetId(undefined);
  };

  const handleRestoreVersion = (version: ThemeVersion) => {
    const versionColors = version.colors as any;
    setTheme({
      colors: {
        ...version.colors,
        ctaPrimary: versionColors.ctaPrimary || defaultTheme.colors.ctaPrimary,
        ctaHover: versionColors.ctaHover || defaultTheme.colors.ctaHover,
        ctaText: versionColors.ctaText || defaultTheme.colors.ctaText,
        ctaGradientStart: versionColors.ctaGradientStart || defaultTheme.colors.ctaGradientStart,
        ctaGradientEnd: versionColors.ctaGradientEnd || defaultTheme.colors.ctaGradientEnd,
        ctaGradientEnabled: versionColors.ctaGradientEnabled ?? defaultTheme.colors.ctaGradientEnabled,
        ctaGradientAngle: versionColors.ctaGradientAngle ?? defaultTheme.colors.ctaGradientAngle,
        ctaGradientHoverEffect: versionColors.ctaGradientHoverEffect || defaultTheme.colors.ctaGradientHoverEffect,
        linkDefault: versionColors.linkDefault || defaultTheme.colors.linkDefault,
        linkHover: versionColors.linkHover || defaultTheme.colors.linkHover,
        linkVisited: versionColors.linkVisited || defaultTheme.colors.linkVisited,
        menuBackground: versionColors.menuBackground || defaultTheme.colors.menuBackground,
        menuText: versionColors.menuText || defaultTheme.colors.menuText,
        menuHover: versionColors.menuHover || defaultTheme.colors.menuHover,
        menuActive: versionColors.menuActive || defaultTheme.colors.menuActive,
      },
      typography: version.typography,
      spacing: version.spacing,
      effects: version.effects,
    });
    setActivePresetId(undefined);
  };

  const generateStyleGuide = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeBrand?.name || 'Brand'} Style Guide</title>
  <link href="https://fonts.googleapis.com/css2?family=${theme.typography.headingFont.replace(' ', '+')}:wght@300;400;500;600;700&family=${theme.typography.bodyFont.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --primary: ${theme.colors.primary}; --secondary: ${theme.colors.secondary}; --accent: ${theme.colors.accent}; --background: ${theme.colors.background}; --text: ${theme.colors.text}; --heading-font: '${theme.typography.headingFont}', sans-serif; --body-font: '${theme.typography.bodyFont}', sans-serif; --base-font-size: ${theme.typography.baseFontSize}px; --border-radius: ${theme.spacing.borderRadius}px; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--body-font); font-size: var(--base-font-size); line-height: ${theme.typography.lineHeight}; color: var(--text); background: #f8f9fa; padding: 40px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .section { background: white; border-radius: var(--border-radius); padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1, h2, h3 { font-family: var(--heading-font); font-weight: ${theme.typography.headingWeight}; }
    h1 { font-size: 2.5em; margin-bottom: 8px; } h2 { font-size: 1.5em; margin-bottom: 16px; border-bottom: 2px solid var(--primary); padding-bottom: 8px; }
    .brand-header { text-align: center; margin-bottom: 40px; }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
    .color-swatch { border-radius: var(--border-radius); overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .color-swatch .preview { height: 80px; } .color-swatch .info { padding: 12px; background: white; }
    .color-swatch .name { font-weight: 600; font-size: 0.875em; } .color-swatch .hex { font-family: monospace; font-size: 0.75em; color: #666; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: var(--border-radius); font-weight: 500; text-decoration: none; margin-right: 8px; margin-bottom: 8px; }
    .btn-primary { background: var(--primary); color: white; } .btn-secondary { background: var(--secondary); color: white; } .btn-accent { background: var(--accent); color: white; }
    .meta { font-size: 0.875em; color: #666; text-align: center; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-header"><h1>${activeBrand?.name || 'Brand'} Style Guide</h1><p>Visual identity and design system</p></div>
    <div class="section"><h2>Color Palette</h2><div class="color-grid">
      <div class="color-swatch"><div class="preview" style="background: var(--primary)"></div><div class="info"><div class="name">Primary</div><div class="hex">${theme.colors.primary}</div></div></div>
      <div class="color-swatch"><div class="preview" style="background: var(--secondary)"></div><div class="info"><div class="name">Secondary</div><div class="hex">${theme.colors.secondary}</div></div></div>
      <div class="color-swatch"><div class="preview" style="background: var(--accent)"></div><div class="info"><div class="name">Accent</div><div class="hex">${theme.colors.accent}</div></div></div>
      <div class="color-swatch"><div class="preview" style="background: var(--background)"></div><div class="info"><div class="name">Background</div><div class="hex">${theme.colors.background}</div></div></div>
      <div class="color-swatch"><div class="preview" style="background: var(--text)"></div><div class="info"><div class="name">Text</div><div class="hex">${theme.colors.text}</div></div></div>
    </div></div>
    <div class="section"><h2>Typography</h2><p>Heading: ${theme.typography.headingFont} | Body: ${theme.typography.bodyFont} | Base: ${theme.typography.baseFontSize}px</p></div>
    <div class="section"><h2>Buttons</h2><a class="btn btn-primary">Primary</a><a class="btn btn-secondary">Secondary</a><a class="btn btn-accent">Accent</a></div>
    <p class="meta">Generated by Instincts AI • ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBrand?.name || 'brand'}-style-guide.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Style guide downloaded");
  };

  const copyCSS = () => {
    const gradientCSS = theme.colors.ctaGradientEnabled 
      ? `  --cta-gradient: linear-gradient(${theme.colors.ctaGradientAngle}deg, ${theme.colors.ctaGradientStart}, ${theme.colors.ctaGradientEnd});
  --cta-gradient-start: ${theme.colors.ctaGradientStart};
  --cta-gradient-end: ${theme.colors.ctaGradientEnd};
  --cta-gradient-angle: ${theme.colors.ctaGradientAngle}deg;
  --cta-gradient-hover-effect: ${theme.colors.ctaGradientHoverEffect};`
      : '';
    
    const css = `:root {
  --primary: ${theme.colors.primary};
  --secondary: ${theme.colors.secondary};
  --accent: ${theme.colors.accent};
  --background: ${theme.colors.background};
  --text: ${theme.colors.text};
  --cta-primary: ${theme.colors.ctaPrimary};
  --cta-hover: ${theme.colors.ctaHover};
  --cta-text: ${theme.colors.ctaText};
${gradientCSS}
  --link-default: ${theme.colors.linkDefault};
  --link-hover: ${theme.colors.linkHover};
  --link-visited: ${theme.colors.linkVisited};
  --menu-background: ${theme.colors.menuBackground};
  --menu-text: ${theme.colors.menuText};
  --menu-hover: ${theme.colors.menuHover};
  --menu-active: ${theme.colors.menuActive};
  --heading-font: '${theme.typography.headingFont}', sans-serif;
  --body-font: '${theme.typography.bodyFont}', sans-serif;
  --base-font-size: ${theme.typography.baseFontSize}px;
  --border-radius: ${theme.spacing.borderRadius}px;
}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("CSS copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Brand Theme</h2>
          <p className="text-muted-foreground">Customize your brand's visual identity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-md">
            <Switch checked={previewActive} onCheckedChange={setPreviewActive} id="preview-toggle" className="data-[state=checked]:bg-background data-[state=unchecked]:bg-background/50" />
            <Label htmlFor="preview-toggle" className="text-sm flex items-center gap-1 text-background">
              <Eye className="h-4 w-4" /> Live Preview
            </Label>
          </div>
          <Button variant="secondary" onClick={copyCSS} className="bg-foreground text-background hover:bg-foreground/90">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy CSS"}
          </Button>
          <Button variant="secondary" onClick={generateStyleGuide} className="bg-foreground text-background hover:bg-foreground/90">
            <Download className="h-4 w-4 mr-2" /> Export Guide
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Theme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <div 
          className="theme-menu-tabs"
          style={{ 
            '--menu-bg': theme.colors.menuBackground,
            '--menu-text': theme.colors.menuText,
            '--menu-hover': theme.colors.menuHover,
            '--menu-active': theme.colors.menuActive,
            '--menu-radius': `${theme.spacing.borderRadius}px`,
          } as React.CSSProperties}
        >
          <TabsList 
            className="flex w-full flex-wrap mb-6 p-1.5 gap-1"
            style={{ 
              backgroundColor: theme.colors.menuBackground,
              borderRadius: `${theme.spacing.borderRadius}px`,
            }}
          >
            {[
              { value: "colors", icon: Palette, label: "Colors" },
              { value: "typography", icon: Type, label: "Typography" },
              { value: "spacing", icon: Sparkles, label: "Effects" },
              { value: "accessibility", icon: ShieldCheck, label: "Accessibility" },
              { value: "presets", icon: Sparkles, label: "Presets" },
              { value: "ai", icon: Sparkles, label: "AI Suggest" },
              { value: "history", icon: History, label: "History" },
              { value: "preview", icon: Eye, label: "Preview" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger 
                key={value}
                value={value} 
                className="flex items-center gap-2 transition-all data-[state=active]:shadow-sm whitespace-nowrap"
                style={{ 
                  color: theme.colors.menuText,
                  borderRadius: `${Math.max(theme.spacing.borderRadius - 4, 4)}px`,
                  backgroundColor: 'transparent',
                }}
                data-menu-hover={theme.colors.menuHover}
                data-menu-active={theme.colors.menuActive}
              >
                <Icon className="h-4 w-4" />{label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="colors">
          <Card>
            <CardHeader><CardTitle>Color Palette</CardTitle><CardDescription>Define your brand's color scheme</CardDescription></CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Brand Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ColorPickerField id="primary" label="Primary Color" value={theme.colors.primary} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, primary: v } }))} description="Main brand color" />
                  <ColorPickerField id="secondary" label="Secondary Color" value={theme.colors.secondary} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, secondary: v } }))} description="Supporting color" />
                  <ColorPickerField id="accent" label="Accent Color" value={theme.colors.accent} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, accent: v } }))} description="Highlight color" />
                  <div className="space-y-2">
                    <ColorPickerField id="background" label="Background Color" value={theme.colors.background} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, background: v } }))} description="Main background" />
                    {theme.colors.background.toLowerCase() !== '#ffffff' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setTheme(t => ({ ...t, colors: { ...t.colors, background: '#ffffff' } }));
                          toast.info("Background set to white. Click Save Theme to apply.");
                        }}
                      >
                        Set to White
                      </Button>
                    )}
                  </div>
                  <ColorPickerField id="text" label="Text Color" value={theme.colors.text} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, text: v } }))} description="Primary text" />
                </div>
              </div>
              
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">CTA & Menu Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ColorPickerField id="ctaPrimary" label="CTA Button Color" value={theme.colors.ctaPrimary} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaPrimary: v } }))} description="Primary button background" />
                  <ColorPickerField id="ctaHover" label="CTA Hover Color" value={theme.colors.ctaHover} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaHover: v } }))} description="Button hover state" />
                  <ColorPickerField id="ctaText" label="CTA Text Color" value={theme.colors.ctaText} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaText: v } }))} description="Button text color" />
                </div>
              </div>
                
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">CTA Gradient</h3>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="gradient-toggle"
                      checked={theme.colors.ctaGradientEnabled} 
                      onCheckedChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaGradientEnabled: v } }))} 
                    />
                    <Label htmlFor="gradient-toggle" className="text-sm">Enable Gradient</Label>
                  </div>
                </div>
                
                {theme.colors.ctaGradientEnabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ColorPickerField id="ctaGradientStart" label="Gradient Start" value={theme.colors.ctaGradientStart} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaGradientStart: v } }))} description="Left/top color" />
                      <ColorPickerField id="ctaGradientEnd" label="Gradient End" value={theme.colors.ctaGradientEnd} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaGradientEnd: v } }))} description="Right/bottom color" />
                      <div className="space-y-2">
                        <Label>Angle: {theme.colors.ctaGradientAngle}°</Label>
                        <Slider 
                          value={[theme.colors.ctaGradientAngle]} 
                          onValueChange={([v]) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaGradientAngle: v } }))} 
                          min={0} 
                          max={360} 
                          step={15} 
                        />
                        <p className="text-xs text-muted-foreground">Gradient direction</p>
                      </div>
                    </div>
                    
                    {/* Gradient Preview */}
                    <div 
                      className="h-12 rounded-lg border border-border"
                      style={{ 
                        background: `linear-gradient(${theme.colors.ctaGradientAngle}deg, ${theme.colors.ctaGradientStart}, ${theme.colors.ctaGradientEnd})` 
                      }}
                    />
                    
                    {/* Hover Effect Selector */}
                    <div className="space-y-2">
                      <Label>Hover Animation Effect</Label>
                      <Select 
                        value={theme.colors.ctaGradientHoverEffect} 
                        onValueChange={(v: 'none' | 'shift' | 'shimmer' | 'pulse') => setTheme(t => ({ ...t, colors: { ...t.colors, ctaGradientHoverEffect: v } }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="shift">Color Shift</SelectItem>
                          <SelectItem value="shimmer">Shimmer</SelectItem>
                          <SelectItem value="pulse">Pulse Glow</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Animation on hover</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Link Colors */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Link Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorPickerField id="linkDefault" label="Default Link" value={theme.colors.linkDefault} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, linkDefault: v } }))} description="Normal link color" />
                  <ColorPickerField id="linkHover" label="Hover Link" value={theme.colors.linkHover} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, linkHover: v } }))} description="Link hover state" />
                  <ColorPickerField id="linkVisited" label="Visited Link" value={theme.colors.linkVisited} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, linkVisited: v } }))} description="Previously visited" />
                </div>
                {/* Link Preview */}
                <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-x-4">
                  <a href="#" style={{ color: theme.colors.linkDefault }} className="underline transition-colors hover:no-underline" 
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.linkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.linkDefault}
                  >Default Link</a>
                  <span style={{ color: theme.colors.linkVisited }} className="underline">Visited Link</span>
                </div>
              </div>

              {/* Menu Colors */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Navigation Menu Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ColorPickerField id="menuBackground" label="Menu Background" value={theme.colors.menuBackground} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, menuBackground: v } }))} description="Nav background" />
                  <ColorPickerField id="menuText" label="Menu Text" value={theme.colors.menuText} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, menuText: v } }))} description="Nav text color" />
                  <ColorPickerField id="menuHover" label="Menu Hover" value={theme.colors.menuHover} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, menuHover: v } }))} description="Hover background" />
                  <ColorPickerField id="menuActive" label="Menu Active" value={theme.colors.menuActive} onChange={(v) => setTheme(t => ({ ...t, colors: { ...t.colors, menuActive: v } }))} description="Active item color" />
                </div>
                {/* Menu Preview */}
                <div className="mt-4 rounded-lg border border-border overflow-hidden">
                  <div className="flex" style={{ backgroundColor: theme.colors.menuBackground }}>
                    <span 
                      className="px-4 py-2 text-sm cursor-pointer transition-colors"
                      style={{ color: theme.colors.menuActive, borderBottom: `2px solid ${theme.colors.menuActive}` }}
                    >Dashboard</span>
                    <span 
                      className="px-4 py-2 text-sm cursor-pointer transition-colors"
                      style={{ color: theme.colors.menuText }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.menuHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >Analytics</span>
                    <span 
                      className="px-4 py-2 text-sm cursor-pointer transition-colors"
                      style={{ color: theme.colors.menuText }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.menuHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >Settings</span>
                  </div>
                </div>
              </div>
                
              {/* CTA Preview */}
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-3">Button Preview {theme.colors.ctaGradientEnabled && theme.colors.ctaGradientHoverEffect !== 'none' && <span className="text-xs">(hover to see {theme.colors.ctaGradientHoverEffect} effect)</span>}</p>
                <style>{`
                  @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                  }
                  @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 5px ${theme.colors.ctaGradientStart}40; }
                    50% { box-shadow: 0 0 20px ${theme.colors.ctaGradientStart}80, 0 0 30px ${theme.colors.ctaGradientEnd}60; }
                  }
                  .cta-shimmer:hover {
                    background-size: 200% auto !important;
                    animation: shimmer 1.5s linear infinite;
                  }
                  .cta-shift:hover {
                    background: linear-gradient(${(theme.colors.ctaGradientAngle + 45) % 360}deg, ${theme.colors.ctaGradientEnd}, ${theme.colors.ctaGradientStart}) !important;
                  }
                  .cta-pulse:hover {
                    animation: pulse-glow 1s ease-in-out infinite;
                  }
                `}</style>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className={`px-4 py-2 rounded-md font-medium transition-all ${
                        theme.colors.ctaGradientEnabled && theme.colors.ctaGradientHoverEffect === 'shimmer' ? 'cta-shimmer' :
                        theme.colors.ctaGradientEnabled && theme.colors.ctaGradientHoverEffect === 'shift' ? 'cta-shift' :
                        theme.colors.ctaGradientEnabled && theme.colors.ctaGradientHoverEffect === 'pulse' ? 'cta-pulse' : ''
                      }`}
                      style={{ 
                        background: theme.colors.ctaGradientEnabled 
                          ? `linear-gradient(${theme.colors.ctaGradientAngle}deg, ${theme.colors.ctaGradientStart}, ${theme.colors.ctaGradientEnd})`
                          : theme.colors.ctaPrimary, 
                        color: theme.colors.ctaText,
                        backgroundSize: theme.colors.ctaGradientHoverEffect === 'shimmer' ? '200% auto' : 'auto',
                      }}
                      onMouseEnter={(e) => {
                        if (!theme.colors.ctaGradientEnabled) {
                          e.currentTarget.style.background = theme.colors.ctaHover;
                        } else if (theme.colors.ctaGradientHoverEffect === 'none') {
                          e.currentTarget.style.filter = 'brightness(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!theme.colors.ctaGradientEnabled) {
                          e.currentTarget.style.background = theme.colors.ctaPrimary;
                        } else if (theme.colors.ctaGradientHoverEffect === 'none') {
                          e.currentTarget.style.filter = 'none';
                        }
                      }}
                    >
                      {theme.colors.ctaGradientEnabled ? 'Gradient CTA' : 'Primary CTA'}
                    </button>
                    <button 
                      className="px-4 py-2 rounded-md font-medium border-2 transition-colors"
                      style={{ 
                        borderColor: theme.colors.ctaGradientEnabled ? theme.colors.ctaGradientStart : theme.colors.ctaPrimary, 
                        color: theme.colors.ctaGradientEnabled ? theme.colors.ctaGradientStart : theme.colors.ctaPrimary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        const bgColor = theme.colors.ctaGradientEnabled ? theme.colors.ctaGradientStart : theme.colors.ctaPrimary;
                        e.currentTarget.style.backgroundColor = bgColor;
                        e.currentTarget.style.color = theme.colors.ctaText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.colors.ctaGradientEnabled ? theme.colors.ctaGradientStart : theme.colors.ctaPrimary;
                      }}
                    >
                      Secondary CTA
                    </button>
                    {theme.colors.ctaGradientEnabled && (
                      <button 
                        className="px-4 py-2 rounded-md font-medium transition-all"
                        style={{ 
                          background: `linear-gradient(${(theme.colors.ctaGradientAngle + 180) % 360}deg, ${theme.colors.ctaGradientStart}, ${theme.colors.ctaGradientEnd})`,
                          color: theme.colors.ctaText 
                        }}
                      >
                        Reversed Gradient
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ADA Compliance Check */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">ADA Accessibility Check</h3>
                <ContrastWarning 
                  pairs={[
                    {
                      label: "Text on Background",
                      foreground: theme.colors.text,
                      background: theme.colors.background,
                      onFix: (color) => setTheme(t => ({ ...t, colors: { ...t.colors, text: color } }))
                    },
                    {
                      label: "CTA Text on Button",
                      foreground: theme.colors.ctaText,
                      background: theme.colors.ctaPrimary,
                      onFix: (color) => setTheme(t => ({ ...t, colors: { ...t.colors, ctaText: color } }))
                    },
                    {
                      label: "Menu Text on Menu Background",
                      foreground: theme.colors.menuText,
                      background: theme.colors.menuBackground,
                      onFix: (color) => setTheme(t => ({ ...t, colors: { ...t.colors, menuText: color } }))
                    },
                    {
                      label: "Link on Background",
                      foreground: theme.colors.linkDefault,
                      background: theme.colors.background,
                      onFix: (color) => setTheme(t => ({ ...t, colors: { ...t.colors, linkDefault: color } }))
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography">
          <Card>
            <CardHeader><CardTitle>Typography</CardTitle><CardDescription>Configure fonts and text styles</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select value={theme.typography.headingFont} onValueChange={(v) => setTheme(t => ({ ...t, typography: { ...t.typography, headingFont: v } }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_OPTIONS.map(font => (<SelectItem key={font.name} value={font.name}><span style={{ fontFamily: font.name }}>{font.name}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select value={theme.typography.bodyFont} onValueChange={(v) => setTheme(t => ({ ...t, typography: { ...t.typography, bodyFont: v } }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_OPTIONS.map(font => (<SelectItem key={font.name} value={font.name}><span style={{ fontFamily: font.name }}>{font.name}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Base Font Size: {theme.typography.baseFontSize}px</Label>
                  <Slider value={[theme.typography.baseFontSize]} onValueChange={([v]) => setTheme(t => ({ ...t, typography: { ...t.typography, baseFontSize: v } }))} min={12} max={20} step={1} />
                </div>
                <div className="space-y-3">
                  <Label>Line Height: {theme.typography.lineHeight}</Label>
                  <Slider value={[theme.typography.lineHeight * 10]} onValueChange={([v]) => setTheme(t => ({ ...t, typography: { ...t.typography, lineHeight: v / 10 } }))} min={12} max={24} step={1} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing">
          <Card>
            <CardHeader><CardTitle>Spacing & Effects</CardTitle><CardDescription>Configure spacing units and visual effects</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Base Spacing Unit: {theme.spacing.baseUnit}px</Label>
                  <Slider value={[theme.spacing.baseUnit]} onValueChange={([v]) => setTheme(t => ({ ...t, spacing: { ...t.spacing, baseUnit: v } }))} min={2} max={8} step={1} />
                </div>
                <div className="space-y-3">
                  <Label>Border Radius: {theme.spacing.borderRadius}px</Label>
                  <Slider value={[theme.spacing.borderRadius]} onValueChange={([v]) => setTheme(t => ({ ...t, spacing: { ...t.spacing, borderRadius: v } }))} min={0} max={24} step={2} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-medium">Visual Effects</h3>
                <div className="flex items-center justify-between">
                  <div><Label>Enable Gradients</Label><p className="text-xs text-muted-foreground">Use gradient backgrounds</p></div>
                  <Switch checked={theme.effects.enableGradients} onCheckedChange={(v) => setTheme(t => ({ ...t, effects: { ...t.effects, enableGradients: v } }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>Enable Shadows</Label><p className="text-xs text-muted-foreground">Add depth with shadows</p></div>
                  <Switch checked={theme.effects.enableShadows} onCheckedChange={(v) => setTheme(t => ({ ...t, effects: { ...t.effects, enableShadows: v } }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilityPanel 
            colors={theme.colors}
            onFixColor={(colorKey, newValue) => {
              setTheme(t => ({
                ...t,
                colors: { ...t.colors, [colorKey]: newValue }
              }));
            }}
          />
        </TabsContent>

        <TabsContent value="presets">
          <ThemePresets
            presets={presets}
            activePresetId={activePresetId}
            onApplyPreset={handleApplyPreset}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            onSetDefault={handleSetDefaultPreset}
            currentTheme={theme}
          />
        </TabsContent>

        <TabsContent value="ai">
          <ThemeAISuggestions
            brandName={activeBrand?.name || 'Brand'}
            websiteUrl={activeBrand?.website_url}
            currentColors={{
              primary: theme.colors.primary,
              secondary: theme.colors.secondary,
              accent: theme.colors.accent,
              background: theme.colors.background,
              text: theme.colors.text,
            }}
            onApplySuggestion={handleApplyAISuggestion}
          />
        </TabsContent>

        <TabsContent value="history">
          <ThemeVersionHistory
            versions={versionHistory}
            currentTheme={theme}
            onRestore={handleRestoreVersion}
          />
        </TabsContent>

        <TabsContent value="preview">
          <ThemePreviewMode theme={theme} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
