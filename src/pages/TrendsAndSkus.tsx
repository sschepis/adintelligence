import { useState, useEffect, useMemo } from "react";
import { PageContainer, TabNavigation, SearchFilterBar, LoadingCards, EmptyState } from "@/components/shared";
import { NotificationCenter } from "@/components/shared";
import { UserMenu } from "@/components/layout/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useOrganization } from "@/hooks/useOrganization";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Package, 
  BarChart3, 
  ArrowRight, 
  BookmarkCheck, 
  Zap,
  Eye,
  Target,
  Layers
} from "lucide-react";

const TrendsAndSkus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { savedTrends, loading: loadingSavedTrends } = useSavedTrends();
  const { organization, loading: loadingOrg } = useOrganization();
  const { trackPageView } = useUsageTracking();

  useEffect(() => {
    trackPageView("trends_and_skus");
  }, []);

  const inventoryItems = useMemo(() => {
    if (!organization?.products || organization.products.length === 0) {
      return [];
    }
    return organization.products.map((product, index) => ({
      id: `org-${index}`,
      name: product.name,
      sku: product.sku || `SKU-${String(index + 1).padStart(3, '0')}`,
      stock: product.stockQuantity ?? (product.inStock ? 10 : 0),
      price: product.price ?? 0,
      category: product.category,
      image: product.image,
    }));
  }, [organization?.products]);

  const filteredTrends = savedTrends.filter(trend =>
    trend.trend_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      title: "Active Trends",
      value: savedTrends.length,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total SKUs",
      value: inventoryItems.length,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Trend Matches",
      value: Math.round(inventoryItems.length * 0.65),
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Categories",
      value: new Set(inventoryItems.map(i => i.category).filter(Boolean)).size || 0,
      icon: Layers,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Trends & SKUs
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor trends and manage your product inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signals">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Signal Intelligence
              </Button>
            </Link>
            <Link to="/commerce-loop">
              <Button variant="gradient" size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                Commerce Loop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <NotificationCenter />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchFilterBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search trends or SKUs..."
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Trends */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              Saved Trends
            </CardTitle>
            <Link to="/signals">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingSavedTrends ? (
              <LoadingCards count={3} columns={1} />
            ) : filteredTrends.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No saved trends"
                description="Save trends from Signal Intelligence to track them here."
              />
            ) : (
              <div className="space-y-3">
                {filteredTrends.slice(0, 5).map((trend) => (
                  <div
                    key={trend.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{trend.trend_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {trend.platform || "Multi-platform"} • {trend.velocity || "Steady"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      trend.velocity === "Accelerating" ? "default" :
                      trend.velocity === "Rising" ? "secondary" : "outline"
                    }>
                      {trend.velocity || "Tracking"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SKU Inventory */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-blue-500" />
              Product Inventory
            </CardTitle>
            <Link to="/catalog">
              <Button variant="ghost" size="sm" className="gap-1">
                View Catalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingOrg ? (
              <LoadingCards count={3} columns={1} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products found"
                description="Add products to your organization to see them here."
              />
            ) : (
              <div className="space-y-3">
                {filteredProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sku} • ${product.price}
                        </p>
                      </div>
                    </div>
                    <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/signals" className="block">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Signal Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Discover emerging trends and signals
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/commerce-loop" className="block">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Zap className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold">Commerce Loop</h3>
                <p className="text-sm text-muted-foreground">
                  Match trends to inventory with AI
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/catalog" className="block">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Product Catalog</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all products
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
};

export default TrendsAndSkus;
