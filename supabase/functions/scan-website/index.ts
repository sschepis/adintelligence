import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  name: string;
  category: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  description?: string;
  image?: string;
  images?: string[];
  sku?: string;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  variants?: string[];
  tags?: string[];
  url?: string;
}

interface BrandVoice {
  toneSpectrum: {
    formal: number;
    casual: number;
    professional: number;
    friendly: number;
    authoritative: number;
    playful: number;
  };
  vocabulary: {
    preferred: string[];
    avoided: string[];
  };
  emotionalSignature: string[];
  communicationPatterns: string[];
  sentenceStyle: string;
}

interface BrandPersonality {
  archetype: string | null;
  secondaryArchetype: string | null;
  traits: string[];
  values: string[];
  emotionalTone: string | null;
}

interface BrandStory {
  mission: string | null;
  vision: string | null;
  tagline: string | null;
  origin: string | null;
  enemyStatement: string | null;
  transformationPromise: string | null;
}

interface BrandGuardrails {
  forbiddenWords: string[];
  avoidTopics: string[];
  toneAvoid: string[];
  visualAvoid: string[];
  competitorMentions: boolean;
  enabled: boolean;
}

interface BrandDNA {
  voice: BrandVoice;
  personality: BrandPersonality;
  story: BrandStory;
  guardrails: BrandGuardrails;
}

interface ScanResult {
  success: boolean;
  isBrand: boolean;
  brandName: string;
  confidence: number;
  reason: string;
  branding: {
    logo: string | null;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    colorScheme: string;
  };
  taxonomy: string[];
  products: ProductData[];
  brandDNA: BrandDNA;
  metadata: {
    title: string | null;
    description: string | null;
    url: string;
    productCount?: number;
    pagesScanned?: number;
  };
  error?: string;
}

