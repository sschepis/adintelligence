import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, websiteUrl, currentColors, industry } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating theme suggestions for brand: ${brandName}`);

    const systemPrompt = `You are an expert brand designer and color theorist. Analyze the brand information and generate optimal theme suggestions.
    
For each theme, provide:
- A cohesive color palette (primary, secondary, accent, background, text colors as hex codes)
- Typography recommendations (heading and body fonts from Google Fonts)
- A brief explanation of why this theme suits the brand

Generate exactly 3 theme variations:
1. A professional/corporate theme
2. A modern/trendy theme  
3. A bold/creative theme

Respond with valid JSON only, no markdown.`;

    const userPrompt = `Brand: ${brandName}
Website: ${websiteUrl || 'Not provided'}
Industry: ${industry || 'General'}
Current Colors: ${JSON.stringify(currentColors || {})}

Generate 3 theme suggestions that would work well for this brand. Each theme should have distinct personality while remaining professional.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_themes",
              description: "Return 3 brand theme suggestions",
              parameters: {
                type: "object",
                properties: {
                  themes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Theme name like 'Professional Blue' or 'Modern Minimal'" },
                        description: { type: "string", description: "Brief explanation of the theme" },
                        colors: {
                          type: "object",
                          properties: {
                            primary: { type: "string", description: "Primary color hex code" },
                            secondary: { type: "string", description: "Secondary color hex code" },
                            accent: { type: "string", description: "Accent color hex code" },
                            background: { type: "string", description: "Background color hex code" },
                            text: { type: "string", description: "Text color hex code" }
                          },
                          required: ["primary", "secondary", "accent", "background", "text"]
                        },
                        typography: {
                          type: "object",
                          properties: {
                            headingFont: { type: "string", description: "Google Font name for headings" },
                            bodyFont: { type: "string", description: "Google Font name for body text" }
                          },
                          required: ["headingFont", "bodyFont"]
                        }
                      },
                      required: ["name", "description", "colors", "typography"]
                    }
                  }
                },
                required: ["themes"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_themes" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract themes from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const themes = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ success: true, ...themes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify({ success: true, themes: parsed.themes || parsed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        console.error("Failed to parse AI response as JSON");
      }
    }

    throw new Error("Failed to generate theme suggestions");
  } catch (error) {
    console.error("Error in suggest-theme function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
