import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  label: string;
  children: ReactNode;
  description?: string;
  required?: boolean;
  className?: string;
  /** For horizontal layouts with multiple fields */
  horizontal?: boolean;
}

export function FormSection({
  label,
  children,
  description,
  required = false,
  className,
  horizontal = false,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div className={cn(horizontal && "grid grid-cols-2 gap-4")}>
        {children}
      </div>
    </div>
  );
}

interface FormRowProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function FormRow({ children, className, columns = 2 }: FormRowProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
