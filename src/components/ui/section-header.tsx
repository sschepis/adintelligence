import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h2 className="font-display font-bold text-xl">{title}</h2>
      {subtitle && !action && (
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      )}
      {action}
    </div>
  );
}
