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
    const { product, demandSignals, competitorPrices, inventoryLevel, trendData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calculating dynamic pricing for:", product?.name);

    const prompt = `You are a pricing optimization AI. Analyze demand signals and recommend optimal pricing.

Product: ${product?.name || 'Unknown'}
Current Price: $${product?.currentPrice || 0}
Cost: $${product?.cost || 0}
Inventory Level: ${inventoryLevel || 'Unknown'} units

Demand Signals:
- Search volume trend: ${demandSignals?.searchTrend || 'stable'}
- Social mentions: ${demandSignals?.socialMentions || 0}
- Website traffic: ${demandSignals?.trafficTrend || 'stable'}

Competitor Prices:
${competitorPrices?.map((c: any) => `- ${c.competitor}: $${c.price}`).join('\n') || 'No data'}

Trend Alignment: ${trendData?.trendName || 'None'} (${trendData?.alignment || 0}% match)

Recommend pricing strategy considering:
1. Demand elasticity
2. Competitive positioning
3. Inventory optimization
4. Trend momentum

Return JSON with this exact structure:
{
  "recommendedPrice": number,
  "priceRange": {
    "floor": number,
    "ceiling": number
  },
  "strategy": "premium" | "competitive" | "penetration" | "dynamic",
  "confidence": number (0-100),
  "reasoning": "string",
  "factors": [
    {
      "factor": "string",
      "impact": "positive" | "negative" | "neutral",
      "weight": number (0-100)
    }
  ],
  "projectedImpact": {
    "revenueChange": number (percentage),
    "marginChange": number (percentage),
    "volumeChange": number (percentage)
  },
  "timingRecommendation": "string"
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
          { role: "system", content: "You are a pricing optimization AI. Always respond with valid JSON only." },
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

    console.log("Pricing recommendation:", result.recommendedPrice);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in dynamic-pricing:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
