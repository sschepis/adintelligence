import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Tag, Package } from "lucide-react";

interface BrandData {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  taxonomy?: string[];
  products?: Array<{ name: string; category?: string }>;
  name?: string;
}

interface SelectionState {
  colors: boolean;
  categories: boolean;
  products: boolean;
}

interface BrandComparisonViewProps {
  currentData: BrandData;
  newData: BrandData;
  selections: SelectionState;
  onSelectionChange: (key: keyof SelectionState, value: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function BrandComparisonView({
  currentData,
  newData,
  selections,
  onSelectionChange,
  onApply,
  onCancel,
}: BrandComparisonViewProps) {
  const hasColorChanges =
    currentData.primary_color !== newData.primary_color ||
    currentData.secondary_color !== newData.secondary_color ||
    currentData.accent_color !== newData.accent_color;

  const hasCategoryChanges =
    JSON.stringify(currentData.taxonomy || []) !== JSON.stringify(newData.taxonomy || []);

  const hasProductChanges =
    JSON.stringify(currentData.products || []) !== JSON.stringify(newData.products || []);

  const ColorSwatch = ({ color, label }: { color?: string; label: string }) => (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border border-border/50"
        style={{ backgroundColor: color || "#000" }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
      <h4 className="font-semibold text-sm">Review Changes</h4>
      <p className="text-xs text-muted-foreground">
        Select which updates you want to apply from the rescan:
      </p>

      {/* Colors Comparison */}
      {hasColorChanges && (
        <div className="space-y-2 p-3 rounded-lg bg-card/50 border border-border/30">
          <div className="flex items-center gap-3">
            <Checkbox
              id="apply-colors"
              checked={selections.colors}
              onCheckedChange={(checked) => onSelectionChange("colors", !!checked)}
            />
            <label htmlFor="apply-colors" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Palette className="h-4 w-4 text-primary" />
              Brand Colors
            </label>
            <Badge variant="soft" className="text-xs">Changed</Badge>
          </div>
          <div className="flex items-center gap-4 ml-7 mt-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Current</span>
              <div className="flex gap-1">
                <ColorSwatch color={currentData.primary_color} label="" />
                <ColorSwatch color={currentData.secondary_color} label="" />
                <ColorSwatch color={currentData.accent_color} label="" />
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">New</span>
              <div className="flex gap-1">
                <ColorSwatch color={newData.primary_color} label="" />
                <ColorSwatch color={newData.secondary_color} label="" />
                <ColorSwatch color={newData.accent_color} label="" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Comparison */}
      {hasCategoryChanges && (
        <div className="space-y-2 p-3 rounded-lg bg-card/50 border border-border/30">
          <div className="flex items-center gap-3">
            <Checkbox
              id="apply-categories"
              checked={selections.categories}
              onCheckedChange={(checked) => onSelectionChange("categories", !!checked)}
            />
            <label htmlFor="apply-categories" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Tag className="h-4 w-4 text-primary" />
              Categories
            </label>
            <Badge variant="soft" className="text-xs">Changed</Badge>
          </div>
          <div className="flex items-center gap-4 ml-7 mt-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Current ({currentData.taxonomy?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1 max-w-[150px]">
                {(currentData.taxonomy || []).slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {(currentData.taxonomy?.length || 0) > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(currentData.taxonomy?.length || 0) - 3}
                  </Badge>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                New ({newData.taxonomy?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1 max-w-[150px]">
                {(newData.taxonomy || []).slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {(newData.taxonomy?.length || 0) > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(newData.taxonomy?.length || 0) - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Comparison */}
      {hasProductChanges && (
        <div className="space-y-2 p-3 rounded-lg bg-card/50 border border-border/30">
          <div className="flex items-center gap-3">
            <Checkbox
              id="apply-products"
              checked={selections.products}
              onCheckedChange={(checked) => onSelectionChange("products", !!checked)}
            />
            <label htmlFor="apply-products" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Package className="h-4 w-4 text-primary" />
              Products
            </label>
            <Badge variant="soft" className="text-xs">Changed</Badge>
          </div>
          <div className="flex items-center gap-4 ml-7 mt-2">
            <span className="text-xs text-muted-foreground">
              {currentData.products?.length || 0} products
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {newData.products?.length || 0} products
            </span>
          </div>
        </div>
      )}

      {!hasColorChanges && !hasCategoryChanges && !hasProductChanges && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No changes detected from rescan
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={onApply}
          disabled={!selections.colors && !selections.categories && !selections.products}
        >
          Apply Selected Changes
        </Button>
      </div>
    </div>
  );
}
