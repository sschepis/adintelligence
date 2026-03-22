import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  CheckCircle2,
  Search,
  ArrowDownUp,
  TrendingDown
} from "lucide-react";
import { useInventorySync, InventoryItem } from "@/hooks/useInventorySync";
import { cn } from "@/lib/utils";

interface InventorySyncPanelProps {
  onReserve?: (productIds: string[], quantities: Record<string, number>) => void;
}

export function InventorySyncPanel({ onReserve }: InventorySyncPanelProps) {
  const { 
    inventory, 
    lowStockItems, 
    loading, 
    syncing, 
    syncInventory,
  } = useInventorySync();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "available">("available");

  const filteredInventory = inventory
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stock") return b.stock - a.stock;
      return a.available - b.available;
    });

  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);
  const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.available <= 0) return { status: "out", color: "text-destructive", bg: "bg-destructive/10" };
    if (item.available <= item.lowStockThreshold) return { status: "low", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "ok", color: "text-signal-rising", bg: "bg-signal-rising/10" };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-xl font-bold">{totalStock.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal-rising/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-signal-rising" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-bold">{totalAvailable.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-xl font-bold">{totalReserved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={lowStockItems.length > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                lowStockItems.length > 0 ? "bg-amber-500/10" : "bg-secondary"
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  lowStockItems.length > 0 ? "text-amber-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="border-amber-500 text-amber-600 gap-1">
                  {item.name}
                  <span className="font-bold">{item.available} left</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Inventory Status</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncInventory}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync"}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "available" ? "stock" : sortBy === "stock" ? "name" : "available")}
              className="gap-1"
            >
              <ArrowDownUp className="h-4 w-4" />
              {sortBy === "available" ? "Available" : sortBy === "stock" ? "Stock" : "Name"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInventory.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredInventory.map(item => {
                const { status, color, bg } = getStockStatus(item);
                const utilizationPercent = item.stock > 0 
                  ? ((item.stock - item.available) / item.stock) * 100 
                  : 0;

                return (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.name}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {item.sku}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <Progress value={100 - utilizationPercent} className="h-1.5 w-24" />
                        <span className="text-xs text-muted-foreground">
                          {item.reserved} reserved
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <Badge className={cn("font-bold", color, bg)}>
                        {item.available} available
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        of {item.stock} total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No products match your search" : "No inventory data available"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
