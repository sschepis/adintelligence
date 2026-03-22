import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

interface InventoryHealthData {
  matched: number;
  partial: number;
  unmatched: number;
  totalSkus: number;
  trendAlignedSkus: number;
}

interface InventoryHealthProps {
  className?: string;
  data?: InventoryHealthData;
  loading?: boolean;
}

export function InventoryHealth({ className, data, loading }: InventoryHealthProps) {
  if (loading) {
    return (
      <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.totalSkus === 0) {
    return (
      <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
        <h3 className="font-display font-bold text-lg mb-4">Inventory Health</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No inventory data</p>
          <p className="text-xs text-muted-foreground/70">Add products to see health metrics</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Matched", value: data.matched, color: "hsl(160, 84%, 45%)" },
    { name: "Partial", value: data.partial, color: "hsl(35, 100%, 55%)" },
    { name: "Unmatched", value: data.unmatched, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
      <h3 className="font-display font-bold text-lg mb-4">Inventory Health</h3>
      
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-semibold text-sm">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total SKUs Analyzed</span>
          <span className="font-semibold">{data.totalSkus.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Trend-Aligned SKUs</span>
          <span className="font-semibold text-signal-rising">{data.trendAlignedSkus.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
