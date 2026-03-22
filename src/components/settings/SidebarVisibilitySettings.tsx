import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  useSidebarVisibility, 
  sidebarItemLabels, 
  SidebarVisibility 
} from "@/hooks/useSidebarVisibility";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Radio, 
  ShoppingCart, 
  Package, 
  FlaskConical,
  Image,
  PenTool,
  Brain,
  Wrench,
  Shield,
  Rocket,
  BarChart3,
  Dna,
  Paintbrush,
  Book,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

const itemIcons: Record<keyof SidebarVisibility, React.ElementType> = {
  commandCenter: LayoutDashboard,
  signalIntelligence: Radio,
  commerceLoop: ShoppingCart,
  brandCatalog: Package,
  simulationStudio: FlaskConical,
  visualForge: Image,
  writingForge: PenTool,
  aiDashboard: Brain,
  aiInsights: Brain,
  optimization: Wrench,
  competitiveIntel: Shield,
  activeDeployment: Rocket,
  analytics: BarChart3,
  brandDna: Dna,
  brandTheme: Paintbrush,
  documentation: Book,
  categories: Tag,
  products: Package,
};

const groupedItems: { label: string; items: (keyof SidebarVisibility)[] }[] = [
  {
    label: "Main Navigation",
    items: ["commandCenter", "signalIntelligence", "commerceLoop", "brandCatalog", "simulationStudio"],
  },
  {
    label: "Tools",
    items: ["visualForge", "writingForge"],
  },
  {
    label: "AI Hub",
    items: ["aiDashboard", "aiInsights", "optimization", "competitiveIntel"],
  },
  {
    label: "Bottom Navigation",
    items: ["activeDeployment", "analytics", "brandDna", "brandTheme", "documentation"],
  },
  {
    label: "Sidebar Sections",
    items: ["categories", "products"],
  },
];

export function SidebarVisibilitySettings() {
  const { visibility, toggleItem } = useSidebarVisibility();
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Only admins can configure sidebar visibility settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Sidebar Visibility</h3>
        <p className="text-sm text-muted-foreground">
          Configure which navigation items are visible in the sidebar for this brand.
        </p>
      </div>

      {groupedItems.map((group) => (
        <Card key={group.label} className="p-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">{group.label}</h4>
          <div className="space-y-3">
            {group.items.map((key) => {
              const Icon = itemIcons[key];
              const isEnabled = visibility[key];
              
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
                    isEnabled ? "bg-muted/30" : "bg-muted/10 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={key} className="cursor-pointer font-normal">
                      {sidebarItemLabels[key]}
                    </Label>
                  </div>
                  <Switch
                    id={key}
                    checked={isEnabled}
                    onCheckedChange={() => toggleItem(key)}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
