import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[100px] w-full rounded-xl border bg-card/60 backdrop-blur-sm px-4 py-3 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: "border-border/40 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm",
        ghost: "border-transparent bg-muted/40 focus-visible:bg-card/80 focus-visible:border-border/40",
        outline: "border-border/60 bg-background/50 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
        filled: "border-transparent bg-muted/60 focus-visible:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
