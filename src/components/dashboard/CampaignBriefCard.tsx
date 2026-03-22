import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Rocket, 
  Hash, 
  Target, 
  Zap,
  Users,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignDeployWizard } from "@/components/deployment/CampaignDeployWizard";
import { useCampaigns } from "@/hooks/useCampaigns";
import { toast } from "sonner";

export interface MatchedSKU {
  name: string;
  sku: string;
  stock: number;
  stockStatus: "high" | "medium" | "low";
  image_url?: string;
}

export interface ProductData {
  name: string;
  sku?: string;
  stock?: number;
  price?: number;
  image_url?: string;
  category?: string;
}

export interface TrendSurgeData {
  platform: string;
  change: string;
  mentions?: string;
}

// Helper to match products to a trend based on keywords
export function matchProductsToTrend(
  products: ProductData[],
  trendName: string
): MatchedSKU[] {
  if (!products || products.length === 0) return [];
  
  const trendKeywords = trendName.toLowerCase().split(/\s+/);
  
  return products
    .map((product) => {
      const productName = product.name?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      
      // Calculate match score based on keyword overlap
      const matchCount = trendKeywords.filter(
        keyword => productName.includes(keyword) || category.includes(keyword)
      ).length;
      
      const stock = product.stock ?? Math.floor(Math.random() * 300);
      const stockStatus: "high" | "medium" | "low" = 
        stock > 100 ? "high" : stock > 30 ? "medium" : "low";
      
      return {
        name: product.name,
        sku: product.sku || `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        stock,
        stockStatus,
        image_url: product.image_url,
        matchScore: matchCount,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(({ matchScore, ...rest }) => rest);
}

// Calculate match percentage based on products and trend
export function calculateMatchPercentage(
  products: ProductData[],
  trendName: string
): number {
  if (!products || products.length === 0) return 0;
  
  const trendKeywords = trendName.toLowerCase().split(/\s+/);
  let totalScore = 0;
  
  products.forEach((product) => {
    const productName = product.name?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    
    trendKeywords.forEach(keyword => {
      if (productName.includes(keyword)) totalScore += 2;
      if (category.includes(keyword)) totalScore += 1;
    });
  });
  
  // Normalize score to 0-100 range
  const maxScore = products.length * trendKeywords.length * 3;
  const percentage = Math.min(100, Math.round((totalScore / maxScore) * 100) + 50);
  return Math.max(55, percentage); // Minimum 55% for visual appeal
}

// Generate hashtags from trend name
function generateHashtags(trendName: string): string[] {
  const baseTags = trendName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const combined = baseTags.join('');
  return [
    `#${combined}`,
    `#${baseTags[0] || 'trend'}vibes`,
    `#${baseTags[0] || 'trend'}style`,
  ].slice(0, 3);
}

interface CampaignBriefCardProps {
  trendName: string;
  matchPercentage?: number;
  trendSurge: string;
  surgeChange: string;
  matchedSKUs?: MatchedSKU[];
  products?: ProductData[];
  onViewBrief?: () => void;
  brandId?: string;
  // New enhanced props
  trendSurges?: TrendSurgeData[];
  hashtags?: string[];
  conversionLevel?: "high" | "medium" | "low";
  competitorLevel?: "low" | "medium" | "high";
  estimatedROAS?: number;
}

export function CampaignBriefCard({
  trendName,
  matchPercentage: providedMatchPercentage,
  trendSurge,
  surgeChange,
  matchedSKUs: providedSKUs,
  products,
  onViewBrief,
  brandId,
  trendSurges,
  hashtags: providedHashtags,
  conversionLevel = "medium",
  competitorLevel = "medium",
  estimatedROAS,
}: CampaignBriefCardProps) {
  const [deployOpen, setDeployOpen] = useState(false);
  const { createCampaign } = useCampaigns();

  // Calculate match percentage and SKUs from real products if not provided
  const matchPercentage = providedMatchPercentage ?? calculateMatchPercentage(products || [], trendName);
  const matchedSKUs = providedSKUs ?? matchProductsToTrend(products || [], trendName);
  const hashtags = providedHashtags ?? generateHashtags(trendName);

  // Generate trend surges if not provided
  const surges: TrendSurgeData[] = trendSurges ?? [
    { platform: "TikTok", change: surgeChange || "+48%", mentions: "24K mentions" },
    { platform: "Instagram", change: "+32%", mentions: "18K mentions" },
  ];

  const getStockColor = (status: MatchedSKU["stockStatus"]) => {
    switch (status) {
      case "high": return "text-signal-rising";
      case "medium": return "text-amber-500";
      case "low": return "text-destructive";
    }
  };

  const getStockBg = (status: MatchedSKU["stockStatus"]) => {
    switch (status) {
      case "high": return "bg-signal-rising/10";
      case "medium": return "bg-amber-500/10";
      case "low": return "bg-destructive/10";
    }
  };

  const getLevelColor = (level: "high" | "medium" | "low", inverse?: boolean) => {
    if (inverse) {
      switch (level) {
        case "high": return "text-destructive bg-destructive/10 border-destructive/20";
        case "medium": return "text-amber-600 bg-amber-500/10 border-amber-500/20";
        case "low": return "text-signal-rising bg-signal-rising/10 border-signal-rising/20";
      }
    }
    switch (level) {
      case "high": return "text-signal-rising bg-signal-rising/10 border-signal-rising/20";
      case "medium": return "text-amber-600 bg-amber-500/10 border-amber-500/20";
      case "low": return "text-muted-foreground bg-secondary/50 border-border";
    }
  };

  const handleDeploy = async (config: any) => {
    try {
      await createCampaign({
        name: `${trendName} Campaign`,
        status: "active",
        platform: config.platforms.join(", "),
        total_budget: config.budget,
        daily_budget: config.dailyBudget,
        brand_id: brandId,
      });
      toast.success(`Campaign "${trendName}" deployed successfully!`);
    } catch (error) {
      toast.error("Failed to deploy campaign");
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              {/* Match Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm font-bold px-3 py-1",
                  matchPercentage >= 80 ? "border-signal-rising text-signal-rising bg-signal-rising/10" :
                  matchPercentage >= 60 ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                  "border-muted-foreground text-muted-foreground"
                )}
              >
                {matchPercentage}% Match
              </Badge>
              <h3 className="font-display font-bold text-lg">{trendName}</h3>
              
              {/* Trending Hashtags */}
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="text-xs bg-primary/10 text-primary border-0 gap-1"
                  >
                    <Hash className="h-3 w-3" />
                    {tag.replace('#', '')}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Trend Surge Column */}
            <div className="text-right space-y-1.5">
              {surges.slice(0, 2).map((surge, i) => (
                <div key={i} className="flex items-center justify-end gap-1.5">
                  <span className="text-xs text-muted-foreground">{surge.platform}</span>
                  <Badge variant="outline" className="text-xs text-signal-rising border-signal-rising/30 bg-signal-rising/5 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {surge.change}
                  </Badge>
                </div>
              ))}
              {surges[0]?.mentions && (
                <p className="text-xs text-muted-foreground">{surges[0].mentions}</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Conversion & Competitor Badges */}
          <div className="flex gap-2">
            <Badge 
              variant="outline"
              className={cn("flex-1 justify-center py-1.5 gap-1.5", getLevelColor(conversionLevel))}
            >
              <Target className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {conversionLevel === "high" ? "High" : conversionLevel === "medium" ? "Med" : "Low"} Conversion
              </span>
            </Badge>
            <Badge 
              variant="outline"
              className={cn("flex-1 justify-center py-1.5 gap-1.5", getLevelColor(competitorLevel, true))}
            >
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {competitorLevel === "high" ? "High" : competitorLevel === "medium" ? "Med" : "Low"} Competition
              </span>
            </Badge>
          </div>

          {/* Match Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Brand Match Score</span>
              <span>{matchPercentage}%</span>
            </div>
            <Progress value={matchPercentage} className="h-2" />
          </div>

          {/* Estimated ROAS */}
          {estimatedROAS && (
            <div className="flex items-center justify-between bg-gradient-to-r from-signal-rising/10 to-transparent rounded-lg p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-signal-rising" />
                <span className="text-sm font-medium">Estimated ROAS</span>
              </div>
              <span className="text-lg font-bold text-signal-rising">{estimatedROAS.toFixed(1)}x</span>
            </div>
          )}

          {/* Matched SKUs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Matched SKUs ({matchedSKUs.length})</span>
            </div>
            <div className="space-y-2">
              {matchedSKUs.slice(0, 3).map((sku, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-secondary/30 rounded-lg p-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {sku.image_url && (
                      <img src={sku.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{sku.name}</p>
                      <p className="text-xs text-muted-foreground">{sku.sku}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs shrink-0 ml-2", getStockColor(sku.stockStatus), getStockBg(sku.stockStatus))}
                  >
                    {sku.stock} units
                    {sku.stockStatus === "low" && <AlertTriangle className="h-3 w-3 ml-1" />}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onViewBrief}>
              View Brief
            </Button>
            <Button size="sm" className="flex-1 gap-1" onClick={() => setDeployOpen(true)}>
              <Rocket className="h-3 w-3" /> Deploy
            </Button>
          </div>
        </CardContent>
      </Card>

      <CampaignDeployWizard
        open={deployOpen}
        onOpenChange={setDeployOpen}
        campaignName={`${trendName} Campaign`}
        onDeploy={handleDeploy}
      />
    </>
  );
}