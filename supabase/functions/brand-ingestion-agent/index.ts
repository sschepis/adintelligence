import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface IngestionState {
  url: string;
  phase: string;
  brandName: string | null;
  colors: Record<string, string>;
  products: any[];
  taxonomy: string[];
  brandDNA: any;
  metadata: Record<string, any>;
  pagesScanned: number;
  errors: string[];
}

// Tool definitions for the AI agent
const tools = [
  {
    type: "function",
    function: {
      name: "scrape_homepage",
      description: "Scrape the brand's homepage to extract branding elements (colors, logo, fonts) and discover links. This is always the first step.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The website URL to scrape" }
        },
        required: ["url"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "map_website",
      description: "Map the entire website to discover all available URLs. Use this to find product pages, about pages, and other important content.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The website URL to map" },
          limit: { type: "number", description: "Maximum number of URLs to discover (default 200)" }
        },
        required: ["url"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scrape_product_pages",
      description: "Scrape specific product pages to extract detailed product information including name, price, description, images, and variants.",
      parameters: {
        type: "object",
        properties: {
          urls: { 
            type: "array", 
            items: { type: "string" },
            description: "Array of product page URLs to scrape (max 10)"
          }
        },
        required: ["urls"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scrape_about_page",
      description: "Scrape the about/company page to extract brand story, mission, values, and team information.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The about page URL" }
        },
        required: ["url"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_brand_voice",
      description: "Analyze content to extract brand voice characteristics including tone, vocabulary, and communication patterns.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "Text content to analyze for brand voice" }
        },
        required: ["content"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_ingestion_state",
      description: "Update the current ingestion state with new data. Use this to save progress after each step.",
      parameters: {
        type: "object",
        properties: {
          brandName: { type: "string", description: "The brand name" },
          colors: { 
            type: "object", 
            description: "Brand colors object with primary, secondary, accent, background, text keys"
          },
          taxonomy: {
            type: "array",
            items: { type: "string" },
            description: "Product categories/taxonomy"
          },
          products: {
            type: "array",
            items: { type: "object" },
            description: "Array of product objects"
          },
          brandDNA: {
            type: "object",
            description: "Brand DNA object with voice, personality, story, guardrails"
          },
          metadata: {
            type: "object",
            description: "Additional metadata"
          },
          phase: {
            type: "string",
            description: "Current ingestion phase"
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_progress_update",
      description: "Send a progress update to the user about what's happening.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Progress message to show the user" },
          step: { type: "string", description: "Current step identifier" },
          progress: { type: "number", description: "Progress percentage (0-100)" }
        },
        required: ["message", "step", "progress"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_user_review",
      description: "Pause the ingestion and request the user to review/edit specific data before continuing.",
      parameters: {
        type: "object",
        properties: {
          section: { 
            type: "string", 
            enum: ["colors", "products", "taxonomy", "brandVoice", "brandStory", "brandPersonality", "guardrails"],
            description: "Which section needs review"
          },
          message: { type: "string", description: "Message explaining what needs review" },
          data: { type: "object", description: "The data to be reviewed" }
        },
        required: ["section", "message", "data"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "complete_ingestion",
      description: "Mark the ingestion as complete and finalize all data.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Summary of what was ingested" }
        },
        required: ["summary"],
        additionalProperties: false
      }
    }
  }
];

