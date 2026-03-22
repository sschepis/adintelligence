import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Palette, Eye, Sparkles } from "lucide-react";
import { useProductImageAnalysis } from "@/hooks/useProductImageAnalysis";
import { toast } from "sonner";

interface VisualAnalysisResult {
  dominantColors: string[];
  colorHexCodes: string[];
  patterns: string[];
  aestheticStyle: string;
  luxuryScore: number;
  colorMatchScore: number;
}

interface VisualPatternMatcherProps {
  productImage?: string;
  productName: string;
  trendColors?: string[];
  onAnalysisComplete?: (result: VisualAnalysisResult) => void;
}

export function VisualPatternMatcher({
  productImage,
  productName,
  trendColors = [],
  onAnalysisComplete
}: VisualPatternMatcherProps) {
  const [analysis, setAnalysis] = useState<VisualAnalysisResult | null>(null);
  const { analyzeProductImage, isAnalyzing } = useProductImageAnalysis();

  const handleAnalyze = useCallback(async () => {
    if (!productImage) {
      toast.error("No product image available to analyze");
      return;
    }

    const result = await analyzeProductImage(productImage, trendColors);
    if (result) {
      setAnalysis(result);
      onAnalysisComplete?.(result);
      toast.success("Visual analysis complete");
    }
  }, [productImage, trendColors, analyzeProductImage, onAnalysisComplete]);

  if (!productImage) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!analysis ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Analyze Colors
            </>
          )}
        </Button>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-3">
            {/* Color Match Score */}
            {trendColors.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Color Match</span>
                <Badge 
                  variant={analysis.colorMatchScore >= 70 ? "default" : analysis.colorMatchScore >= 40 ? "secondary" : "outline"}
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {analysis.colorMatchScore}%
                </Badge>
              </div>
            )}

            {/* Dominant Colors */}
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Palette className="h-3 w-3" />
                Detected Colors
              </span>
              <div className="flex flex-wrap gap-1">
                {analysis.dominantColors.slice(0, 5).map((color, i) => (
                  <Badge key={i} variant="outline" className="text-xs capitalize">
                    <span 
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: analysis.colorHexCodes[i] || '#888' }}
                    />
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Patterns & Style */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Style: <span className="text-foreground capitalize">{analysis.aestheticStyle}</span></span>
              <span className="text-muted-foreground">Luxury: <span className="text-foreground">{analysis.luxuryScore}/10</span></span>
            </div>

            {/* Patterns */}
            {analysis.patterns.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.patterns.map((pattern, i) => (
                  <Badge key={i} variant="secondary" className="text-xs capitalize">
                    {pattern}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
