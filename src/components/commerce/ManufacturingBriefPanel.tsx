import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Factory, 
  Loader2, 
  FileText, 
  TrendingUp, 
  Package, 
  Palette, 
  Clock, 
  DollarSign,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  Copy,
  Mail
} from "lucide-react";
import { useManufacturingBrief, ManufacturingBrief, ProductRecommendation } from "@/hooks/useManufacturingBrief";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ManufacturingBriefPanelProps {
  trendName: string;
  trendKeywords?: string[];
  trendColors?: string[];
  existingCategories?: string[];
  gapCategories?: string[];
}

function ProductCard({ product, index }: { product: ProductRecommendation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 bg-secondary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {index + 1}
            </div>
            <div>
              <CardTitle className="text-sm">{product.productName}</CardTitle>
              <Badge variant="outline" className="text-[10px] mt-1">{product.category}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground mb-2">{product.description}</p>
        
        {expanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/50 animate-fade-in">
            {/* Features */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Key Features</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.keyFeatures.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{feature}</Badge>
                ))}
              </div>
            </div>

            {/* Materials & Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Materials</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.materials.map((mat, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{mat}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Colorways</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.colorways.map((color, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      <Palette className="h-2 w-2 mr-1" />
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-primary/5">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground">Wholesale</span>
                <p className="text-sm font-bold text-primary">{product.pricePoint.wholesale}</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground">Retail</span>
                <p className="text-sm font-bold">{product.pricePoint.retail}</p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground">Margin</span>
                <p className="text-sm font-bold text-signal-rising">{product.pricePoint.margin}</p>
              </div>
            </div>

            {/* MOQ & Lead Time */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span><Package className="h-3 w-3 inline mr-1" />MOQ: {product.moq}</span>
              <span><Clock className="h-3 w-3 inline mr-1" />Lead: {product.leadTime}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ManufacturingBriefPanel({
  trendName,
  trendKeywords = [],
  trendColors = [],
  existingCategories = [],
  gapCategories = []
}: ManufacturingBriefPanelProps) {
  const { brief, isGenerating, generateBrief, clearBrief } = useManufacturingBrief();

  const handleGenerate = () => {
    generateBrief({
      trendName,
      trendKeywords,
      trendColors,
      existingCategories,
      gapCategories
    });
  };

  const urgencyConfig = {
    high: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    medium: { icon: Clock, color: "text-accent", bg: "bg-accent/10" },
    low: { icon: CheckCircle2, color: "text-signal-rising", bg: "bg-signal-rising/10" }
  };

  if (!brief) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Factory className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-sm mb-1">Manufacturing Brief Generator</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs">
            AI will analyze trend gaps and generate product development recommendations
          </p>
          {gapCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 justify-center">
              {gapCategories.slice(0, 3).map((cat, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  Gap: {cat}
                </Badge>
              ))}
              {gapCategories.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{gapCategories.length - 3} more
                </Badge>
              )}
            </div>
          )}
          <Button
            variant="gradient"
            size="sm"
            className="gap-2"
            onClick={handleGenerate}
            disabled={isGenerating || !trendName}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Manufacturing Brief
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const urgency = urgencyConfig[brief.marketOpportunity.urgencyLevel] || urgencyConfig.medium;
  const UrgencyIcon = urgency.icon;

  const generatePdfContent = () => {
    if (!brief) return "";
    return `
MANUFACTURING BRIEF: ${brief.briefTitle}
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${brief.executiveSummary}

MARKET OPPORTUNITY
Target: ${brief.marketOpportunity.targetDemographic}
Urgency: ${brief.marketOpportunity.urgencyLevel.toUpperCase()}
Projected Margin: ${brief.marketOpportunity.projectedMargin}
Demand Signals: ${brief.marketOpportunity.demandSignals.join(", ")}

PRODUCT RECOMMENDATIONS
${brief.productRecommendations.map((p, i) => `
${i + 1}. ${p.productName} (${p.category})
   ${p.description}
   Features: ${p.keyFeatures.join(", ")}
   Materials: ${p.materials.join(", ")}
   Colors: ${p.colorways.join(", ")}
   Pricing: Wholesale ${p.pricePoint.wholesale} | Retail ${p.pricePoint.retail} | Margin ${p.pricePoint.margin}
   MOQ: ${p.moq} | Lead Time: ${p.leadTime}
`).join("")}

DESIGN GUIDELINES
${brief.designGuidelines.aestheticDirection}
Must Have: ${brief.designGuidelines.mustHaveElements.join(", ")}
Avoid: ${brief.designGuidelines.avoidElements.join(", ")}

TIMELINE
Launch Window: ${brief.timelineRecommendation.idealLaunchWindow}
Trend Longevity: ${brief.timelineRecommendation.trendLongevity}
Seasonality: ${brief.timelineRecommendation.seasonality}

PRODUCTION NOTES
Manufacturers: ${brief.productionNotes.recommendedManufacturers}
Sustainability: ${brief.productionNotes.sustainabilityConsiderations}
    `.trim();
  };

  const handleExportPdf = () => {
    const content = generatePdfContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manufacturing-brief-${brief?.briefTitle?.replace(/\s+/g, "-").toLowerCase() || "export"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Brief exported successfully");
  };

  const handleCopyToClipboard = async () => {
    const content = generatePdfContent();
    await navigator.clipboard.writeText(content);
    toast.success("Brief copied to clipboard");
  };

  const handleEmailShare = () => {
    const content = generatePdfContent();
    const subject = encodeURIComponent(`Manufacturing Brief: ${brief?.briefTitle || "Product Development"}`);
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{brief.briefTitle}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">{brief.executiveSummary}</p>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPdf}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEmailShare}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={clearBrief}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Market Opportunity */}
            <div className={cn("p-3 rounded-lg", urgency.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <UrgencyIcon className={cn("h-4 w-4", urgency.color)} />
                <span className="text-xs font-medium">Market Opportunity</span>
                <Badge variant="outline" className={cn("text-[10px] ml-auto", urgency.color)}>
                  {brief.marketOpportunity.urgencyLevel.toUpperCase()} URGENCY
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <p className="font-medium">{brief.marketOpportunity.targetDemographic}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Projected Margin:</span>
                  <p className="font-medium text-signal-rising">{brief.marketOpportunity.projectedMargin}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-muted-foreground">Demand Signals:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brief.marketOpportunity.demandSignals.map((signal, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      <TrendingUp className="h-2 w-2 mr-1" />
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Product Recommendations */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Product Recommendations ({brief.productRecommendations.length})
              </h4>
              <div className="space-y-3">
                {brief.productRecommendations.map((product, index) => (
                  <ProductCard key={index} product={product} index={index} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Design Guidelines */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Design Guidelines
              </h4>
              <p className="text-xs text-muted-foreground mb-2">{brief.designGuidelines.aestheticDirection}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">Must Have:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.designGuidelines.mustHaveElements.map((el, i) => (
                      <Badge key={i} variant="default" className="text-[10px]">
                        <CheckCircle2 className="h-2 w-2 mr-1" />
                        {el}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Avoid:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.designGuidelines.avoidElements.map((el, i) => (
                      <Badge key={i} variant="destructive" className="text-[10px]">
                        <XCircle className="h-2 w-2 mr-1" />
                        {el}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="p-3 rounded-lg bg-secondary/50">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Timeline Recommendation
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Launch Window:</span>
                  <p className="font-medium">{brief.timelineRecommendation.idealLaunchWindow}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trend Longevity:</span>
                  <p className="font-medium">{brief.timelineRecommendation.trendLongevity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seasonality:</span>
                  <p className="font-medium">{brief.timelineRecommendation.seasonality}</p>
                </div>
              </div>
            </div>

            {/* Production Notes */}
            <div className="text-xs text-muted-foreground">
              <p><strong>Manufacturers:</strong> {brief.productionNotes.recommendedManufacturers}</p>
              <p><strong>Sustainability:</strong> {brief.productionNotes.sustainabilityConsiderations}</p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
