import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared";
import { useBrand } from "@/contexts/BrandContext";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Globe, Store, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type FilterTab = "all" | "trending" | "new" | "online" | "retail";

interface ProductData {
  name: string;
  sku?: string;
  image_url?: string;
  price?: number;
  category?: string;
}

interface FilterTabConfig {
  id: FilterTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

export default function BrandCatalog() {
  const { activeBrand, loading } = useBrand();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const products = useMemo(() => {
    return (activeBrand?.products || []) as ProductData[];
  }, [activeBrand]);

  // Calculate filter counts from actual product properties
  const filterTabs: FilterTabConfig[] = useMemo(() => {
    const trendingCount = products.filter(p => (p as any).trending === true).length;
    const newCount = products.filter(p => {
      const createdAt = (p as any).created_at;
      if (!createdAt) return false;
      const date = new Date(createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date > thirtyDaysAgo;
    }).length;
    const onlineCount = products.filter(p => (p as any).channel === "online").length;
    const retailCount = products.filter(p => (p as any).channel === "retail").length;

    return [
      { id: "all" as FilterTab, label: "All", icon: Package, count: products.length },
      ...(trendingCount > 0 ? [{ id: "trending" as FilterTab, label: "Trending", icon: TrendingUp, count: trendingCount }] : []),
      ...(newCount > 0 ? [{ id: "new" as FilterTab, label: "New", icon: Sparkles, count: newCount }] : []),
      ...(onlineCount > 0 ? [{ id: "online" as FilterTab, label: "Online", icon: Globe, count: onlineCount }] : []),
      ...(retailCount > 0 ? [{ id: "retail" as FilterTab, label: "Retail", icon: Store, count: retailCount }] : []),
    ];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply tab filter using actual product properties
    if (activeTab === "trending") {
      filtered = filtered.filter(p => (p as any).trending === true);
    } else if (activeTab === "new") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(p => {
        const createdAt = (p as any).created_at;
        return createdAt && new Date(createdAt) > thirtyDaysAgo;
      });
    } else if (activeTab === "online") {
      filtered = filtered.filter(p => (p as any).channel === "online");
    } else if (activeTab === "retail") {
      filtered = filtered.filter(p => (p as any).channel === "retail");
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        (p as any).sku?.toLowerCase().includes(query) ||
        (p as any).category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, activeTab, searchQuery]);

  const handleProductClick = (product: ProductData, index: number) => {
    const productId = product.sku || `product-${index}`;
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Brand Catalog" description="Loading products..." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Brand Catalog" 
        description="Explore your complete product inventory. Filter by category, channel, and retailer to discover SKUs ready for activation."
      />

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className="text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={(product as any).id || index} 
              product={product} 
              isTrending={(product as any).trending === true}
              onClick={() => handleProductClick(product, index)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {products.length === 0 
              ? "Add products to your brand catalog to see them here."
              : "Try adjusting your search or filters."
            }
          </p>
        </div>
      )}
    </PageContainer>
  );
}

interface ProductCardProps {
  product: ProductData;
  isTrending?: boolean;
  onClick?: () => void;
}

function ProductCard({ product, isTrending, onClick }: ProductCardProps) {
  const imageUrl = product.image_url || (product as any).image;
  const sku = (product as any).sku || generateSKU(product.name);
  const price = product.price;
  const category = (product as any).category || "Uncategorized";

  return (
    <div 
      onClick={onClick}
      className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {isTrending && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary/90 text-primary-foreground gap-1">
              <TrendingUp className="h-3 w-3" />
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground font-mono">{sku}</p>
        <h3 className="font-semibold text-sm line-clamp-2 mt-0.5">{product.name}</h3>
        {price && (
          <p className="text-sm font-bold mt-1">${typeof price === 'number' ? price.toFixed(2) : price}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-secondary rounded" />
        <div className="h-4 w-full bg-secondary rounded" />
        <div className="h-4 w-12 bg-secondary rounded" />
      </div>
    </div>
  );
}

function generateSKU(name: string): string {
  // Derive a deterministic SKU from the product name
  const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const num = String(Math.abs(hash) % 999).padStart(3, '0');
  return `${prefix}-${num}`;
}
