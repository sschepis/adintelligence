import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";

interface PlatformData {
  name: string;
  signals: number;
  colorVar: string;
}

// Platform-specific colors using semantic tokens
const platformColors: Record<string, string> = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  purple: "hsl(280, 50%, 60%)",
  green: "hsl(160, 60%, 45%)",
  blue: "hsl(210, 70%, 55%)",
};

const platformColorMapping: Record<string, string> = {
  "Google Trends": "primary",
  "TikTok": "accent",
  "Instagram": "purple",
  "Pinterest": "green",
  "Search Data": "blue",
};

interface SignalDistributionProps {
  className?: string;
  data?: PlatformData[];
  loading?: boolean;
}

export function SignalDistribution({ className, data, loading }: SignalDistributionProps) {
  const hasData = data && data.length > 0;

  return (
    <div className={cn("bg-card/80 backdrop-blur-sm rounded-2xl p-5 animate-slide-up border border-border/40 shadow-sm", className)}>
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">Platform Distribution</h3>
        <p className="text-sm text-muted-foreground">Active signals by platform</p>
      </div>

      <div className="h-48">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <PieChart className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Loading distribution...</p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <PieChart className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No platform data</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Refresh to load signals</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                horizontal={false} 
              />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="signals" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={platformColors[entry.colorVar] || platformColors.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export { platformColorMapping };
