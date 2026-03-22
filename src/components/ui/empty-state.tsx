import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "dashed";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "dashed",
}: EmptyStateProps) {
  return (
    <Card className={cn(variant === "dashed" && "border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        )}
        <p className="text-muted-foreground mb-2">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground/70 mb-4">{description}</p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}
