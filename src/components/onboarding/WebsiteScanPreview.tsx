import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, 
  Palette, 
  Package, 
  Tag, 
  Check, 
  X, 
  Loader2,
  RefreshCw,
  Edit3,
  ChevronDown,
  ChevronRight,
  Plus,
  Image
} from "lucide-react";

interface ExtractedData {
  brandName: string;
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  categories: string[];
  products: Array<{
    name: string;
    category: string;
    price?: string;
    imageUrl?: string;
  }>;
}

interface WebsiteScanPreviewProps {
  url: string;
  extractedData: ExtractedData;
  isScanning: boolean;
  onRescan: () => void;
  onConfirm: (data: ExtractedData) => void;
  onCancel: () => void;
}

export function WebsiteScanPreview({
  url,
  extractedData,
  isScanning,
  onRescan,
  onConfirm,
  onCancel,
}: WebsiteScanPreviewProps) {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedData>(extractedData);
  const [expandedSections, setExpandedSections] = useState({
    colors: true,
    categories: true,
    products: false,
  });

  const [editingColor, setEditingColor] = useState<string | null>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateColor = (colorKey: keyof ExtractedData['colors'], value: string) => {
    setData(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
  };

  const removeCategory = (index: number) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addCategory = (category: string) => {
    if (category.trim() && !data.categories.includes(category.trim())) {
      setData(prev => ({
        ...prev,
        categories: [...prev.categories, category.trim()]
      }));
    }
  };

  const removeProduct = (index: number) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  if (isScanning) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">Scanning Website</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Analyzing {url}...
        </p>
        <div className="max-w-xs mx-auto space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            <span>Extracting brand identity</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Detecting product catalog</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <div className="w-4 h-4" />
            <span>Building taxonomy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Website Scan Results</h3>
              <p className="text-sm text-muted-foreground">{url}</p>
            </div>
          </div>
          <Button variant="glass" size="sm" onClick={onRescan} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Rescan
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[500px]">
        <div className="p-5 space-y-6">
          {/* Brand Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Brand Name</Label>
              {editMode === "brandName" ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={data.brandName}
                    onChange={(e) => setData(prev => ({ ...prev, brandName: e.target.value }))}
                    className="h-8 w-48 bg-secondary/50"
                  />
                  <Button size="sm" variant="ghost" onClick={() => setEditMode(null)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold">{data.brandName}</span>
                  <Button size="sm" variant="ghost" onClick={() => setEditMode("brandName")}>
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {data.logoUrl && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                  <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm text-muted-foreground">Logo detected</span>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("colors")}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium cursor-pointer">Brand Colors</Label>
              </div>
              {expandedSections.colors ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.colors && (
              <div className="grid grid-cols-5 gap-3 animate-fade-in">
                {Object.entries(data.colors).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <div
                      className={cn(
                        "aspect-square rounded-lg cursor-pointer transition-all hover:scale-105 relative",
                        editingColor === key && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: value }}
                      onClick={() => setEditingColor(editingColor === key ? null : key)}
                    />
                    <p className="text-xs text-muted-foreground capitalize text-center">{key}</p>
                    {editingColor === key && (
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => updateColor(key as keyof ExtractedData['colors'], e.target.value)}
                        className="w-full h-8"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("categories")}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium cursor-pointer">
                  Categories ({data.categories.length})
                </Label>
              </div>
              {expandedSections.categories ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.categories && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => removeCategory(index)}
                    >
                      {category}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add category..."
                    className="h-8 bg-secondary/50 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addCategory((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("products")}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium cursor-pointer">
                  Products ({data.products.length})
                </Label>
              </div>
              {expandedSections.products ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.products && (
              <div className="space-y-2 animate-fade-in">
                {data.products.slice(0, 10).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 group"
                  >
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Image className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    {product.price && (
                      <span className="text-sm font-medium text-primary">{product.price}</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeProduct(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {data.products.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{data.products.length - 10} more products
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-5 border-t border-border flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            You can edit these details anytime in Brand Settings
          </p>
          <Button variant="gradient" onClick={() => onConfirm(data)}>
            <Check className="h-4 w-4 mr-2" />
            Confirm & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
