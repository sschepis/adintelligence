import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InventoryItem {
  name: string;
  stock: number;
  price?: number;
  category?: string;
  sku?: string;
}

interface TrendSignal {
  name: string;
  velocity?: string;
  volume?: string;
  sentiment_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inventory, trends, salesHistory, leadTimeDays } = await req.json();
    
    if (!inventory || !Array.isArray(inventory)) {
      return new Response(
        JSON.stringify({ error: 'No inventory data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[PLAN-DEMAND] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inventorySummary = inventory.map((i: InventoryItem) => 
      `- ${i.name}: stock=${i.stock}, price=$${i.price || 0}, category=${i.category || 'general'}`
    ).join('\n');

    const trendSummary = trends?.map((t: TrendSignal) => 
      `- ${t.name}: velocity=${t.velocity || 'unknown'}, volume=${t.volume || 'unknown'}`
    ).join('\n') || 'No trend data available';

    const systemPrompt = `You are an inventory demand planning expert. Analyze current stock levels against trend signals to recommend optimal inventory actions.

Your recommendations should:
1. Identify stockout risks based on trend velocity
2. Flag overstocked items that don't align with trends
3. Suggest reorder quantities and timing
4. Prioritize high-margin trend-aligned products
5. Consider lead times for restocking

Provide actionable, specific recommendations with urgency levels.`;

    const userPrompt = `Generate demand planning recommendations:

CURRENT INVENTORY:
${inventorySummary}

ACTIVE TRENDS:
${trendSummary}

Lead Time: ${leadTimeDays || 14} days
${salesHistory ? `Sales History: ${JSON.stringify(salesHistory)}` : ''}

Return a JSON object:
{
  "recommendations": [
    {
      "productName": "string",
      "currentStock": number,
      "recommendedAction": "reorder|reduce|hold|discontinue",
      "urgency": "critical|high|medium|low",
      "quantity": number,
      "reasoning": "string",
      "trendAlignment": "strong|moderate|weak|none",
      "estimatedDemand": { "weekly": number, "monthly": number },
      "stockoutRisk": { "days": number, "probability": number }
    }
  ],
  "alerts": [
    {
      "type": "stockout|overstock|opportunity|trend_mismatch",
      "severity": "critical|warning|info",
      "message": "string",
      "affectedProducts": ["string"]
    }
  ],
  "summary": {
    "criticalActions": number,
    "totalReorderValue": number,
    "potentialStockoutLoss": number,
    "trendAlignmentScore": number,
    "topPriority": "string"
  }
}`;

    console.log('[PLAN-DEMAND] Analyzing', inventory.length, 'inventory items');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PLAN-DEMAND] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Demand planning failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No recommendations generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('[PLAN-DEMAND] Parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[PLAN-DEMAND] Generated', plan.recommendations?.length || 0, 'recommendations');

    return new Response(
      JSON.stringify({
        success: true,
        ...plan,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[PLAN-DEMAND] Error:', error);
    const message = error instanceof Error ? error.message : 'Demand planning failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
