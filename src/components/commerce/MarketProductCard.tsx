import { ExternalLink, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketProduct {
  asin: string;
  title: string;
  link: string;
  image?: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsTotal?: number;
  isPrime?: boolean;
  isBestSeller?: boolean;
  rank?: number;
}

interface MarketProductCardProps {
  product: MarketProduct;
  delay?: number;
}

export function MarketProductCard({ product, delay = 0 }: MarketProductCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:border-primary/50 transition-colors animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg bg-secondary"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {product.price && (
                <span className="font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
              )}
              {product.isBestSeller && (
                <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">
                  Best Seller
                </Badge>
              )}
              {product.rank && (
                <Badge variant="outline" className="text-xs">
                  #{product.rank}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {product.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {product.rating}
                </span>
              )}
              {product.ratingsTotal && (
                <span>({product.ratingsTotal.toLocaleString()} reviews)</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View on Amazon <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
