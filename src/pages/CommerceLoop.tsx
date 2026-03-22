import { useState, useCallback, useEffect, useMemo } from "react";
import { PageContainer, TabNavigation, SearchFilterBar, ApiStatusIndicator, LoadingCards, EmptyState } from "@/components/shared";
import { GlassBoxAssistant, NotificationCenter } from "@/components/shared";
import { SectionHeader } from "@/components/ui/section-header";
import { TrendSelector, Trend } from "@/components/commerce/TrendSelector";
import { InventoryMatchCard } from "@/components/commerce/InventoryMatchCard";
import { BundleSuggestion } from "@/components/commerce/BundleSuggestion";
import { GapAnalysisPanel, GapItem } from "@/components/commerce/GapAnalysisPanel";
import { InventoryHealth } from "@/components/commerce/InventoryHealth";
import { ManufacturingBriefPanel } from "@/components/commerce/ManufacturingBriefPanel";
import { MarketProductCard } from "@/components/commerce/MarketProductCard";
import { SavedTrendCard } from "@/components/commerce/SavedTrendCard";
import { DemandInsightsWidget } from "@/components/commerce/DemandInsightsWidget";
import { MarketGapsWidget } from "@/components/commerce/MarketGapsWidget";
import { CampaignDeployWizard } from "@/components/deployment/CampaignDeployWizard";
import { UserMenu } from "@/components/layout/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRainforestProducts } from "@/hooks/useRainforestProducts";
import { useTrendProductMatching } from "@/hooks/useTrendProductMatching";
import { useOrganization } from "@/hooks/useOrganization";
import { useSavedTrends } from "@/hooks/useSavedTrends";
import { useProductImageAnalysis } from "@/hooks/useProductImageAnalysis";
import { useVisualAnalysisCache } from "@/hooks/useVisualAnalysisCache";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Loader2, Zap, Eye, Rocket, BookmarkCheck, Package, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AmazonProduct {
  asin: string;
  title: string;
  link: string;
  image: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsTotal?: number;
  isPrime?: boolean;
  isBestSeller?: boolean;
  rank?: number;
}

