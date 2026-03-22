import { useMemo } from "react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
  image?: string;
}

interface TrendData {
  id: string;
  name: string;
  keywords?: string[];
  colors?: string[];
  categories?: string[];
}

// Keyword mappings for common fashion/lifestyle trends
const trendKeywordMappings: Record<string, { keywords: string[]; categories: string[]; colors: string[] }> = {
  "Quiet Luxury": {
    keywords: ["cashmere", "silk", "wool", "leather", "minimalist", "neutral", "timeless", "elegant", "understated", "quality", "premium", "refined"],
    categories: ["Knitwear", "Bags", "Jewelry", "Accessories", "Outerwear"],
    colors: ["beige", "cream", "camel", "black", "white", "navy", "grey", "taupe"],
  },
  "Office Siren": {
    keywords: ["pencil", "blazer", "heels", "button", "blouse", "skirt", "fitted", "tailored", "professional", "sleek", "power"],
    categories: ["Tops", "Bottoms", "Footwear", "Dresses", "Suits"],
    colors: ["black", "red", "burgundy", "navy", "white"],
  },
  "Mob Wife Aesthetic": {
    keywords: ["fur", "gold", "leopard", "velvet", "leather", "chain", "bold", "statement", "luxe", "dramatic", "opulent"],
    categories: ["Jewelry", "Outerwear", "Bags", "Accessories"],
    colors: ["gold", "black", "leopard", "red", "brown"],
  },
  "Clean Girl": {
    keywords: ["minimal", "natural", "fresh", "basic", "simple", "sleek", "effortless", "neutral", "cotton", "linen"],
    categories: ["Tops", "Basics", "Skincare", "Accessories"],
    colors: ["white", "beige", "cream", "nude", "tan"],
  },
  "Coastal Grandmother": {
    keywords: ["linen", "cotton", "knit", "sweater", "cable", "striped", "nautical", "relaxed", "comfortable", "cozy", "soft"],
    categories: ["Knitwear", "Tops", "Accessories", "Footwear"],
    colors: ["white", "cream", "blue", "navy", "sand", "beige"],
  },
};

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate color distance using CIE76 Delta E approximation
function colorDistance(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const rMean = (color1.r + color2.r) / 2;
  const dR = color1.r - color2.r;
  const dG = color1.g - color2.g;
  const dB = color1.b - color2.b;
  
  // Weighted Euclidean distance (accounts for human color perception)
  const weightR = 2 + rMean / 256;
  const weightG = 4;
  const weightB = 2 + (255 - rMean) / 256;
  
  return Math.sqrt(weightR * dR * dR + weightG * dG * dG + weightB * dB * dB);
}

// Named colors to hex mapping for better color matching
const namedColorsToHex: Record<string, string> = {
  beige: "#F5F5DC", cream: "#FFFDD0", camel: "#C19A6B", black: "#000000",
  white: "#FFFFFF", navy: "#000080", grey: "#808080", gray: "#808080",
  taupe: "#483C32", red: "#FF0000", burgundy: "#800020", gold: "#FFD700",
  leopard: "#C19A6B", brown: "#8B4513", nude: "#E3BC9A", tan: "#D2B48C",
  blue: "#0000FF", sand: "#C2B280", pink: "#FFC0CB", coral: "#FF7F50",
  orange: "#FFA500", yellow: "#FFFF00", green: "#008000", purple: "#800080",
  lavender: "#E6E6FA", mint: "#98FF98", olive: "#808000", maroon: "#800000",
};

// Calculate visual color match score between product colors and trend colors
function calculateColorMatchScore(
  productHexColors: string[] = [],
  trendColors: string[] = [],
  trendColorHexes: string[] = []
): number {
  if (productHexColors.length === 0) return 0;
  
  // Convert trend colors to hex if they're named colors
  const trendHexes = [
    ...trendColorHexes,
    ...trendColors.map(c => namedColorsToHex[c.toLowerCase()] || null).filter(Boolean) as string[]
  ];
  
  if (trendHexes.length === 0) return 0;
  
  let totalMatchScore = 0;
  let matchCount = 0;
  
  for (const productHex of productHexColors) {
    const productRgb = hexToRgb(productHex);
    if (!productRgb) continue;
    
    let bestMatch = 0;
    for (const trendHex of trendHexes) {
      const trendRgb = hexToRgb(trendHex);
      if (!trendRgb) continue;
      
      const distance = colorDistance(productRgb, trendRgb);
      // Max distance is approximately 765 for opposite colors
      // Score inversely proportional to distance
      const matchScore = Math.max(0, 100 - (distance / 7.65));
      bestMatch = Math.max(bestMatch, matchScore);
    }
    
    totalMatchScore += bestMatch;
    matchCount++;
  }
  
  return matchCount > 0 ? Math.round(totalMatchScore / matchCount) : 0;
}

