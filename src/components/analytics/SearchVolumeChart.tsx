import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface SearchVolumeData {
  date: string;
  volume: number;
  trend?: number;
}

interface SearchVolumeChartProps {
  data?: SearchVolumeData[];
  keyword?: string;
  totalVolume?: string;
  change?: string;
  className?: string;
}

const defaultData: SearchVolumeData[] = [
  { date: "Week 1", volume: 12400 },
  { date: "Week 2", volume: 15600 },
  { date: "Week 3", volume: 18900 },
  { date: "Week 4", volume: 22100 },
  { date: "Week 5", volume: 28500 },
  { date: "Week 6", volume: 31200 },
  { date: "Week 7", volume: 35800 },
  { date: "Week 8", volume: 42300 },
];

export function SearchVolumeChart({ 
  data = defaultData, 
  keyword = "Brand Keywords",
  totalVolume = "42.3K",
  change = "+18.2%",
  className 
}: SearchVolumeChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-display">Search Volume</CardTitle>
            <p className="text-xs text-muted-foreground">{keyword}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalVolume}</p>
            <Badge variant="outline" className="text-signal-rising border-signal-rising/30 gap-1">
              <TrendingUp className="h-3 w-3" />
              {change}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Search Volume"]}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
