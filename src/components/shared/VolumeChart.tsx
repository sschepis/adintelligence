import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface DataPoint {
  time: string;
  volume: number;
  engagement: number;
}

interface VolumeChartProps {
  title: string;
  subtitle?: string;
  className?: string;
  data?: DataPoint[];
  loading?: boolean;
}

export function VolumeChart({ title, subtitle, className, data, loading }: VolumeChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className={cn("bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm", className)}>
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="h-64">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No volume data available</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Data will appear once trends are fetched</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                className="fill-muted-foreground text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="fill-muted-foreground text-xs"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, ""]}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#volumeGradient)"
                name="Volume"
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#engagementGradient)"
                name="Engagement"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && !loading && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-foreground">Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-foreground">Engagement</span>
          </div>
        </div>
      )}
    </div>
  );
}