// Helper to extract product URLs from links
function findProductUrls(links: string[], baseUrl: string): string[] {
  const productPatterns = [
    /\/product[s]?\//i,
    /\/shop\//i,
    /\/item[s]?\//i,
    /\/p\//i,
    /\/pd\//i,
    /\/buy\//i,
    /\/collection[s]?\/.+\/.+/i,
    /\/catalog\/.+\/.+/i,
    /-p-\d+/i,
    /\/dp\//i, // Amazon-style
    /\?product=/i,
    /product_id=/i,
  ];
  
  const excludePatterns = [
    /\/cart/i,
    /\/checkout/i,
    /\/login/i,
    /\/account/i,
    /\/wishlist/i,
    /\/search/i,
    /\.(jpg|jpeg|png|gif|webp|svg|css|js)$/i,
  ];
  
  const productUrls: string[] = [];
  const seen = new Set<string>();
  
  for (const link of links) {
    // Normalize URL
    let fullUrl = link;
    if (link.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        fullUrl = `${base.origin}${link}`;
      } catch {
        continue;
      }
    }
    
    if (seen.has(fullUrl)) continue;
    
    // Check if it matches product patterns
    const isProduct = productPatterns.some(p => p.test(fullUrl));
    const isExcluded = excludePatterns.some(p => p.test(fullUrl));
    
    if (isProduct && !isExcluded) {
      seen.add(fullUrl);
      productUrls.push(fullUrl);
    }
  }
  
  return productUrls.slice(0, 20); // Limit to 20 product pages
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    if (!url) {
      throw new Error("URL is required");
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log(`[SCAN-WEBSITE] Starting comprehensive scan of: ${normalizedUrl}`);

    // Step 1: Get homepage data with branding and links
    console.log('[SCAN-WEBSITE] Step 1: Scraping homepage for branding and links...');
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: normalizedUrl,
        formats: ['branding', 'links', 'markdown'],
        onlyMainContent: false,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('[SCAN-WEBSITE] Firecrawl homepage error:', errorText);
      throw new Error(`Failed to scan website: ${scrapeResponse.status}`);
    }

    const scrapeResult = await scrapeResponse.json();
    console.log('[SCAN-WEBSITE] Homepage scraped successfully');

    if (!scrapeResult.success) {
      throw new Error('Failed to extract homepage data');
    }

    const pageData = scrapeResult.data || scrapeResult;

    // Step 2: Map the website to find more URLs
    console.log('[SCAN-WEBSITE] Step 2: Mapping website for product URLs...');
    let allLinks = pageData.links || [];
    
    try {
      const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          limit: 200,
          includeSubdomains: false,
        }),
      });
      
      if (mapResponse.ok) {
        const mapResult = await mapResponse.json();
        if (mapResult.success && mapResult.links) {
          allLinks = [...new Set([...allLinks, ...mapResult.links])];
          console.log(`[SCAN-WEBSITE] Found ${mapResult.links.length} URLs via map`);
        }
      }
    } catch (mapError) {
      console.warn('[SCAN-WEBSITE] Map failed, continuing with homepage links:', mapError);
    }

    // Step 3: Find product page URLs
    const productUrls = findProductUrls(allLinks, normalizedUrl);
    console.log(`[SCAN-WEBSITE] Found ${productUrls.length} potential product URLs`);

    // Step 4: Scrape individual product pages for detailed data
    const detailedProducts: ProductData[] = [];
    
    if (productUrls.length > 0) {
      console.log('[SCAN-WEBSITE] Step 3: Scraping individual product pages...');
      
      // Scrape up to 10 product pages for detailed info
      const pagesToScrape = productUrls.slice(0, 10);
      
      for (const productUrl of pagesToScrape) {
        try {
          console.log(`[SCAN-WEBSITE] Scraping product: ${productUrl}`);
          
          const productResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: productUrl,
              formats: [
                'markdown',
                { 
                  type: 'json', 
                  schema: {
                    type: 'object',
                    properties: {
                      productName: { type: 'string', description: 'The name/title of the product' },
                      price: { type: 'number', description: 'Current price as a number (without currency symbol)' },
                      currency: { type: 'string', description: 'Currency code (USD, EUR, GBP, etc.)' },
                      originalPrice: { type: 'number', description: 'Original/compare-at price if on sale' },
                      description: { type: 'string', description: 'Full product description' },
                      shortDescription: { type: 'string', description: 'Short/summary description' },
                      images: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'All product image URLs' 
                      },
                      sku: { type: 'string', description: 'Product SKU/ID' },
                      inStock: { type: 'boolean', description: 'Whether product is in stock' },
                      stockQuantity: { type: 'number', description: 'Number of items in stock if shown' },
                      category: { type: 'string', description: 'Product category from breadcrumbs or tags' },
                      categories: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'All category breadcrumbs' 
                      },
                      brand: { type: 'string', description: 'Brand name if different from store' },
                      rating: { type: 'number', description: 'Average rating (0-5 scale)' },
                      reviewCount: { type: 'number', description: 'Number of reviews' },
                      variants: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Available variants (sizes, colors, etc.)' 
                      },
                      tags: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Product tags or keywords' 
                      },
                      materials: { type: 'string', description: 'Materials/ingredients list' },
                      dimensions: { type: 'string', description: 'Product dimensions if physical' },
                      weight: { type: 'string', description: 'Product weight' },
                    },
                  }
                }
              ],
              onlyMainContent: true,
            }),
          });

          if (productResponse.ok) {
            const productResult = await productResponse.json();
            const productData = productResult.data || productResult;
            const extractedJson = productData.json || {};

            if (extractedJson.productName) {
              detailedProducts.push({
                name: extractedJson.productName,
                category: extractedJson.category || extractedJson.categories?.[0] || 'Uncategorized',
                price: extractedJson.price,
                currency: extractedJson.currency || 'USD',
                originalPrice: extractedJson.originalPrice,
                description: extractedJson.shortDescription || extractedJson.description?.substring(0, 500),
                image: extractedJson.images?.[0],
                images: extractedJson.images,
                sku: extractedJson.sku,
                inStock: extractedJson.inStock ?? true,
                stockQuantity: extractedJson.stockQuantity,
                rating: extractedJson.rating,
                reviewCount: extractedJson.reviewCount,
                brand: extractedJson.brand,
                variants: extractedJson.variants,
                tags: extractedJson.tags,
                url: productUrl,
              });
              console.log(`[SCAN-WEBSITE] Extracted product: ${extractedJson.productName}`);
            }
          }
        } catch (productError) {
          console.warn(`[SCAN-WEBSITE] Failed to scrape ${productUrl}:`, productError);
        }
      }
    }

    console.log(`[SCAN-WEBSITE] Extracted ${detailedProducts.length} products with full details`);

    // Step 5: Use AI to analyze the overall website and fill gaps
    console.log('[SCAN-WEBSITE] Step 4: AI analysis for brand and taxonomy...');
    
    const analysisPrompt = `You are an expert e-commerce and brand analyst. Analyze this website data and extract detailed information including brand DNA (voice, personality, story, guardrails).

WEBSITE DATA:
- Title: ${pageData.metadata?.title || 'Unknown'}
- Description: ${pageData.metadata?.description || 'Unknown'}
- Content Preview (first 8000 chars): ${pageData.markdown?.substring(0, 8000) || 'No content'}
- Total URLs found: ${allLinks.length}
- Product URLs found: ${productUrls.length}
- Sample product URLs: ${productUrls.slice(0, 5).join(', ')}

BRANDING DATA FROM SCRAPER:
- Logo: ${pageData.branding?.logo || 'Not found'}
- Primary Color: ${pageData.branding?.colors?.primary || 'Not detected'}
- Secondary Color: ${pageData.branding?.colors?.secondary || 'Not detected'}
- Color Scheme: ${pageData.branding?.colorScheme || 'Unknown'}

PRODUCTS ALREADY EXTRACTED (${detailedProducts.length}):
${detailedProducts.slice(0, 5).map(p => `- ${p.name} (${p.category}) - $${p.price || 'N/A'}`).join('\n')}

INSTRUCTIONS:
1. Determine if this is an e-commerce brand selling products or services
2. Extract the brand name (look for logo text, title, header mentions)
3. Identify ALL product categories/taxonomy from navigation, content, links, and extracted products
4. Find additional products mentioned in the content that weren't captured
5. If branding colors weren't detected, suggest appropriate ones based on the brand aesthetic
6. Rate your confidence 0-100
7. CRITICALLY: Extract the brand's DNA including voice, personality, story, and guardrails

For BRAND VOICE analysis:
- Analyze the writing style (formal vs casual, professional vs friendly)
- Identify preferred vocabulary and phrases
- Note emotional signatures (inspiring, reassuring, exciting, etc.)
- Detect communication patterns (short punchy sentences vs detailed explanations)

For BRAND PERSONALITY analysis:
- Determine the brand archetype (Hero, Sage, Explorer, Creator, Ruler, Caregiver, Magician, Lover, Jester, Everyperson, Innocent, Outlaw)
- Extract core traits and values from the messaging
- Identify the emotional tone

For BRAND STORY analysis:
- Extract mission statement or purpose
- Identify vision or future aspirations
- Find tagline or slogan
- Note origin story elements if present
- Identify what problem the brand fights against (enemy statement)

For BRAND GUARDRAILS:
- Identify words or phrases the brand likely avoids
- Note topics that seem off-limits based on positioning
- Suggest visual styles to avoid based on brand aesthetic

RESPOND WITH ONLY VALID JSON in this exact format:
{
  "isBrand": true/false,
  "brandName": "extracted brand name or null",
  "confidence": 0-100,
  "reason": "brief explanation of your analysis",
  "taxonomy": ["category1", "category2", "etc - be comprehensive!"],
  "additionalProducts": [
    {
      "name": "product name",
      "category": "category",
      "price": 99.99,
      "currency": "USD",
      "description": "brief description",
      "inStock": true
    }
  ],
  "suggestedColors": {
    "primary": "#hexcode or null if already detected",
    "secondary": "#hexcode or null",
    "accent": "#hexcode or null",
    "background": "#hexcode or null",
    "text": "#hexcode or null"
  },
  "brandDNA": {
    "voice": {
      "toneSpectrum": {
        "formal": 0-100,
        "casual": 0-100,
        "professional": 0-100,
        "friendly": 0-100,
        "authoritative": 0-100,
        "playful": 0-100
      },
      "vocabulary": {
        "preferred": ["words", "and", "phrases", "the", "brand", "uses"],
        "avoided": ["words", "likely", "avoided"]
      },
      "emotionalSignature": ["inspiring", "reassuring", "etc"],
      "communicationPatterns": ["short punchy sentences", "etc"],
      "sentenceStyle": "short/medium/long"
    },
    "personality": {
      "archetype": "Hero/Sage/Explorer/Creator/Ruler/Caregiver/Magician/Lover/Jester/Everyperson/Innocent/Outlaw or null",
      "secondaryArchetype": "secondary archetype or null",
      "traits": ["innovative", "trustworthy", "etc"],
      "values": ["quality", "sustainability", "etc"],
      "emotionalTone": "confident/warm/exciting/etc"
    },
    "story": {
      "mission": "extracted or inferred mission statement or null",
      "vision": "extracted or inferred vision or null",
      "tagline": "brand tagline/slogan or null",
      "origin": "origin story elements or null",
      "enemyStatement": "what problem the brand fights or null",
      "transformationPromise": "what transformation they promise customers or null"
    },
    "guardrails": {
      "forbiddenWords": ["cheap", "basic", "etc - words to avoid"],
      "avoidTopics": ["topics that don't fit the brand"],
      "toneAvoid": ["tones to avoid like aggressive or sarcastic"],
      "visualAvoid": ["visual styles to avoid"],
      "competitorMentions": false
    }
  },
  "productIndicators": ["list of evidence that products are sold"],
  "brandingEvidence": "description of branding elements found",
  "estimatedProductCount": number
}

Provide up to 20 additional products and 15 taxonomy categories. Be thorough with brand DNA extraction!`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at analyzing e-commerce websites to extract product and branding information. Always respond with valid JSON only, no markdown formatting. Be thorough in finding products." 
          },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    let analysis: any = {
      isBrand: detailedProducts.length > 0,
      brandName: pageData.metadata?.title,
      confidence: detailedProducts.length > 0 ? 70 : 30,
      reason: 'Based on extracted products',
      taxonomy: [],
      additionalProducts: [],
      suggestedColors: {},
      brandDNA: null,
    };

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const analysisText = aiData.choices?.[0]?.message?.content || '{}';
      
      try {
        const cleanedText = analysisText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        analysis = JSON.parse(cleanedText);
      } catch (e) {
        console.error('[SCAN-WEBSITE] Failed to parse AI response:', analysisText.substring(0, 500));
      }
    } else {
      console.warn('[SCAN-WEBSITE] AI analysis failed, using extracted data only');
    }

    console.log('[SCAN-WEBSITE] AI Analysis result:', {
      isBrand: analysis.isBrand,
      brandName: analysis.brandName,
      confidence: analysis.confidence,
      taxonomyCount: analysis.taxonomy?.length || 0,
      additionalProductsCount: analysis.additionalProducts?.length || 0,
      estimatedProductCount: analysis.estimatedProductCount
    });

    // Merge AI-discovered products with scraped products
    const allProducts = [...detailedProducts];
    if (analysis.additionalProducts?.length > 0) {
      for (const aiProduct of analysis.additionalProducts) {
        // Avoid duplicates
        const exists = allProducts.some(p => 
          p.name.toLowerCase() === aiProduct.name?.toLowerCase()
        );
        if (!exists && aiProduct.name) {
          allProducts.push({
            name: aiProduct.name,
            category: aiProduct.category || 'Uncategorized',
            price: aiProduct.price,
            currency: aiProduct.currency || 'USD',
            description: aiProduct.description,
            inStock: aiProduct.inStock ?? true,
          });
        }
      }
    }

    // Build taxonomy from products if AI didn't provide enough
    const productCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    const taxonomy = analysis.taxonomy?.length > 0 
      ? [...new Set([...analysis.taxonomy, ...productCategories])]
      : productCategories;

    // Build default Brand DNA if not extracted
    const defaultBrandDNA: BrandDNA = {
      voice: {
        toneSpectrum: { formal: 50, casual: 50, professional: 50, friendly: 50, authoritative: 50, playful: 50 },
        vocabulary: { preferred: [], avoided: [] },
        emotionalSignature: [],
        communicationPatterns: [],
        sentenceStyle: 'medium',
      },
      personality: {
        archetype: null,
        secondaryArchetype: null,
        traits: [],
        values: [],
        emotionalTone: null,
      },
      story: {
        mission: null,
        vision: null,
        tagline: null,
        origin: null,
        enemyStatement: null,
        transformationPromise: null,
      },
      guardrails: {
        forbiddenWords: [],
        avoidTopics: [],
        toneAvoid: [],
        visualAvoid: [],
        competitorMentions: false,
        enabled: true,
      },
    };

    // Merge extracted Brand DNA with defaults
    const extractedDNA = analysis.brandDNA || {};
    const brandDNA: BrandDNA = {
      voice: {
        toneSpectrum: extractedDNA.voice?.toneSpectrum || defaultBrandDNA.voice.toneSpectrum,
        vocabulary: {
          preferred: extractedDNA.voice?.vocabulary?.preferred || [],
          avoided: extractedDNA.voice?.vocabulary?.avoided || [],
        },
        emotionalSignature: extractedDNA.voice?.emotionalSignature || [],
        communicationPatterns: extractedDNA.voice?.communicationPatterns || [],
        sentenceStyle: extractedDNA.voice?.sentenceStyle || 'medium',
      },
      personality: {
        archetype: extractedDNA.personality?.archetype || null,
        secondaryArchetype: extractedDNA.personality?.secondaryArchetype || null,
        traits: extractedDNA.personality?.traits || [],
        values: extractedDNA.personality?.values || [],
        emotionalTone: extractedDNA.personality?.emotionalTone || null,
      },
      story: {
        mission: extractedDNA.story?.mission || null,
        vision: extractedDNA.story?.vision || null,
        tagline: extractedDNA.story?.tagline || null,
        origin: extractedDNA.story?.origin || null,
        enemyStatement: extractedDNA.story?.enemyStatement || null,
        transformationPromise: extractedDNA.story?.transformationPromise || null,
      },
      guardrails: {
        forbiddenWords: extractedDNA.guardrails?.forbiddenWords || [],
        avoidTopics: extractedDNA.guardrails?.avoidTopics || [],
        toneAvoid: extractedDNA.guardrails?.toneAvoid || [],
        visualAvoid: extractedDNA.guardrails?.visualAvoid || [],
        competitorMentions: extractedDNA.guardrails?.competitorMentions ?? false,
        enabled: true,
      },
    };

    // Build final result
    const result: ScanResult = {
      success: true,
      isBrand: (analysis.isBrand && analysis.confidence > 40) || allProducts.length > 0,
      brandName: analysis.brandName || pageData.metadata?.title || 'Unknown Brand',
      confidence: analysis.confidence || (allProducts.length > 0 ? 70 : 30),
      reason: analysis.reason || `Found ${allProducts.length} products`,
      branding: {
        logo: pageData.branding?.logo || null,
        colors: {
          primary: pageData.branding?.colors?.primary || analysis.suggestedColors?.primary || '#6366f1',
          secondary: pageData.branding?.colors?.secondary || analysis.suggestedColors?.secondary || '#8b5cf6',
          accent: pageData.branding?.colors?.accent || analysis.suggestedColors?.accent || '#ec4899',
          background: pageData.branding?.colors?.background || analysis.suggestedColors?.background || '#0a0a0a',
          text: pageData.branding?.colors?.textPrimary || analysis.suggestedColors?.text || '#ffffff',
        },
        colorScheme: pageData.branding?.colorScheme || 'dark',
      },
      taxonomy: taxonomy.slice(0, 20),
      products: allProducts.slice(0, 50),
      brandDNA,
      metadata: {
        title: pageData.metadata?.title,
        description: pageData.metadata?.description,
        url: normalizedUrl,
        productCount: analysis.estimatedProductCount || allProducts.length,
        pagesScanned: productUrls.length + 1,
      },
    };

    console.log('[SCAN-WEBSITE] Brand DNA extracted:', {
      hasVoice: !!brandDNA.voice.emotionalSignature.length,
      archetype: brandDNA.personality.archetype,
      hasMission: !!brandDNA.story.mission,
      guardrailsCount: brandDNA.guardrails.forbiddenWords.length,
    });

    console.log('[SCAN-WEBSITE] Scan complete:', {
      success: result.success,
      isBrand: result.isBrand,
      brandName: result.brandName,
      taxonomyCount: result.taxonomy.length,
      productsCount: result.products.length,
      productsWithPrices: result.products.filter(p => p.price).length,
      productsWithImages: result.products.filter(p => p.image).length,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[SCAN-WEBSITE] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      isBrand: false,
      brandName: 'Unknown',
      confidence: 0,
      reason: 'Scan failed',
      branding: {
        logo: null,
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#0a0a0a',
          text: '#ffffff',
        },
        colorScheme: 'dark',
      },
      taxonomy: [],
      products: [],
      metadata: { title: null, description: null, url: '' },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