const CommerceLoop = () => {
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [selectedTrendData, setSelectedTrendData] = useState<Trend | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [amazonProducts, setAmazonProducts] = useState<AmazonProduct[]>([]);
  const [loadingAmazon, setLoadingAmazon] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "market" | "saved">("inventory");
  const [deployWizardOpen, setDeployWizardOpen] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});

  const { searchProducts, fetchBestSellers, apiUnavailable: rainforestUnavailable } = useRainforestProducts();
  const { organization, loading: loadingOrg } = useOrganization();
  const { savedTrends, loading: loadingSavedTrends } = useSavedTrends();
  const { analyzeProductImage, isAnalyzing } = useProductImageAnalysis();
  const { visualScores, saveAnalysis, loading: loadingCache } = useVisualAnalysisCache();
  const { trackPageView, trackFeatureUse } = useUsageTracking();

  useEffect(() => {
    trackPageView("commerce_loop");
  }, []);

  // Transform organization products to inventory items format
  // Now uses real data from enhanced Firecrawl scanning
  const inventoryItems = useMemo(() => {
    if (!organization?.products || organization.products.length === 0) {
      return [];
    }
    return organization.products.map((product, index) => ({
      id: `org-${index}`,
      name: product.name,
      sku: product.sku || `SKU-${String(index + 1).padStart(3, '0')}`,
      stock: product.stockQuantity ?? (product.inStock ? 10 : 0),
      price: product.price ?? 0,
      category: product.category,
      image: product.image,
    }));
  }, [organization?.products]);

  // Convert cached visual scores to simple number map
  const visualScoreNumbers = useMemo(() => {
    const scores: Record<string, number> = {};
    Object.entries(visualScores).forEach(([id, data]) => {
      scores[id] = data.colorMatchScore;
    });
    return scores;
  }, [visualScores]);
  
  const { matchedProducts, topMatches, suggestedBundles, matchCount } = useTrendProductMatching(
    inventoryItems,
    selectedTrendData,
    visualScoreNumbers
  );

  const currentRanks = useMemo(() => {
    const ranks: Record<string, number> = {};
    matchedProducts.forEach((product, index) => {
      ranks[product.id] = index + 1;
    });
    return ranks;
  }, [matchedProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousRanks(currentRanks);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentRanks]);

  const handleTrendSelect = (id: string, trend: Trend) => {
    setSelectedTrendId(id);
    setSelectedTrendData(trend);
    toast.success(`Matched products to "${trend.name}" trend`);
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredProducts = matchedProducts.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchMarket = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search term to find market products");
      return;
    }
    
    setLoadingAmazon(true);
    try {
      const result = await searchProducts(searchQuery);
      if (result?.data) {
        setAmazonProducts(result.data);
        setActiveTab("market");
        toast.success(`Found ${result.data.length} products on Amazon`);
      }
    } catch (err) {
      toast.error("Failed to search market products");
    } finally {
      setLoadingAmazon(false);
    }
  };

  const handleFetchBestSellers = async (category = "beauty") => {
    setLoadingAmazon(true);
    try {
      const categoryIds: Record<string, string> = {
        beauty: "3760911",
        fashion: "7141123011",
        jewelry: "7192394011",
      };
      
      const result = await fetchBestSellers(categoryIds[category] || "3760911");
      if (result?.data) {
        setAmazonProducts(result.data);
        setActiveTab("market");
        toast.success(`Loaded ${result.data.length} best sellers`);
      }
    } catch (err) {
      toast.error("Failed to fetch best sellers");
    } finally {
      setLoadingAmazon(false);
    }
  };

  const handleAnalyzeAll = useCallback(async () => {
    if (!selectedTrendData?.colors) {
      toast.error("Select a trend first");
      return;
    }

    const productsWithImages = inventoryItems.filter(item => item.image);
    if (productsWithImages.length === 0) {
      toast.error("No products with images to analyze");
      return;
    }

    setIsAnalyzingAll(true);
    toast.info(`Analyzing ${productsWithImages.length} products...`);

    let analyzedCount = 0;
    
    for (let i = 0; i < productsWithImages.length; i += 2) {
      const batch = productsWithImages.slice(i, i + 2);
      await Promise.all(
        batch.map(async (product) => {
          try {
            const result = await analyzeProductImage(product.image!, selectedTrendData.colors);
            if (result) {
              await saveAnalysis(product.id, product.image!, {
                colorMatchScore: result.colorMatchScore,
                dominantColors: result.dominantColors,
                colorHexCodes: result.colorHexCodes,
                patterns: result.patterns,
                aestheticStyle: result.aestheticStyle,
                luxuryScore: result.luxuryScore,
              }, selectedTrendData.colors);
              analyzedCount++;
            }
          } catch (err) {
            console.error(`Failed to analyze ${product.name}:`, err);
          }
        })
      );
    }

    setIsAnalyzingAll(false);
    toast.success(`Analyzed ${analyzedCount} products with AI vision`);
  }, [selectedTrendData, inventoryItems, analyzeProductImage, saveAnalysis]);

  const handleSelectSavedTrend = (savedTrend: typeof savedTrends[0]) => {
    const customTrend: Trend = {
      id: savedTrend.id,
      name: savedTrend.trend_name,
      signal: savedTrend.velocity === "Accelerating" ? "hot" : savedTrend.velocity === "Rising" ? "rising" : "warm",
      matchedSkus: 0,
      keywords: [],
      colors: []
    };
    setSelectedTrendId(customTrend.id);
    setSelectedTrendData(customTrend);
    toast.success(`Loaded saved trend: ${savedTrend.trend_name}`);
    setActiveTab("inventory");
  };

  // Derive inventory health from matched products
  const inventoryHealthData = useMemo(() => {
    if (inventoryItems.length === 0) return undefined;
    
    const totalSkus = inventoryItems.length;
    const matchedCount = matchedProducts.filter(p => (p.matchScore || 0) >= 70).length;
    const partialCount = matchedProducts.filter(p => (p.matchScore || 0) >= 40 && (p.matchScore || 0) < 70).length;
    const unmatchedCount = totalSkus - matchedCount - partialCount;
    
    return {
      matched: totalSkus > 0 ? Math.round((matchedCount / totalSkus) * 100) : 0,
      partial: totalSkus > 0 ? Math.round((partialCount / totalSkus) * 100) : 0,
      unmatched: totalSkus > 0 ? Math.round((unmatchedCount / totalSkus) * 100) : 0,
      totalSkus,
      trendAlignedSkus: matchedCount + partialCount,
    };
  }, [inventoryItems, matchedProducts]);

  // Derive gap analysis from trend and inventory
  const gapAnalysisData = useMemo((): GapItem[] => {
    if (!selectedTrendData) return [];
    
    // Find categories in trend keywords that don't have matching inventory
    const trendKeywords = selectedTrendData.keywords || [];
    const inventoryCategories = new Set(inventoryItems.map(i => i.category?.toLowerCase()));
    
    const gaps: GapItem[] = [];
    
    trendKeywords.forEach((keyword, index) => {
      const keywordLower = keyword.toLowerCase();
      const hasMatch = Array.from(inventoryCategories).some(cat => 
        cat?.includes(keywordLower) || keywordLower.includes(cat || '')
      );
      
      if (!hasMatch && keyword.length > 2) {
        gaps.push({
          id: `gap-${index}`,
          trendName: selectedTrendData.name,
          missingCategory: keyword,
          marketDemand: "TBD",
          competitorCount: 0,
          urgency: index < 2 ? "high" : index < 4 ? "medium" : "low",
          suggestedProducts: [`${keyword} Item 1`, `${keyword} Item 2`],
        });
      }
    });
    
    return gaps.slice(0, 5);
  }, [selectedTrendData, inventoryItems]);

  const displayBundles = suggestedBundles.length > 0 ? suggestedBundles : [];

  const tabs = [
    { id: "inventory", label: "Matched Inventory", count: filteredProducts.length },
    { id: "market", label: "Market Products", count: amazonProducts.length },
    { id: "saved", label: "Saved Trends", count: savedTrends.length, icon: <BookmarkCheck className="h-3 w-3" /> },
  ];

  const tabActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleAnalyzeAll}
        disabled={isAnalyzingAll || !selectedTrendData}
      >
        {isAnalyzingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
        Analyze All
      </Button>
      <Button
        variant="gradient"
        size="sm"
        className="gap-2"
        onClick={() => setDeployWizardOpen(true)}
        disabled={!selectedTrendData}
      >
        <Rocket className="h-4 w-4" />
        Deploy Campaign
      </Button>
    </>
  );

  return (
    <PageContainer>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Commerce Loop
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered trend-to-inventory matching • Market intelligence via Rainforest API
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ApiStatusIndicator 
              apis={[
                { name: "Rainforest API", available: !rainforestUnavailable, icon: "🛒" },
                { name: "AI Vision", available: true, icon: "👁️" },
              ]} 
            />
            <Button 
              variant="glass" 
              size="sm" 
              className="gap-2"
              onClick={() => handleFetchBestSellers("beauty")}
              disabled={loadingAmazon}
            >
              {loadingAmazon ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Best Sellers
            </Button>
            <Button variant="glass" size="sm" className="gap-2">
              <Package className="h-4 w-4" />
              Sync Inventory
            </Button>
            <Button variant="gradient" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Auto-Generate Bundles
            </Button>
            <NotificationCenter />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Trend Selector */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-4 mb-2">
          <TrendSelector selectedTrend={selectedTrendId} onSelect={handleTrendSelect} />
          {selectedTrendData && (
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
              <Zap className="h-3 w-3" />
              {matchCount} high matches
            </Badge>
          )}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter */}
          <SearchFilterBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearchMarket}
            placeholder="Search SKUs, product names, or market keywords..."
            isSearching={loadingAmazon}
            searchButtonLabel="Search Market"
          />

          {/* Tab Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as "inventory" | "market" | "saved")}
            actions={tabActions}
          />

          {/* Inventory Grid */}
          {activeTab === "inventory" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-bold text-xl">Matched Inventory</h2>
                  {selectedTrendData && (
                    <span className="text-sm text-muted-foreground">
                      Sorted by match score for "{selectedTrendData.name}"
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} items selected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingOrg || isAnalyzingAll || loadingCache ? (
                  <LoadingCards count={4} columns={2} />
                ) : filteredProducts.length === 0 ? null : (
                  filteredProducts.map((item, index) => (
                    <InventoryMatchCard
                      key={item.id}
                      item={item}
                      selected={selectedItems.includes(item.id)}
                      onSelect={() => toggleItem(item.id)}
                      delay={index * 50}
                      trendColors={selectedTrendData?.colors}
                      currentRank={currentRanks[item.id] || 0}
                      previousRank={previousRanks[item.id] || 0}
                      onVisualScoreUpdate={async (id, score, fullAnalysis) => {
                        const product = inventoryItems.find(p => p.id === id);
                        if (product?.image && selectedTrendData?.colors) {
                          await saveAnalysis(id, product.image, {
                            colorMatchScore: score,
                            dominantColors: fullAnalysis?.dominantColors || [],
                            colorHexCodes: fullAnalysis?.colorHexCodes || [],
                            patterns: fullAnalysis?.patterns || [],
                            aestheticStyle: fullAnalysis?.aestheticStyle || "",
                            luxuryScore: fullAnalysis?.luxuryScore || 0,
                          }, selectedTrendData.colors);
                        }
                      }}
                    />
                  ))
                )}
              </div>
              {filteredProducts.length === 0 && !loadingOrg && !isAnalyzingAll && !loadingCache && (
                <EmptyState
                  icon={Package}
                  title="No products in inventory"
                  description="Products from your organization will appear here. Connect your store or add products to get started."
                />
              )}
            </div>
          )}

          {/* Market Products */}
          {activeTab === "market" && (
            <div>
              <SectionHeader
                title="Market Products"
                subtitle={loadingAmazon ? "Searching..." : `${amazonProducts.length} products from Amazon`}
              />
              {loadingAmazon ? (
                <LoadingCards count={4} columns={2} />
              ) : amazonProducts.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Search for market products"
                  description="Enter a search term above or click 'Best Sellers' to find trending products on Amazon."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amazonProducts.map((product, index) => (
                    <MarketProductCard 
                      key={product.asin} 
                      product={product} 
                      delay={index * 50}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Trends */}
          {activeTab === "saved" && (
            <div>
              <SectionHeader
                title="Saved Trends"
                subtitle="Trends you've saved from Signal Intelligence"
              />
              {loadingSavedTrends ? (
                <LoadingCards count={2} columns={2} />
              ) : savedTrends.length === 0 ? (
                <EmptyState
                  icon={BookmarkCheck}
                  title="No saved trends"
                  description="Save trends from Signal Intelligence to match them with your inventory here."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTrends.map((trend, index) => (
                    <SavedTrendCard
                      key={trend.id}
                      trend={trend}
                      onClick={() => handleSelectSavedTrend(trend)}
                      delay={index * 50}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Intelligence Panels */}
        <div className="space-y-6">
          {displayBundles.length > 0 ? (
            displayBundles.map((bundle, index) => (
              <BundleSuggestion
                key={index}
                trendName={bundle.trendName}
                items={bundle.items}
                totalPrice={bundle.totalPrice}
                bundlePrice={bundle.bundlePrice}
                projectedRevenue={bundle.projectedRevenue}
                confidence={bundle.confidence}
                delay={index * 100}
              />
            ))
          ) : (
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-lg">Bundle Suggestions</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No bundles yet</p>
                <p className="text-xs text-muted-foreground/70">Select a trend to generate AI bundle suggestions</p>
              </div>
            </div>
          )}
          <GapAnalysisPanel 
            gaps={gapAnalysisData} 
            loading={loadingOrg}
          />
          <DemandInsightsWidget 
            trendName={selectedTrendData?.name}
            inventoryCount={inventoryItems.length}
            matchedProducts={matchCount}
          />
          <MarketGapsWidget industry="beauty" />
          <InventoryHealth 
            data={inventoryHealthData} 
            loading={loadingOrg || loadingCache}
          />
          <ManufacturingBriefPanel
            trendName={selectedTrendData?.name || ""}
            trendKeywords={selectedTrendData?.keywords}
            trendColors={selectedTrendData?.colors}
          />
        </div>
      </div>

      {/* Campaign Deploy Wizard */}
      <CampaignDeployWizard
        open={deployWizardOpen}
        onOpenChange={setDeployWizardOpen}
        campaignName={selectedTrendData?.name || "New Campaign"}
      />

      {/* Glass Box Assistant */}
      <GlassBoxAssistant />
    </PageContainer>
  );
};

export default CommerceLoop;
