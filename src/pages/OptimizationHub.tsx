import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutomatedOptimization } from "@/hooks/useAutomatedOptimization";
import { 
  Sparkles, DollarSign, Clock, Loader2, Copy, Check, 
  TrendingUp, Target, Zap, Calendar, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const OptimizationHub = () => {
  const [activeTab, setActiveTab] = useState("ab-variants");
  const [copied, setCopied] = useState<string | null>(null);
  
  // A/B Variants state
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Pricing state
  const [productName, setProductName] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  
  // Timing state
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("post");
  
  const { 
    isLoading, 
    abVariants, 
    pricingResult, 
    timingResult,
    generateABVariants,
    calculateDynamicPricing,
    predictOptimalTiming
  } = useAutomatedOptimization();

  const handleGenerateVariants = async () => {
    if (!headline) {
      toast.error("Enter a headline to generate variants");
      return;
    }
    await generateABVariants(
      { headline, body, cta },
      undefined,
      targetAudience || undefined,
      3
    );
  };

  const handleCalculatePricing = async () => {
    if (!productName || !currentPrice) {
      toast.error("Enter product name and current price");
      return;
    }
    await calculateDynamicPricing(
      { name: productName, currentPrice: parseFloat(currentPrice), cost: productCost ? parseFloat(productCost) : undefined },
      { searchTrend: "rising", socialMentions: 500, trafficTrend: "increasing" }
    );
  };

  const handlePredictTiming = async () => {
    await predictOptimalTiming(platform, targetAudience || undefined, contentType);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Optimization Hub"
        description="AI-powered creative optimization • A/B testing • Dynamic pricing • Timing intelligence"
        badge={<Badge variant="secondary" className="bg-primary/10 text-primary">AI Powered</Badge>}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="ab-variants" className="gap-2">
            <Sparkles className="h-4 w-4" />
            A/B Variants
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-2">
            <Clock className="h-4 w-4" />
            Timing
          </TabsTrigger>
        </TabsList>

        {/* A/B Variants Tab */}
        <TabsContent value="ab-variants" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Original Creative
                </CardTitle>
                <CardDescription>Enter your creative to generate optimized variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Headline</label>
                  <Input 
                    value={headline} 
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Your attention-grabbing headline..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Body Copy</label>
                  <Textarea 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Main message or description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Call to Action</label>
                  <Input 
                    value={cta} 
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="e.g., Shop Now, Learn More..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Audience (optional)</label>
                  <Input 
                    value={targetAudience} 
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals, Fashion enthusiasts..."
                  />
                </div>
                <Button 
                  variant="gradient" 
                  className="w-full gap-2" 
                  onClick={handleGenerateVariants}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Smart Variants
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI-Generated Variants
                </CardTitle>
                <CardDescription>
                  {abVariants ? `${abVariants.variants.length} variants generated` : "Variants will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!abVariants && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Enter your creative and click generate</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {abVariants && (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {abVariants.variants.map((variant, i) => (
                      <div key={variant.id} className="p-4 rounded-xl bg-muted/50 border border-border/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{variant.name}</Badge>
                          <Badge className="bg-green-500/10 text-green-600">+{variant.predictedLift}% lift</Badge>
                        </div>
                        <p className="font-semibold text-sm">{variant.headline}</p>
                        <p className="text-xs text-muted-foreground">{variant.body}</p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{variant.cta}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(`${variant.headline}\n\n${variant.body}\n\n${variant.cta}`, variant.id)}
                          >
                            {copied === variant.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {abVariants.testingStrategy && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
                        <p className="font-medium text-primary">Testing Strategy</p>
                        <p>Duration: {abVariants.testingStrategy.recommendedDuration}</p>
                        <p>Sample Size: {abVariants.testingStrategy.minimumSampleSize.toLocaleString()}</p>
                        <p>Primary Metric: {abVariants.testingStrategy.primaryMetric}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Product Pricing
                </CardTitle>
                <CardDescription>Get AI-powered price recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Product Name</label>
                  <Input 
                    value={productName} 
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Premium Skincare Set..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Price ($)</label>
                  <Input 
                    type="number"
                    value={currentPrice} 
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Product Cost (optional)</label>
                  <Input 
                    type="number"
                    value={productCost} 
                    onChange={(e) => setProductCost(e.target.value)}
                    placeholder="20.00"
                  />
                </div>
                <Button 
                  variant="gradient" 
                  className="w-full gap-2" 
                  onClick={handleCalculatePricing}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Calculate Optimal Price
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Price Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!pricingResult && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Enter product details to get pricing insights</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {pricingResult && (
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Recommended Price</p>
                      <p className="text-4xl font-bold text-primary">${pricingResult.recommendedPrice.toFixed(2)}</p>
                      <p className="text-xs mt-1">
                        Range: ${pricingResult.priceRange.floor.toFixed(2)} - ${pricingResult.priceRange.ceiling.toFixed(2)}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className={`font-semibold ${pricingResult.projectedImpact.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pricingResult.projectedImpact.revenueChange >= 0 ? '+' : ''}{pricingResult.projectedImpact.revenueChange}%
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className={`font-semibold ${pricingResult.projectedImpact.marginChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pricingResult.projectedImpact.marginChange >= 0 ? '+' : ''}{pricingResult.projectedImpact.marginChange}%
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Volume</p>
                        <p className={`font-semibold ${pricingResult.projectedImpact.volumeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pricingResult.projectedImpact.volumeChange >= 0 ? '+' : ''}{pricingResult.projectedImpact.volumeChange}%
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 text-sm">
                      <p className="font-medium mb-1">Strategy: {pricingResult.strategy}</p>
                      <p className="text-xs text-muted-foreground">{pricingResult.reasoning}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Timing Preferences
                </CardTitle>
                <CardDescription>Find the best times to post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Platform</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card/80 border border-border/40 text-sm"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content Type</label>
                  <select 
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card/80 border border-border/40 text-sm"
                  >
                    <option value="post">Feed Post</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel/Short Video</option>
                    <option value="ad">Paid Ad</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Audience (optional)</label>
                  <Input 
                    value={targetAudience} 
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., US-based millennials..."
                  />
                </div>
                <Button 
                  variant="gradient" 
                  className="w-full gap-2" 
                  onClick={handlePredictTiming}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Predict Optimal Times
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Optimal Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!timingResult && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select platform and content type to get timing recommendations</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {timingResult && (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {timingResult.recommendations.map((rec, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{rec.platform}</Badge>
                          {rec.peakWindow && (
                            <span className="text-xs text-muted-foreground">
                              Peak: {rec.peakWindow.start} - {rec.peakWindow.end}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {rec.optimalTimes.slice(0, 4).map((time, j) => (
                            <div key={j} className="p-2 rounded-lg bg-muted/50 text-center">
                              <p className="font-medium text-sm">{time.day}</p>
                              <p className="text-primary font-semibold">{time.time}</p>
                              <p className="text-xs text-muted-foreground">{time.engagementPrediction}% engagement</p>
                            </div>
                          ))}
                        </div>
                        {rec.avoidTimes?.length > 0 && (
                          <div className="p-2 rounded-lg bg-destructive/10 text-xs">
                            <p className="font-medium text-destructive">Avoid:</p>
                            {rec.avoidTimes.slice(0, 2).map((avoid, k) => (
                              <p key={k}>{avoid.day} {avoid.time} - {avoid.reason}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {timingResult.insights?.length > 0 && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
                        <p className="font-medium text-primary">Insights</p>
                        {timingResult.insights.filter(i => i.actionable).slice(0, 3).map((insight, i) => (
                          <p key={i}>• {insight.insight}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default OptimizationHub;
