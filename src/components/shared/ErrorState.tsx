import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: "default" | "inline" | "card";
  icon?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onBack,
  onHome,
  retryLabel = "Try again",
  className,
  variant = "default",
  icon,
}: ErrorStateProps) {
  const content = (
    <>
      <div className={cn(
        "rounded-full bg-destructive/10 p-3",
        variant === "inline" && "p-2"
      )}>
        {icon || <AlertCircle className={cn(
          "text-destructive",
          variant === "inline" ? "h-5 w-5" : "h-8 w-8"
        )} />}
      </div>
      
      <div className={cn(
        "space-y-2 text-center",
        variant === "inline" && "space-y-1"
      )}>
        <h3 className={cn(
          "font-semibold text-foreground",
          variant === "inline" ? "text-sm" : "text-lg"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-muted-foreground max-w-md",
          variant === "inline" ? "text-xs" : "text-sm"
        )}>
          {message}
        </p>
      </div>

      {(onRetry || onBack || onHome) && (
        <div className={cn(
          "flex items-center gap-2",
          variant === "inline" && "mt-2"
        )}>
          {onBack && (
            <Button variant="outline" size={variant === "inline" ? "sm" : "default"} onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>
          )}
          {onRetry && (
            <Button size={variant === "inline" ? "sm" : "default"} onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          {onHome && (
            <Button variant="outline" size={variant === "inline" ? "sm" : "default"} onClick={onHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          )}
        </div>
      )}
    </>
  );

  if (variant === "inline") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-6 px-4 gap-3",
        className
      )}>
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 gap-4 rounded-xl border border-destructive/20 bg-destructive/5",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] gap-4",
      className
    )}>
      {content}
    </div>
  );
}
