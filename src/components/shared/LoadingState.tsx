import { ReactNode } from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Loading text to display */
  text?: string;
  /** Optional icon to show alongside spinner */
  icon?: LucideIcon;
  /** Variant: spinner, skeleton, or cards */
  variant?: "spinner" | "skeleton" | "cards";
  /** Number of skeleton cards to show */
  cardCount?: number;
  /** Custom className */
  className?: string;
  /** Whether to show in a card container */
  contained?: boolean;
  /** Size of the loading indicator */
  size?: "sm" | "md" | "lg";
  /** Whether to animate cards with staggered fade-in */
  animated?: boolean;
  /** Grid columns configuration */
  columns?: 1 | 2 | 3 | 4;
}

export function LoadingState({
  text = "Loading...",
  icon: Icon,
  variant = "spinner",
  cardCount = 4,
  className,
  contained = false,
  size = "md",
  animated = true,
  columns = 2,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const spinnerContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      animated && "animate-fade-in",
      className
    )}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {Icon && (
          <Icon className={cn("absolute inset-0 m-auto text-primary/50", 
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-4 w-4" : "h-6 w-6"
          )} />
        )}
      </div>
      {text && (
        <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  const skeletonContent = (
    <div className={cn("space-y-3", animated && "animate-fade-in", className)}>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  const cardsContent = (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <Card 
          key={i} 
          className={cn(
            "overflow-hidden",
            animated && "animate-fade-in"
          )}
          style={animated ? { animationDelay: `${i * 75}ms` } : undefined}
        >
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const content = variant === "spinner" ? spinnerContent : variant === "skeleton" ? skeletonContent : cardsContent;

  if (contained && variant === "spinner") {
    return (
      <Card className={cn("border-dashed", animated && "animate-fade-in", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}

// Convenient presets for common loading patterns
export function LoadingSpinner({ text, className }: { text?: string; className?: string }) {
  return <LoadingState variant="spinner" text={text} className={cn("py-12", className)} />;
}

export function LoadingCards({ 
  count = 4, 
  columns = 2,
  className 
}: { 
  count?: number; 
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  return <LoadingState variant="cards" cardCount={count} columns={columns} className={className} />;
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <LoadingState variant="skeleton" className={className} />;
}
