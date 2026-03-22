import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChannelData {
  channel: string;
  growth: number;
  color: string;
}

interface SocialChannelGrowthProps {
  data?: ChannelData[];
  className?: string;
}

const defaultData: ChannelData[] = [
  { channel: "TikTok", growth: 127, color: "hsl(var(--primary))" },
  { channel: "Instagram", growth: 89, color: "hsl(var(--accent))" },
  { channel: "Pinterest", growth: 64, color: "hsl(25, 80%, 70%)" },
  { channel: "YouTube", growth: 45, color: "hsl(0, 70%, 60%)" },
  { channel: "Twitter/X", growth: 23, color: "hsl(200, 70%, 50%)" },
];

export function SocialChannelGrowth({ data = defaultData, className }: SocialChannelGrowthProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">Social Channel Growth</CardTitle>
        <p className="text-xs text-muted-foreground">Trend velocity by platform (30 days)</p>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis 
                type="category" 
                dataKey="channel" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}% growth`, "Growth Rate"]}
              />
              <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
