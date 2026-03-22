import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Star, 
  ExternalLink, 
  TrendingUp, 
  BarChart3,
  ShoppingCart,
  Palette,
  Target,
  Zap,
  Clock,
  DollarSign,
  Users,
  Share2,
  Heart,
  Edit,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrand } from "@/contexts/BrandContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { toast } from "sonner";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ProductData {
  id: string;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  inStock?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  image_url?: string;
  variants?: string[];
  tags?: string[];
  url?: string;
  sku?: string;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { activeBrand, loading: brandLoading } = useBrand();
  const { campaigns } = useCampaigns(true);
  const { savedTrends } = useSavedTrends();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  // Find product from brand products
  useEffect(() => {
    if (activeBrand && productId) {
      const products = (activeBrand.products as ProductData[]) || [];
      const found = products.find((p, index) => 
        p.sku === productId || `product-${index}` === productId
      );
      if (found) {
        setProduct({
          ...found,
          id: found.sku || productId,
        });
      }
      setLoading(false);
    }
  }, [activeBrand, productId]);

  // Mock performance data
  const performanceData = [
    { date: "Mon", views: 120, clicks: 45, conversions: 12 },
    { date: "Tue", views: 180, clicks: 62, conversions: 18 },
    { date: "Wed", views: 150, clicks: 55, conversions: 15 },
    { date: "Thu", views: 220, clicks: 78, conversions: 24 },
    { date: "Fri", views: 280, clicks: 95, conversions: 32 },
    { date: "Sat", views: 320, clicks: 112, conversions: 38 },
    { date: "Sun", views: 260, clicks: 88, conversions: 28 },
  ];

  const channelDistribution = [
    { name: "Organic", value: 35, color: "hsl(var(--primary))" },
    { name: "Social", value: 28, color: "hsl(350, 85%, 55%)" },
    { name: "Paid Ads", value: 22, color: "hsl(25, 80%, 60%)" },
    { name: "Email", value: 15, color: "hsl(280, 60%, 55%)" },
  ];

  // Find related campaigns
  const relatedCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(product?.category?.toLowerCase() || '') ||
    c.name.toLowerCase().includes(product?.name.split(' ')[0]?.toLowerCase() || '')
  ).slice(0, 3);

  // Find matching trends
  const matchingTrends = savedTrends.filter(t =>
    product?.tags?.some(tag => t.trend_name.toLowerCase().includes(tag.toLowerCase())) ||
    t.trend_name.toLowerCase().includes(product?.category?.toLowerCase() || '')
  ).slice(0, 4);

  const handleCopySku = () => {
    if (product?.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopied(true);
      toast.success("SKU copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || brandLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const stockStatus = product.stock !== undefined 
    ? product.stock > 100 ? "high" : product.stock > 30 ? "medium" : "low"
    : product.inStock ? "high" : "low";

  return (
    <PageContainer>
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className="mb-4 gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/50 border border-border/50">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            {/* Stock Badge */}
            <Badge 
              className={cn(
                "absolute top-4 right-4",
                stockStatus === "high" && "bg-signal-rising text-white",
                stockStatus === "medium" && "bg-amber-500 text-white",
                stockStatus === "low" && "bg-destructive text-white"
              )}
            >
              {stockStatus === "high" ? "In Stock" : stockStatus === "medium" ? "Low Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Heart className="h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category Badge */}
          {product.category && (
            <Badge variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {product.category}
            </Badge>
          )}

          {/* Title */}
          <h1 className="font-display font-bold text-3xl lg:text-4xl">{product.name}</h1>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating!) 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-4xl text-primary">
              {product.currency || '$'}{(product.price || 0).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > (product.price || 0) && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {product.currency || '$'}{product.originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {Math.round((1 - (product.price || 0) / product.originalPrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock Info */}
          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Inventory Status</span>
              <div className="flex items-center gap-2">
                {stockStatus === "high" && <CheckCircle2 className="h-4 w-4 text-signal-rising" />}
                {stockStatus === "medium" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                {stockStatus === "low" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                <span className="font-semibold">{product.stock || 0} units</span>
              </div>
            </div>
            <Progress 
              value={Math.min(100, ((product.stock || 0) / 200) * 100)} 
              className="h-2"
            />
          </div>

          {/* SKU */}
          {product.sku && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">SKU:</span>
              <code className="bg-secondary px-2 py-1 rounded font-mono">{product.sku}</code>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopySku}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-signal-rising" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Available Variants</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, i) => (
                  <Badge key={i} variant="outline" className="cursor-pointer hover:bg-secondary">
                    {variant}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          {product.url && (
            <a 
              href={product.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View on website
            </a>
          )}
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trend Match
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Weekly Views</p>
                <p className="font-bold text-2xl">1,530</p>
                <p className="text-xs text-signal-rising">+12.4%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                <p className="font-bold text-2xl">3.2%</p>
                <p className="text-xs text-signal-rising">+0.8%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Revenue (7d)</p>
                <p className="font-bold text-2xl">$4,280</p>
                <p className="text-xs text-signal-rising">+18.2%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg. Order Value</p>
                <p className="font-bold text-2xl">${(product.price || 0).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Per unit</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" />
                      <Line type="monotone" dataKey="conversions" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {channelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {channelDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchingTrends.length > 0 ? matchingTrends.map((trend, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{trend.platform}</Badge>
                    <TrendingUp className="h-4 w-4 text-signal-rising" />
                  </div>
                  <h4 className="font-semibold mb-1">{trend.trend_name}</h4>
                  <p className="text-sm text-muted-foreground">{trend.velocity || "Rising"}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Progress value={Math.random() * 40 + 60} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium">{Math.floor(Math.random() * 20 + 75)}%</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matching trends found for this product</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {relatedCampaigns.length > 0 ? (
            <div className="space-y-4">
              {relatedCampaigns.map((campaign, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                        <p className="text-sm mt-1">
                          ${campaign.spent?.toFixed(0)} / ${campaign.total_budget?.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns associated with this product yet</p>
              <Button variant="outline" className="mt-4 gap-2">
                <Zap className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-signal-rising/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-signal-rising" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">High Growth Potential</p>
                    <p className="text-xs text-muted-foreground">This product aligns with 3 trending aesthetics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Palette className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Visual Match</p>
                    <p className="text-xs text-muted-foreground">Product colors match trending palette (Gold, Bronze)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Target Audience</p>
                    <p className="text-xs text-muted-foreground">Best performing with 18-34 female demographic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Predicted Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Predicted ROAS</span>
                      <span className="font-bold text-signal-rising">3.8x</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Brand Alignment</span>
                      <span className="font-bold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Trend Momentum</span>
                      <span className="font-bold">High</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default ProductDetail;
