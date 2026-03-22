import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  className?: string;
}

const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export function ColorPickerField({
  id,
  label,
  value,
  onChange,
  description,
  error,
  className,
}: ColorPickerFieldProps) {
  const handleInputChange = (inputValue: string) => {
    // Auto-add # if missing
    let normalizedValue = inputValue.trim();
    if (normalizedValue && !normalizedValue.startsWith("#")) {
      normalizedValue = `#${normalizedValue}`;
    }
    onChange(normalizedValue);
  };

  const displayColor = isValidHexColor(value) ? value : "#000000";

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-lg border cursor-pointer overflow-hidden transition-colors",
            error ? "border-destructive" : "border-border"
          )}
          style={{ backgroundColor: displayColor }}
        >
          <input
            type="color"
            id={`${id}-picker`}
            value={displayColor}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full cursor-pointer opacity-0"
          />
        </div>
        <Input
          id={id}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className={cn(
            "flex-1 font-mono",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { isValidHexColor };
