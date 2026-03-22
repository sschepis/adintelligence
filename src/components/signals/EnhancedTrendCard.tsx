import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  TrendingUp, 
  Minus, 
  FileText,
  Package
} from "lucide-react";

interface PlatformGrowth {
  platform: string;
  icon: string;
  growth: string;
}

interface ProductMatch {
  id: string;
  name: string;
  image?: string;
}

interface EnhancedTrendCardProps {
  id: string;
  name: string;
  matchScore: number;
  risingOn: {
    platform: string;
    icon: string;
    growth: string;
  };
  products: ProductMatch[];
  skuCount: number;
  leadProduct: string;
  platformGrowth: PlatformGrowth[];
  hashtags: string[];
  onViewBrief?: () => void;
  onRemove?: () => void;
}

const platformIcons: Record<string, string> = {
  YouTube: "▶️",
  TikTok: "📱",
  Google: "🔍",
  Instagram: "📷",
  Pinterest: "📌",
  Meta: "Ⓜ️",
};

const platformColors: Record<string, string> = {
  YouTube: "text-red-500",
  TikTok: "text-gray-800 dark:text-gray-200",
  Google: "text-blue-500",
  Instagram: "text-pink-500",
  Pinterest: "text-red-600",
  Meta: "text-blue-600",
};

export function EnhancedTrendCard({
  id,
  name,
  matchScore,
  risingOn,
  products,
  skuCount,
  leadProduct,
  platformGrowth,
  hashtags,
  onViewBrief,
  onRemove,
}: EnhancedTrendCardProps) {
  const displayProducts = products.slice(0, 3);
  const remainingProducts = products.length - 3;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-lg">{name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-lg text-sm font-bold border",
            matchScore >= 90 
              ? "bg-primary/10 text-primary border-primary/30" 
              : matchScore >= 80 
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-secondary text-muted-foreground border-border"
          )}>
            {matchScore}
          </span>
          {onRemove && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Rising On */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Rising on</span>
        <span>{risingOn.icon}</span>
        <span className={cn("font-medium", platformColors[risingOn.platform])}>
          {risingOn.platform}
        </span>
        <span className="text-amber-600 font-bold">{risingOn.growth}</span>
      </div>

      {/* Products Grid */}
      <p className="text-xs text-muted-foreground mb-2">Top Matching Products</p>
      <div className="flex items-center gap-2 mb-4">
        {displayProducts.map((product) => (
          <div key={product.id} className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border/50 overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground text-center truncate max-w-[80px]">
              {product.name}
            </span>
          </div>
        ))}
        {remainingProducts > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-xl bg-secondary/30 border border-dashed border-border flex items-center justify-center">
              <span className="text-sm text-muted-foreground font-medium">+{remainingProducts}</span>
            </div>
          </div>
        )}
      </div>

      {/* SKU Count */}
      <p className="text-sm text-muted-foreground mb-3">
        <span className="font-semibold text-foreground">{skuCount} SKUs</span>
        <span className="mx-1">•</span>
        <span>{leadProduct}</span>
      </p>

      {/* Platform Growth Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {platformGrowth.slice(0, 5).map((pg) => (
          <div 
            key={pg.platform} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50"
          >
            <span className="text-xs">{platformIcons[pg.platform] || pg.icon}</span>
            <span className="text-xs text-muted-foreground">{pg.platform}</span>
            <span className="text-xs text-amber-600 font-semibold">{pg.growth}</span>
          </div>
        ))}
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {hashtags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="text-xs bg-secondary/30"
          >
            #{tag}
          </Badge>
        ))}
      </div>

      {/* View Brief Button */}
      {onViewBrief && (
        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={onViewBrief}
        >
          <FileText className="h-4 w-4" />
          View Brief
        </Button>
      )}
    </div>
  );
}

