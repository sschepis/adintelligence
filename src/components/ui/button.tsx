import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm shadow-primary/15 hover:shadow-lg hover:shadow-primary/25",
        destructive: "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 hover:shadow-lg hover:shadow-destructive/25",
        outline: "border border-border/60 bg-background/50 hover:bg-secondary/50 hover:border-primary/30 text-foreground hover:shadow-md hover:shadow-primary/10",
        secondary: "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90 border border-border/30 hover:shadow-md hover:shadow-secondary/20",
        ghost: "hover:bg-secondary/60 hover:text-foreground text-muted-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100 active:scale-100",
        gradient: "bg-gradient-to-r from-primary via-accent to-primary/80 text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
        accent: "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 shadow-sm shadow-accent/15 hover:shadow-lg hover:shadow-accent/25",
        glass: "bg-card/40 backdrop-blur-xl border border-border/40 text-foreground hover:bg-card/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
        soft: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:shadow-md hover:shadow-primary/15",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
