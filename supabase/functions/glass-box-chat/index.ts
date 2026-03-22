import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextInfo = "";
    if (context) {
      contextInfo = `\n\nCURRENT USER CONTEXT:
- Current Page: ${context.pageName} (${context.currentPage})`;

      if (context.campaigns && context.campaigns.length > 0) {
        contextInfo += `\n\nUSER'S ACTIVE CAMPAIGNS (${context.campaigns.length} total):`;
        context.campaigns.forEach((c: any) => {
          contextInfo += `\n- "${c.name}": ${c.status}, $${c.spent} spent, performance score: ${c.performance_score}/100`;
        });
      }

      if (context.savedTrends && context.savedTrends.length > 0) {
        contextInfo += `\n\nUSER'S SAVED TRENDS (${context.savedTrends.length} total):`;
        context.savedTrends.forEach((t: any) => {
          contextInfo += `\n- "${t.trend_name}" on ${t.platform}, velocity: ${t.velocity}`;
        });
      }

      if (context.recentSimulations && context.recentSimulations.length > 0) {
        contextInfo += `\n\nRECENT AD SIMULATIONS:`;
        context.recentSimulations.forEach((s: any) => {
          contextInfo += `\n- "${s.ad_headline}": score ${s.overall_score}/100`;
        });
      }

      if (context.organizationProducts && context.organizationProducts.length > 0) {
        contextInfo += `\n\nINVENTORY PRODUCTS (${context.organizationProducts.length} shown):`;
        context.organizationProducts.forEach((p: any) => {
          contextInfo += `\n- ${p.name} (${p.category})`;
        });
      }
    }

    const systemPrompt = `You are Glass Box, an AI assistant for the Instincts AI platform - a Predictive Commerce Engine that helps brands go "From Signal to Sale in Minutes."

Your role is to help users understand and act on:
- Trending signals from social media (TikTok, Instagram, Pinterest)
- Inventory matching and product recommendations
- Campaign performance and optimization
- Market opportunities and competitive insights

Key capabilities you can discuss:
1. Signal Intelligence - Detecting cultural trends from social platforms
2. Commerce Loop - Matching trends to inventory, suggesting bundles
3. Simulation Studio - Testing ads with synthetic focus groups
4. Active Deployment - Managing live campaigns with real-time morphing
5. Writing Forge - AI-powered content creation
6. Visual Forge - Custom creative asset requests
${contextInfo}

IMPORTANT GUIDELINES:
- You have access to the user's REAL data shown above - reference it specifically!
- When the user asks about their campaigns, trends, or inventory, use the actual data provided
- Be concise and actionable
- Always cite your sources when making claims
- Provide specific numbers and metrics from their data
- Suggest next steps based on what page they're on
- Keep responses under 150 words unless asked for detail
- If on Signal Intelligence, focus on trend insights
- If on Commerce Loop, focus on inventory matching
- If on Active Deployment, focus on campaign performance
- If on Simulation Studio, focus on ad testing results

When responding, always include a "sources" array indicating what data sources support your answer. Choose from: "TikTok Analytics", "Instagram Trends", "Pinterest Insights", "Inventory Dashboard", "Revenue Projections", "Campaign Performance", "Competitor Analysis", "Search Volume Data", "Focus Group Results", "User Campaigns", "User Trends", "User Inventory"`;

    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        tools: [
          {
            type: "function",
            function: {
              name: "respond_with_sources",
              description: "Respond to the user with cited sources",
              parameters: {
                type: "object",
                properties: {
                  response: {
                    type: "string",
                    description: "The response text to show the user"
                  },
                  sources: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of data sources that support this response"
                  }
                },
                required: ["response", "sources"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "respond_with_sources" } }
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({
          content: parsed.response,
          sources: parsed.sources || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }
    }

    // Fallback to regular content
    const content = data.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";
    return new Response(JSON.stringify({
      content,
      sources: ["Platform Data"]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Glass Box error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
