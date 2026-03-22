import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart,
  Pause,
  Play
} from "lucide-react";
import { InventoryMovement, InventoryItem } from "@/hooks/useInventorySync";
import { Campaign } from "@/hooks/useCampaigns";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface InventoryAnalyticsProps {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  campaigns: Campaign[];
}

export function InventoryAnalytics({ inventory, movements, campaigns }: InventoryAnalyticsProps) {
  // Generate stock movement trend data for last 7 days
  const stockTrendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayMovements = movements.filter(m => {
        const movementDate = startOfDay(new Date(m.timestamp));
        return movementDate.getTime() === dayStart.getTime();
      });

      const reserved = dayMovements
        .filter(m => m.type === "reserve")
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const released = dayMovements
        .filter(m => m.type === "release")
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const sales = dayMovements
        .filter(m => m.type === "sale")
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        date: format(day, "MMM dd"),
        reserved,
        released,
        sales,
        net: released - reserved - sales,
      };
    });
  }, [movements]);

  // Campaign performance vs inventory correlation
  const campaignInventoryData = useMemo(() => {
    return campaigns.slice(0, 5).map(campaign => {
      const campaignMovements = movements.filter(m => m.campaignId === campaign.id);
      const totalReserved = campaignMovements
        .filter(m => m.type === "reserve")
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        name: campaign.name.length > 15 ? campaign.name.slice(0, 15) + "..." : campaign.name,
        conversions: campaign.conversions,
        reserved: totalReserved,
        status: campaign.status,
      };
    });
  }, [campaigns, movements]);

  // Product movement summary
  const productMovementSummary = useMemo(() => {
    const summary: Record<string, { name: string; reserved: number; released: number; sales: number }> = {};
    
    movements.forEach(m => {
      if (!summary[m.productId]) {
        summary[m.productId] = { name: m.productName, reserved: 0, released: 0, sales: 0 };
      }
      if (m.type === "reserve") summary[m.productId].reserved += m.quantity;
      if (m.type === "release") summary[m.productId].released += m.quantity;
      if (m.type === "sale") summary[m.productId].sales += m.quantity;
    });

    return Object.values(summary)
      .sort((a, b) => (b.reserved + b.sales) - (a.reserved + a.sales))
      .slice(0, 5);
  }, [movements]);

  // Calculate key metrics
  const totalReserved = movements
    .filter(m => m.type === "reserve")
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalReleased = movements
    .filter(m => m.type === "release")
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const pausedCampaigns = campaigns.filter(c => c.status === "paused").length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reserved</p>
                <p className="text-xl font-bold">{totalReserved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-rising/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-signal-rising" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="text-xl font-bold">{totalReleased.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-rising/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-signal-rising" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={pausedCampaigns > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pausedCampaigns > 0 ? "bg-amber-500/10" : "bg-secondary"
              }`}>
                <Pause className={`h-5 w-5 ${
                  pausedCampaigns > 0 ? "text-amber-500" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paused (Stockout)</p>
                <p className="text-xl font-bold">{pausedCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Movement Trend (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reserved" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary)/0.3)" 
                  name="Reserved"
                />
                <Area 
                  type="monotone" 
                  dataKey="released" 
                  stackId="2"
                  stroke="hsl(var(--signal-rising))" 
                  fill="hsl(var(--signal-rising)/0.3)" 
                  name="Released"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Campaign vs Inventory Correlation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Performance vs Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignInventoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignInventoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="conversions" fill="hsl(var(--primary))" name="Conversions" />
                    <Bar dataKey="reserved" fill="hsl(var(--accent))" name="Reserved Units" />
                    <Legend />
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

        {/* Top Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productMovementSummary.length > 0 ? (
              <div className="space-y-4">
                {productMovementSummary.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Reserved: {product.reserved}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Released: {product.released}
                        </span>
                      </div>
                    </div>
                    <Badge variant={product.reserved > product.released ? "default" : "secondary"}>
                      {product.reserved > product.released ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {product.reserved - product.released} net
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No movement data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Inventory Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movements.slice(0, 10).map((movement) => (
                <div 
                  key={movement.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      movement.type === "reserve" ? "bg-primary/10" :
                      movement.type === "release" ? "bg-signal-rising/10" :
                      "bg-accent/10"
                    }`}>
                      {movement.type === "reserve" ? (
                        <TrendingDown className="h-4 w-4 text-primary" />
                      ) : movement.type === "release" ? (
                        <TrendingUp className="h-4 w-4 text-signal-rising" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{movement.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.campaignName || "Manual adjustment"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={movement.type === "reserve" ? "default" : "secondary"}>
                      {movement.type === "reserve" ? "-" : "+"}{movement.quantity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(movement.timestamp), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No inventory movements recorded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}