import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { BundleSuggestion } from "@/components/commerce/BundleSuggestion";

interface BundleItem {
  name: string;
  price: number;
  matchScore: number;
}

interface Bundle {
  trendName: string;
  items: BundleItem[];
  totalPrice: number;
  bundlePrice: number;
  projectedRevenue: string;
  confidence: number;
}

interface BundleSuggestionsPanelProps {
  bundles: Bundle[];
}

export function BundleSuggestionsPanel({ bundles }: BundleSuggestionsPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">AI Bundle Suggestions</h2>
        {bundles.length > 0 && (
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {bundles.length} bundles
          </Badge>
        )}
      </div>
      <div className="space-y-4">
        {bundles.length > 0 ? (
          bundles.map((bundle, index) => (
            <BundleSuggestion key={bundle.trendName} {...bundle} delay={index * 100} />
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a trend with matching products to generate bundle suggestions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