function calculateMatchScore(item: InventoryItem, trend: TrendData, visualColorScore?: number): number {
  const trendName = trend.name;
  const mapping = trendKeywordMappings[trendName];
  
  // Use trend's own data if mapping doesn't exist
  const keywords = mapping?.keywords || trend.keywords || [];
  const categories = mapping?.categories || trend.categories || [];
  const colors = mapping?.colors || trend.colors || [];
  
  if (keywords.length === 0 && categories.length === 0 && colors.length === 0) {
    return Math.floor(Math.random() * 30) + 20; // Low random score for unknown trends
  }
  
  let score = 0;
  const itemNameLower = item.name.toLowerCase();
  const itemCategoryLower = item.category.toLowerCase();
  
  // Keyword matching with TF-IDF inspired weighting (up to 40 points)
  const keywordMatches = keywords.filter(kw => itemNameLower.includes(kw.toLowerCase()));
  const keywordScore = Math.min(keywordMatches.length * 12, 40);
  score += keywordScore;
  
  // Category matching (up to 25 points)
  const categoryMatch = categories.some(cat => 
    itemCategoryLower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(itemCategoryLower)
  );
  if (categoryMatch) {
    score += 25;
  }
  
  // Named color matching from product name (up to 15 points)
  const colorMatches = colors.filter(color => itemNameLower.includes(color.toLowerCase()));
  score += Math.min(colorMatches.length * 8, 15);
  
  // Visual color analysis score bonus (up to 20 points)
  if (visualColorScore && visualColorScore > 0) {
    score += Math.round(visualColorScore * 0.2);
  }
  
  // Normalize to 0-100
  return Math.min(Math.max(score, 10), 100);
}

export function useTrendProductMatching(
  inventory: InventoryItem[],
  selectedTrend: TrendData | null,
  visualScores: Record<string, number> = {},
  productHexColors: Record<string, string[]> = {}
) {
  const matchedProducts = useMemo(() => {
    if (!selectedTrend || !inventory.length) {
      return inventory.map(item => ({ 
        ...item, 
        matchScore: 50,
        keywordScore: 50,
        visualScore: visualScores[item.id] || 0,
        colorMatchScore: 0,
        hasVisualScore: !!visualScores[item.id]
      }));
    }

    // Extract trend colors for visual matching
    const trendColors = selectedTrend.colors || 
      trendKeywordMappings[selectedTrend.name]?.colors || [];
    
    return inventory
      .map(item => {
        const visualScore = visualScores[item.id] || 0;
        const hasVisualScore = !!visualScores[item.id];
        
        // Calculate color match score if product has hex colors from visual analysis
        const itemHexColors = productHexColors[item.id] || [];
        const colorMatchScore = calculateColorMatchScore(itemHexColors, trendColors, []);
        
        // Calculate keyword score with visual color score boost
        const keywordScore = calculateMatchScore(item, selectedTrend, colorMatchScore);
        
        // Combined score: 50% keyword, 30% visual AI, 20% color match
        let combinedScore = keywordScore;
        if (hasVisualScore || colorMatchScore > 0) {
          combinedScore = Math.round(
            keywordScore * 0.5 + 
            visualScore * 0.3 + 
            colorMatchScore * 0.2
          );
        }
        
        return {
          ...item,
          matchScore: combinedScore,
          keywordScore,
          visualScore,
          colorMatchScore,
          hasVisualScore
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [inventory, selectedTrend, visualScores, productHexColors]);
  
  const topMatches = useMemo(() => {
    return matchedProducts.filter(p => p.matchScore >= 70);
  }, [matchedProducts]);
  
  const suggestedBundles = useMemo(() => {
    if (!selectedTrend || topMatches.length < 2) return [];
    
    const trendName = selectedTrend.name;
    const bundleItems = topMatches.slice(0, 3);
    
    if (bundleItems.length < 2) return [];
    
    const totalPrice = bundleItems.reduce((sum, item) => sum + item.price, 0);
    const discountRate = 0.15; // 15% bundle discount
    const bundlePrice = Math.round(totalPrice * (1 - discountRate));
    
    // Estimate projected revenue based on match scores
    const avgMatchScore = bundleItems.reduce((sum, item) => sum + item.matchScore, 0) / bundleItems.length;
    const baseRevenue = 50000; // Base projected revenue
    const projectedRevenue = Math.round(baseRevenue * (avgMatchScore / 100) * (bundleItems.length / 2));
    
    return [{
      trendName,
      items: bundleItems.map(item => ({
        name: item.name,
        price: item.price,
        matchScore: item.matchScore,
      })),
      totalPrice,
      bundlePrice,
      projectedRevenue: `$${(projectedRevenue / 1000).toFixed(0)}K`,
      confidence: Math.round(avgMatchScore),
    }];
  }, [selectedTrend, topMatches]);
  
  return {
    matchedProducts,
    topMatches,
    suggestedBundles,
    matchCount: topMatches.length,
  };
}

export function extractTrendKeywords(trendName: string): string[] {
  const mapping = trendKeywordMappings[trendName];
  return mapping?.keywords || [];
}

export function getTrendCategories(trendName: string): string[] {
  const mapping = trendKeywordMappings[trendName];
  return mapping?.categories || [];
}

export { calculateColorMatchScore };
