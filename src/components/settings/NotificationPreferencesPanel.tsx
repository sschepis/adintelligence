import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX,
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Rocket, 
  Package, 
  Brain,
  Smartphone,
  BellRing
} from "lucide-react";
import { toast } from "sonner";

const notificationTypes = [
  {
    key: "trend" as const,
    label: "Trend Alerts",
    description: "New trends detected, saved trends, and trend velocity changes",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    key: "alert" as const,
    label: "System Alerts",
    description: "Important warnings about campaigns, budgets, and performance issues",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    key: "success" as const,
    label: "Success Notifications",
    description: "Campaign launches, completed analyses, and achievements",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    key: "campaign" as const,
    label: "Campaign Updates",
    description: "Campaign status changes, budget alerts, and performance updates",
    icon: Rocket,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    key: "inventory" as const,
    label: "Inventory Alerts",
    description: "Stock level warnings, demand planning alerts, and reorder suggestions",
    icon: Package,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  {
    key: "ai" as const,
    label: "AI Intelligence",
    description: "AI predictions complete, optimization suggestions, competitive insights",
    icon: Brain,
    color: "text-primary",
    bgColor: "bg-primary/10"
  }
];

export function NotificationPreferencesPanel() {
  const { 
    preferences, 
    pushPermission, 
    updatePreferences, 
    toggleTypePreference,
    requestPermission 
  } = useNotifications();
  
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleRequestPushPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Push notification permission denied");
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const enabledCount = Object.values(preferences.types).filter(Boolean).length;
  const totalCount = Object.keys(preferences.types).length;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Notification Preferences</CardTitle>
              <CardDescription>
                Customize which AI and system notifications you receive
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/{totalCount} active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Delivery Settings
          </h4>
          
          <div className="grid gap-3">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                {preferences.sound ? (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Sound</p>
                  <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
                </div>
              </div>
              <Switch 
                checked={preferences.sound}
                onCheckedChange={(checked) => updatePreferences({ sound: checked })}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {pushPermission === "granted" 
                      ? "Browser notifications enabled" 
                      : pushPermission === "denied"
                        ? "Permission denied - enable in browser settings"
                        : "Receive browser notifications for urgent alerts"
                    }
                  </p>
                </div>
              </div>
              {pushPermission === "granted" ? (
                <Switch 
                  checked={preferences.push}
                  onCheckedChange={(checked) => updatePreferences({ push: checked })}
                />
              ) : pushPermission === "denied" ? (
                <Badge variant="destructive" className="text-xs">Blocked</Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRequestPushPermission}
                  disabled={isRequestingPermission}
                >
                  {isRequestingPermission ? "Requesting..." : "Enable"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Types */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Notification Types
            </h4>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  Object.keys(preferences.types).forEach(key => {
                    if (!preferences.types[key as keyof typeof preferences.types]) {
                      toggleTypePreference(key as keyof typeof preferences.types);
                    }
                  });
                  toast.success("All notifications enabled");
                }}
              >
                Enable All
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  Object.keys(preferences.types).forEach(key => {
                    if (preferences.types[key as keyof typeof preferences.types]) {
                      toggleTypePreference(key as keyof typeof preferences.types);
                    }
                  });
                  toast.success("All notifications disabled");
                }}
              >
                Disable All
              </Button>
            </div>
          </div>
          
          <div className="grid gap-3">
            {notificationTypes.map((type) => {
              const isEnabled = preferences.types[type.key];
              const Icon = type.icon;
              
              return (
                <div 
                  key={type.key}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isEnabled ? "bg-secondary/30" : "bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.bgColor}`}>
                      <Icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={isEnabled}
                    onCheckedChange={() => toggleTypePreference(type.key)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <BellRing className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About AI Notifications</p>
            <p>
              AI Intelligence notifications include alerts when trend predictions complete, 
              demand planning identifies critical actions, or competitive intelligence 
              detects significant market changes. High-priority alerts will always 
              trigger push notifications if enabled.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
