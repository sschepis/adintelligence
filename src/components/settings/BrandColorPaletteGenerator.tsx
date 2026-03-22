import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BrandColorPaletteGeneratorProps {
  primaryColor: string;
  onApplyColor: (colorType: string, color: string) => void;
}

type PaletteType = "complementary" | "analogous" | "triadic" | "split" | "monochromatic";

// Convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(
  primaryHex: string,
  type: PaletteType
): Array<{ name: string; hex: string; suggestion: string }> {
  const { h, s, l } = hexToHsl(primaryHex);

  switch (type) {
    case "complementary":
      return [
        { name: "Primary", hex: primaryHex, suggestion: "primary_color" },
        { name: "Complement", hex: hslToHex(h + 180, s, l), suggestion: "accent_color" },
        { name: "Light Primary", hex: hslToHex(h, s * 0.7, l + 20), suggestion: "secondary_color" },
        { name: "Dark Complement", hex: hslToHex(h + 180, s, l - 20), suggestion: "background_color" },
        { name: "Neutral", hex: hslToHex(h, s * 0.1, 95), suggestion: "text_color" },
      ];
    case "analogous":
      return [
        { name: "Primary", hex: primaryHex, suggestion: "primary_color" },
        { name: "Warm Shift", hex: hslToHex(h + 30, s, l), suggestion: "secondary_color" },
        { name: "Cool Shift", hex: hslToHex(h - 30, s, l), suggestion: "accent_color" },
        { name: "Extended Warm", hex: hslToHex(h + 60, s * 0.8, l), suggestion: "background_color" },
        { name: "Extended Cool", hex: hslToHex(h - 60, s * 0.8, l), suggestion: "text_color" },
      ];
    case "triadic":
      return [
        { name: "Primary", hex: primaryHex, suggestion: "primary_color" },
        { name: "Triadic 1", hex: hslToHex(h + 120, s, l), suggestion: "secondary_color" },
        { name: "Triadic 2", hex: hslToHex(h + 240, s, l), suggestion: "accent_color" },
        { name: "Muted Primary", hex: hslToHex(h, s * 0.5, l + 10), suggestion: "background_color" },
        { name: "Dark Base", hex: hslToHex(h, s * 0.3, 15), suggestion: "text_color" },
      ];
    case "split":
      return [
        { name: "Primary", hex: primaryHex, suggestion: "primary_color" },
        { name: "Split 1", hex: hslToHex(h + 150, s, l), suggestion: "secondary_color" },
        { name: "Split 2", hex: hslToHex(h + 210, s, l), suggestion: "accent_color" },
        { name: "Light Accent", hex: hslToHex(h + 150, s * 0.6, l + 25), suggestion: "background_color" },
        { name: "Deep Tone", hex: hslToHex(h, s * 0.8, l - 30), suggestion: "text_color" },
      ];
    case "monochromatic":
      return [
        { name: "Primary", hex: primaryHex, suggestion: "primary_color" },
        { name: "Lighter", hex: hslToHex(h, s * 0.8, l + 20), suggestion: "secondary_color" },
        { name: "Lightest", hex: hslToHex(h, s * 0.5, l + 35), suggestion: "accent_color" },
        { name: "Darker", hex: hslToHex(h, s * 1.1, l - 20), suggestion: "background_color" },
        { name: "Darkest", hex: hslToHex(h, s * 0.9, l - 40), suggestion: "text_color" },
      ];
    default:
      return [];
  }
}

const paletteTypes: Array<{ type: PaletteType; label: string; description: string }> = [
  { type: "complementary", label: "Complementary", description: "Opposite colors for high contrast" },
  { type: "analogous", label: "Analogous", description: "Adjacent colors for harmony" },
  { type: "triadic", label: "Triadic", description: "Three evenly spaced colors" },
  { type: "split", label: "Split Complementary", description: "Balanced with variation" },
  { type: "monochromatic", label: "Monochromatic", description: "Shades of one color" },
];

export function BrandColorPaletteGenerator({
  primaryColor,
  onApplyColor,
}: BrandColorPaletteGeneratorProps) {
  const [selectedType, setSelectedType] = useState<PaletteType>("complementary");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const palette = useMemo(
    () => generatePalette(primaryColor, selectedType),
    [primaryColor, selectedType]
  );

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success(`Copied ${hex}`);
  };

  const applyAllColors = () => {
    palette.forEach((color) => {
      onApplyColor(color.suggestion, color.hex);
    });
    toast.success("All palette colors applied");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h4 className="font-medium">Color Palette Generator</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {paletteTypes.map((pt) => (
          <Button
            key={pt.type}
            variant={selectedType === pt.type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(pt.type)}
            className="text-xs"
          >
            {pt.label}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {paletteTypes.find((pt) => pt.type === selectedType)?.description}
      </p>

      <Card className="p-4">
        <div className="grid grid-cols-5 gap-3">
          {palette.map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105 relative group"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex)}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                  {copiedColor === color.hex ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Copy className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium truncate">{color.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => {
                  onApplyColor(color.suggestion, color.hex);
                  toast.success(`Applied to ${color.suggestion.replace("_", " ")}`);
                }}
              >
                Apply
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Based on: {primaryColor}
            </Badge>
          </div>
          <Button size="sm" onClick={applyAllColors} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Apply All Colors
          </Button>
        </div>
      </Card>
    </div>
  );
}
