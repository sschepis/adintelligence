import { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SettingsToggleProps {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        disabled={disabled}
      />
    </div>
  );
}
