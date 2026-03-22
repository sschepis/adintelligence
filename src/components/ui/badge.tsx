import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary",
        secondary: "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/20 hover:bg-destructive",
        outline: "text-foreground border-border/60 bg-background/50 backdrop-blur-sm",
        soft: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        accent: "border-transparent bg-accent/80 text-accent-foreground shadow-sm shadow-accent/20 hover:bg-accent",
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info: "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
        muted: "border-border/40 bg-muted/50 text-muted-foreground backdrop-blur-sm",
        gradient: "border-transparent bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground shadow-sm shadow-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
