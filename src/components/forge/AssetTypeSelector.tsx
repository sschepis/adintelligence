import { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AssetType {
  id: string;
  name: string;
  icon: LucideIcon;
  color?: string;
}

interface AssetTypeSelectorProps {
  assetTypes: AssetType[];
  selectedType: string | null;
  onSelect: (typeId: string) => void;
  columns?: 2 | 3;
}

export function AssetTypeSelector({ 
  assetTypes, 
  selectedType, 
  onSelect,
  columns = 3
}: AssetTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Asset Type</Label>
      <div className={cn("grid gap-3", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {assetTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-2",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium text-sm">{type.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
