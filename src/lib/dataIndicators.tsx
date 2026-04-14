import { cn } from "@/lib/utils";

interface DataSourceIndicatorProps {
  label?: string;
  className?: string;
}

export function EstimatedIndicator({
  label = "estimated",
  className,
}: DataSourceIndicatorProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-normal text-muted-foreground/70 ml-1",
        className
      )}
    >
      ({label})
    </span>
  );
}

export const DEFAULT_AVG_ORDER_VALUE = 50;
export const AVG_ORDER_VALUE_LABEL = `estimated at $${DEFAULT_AVG_ORDER_VALUE} AOV`;
