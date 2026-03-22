import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Plus, X, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface RegionData {
  code: string;
  name: string;
  engagementRate: number;
  impressions: number;
  conversions: number;
  population?: number;
  selected?: boolean;
}

interface GeoLocationTargetingProps {
  regions?: RegionData[];
  selectedRegions?: string[];
  onRegionToggle?: (regionCode: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  className?: string;
}

const defaultRegions: RegionData[] = [
  { code: "CA", name: "California", engagementRate: 8.2, impressions: 125000, conversions: 4200, population: 39500000 },
  { code: "TX", name: "Texas", engagementRate: 7.8, impressions: 98000, conversions: 3100, population: 29000000 },
  { code: "FL", name: "Florida", engagementRate: 7.5, impressions: 89000, conversions: 2800, population: 22000000 },
  { code: "NY", name: "New York", engagementRate: 6.9, impressions: 112000, conversions: 3400, population: 19500000 },
  { code: "IL", name: "Illinois", engagementRate: 6.4, impressions: 54000, conversions: 1600, population: 12600000 },
  { code: "PA", name: "Pennsylvania", engagementRate: 5.8, impressions: 42000, conversions: 1200, population: 13000000 },
  { code: "OH", name: "Ohio", engagementRate: 5.5, impressions: 38000, conversions: 980, population: 11700000 },
  { code: "GA", name: "Georgia", engagementRate: 6.1, impressions: 51000, conversions: 1450, population: 10700000 },
];

const regionColors: Record<string, string> = {
  CA: "hsl(var(--primary))",
  TX: "hsl(350, 85%, 55%)",
  FL: "hsl(25, 80%, 60%)",
  NY: "hsl(280, 60%, 55%)",
  IL: "hsl(200, 70%, 50%)",
  PA: "hsl(160, 60%, 45%)",
  OH: "hsl(45, 80%, 55%)",
  GA: "hsl(320, 70%, 55%)",
};

export function GeoLocationTargeting({
  regions = defaultRegions,
  selectedRegions: initialSelected = ["CA", "TX", "FL"],
  onRegionToggle,
  onRegionsChange,
  className,
}: GeoLocationTargetingProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialSelected);

  const handleToggle = (code: string) => {
    const newSelected = selectedRegions.includes(code)
      ? selectedRegions.filter((r) => r !== code)
      : [...selectedRegions, code];
    setSelectedRegions(newSelected);
    onRegionToggle?.(code);
    onRegionsChange?.(newSelected);
  };

  const selectedRegionData = regions.filter((r) => selectedRegions.includes(r.code));
  const availableRegions = regions.filter((r) => !selectedRegions.includes(r.code));

  const chartData = selectedRegionData
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .map((r) => ({
      name: r.code,
      engagement: r.engagementRate,
      impressions: r.impressions,
      color: regionColors[r.code] || "hsl(var(--primary))",
    }));

  const totalImpressions = selectedRegionData.reduce((sum, r) => sum + r.impressions, 0);
  const totalConversions = selectedRegionData.reduce((sum, r) => sum + r.conversions, 0);
  const avgEngagement = selectedRegionData.length
    ? selectedRegionData.reduce((sum, r) => sum + r.engagementRate, 0) / selectedRegionData.length
    : 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Geo-Location Targeting</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedRegions.length} regions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Region Badges */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Target Regions</p>
          <div className="flex flex-wrap gap-2">
            {selectedRegionData.map((region) => (
              <Badge
                key={region.code}
                variant="outline"
                className={cn(
                  "px-3 py-1.5 gap-2 cursor-pointer hover:bg-secondary/80 transition-colors",
                  "border-2"
                )}
                style={{ borderColor: regionColors[region.code] }}
                onClick={() => handleToggle(region.code)}
              >
                <span className="font-bold">{region.code}</span>
                <span className="text-muted-foreground text-xs">{region.engagementRate}%</span>
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Badge>
            ))}
            {availableRegions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 gap-1 border-dashed"
                onClick={() => handleToggle(availableRegions[0].code)}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Impressions</p>
            <p className="font-bold text-lg">{(totalImpressions / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Conversions</p>
            <p className="font-bold text-lg">{(totalConversions / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
            <p className="font-bold text-lg text-signal-rising">{avgEngagement.toFixed(1)}%</p>
          </div>
        </div>

        {/* Engagement by Region Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Engagement Rate by Region</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={30}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Engagement"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="engagement" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Region Performance */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Region Performance</p>
          {selectedRegionData.slice(0, 4).map((region) => (
            <div
              key={region.code}
              className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: regionColors[region.code] }}
                >
                  {region.code}
                </div>
                <div>
                  <p className="text-sm font-medium">{region.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(region.impressions / 1000).toFixed(0)}K impressions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-signal-rising text-sm font-bold">
                  <TrendingUp className="h-3 w-3" />
                  {region.engagementRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {region.conversions.toLocaleString()} conv
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default GeoLocationTargeting;
