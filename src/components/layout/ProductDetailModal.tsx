import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, DollarSign, Star, ExternalLink, Check, X } from "lucide-react";

// Flexible product type that works with both organization and brand products
export interface ProductData {
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  image?: string;
  image_url?: string;
  variants?: string[];
  tags?: string[];
  url?: string;
  sku?: string;
  stock?: number;
}

interface ProductDetailModalProps {
  product: ProductData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Product Image */}
          {(product.image || product.image_url) && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-secondary">
              <img 
                src={product.image || product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Category */}
          {product.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Category:</span>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
          )}

          {/* Price */}
          {product.price !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="font-bold text-lg text-primary">
                {product.currency || '$'}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.currency || '$'}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock Status */}
          {product.inStock !== undefined && (
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">In Stock</span>
                  {product.stockQuantity !== undefined && (
                    <span className="text-xs text-muted-foreground">({product.stockQuantity} available)</span>
                  )}
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Out of Stock</span>
                </>
              )}
            </div>
          )}

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm">{product.rating.toFixed(1)}</span>
              {product.reviewCount !== undefined && (
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Variants</h4>
              <div className="flex flex-wrap gap-1">
                {product.variants.map((variant, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{variant}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {product.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
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
              className="flex items-center gap-2 text-sm text-primary hover:underline pt-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on website
            </a>
          )}

          {/* SKU */}
          {product.sku && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              SKU: {product.sku}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
