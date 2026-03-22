import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { industry, trendData, competitorOfferings, currentInventory, searchDemand } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Detecting market gaps for:", industry);

    const prompt = `You are a market opportunity AI. Identify gaps in the market that competitors are missing.

Industry: ${industry || 'E-commerce'}

Current Trends:
${trendData?.map((t: any) => `- ${t.name}: ${t.volume} volume, ${t.growth}% growth`).join('\n') || 'No trend data'}

Competitor Offerings:
${competitorOfferings?.map((c: any) => `- ${c.competitor}: ${c.products?.join(', ')}`).join('\n') || 'No competitor data'}

Your Current Inventory Categories:
${currentInventory?.map((i: any) => `- ${i.category}: ${i.count} products`).join('\n') || 'No inventory data'}

Search Demand Signals:
${searchDemand?.map((s: any) => `- "${s.keyword}": ${s.volume} monthly searches, ${s.competition} competition`).join('\n') || 'No search data'}

Identify:
1. Unmet customer needs
2. Trending categories without adequate supply
3. Price gap opportunities
4. Feature gaps

Return JSON with this exact structure:
{
  "gaps": [
    {
      "id": "string",
      "type": "product" | "price" | "feature" | "service" | "audience",
      "title": "string",
      "description": "string",
      "marketSize": "string",
      "urgency": "high" | "medium" | "low",
      "confidence": number (0-100),
      "evidence": ["string"],
      "competitorsCovering": number,
      "actionPlan": {
        "shortTerm": ["string"],
        "longTerm": ["string"]
      }
    }
  ],
  "emergingOpportunities": [
    {
      "opportunity": "string",
      "timeframe": "string",
      "investmentLevel": "low" | "medium" | "high",
      "potentialReturn": "string"
    }
  ],
  "riskAssessment": {
    "marketRisks": ["string"],
    "competitiveRisks": ["string"],
    "mitigationStrategies": ["string"]
  },
  "priorityMatrix": {
    "quickWins": ["string"],
    "strategicBets": ["string"],
    "avoid": ["string"]
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a market analysis AI. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    console.log("Detected", result.gaps?.length || 0, "market gaps");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in market-gap-detection:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
