import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonMetric } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Building2, DollarSign, Target, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  logo_url?: string | null;
  primary_color?: string | null;
}

interface Campaign {
  id: string;
  brand_id: string | null;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: string;
}

interface CrossBrandReportProps {
  brands: Brand[];
  campaigns: Campaign[];
  isLoading?: boolean;
}

interface BrandMetrics {
  brandId: string;
  brandName: string;
  brandColor: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  activeCampaigns: number;
  roas: number;
  ctr: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--signal-rising))",
  "hsl(280, 70%, 50%)",
  "hsl(190, 80%, 45%)",
  "hsl(30, 90%, 55%)",
];

export function CrossBrandReport({ brands, campaigns, isLoading }: CrossBrandReportProps) {
  // Calculate metrics per brand
  const brandMetrics = useMemo<BrandMetrics[]>(() => {
    if (!brands || brands.length === 0) return [];

    return brands.map((brand, index) => {
      const brandCampaigns = campaigns.filter(c => c.brand_id === brand.id);
      
      const totalSpend = brandCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
      const totalImpressions = brandCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const totalClicks = brandCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalConversions = brandCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const activeCampaigns = brandCampaigns.filter(c => c.status === "active").length;
      
      const avgOrderValue = 50;
      const revenue = totalConversions * avgOrderValue;
      const roas = totalSpend > 0 ? revenue / totalSpend : 0;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      return {
        brandId: brand.id,
        brandName: brand.name,
        brandColor: brand.primary_color || CHART_COLORS[index % CHART_COLORS.length],
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        activeCampaigns,
        roas,
        ctr,
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [brands, campaigns]);

  // Chart data for spend comparison
  const spendChartData = useMemo(() => {
    return brandMetrics.map(m => ({
      name: m.brandName.length > 12 ? m.brandName.slice(0, 12) + "..." : m.brandName,
      spend: m.totalSpend,
      color: m.brandColor,
    }));
  }, [brandMetrics]);

  // Chart data for ROAS comparison
  const roasChartData = useMemo(() => {
    return brandMetrics.map(m => ({
      name: m.brandName.length > 12 ? m.brandName.slice(0, 12) + "..." : m.brandName,
      roas: Math.round(m.roas * 10) / 10,
      color: m.brandColor,
    }));
  }, [brandMetrics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonMetric key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length <= 1) {
    return null; // Don't show cross-brand report for single brand
  }

  const totalOrgSpend = brandMetrics.reduce((sum, m) => sum + m.totalSpend, 0);
  const totalOrgImpressions = brandMetrics.reduce((sum, m) => sum + m.totalImpressions, 0);
  const topPerformer = brandMetrics.reduce((best, m) => m.roas > best.roas ? m : best, brandMetrics[0]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg">Cross-Brand Performance</h2>
        <Badge variant="outline" className="ml-2">
          {brands.length} brands
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-primary" />
              <Badge variant="soft" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-display font-bold mt-2">
              ${totalOrgSpend.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Organization Spend</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Eye className="h-5 w-5 text-accent" />
              <Badge variant="soft" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-display font-bold mt-2">
              {totalOrgImpressions >= 1000000 
                ? `${(totalOrgImpressions / 1000000).toFixed(1)}M`
                : totalOrgImpressions >= 1000 
                  ? `${(totalOrgImpressions / 1000).toFixed(1)}K`
                  : totalOrgImpressions}
            </p>
            <p className="text-xs text-muted-foreground">Total Impressions</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-signal-rising" />
              <Badge variant="accent" className="text-xs">Top</Badge>
            </div>
            <p className="text-2xl font-display font-bold mt-2">
              {topPerformer?.brandName || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Best ROAS: {topPerformer?.roas.toFixed(1)}x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Brand */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Spend by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Spend"]}
                  />
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                    {spendChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ROAS by Brand */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">ROAS by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roasChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}x`, "ROAS"]}
                  />
                  <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
                    {roasChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Performance Table */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Brand Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaigns</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Spend</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Impressions</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">CTR</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {brandMetrics.map((metric) => (
                  <tr key={metric.brandId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: metric.brandColor }} 
                        />
                        <span className="font-medium text-sm">{metric.brandName}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm">{metric.activeCampaigns}</td>
                    <td className="text-right py-3 px-4 text-sm font-medium">${metric.totalSpend.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-sm">{metric.totalImpressions.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-sm">{metric.ctr.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">
                      <Badge 
                        variant={metric.roas >= 2 ? "success" : metric.roas >= 1 ? "soft" : "outline"}
                        className="font-mono"
                      >
                        {metric.roas.toFixed(1)}x
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}