// Execute tool calls
async function executeTool(
  name: string, 
  args: any, 
  state: IngestionState,
  FIRECRAWL_API_KEY: string,
  LOVABLE_API_KEY: string
): Promise<{ result: any; stateUpdates?: Partial<IngestionState> }> {
  console.log(`[INGESTION-AGENT] Executing tool: ${name}`, args);

  switch (name) {
    case "scrape_homepage": {
      const url = args.url;
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['branding', 'links', 'markdown'],
            onlyMainContent: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { result: { success: false, error: `Failed to scrape: ${errorText}` } };
        }

        const data = await response.json();
        const pageData = data.data || data;
        
        return { 
          result: { 
            success: true, 
            branding: pageData.branding,
            links: pageData.links || [],
            markdown: pageData.markdown?.substring(0, 5000),
            metadata: pageData.metadata
          },
          stateUpdates: {
            pagesScanned: state.pagesScanned + 1,
            brandName: pageData.metadata?.title?.split('|')[0]?.split('-')[0]?.trim() || null,
            colors: pageData.branding?.colors || {},
            metadata: {
              ...state.metadata,
              logo: pageData.branding?.logo,
              title: pageData.metadata?.title,
              description: pageData.metadata?.description
            }
          }
        };
      } catch (error) {
        return { result: { success: false, error: String(error) } };
      }
    }

    case "map_website": {
      const { url, limit = 200 } = args;
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/map', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            limit,
            includeSubdomains: false,
          }),
        });

        if (!response.ok) {
          return { result: { success: false, error: 'Map request failed' } };
        }

        const data = await response.json();
        return { 
          result: { 
            success: true, 
            links: data.links || [],
            totalFound: data.links?.length || 0
          }
        };
      } catch (error) {
        return { result: { success: false, error: String(error) } };
      }
    }

    case "scrape_product_pages": {
      const { urls } = args;
      const pagesToScrape = urls.slice(0, 10);
      const products: any[] = [];

      for (const productUrl of pagesToScrape) {
        try {
          const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
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
                      productName: { type: 'string' },
                      price: { type: 'number' },
                      currency: { type: 'string' },
                      originalPrice: { type: 'number' },
                      description: { type: 'string' },
                      images: { type: 'array', items: { type: 'string' } },
                      category: { type: 'string' },
                      inStock: { type: 'boolean' },
                      variants: { type: 'array', items: { type: 'string' } },
                      tags: { type: 'array', items: { type: 'string' } },
                    },
                  }
                }
              ],
              onlyMainContent: true,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const pageData = data.data || data;
            const extracted = pageData.json || {};

            if (extracted.productName) {
              products.push({
                name: extracted.productName,
                category: extracted.category || 'Uncategorized',
                price: extracted.price,
                currency: extracted.currency || 'USD',
                originalPrice: extracted.originalPrice,
                description: extracted.description?.substring(0, 500),
                image: extracted.images?.[0],
                images: extracted.images,
                inStock: extracted.inStock ?? true,
                variants: extracted.variants,
                tags: extracted.tags,
                url: productUrl,
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to scrape ${productUrl}:`, error);
        }
      }

      return { 
        result: { success: true, products, scrapedCount: products.length },
        stateUpdates: {
          products: [...state.products, ...products],
          pagesScanned: state.pagesScanned + pagesToScrape.length
        }
      };
    }

    case "scrape_about_page": {
      const { url } = args;
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', { 
              type: 'json',
              schema: {
                type: 'object',
                properties: {
                  mission: { type: 'string' },
                  vision: { type: 'string' },
                  story: { type: 'string' },
                  values: { type: 'array', items: { type: 'string' } },
                  teamInfo: { type: 'string' },
                  foundedYear: { type: 'string' },
                },
              }
            }],
            onlyMainContent: true,
          }),
        });

        if (!response.ok) {
          return { result: { success: false, error: 'About page scrape failed' } };
        }

        const data = await response.json();
        const pageData = data.data || data;
        
        return { 
          result: { 
            success: true, 
            content: pageData.markdown?.substring(0, 3000),
            extracted: pageData.json || {}
          },
          stateUpdates: {
            pagesScanned: state.pagesScanned + 1
          }
        };
      } catch (error) {
        return { result: { success: false, error: String(error) } };
      }
    }

    case "analyze_brand_voice": {
      const { content } = args;
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a brand voice analyst. Analyze the provided content and extract brand voice characteristics." 
              },
              { 
                role: "user", 
                content: `Analyze this content for brand voice:\n\n${content.substring(0, 4000)}`
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "brand_voice_analysis",
                  description: "Return brand voice analysis",
                  parameters: {
                    type: "object",
                    properties: {
                      toneSpectrum: {
                        type: "object",
                        properties: {
                          formal: { type: "number" },
                          casual: { type: "number" },
                          professional: { type: "number" },
                          friendly: { type: "number" },
                          authoritative: { type: "number" },
                          playful: { type: "number" }
                        }
                      },
                      vocabulary: {
                        type: "object",
                        properties: {
                          preferred: { type: "array", items: { type: "string" } },
                          avoided: { type: "array", items: { type: "string" } }
                        }
                      },
                      emotionalSignature: { type: "array", items: { type: "string" } },
                      communicationPatterns: { type: "array", items: { type: "string" } },
                      archetype: { type: "string" },
                      traits: { type: "array", items: { type: "string" } }
                    },
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "brand_voice_analysis" } }
          }),
        });

        if (!response.ok) {
          return { result: { success: false, error: 'Voice analysis failed' } };
        }

        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          const analysis = JSON.parse(toolCall.function.arguments);
          return { 
            result: { success: true, analysis },
            stateUpdates: {
              brandDNA: {
                ...state.brandDNA,
                voice: {
                  toneSpectrum: analysis.toneSpectrum || {},
                  vocabulary: analysis.vocabulary || { preferred: [], avoided: [] },
                  emotionalSignature: analysis.emotionalSignature || [],
                  communicationPatterns: analysis.communicationPatterns || [],
                  sentenceStyle: "medium"
                },
                personality: {
                  ...state.brandDNA?.personality,
                  archetype: analysis.archetype || null,
                  traits: analysis.traits || []
                }
              }
            }
          };
        }
        
        return { result: { success: false, error: 'No analysis returned' } };
      } catch (error) {
        return { result: { success: false, error: String(error) } };
      }
    }

    case "update_ingestion_state": {
      return { 
        result: { success: true, message: "State updated" },
        stateUpdates: args
      };
    }

    case "send_progress_update": {
      return { 
        result: { 
          success: true, 
          type: "progress",
          message: args.message,
          step: args.step,
          progress: args.progress
        }
      };
    }

    case "request_user_review": {
      return { 
        result: { 
          success: true, 
          type: "review_request",
          section: args.section,
          message: args.message,
          data: args.data,
          requiresUserAction: true
        }
      };
    }

    case "complete_ingestion": {
      return { 
        result: { 
          success: true, 
          type: "complete",
          summary: args.summary,
          isComplete: true
        }
      };
    }

    default:
      return { result: { success: false, error: `Unknown tool: ${name}` } };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, messages, state: clientState, userInput, reviewedData } = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let state: IngestionState = clientState || {
      url: url || "",
      phase: "initializing",
      brandName: null,
      colors: {},
      products: [],
      taxonomy: [],
      brandDNA: {
        voice: {
          toneSpectrum: { formal: 50, casual: 50, professional: 50, friendly: 50, authoritative: 50, playful: 50 },
          vocabulary: { preferred: [], avoided: [] },
          emotionalSignature: [],
          communicationPatterns: [],
          sentenceStyle: "medium"
        },
        personality: { archetype: null, secondaryArchetype: null, traits: [], values: [], emotionalTone: null },
        story: { mission: null, vision: null, tagline: null, origin: null, enemyStatement: null, transformationPromise: null },
        guardrails: { forbiddenWords: [], avoidTopics: [], toneAvoid: [], visualAvoid: [], competitorMentions: false, enabled: true }
      },
      metadata: {},
      pagesScanned: 0,
      errors: []
    };

    // Build system prompt based on action
    let systemPrompt = `You are an AI agent tasked with ingesting a brand's website to extract comprehensive brand information. You have access to tools for scraping, analyzing, and processing website data.

CURRENT STATE:
- URL: ${state.url}
- Phase: ${state.phase}
- Brand Name: ${state.brandName || "Not yet detected"}
- Products Found: ${state.products.length}
- Pages Scanned: ${state.pagesScanned}

AVAILABLE TOOLS:
1. scrape_homepage - Get branding elements and links from homepage
2. map_website - Discover all URLs on the site
3. scrape_product_pages - Extract product details from product URLs
4. scrape_about_page - Get brand story and mission
5. analyze_brand_voice - Analyze content for voice characteristics
6. update_ingestion_state - Save progress
7. send_progress_update - Update user on current step
8. request_user_review - Pause for user to review/edit data
9. complete_ingestion - Finalize the ingestion

WORKFLOW GUIDELINES:
1. Always start by scraping the homepage to get branding and discover links
2. Map the website to find all pages
3. Identify and scrape product pages (look for URLs with /product/, /shop/, /item/, etc.)
4. Find and scrape the about page for brand story
5. Analyze collected content for brand voice
6. Request user review at key checkpoints (colors, products, brand voice)
7. Complete ingestion when all data is collected

Be thorough but efficient. Communicate progress clearly.`;

    // Build conversation messages
    const conversationMessages: Message[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add any previous messages
    if (messages && messages.length > 0) {
      conversationMessages.push(...messages);
    }

    // Add user input if present
    if (userInput) {
      conversationMessages.push({ role: "user", content: userInput });
    } else if (action === "start") {
      conversationMessages.push({ 
        role: "user", 
        content: `Start ingesting the brand at URL: ${url}. Begin by scraping the homepage and discovering what's on the site. Send progress updates as you go.`
      });
    } else if (action === "continue" && reviewedData) {
      conversationMessages.push({ 
        role: "user", 
        content: `I've reviewed and updated the ${reviewedData.section}. Here's the updated data: ${JSON.stringify(reviewedData.data)}. Please continue with the ingestion.`
      });
    } else if (action === "continue") {
      conversationMessages.push({ 
        role: "user", 
        content: "Continue with the next step of the ingestion process."
      });
    }

    // Call the AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversationMessages,
        tools,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("[INGESTION-AGENT] AI Response:", JSON.stringify(aiResponse, null, 2));

    const message = aiResponse.choices?.[0]?.message;
    const toolCalls = message?.tool_calls || [];
    const assistantContent = message?.content || "";

    // Execute all tool calls
    const toolResults: any[] = [];
    let requiresUserAction = false;
    let reviewRequest: any = null;
    let isComplete = false;
    let completeSummary = "";
    const progressUpdates: any[] = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      let toolArgs: any;
      
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = {};
      }

      const { result, stateUpdates } = await executeTool(
        toolName, 
        toolArgs, 
        state,
        FIRECRAWL_API_KEY,
        LOVABLE_API_KEY
      );

      // Apply state updates
      if (stateUpdates) {
        state = { ...state, ...stateUpdates };
      }

      toolResults.push({
        toolCallId: toolCall.id,
        name: toolName,
        result
      });

      // Handle special result types
      if (result.type === "review_request") {
        requiresUserAction = true;
        reviewRequest = result;
      }
      if (result.type === "complete") {
        isComplete = true;
        completeSummary = result.summary;
      }
      if (result.type === "progress") {
        progressUpdates.push(result);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      state,
      assistantMessage: assistantContent,
      toolResults,
      requiresUserAction,
      reviewRequest,
      isComplete,
      completeSummary,
      progressUpdates,
      conversationMessages: [
        ...conversationMessages,
        { role: "assistant", content: assistantContent, tool_calls: toolCalls },
        ...toolResults.map(tr => ({
          role: "tool",
          tool_call_id: tr.toolCallId,
          content: JSON.stringify(tr.result)
        }))
      ]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[INGESTION-AGENT] Error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
