import { AlertCircle, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiStatus {
  name: string;
  available: boolean;
  icon?: string;
}

interface ApiStatusIndicatorProps {
  apis: ApiStatus[];
  className?: string;
}

export function ApiStatusIndicator({ apis, className }: ApiStatusIndicatorProps) {
  const allAvailable = apis.every((api) => api.available);
  const someUnavailable = apis.some((api) => !api.available);

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-default",
                allAvailable
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : someUnavailable
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}
            >
              {allAvailable ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>
                {allAvailable
                  ? "All APIs Online"
                  : `${apis.filter((a) => !a.available).length}/${apis.length} Unavailable`}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-0">
            <div className="p-3 space-y-2 min-w-[180px]">
              <p className="text-xs font-medium text-foreground mb-2">API Status</p>
              {apis.map((api) => (
                <div
                  key={api.name}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {api.icon && <span>{api.icon}</span>}
                    {api.name}
                  </span>
                  {api.available ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
