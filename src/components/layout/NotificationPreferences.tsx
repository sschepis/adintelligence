import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Bell, 
  Volume2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Rocket,
  Package,
  Sparkles,
  Settings
} from "lucide-react";
import { NotificationPreferences as NotificationPreferencesType } from "@/hooks/useNotifications";

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType;
  pushPermission: NotificationPermission;
  onUpdatePreferences: (updates: Partial<NotificationPreferencesType>) => void;
  onToggleType: (type: keyof NotificationPreferencesType["types"]) => void;
  onRequestPermission: () => Promise<boolean>;
}

const typeConfig = {
  trend: { icon: TrendingUp, label: "Trend Alerts", description: "New trends and opportunities" },
  alert: { icon: AlertTriangle, label: "Warning Alerts", description: "Issues needing attention" },
  success: { icon: CheckCircle2, label: "Success Updates", description: "Completed actions and wins" },
  campaign: { icon: Rocket, label: "Campaign Updates", description: "Budget and performance alerts" },
  inventory: { icon: Package, label: "Inventory Alerts", description: "Stock and availability updates" },
  ai: { icon: Sparkles, label: "AI Recommendations", description: "Smart suggestions and insights" },
};

export function NotificationPreferences({
  preferences,
  pushPermission,
  onUpdatePreferences,
  onToggleType,
  onRequestPermission
}: NotificationPreferencesProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Sound & Push Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Delivery Settings</h4>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="sound" className="text-sm font-medium">Sound</Label>
                  <p className="text-xs text-muted-foreground">Play sound for notifications</p>
                </div>
              </div>
              <Switch
                id="sound"
                checked={preferences.sound}
                onCheckedChange={(checked) => onUpdatePreferences({ sound: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push" className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    {pushPermission === "granted" 
                      ? "Browser notifications enabled"
                      : pushPermission === "denied"
                      ? "Browser notifications blocked"
                      : "Enable browser notifications"}
                  </p>
                </div>
              </div>
              {pushPermission === "granted" ? (
                <Switch
                  id="push"
                  checked={preferences.push}
                  onCheckedChange={(checked) => onUpdatePreferences({ push: checked })}
                />
              ) : pushPermission === "default" ? (
                <Button size="sm" variant="outline" onClick={onRequestPermission}>
                  Enable
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Blocked</span>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Notification Types</h4>
            
            <div className="space-y-2">
              {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={type}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor={type} className="text-sm font-medium cursor-pointer">
                          {config.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={type}
                      checked={preferences.types[type]}
                      onCheckedChange={() => onToggleType(type)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}