import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Award,
  Target,
} from "lucide-react";
import { InventoryItem, InventoryMovement } from "@/hooks/useInventorySync";
import { Campaign } from "@/hooks/useCampaigns";
import { calculateCampaignROI, CampaignROI } from "@/lib/inventoryForecasting";

interface CampaignInventoryROIProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  campaigns: Campaign[];
}

const EFFICIENCY_COLORS = {
  excellent: "hsl(var(--signal-rising))",
  good: "hsl(var(--primary))",
  average: "hsl(var(--accent))",
  poor: "hsl(var(--destructive))",
};

export function CampaignInventoryROI({ inventory, movements, campaigns }: CampaignInventoryROIProps) {
  const roiData = useMemo(
    () => calculateCampaignROI(campaigns, movements, inventory),
    [campaigns, movements, inventory]
  );

  const totals = useMemo(() => {
    return {
      totalSpent: roiData.reduce((sum, r) => sum + r.totalSpent, 0),
      totalUnitsReserved: roiData.reduce((sum, r) => sum + r.unitsReserved, 0),
      totalUnitsSold: roiData.reduce((sum, r) => sum + r.unitsSold, 0),
      avgROI: roiData.length > 0 
        ? Math.round(roiData.reduce((sum, r) => sum + r.roi, 0) / roiData.length)
        : 0,
      avgTurnover: roiData.length > 0
        ? Math.round((roiData.reduce((sum, r) => sum + r.inventoryTurnover, 0) / roiData.length) * 100) / 100
        : 0,
    };
  }, [roiData]);

  const efficiencyDistribution = useMemo(() => {
    const counts = { excellent: 0, good: 0, average: 0, poor: 0 };
    roiData.forEach(r => counts[r.efficiency]++);
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [roiData]);

  const getEfficiencyBadge = (efficiency: CampaignROI["efficiency"]) => {
    switch (efficiency) {
      case "excellent":
        return <Badge className="bg-signal-rising/10 text-signal-rising border-signal-rising/30">Excellent</Badge>;
      case "good":
        return <Badge className="bg-primary/10 text-primary border-primary/30">Good</Badge>;
      case "average":
        return <Badge className="bg-accent/10 text-accent-foreground border-accent/30">Average</Badge>;
      default:
        return <Badge variant="destructive">Poor</Badge>;
    }
  };

  const topPerformers = roiData.filter(r => r.efficiency === "excellent" || r.efficiency === "good").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">${totals.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Units Reserved</p>
                <p className="text-xl font-bold">{totals.totalUnitsReserved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-rising/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-signal-rising" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Units Sold</p>
                <p className="text-xl font-bold">{totals.totalUnitsSold.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className={`text-xl font-bold ${totals.avgROI >= 0 ? "text-signal-rising" : "text-destructive"}`}>
                  {totals.avgROI}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Turnover</p>
                <p className="text-xl font-bold">{totals.avgTurnover}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className="border-signal-rising/30 bg-signal-rising/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-signal-rising" />
              Top Performing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {topPerformers.map((campaign, idx) => (
                <div key={campaign.campaignId} className="p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-primary">#{idx + 1}</span>
                    <span className="font-medium truncate">{campaign.campaignName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-bold text-signal-rising">{campaign.roi}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Turnover</p>
                      <p className="font-bold">{campaign.inventoryTurnover}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* ROI by Campaign Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign ROI Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {roiData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiData.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" unit="%" />
                    <YAxis
                      dataKey="campaignName"
                      type="category"
                      width={100}
                      className="text-xs"
                      tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + "..." : value}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "ROI"]}
                    />
                    <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                      {roiData.slice(0, 8).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EFFICIENCY_COLORS[entry.efficiency]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No campaign data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Efficiency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Efficiency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {efficiencyDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={efficiencyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {efficiencyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EFFICIENCY_COLORS[entry.name as keyof typeof EFFICIENCY_COLORS]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No efficiency data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed ROI Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign-to-Inventory ROI Details</CardTitle>
        </CardHeader>
        <CardContent>
          {roiData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">Campaign</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-right py-3 px-2">Spent</th>
                    <th className="text-right py-3 px-2">Reserved</th>
                    <th className="text-right py-3 px-2">Sold</th>
                    <th className="text-right py-3 px-2">Turnover</th>
                    <th className="text-right py-3 px-2">Cost/Unit</th>
                    <th className="text-right py-3 px-2">ROI</th>
                    <th className="text-center py-3 px-2">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {roiData.map((row) => (
                    <tr key={row.campaignId} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-2 font-medium">{row.campaignName}</td>
                      <td className="py-3 px-2">
                        <Badge variant={row.status === "active" ? "default" : "secondary"}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">${row.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right">{row.unitsReserved}</td>
                      <td className="py-3 px-2 text-right">{row.unitsSold}</td>
                      <td className="py-3 px-2 text-right">{row.inventoryTurnover}x</td>
                      <td className="py-3 px-2 text-right">${row.costPerUnit}</td>
                      <td className={`py-3 px-2 text-right font-bold ${row.roi >= 0 ? "text-signal-rising" : "text-destructive"}`}>
                        {row.roi}%
                      </td>
                      <td className="py-3 px-2 text-center">
                        {getEfficiencyBadge(row.efficiency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No campaign ROI data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
