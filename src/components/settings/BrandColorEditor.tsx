import { ColorPickerField } from "@/components/shared/ColorPickerField";

interface BrandColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
}

interface BrandColorEditorProps {
  colors: BrandColors;
  onChange: (colors: BrandColors) => void;
}

export function BrandColorEditor({ colors, onChange }: BrandColorEditorProps) {
  const handleColorChange = (key: keyof BrandColors, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  return (
    <div 
      className="grid grid-cols-2 gap-4"
      role="group"
      aria-label="Brand color settings"
    >
      <ColorPickerField
        id="primary_color"
        label="Primary Color"
        value={colors.primary_color || "#6366f1"}
        onChange={(v) => handleColorChange("primary_color", v)}
        aria-describedby="primary-color-desc"
      />
      <ColorPickerField
        id="secondary_color"
        label="Secondary Color"
        value={colors.secondary_color || "#8b5cf6"}
        onChange={(v) => handleColorChange("secondary_color", v)}
        aria-describedby="secondary-color-desc"
      />
      <ColorPickerField
        id="accent_color"
        label="Accent Color"
        value={colors.accent_color || "#ec4899"}
        onChange={(v) => handleColorChange("accent_color", v)}
        aria-describedby="accent-color-desc"
      />
      <ColorPickerField
        id="background_color"
        label="Background Color"
        value={colors.background_color || "#ffffff"}
        onChange={(v) => handleColorChange("background_color", v)}
        aria-describedby="background-color-desc"
      />
      <ColorPickerField
        id="text_color"
        label="Text Color"
        value={colors.text_color || "#1a1a1a"}
        onChange={(v) => handleColorChange("text_color", v)}
        aria-describedby="text-color-desc"
      />
    </div>
  );
}
