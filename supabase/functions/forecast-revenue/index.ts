import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  name: string;
  price?: number;
  stock?: number;
  category?: string;
}

interface TrendMatch {
  trendName: string;
  matchScore: number;
  products: ProductData[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trendMatches, historicalData, timeframeWeeks } = await req.json();
    
    if (!trendMatches || !Array.isArray(trendMatches)) {
      return new Response(
        JSON.stringify({ error: 'No trend matches provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[FORECAST-REVENUE] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const matchSummaries = trendMatches.map((m: TrendMatch) => {
      const productSummary = m.products?.map(p => 
        `${p.name} ($${p.price || 0}, stock: ${p.stock || 0})`
      ).join(', ') || 'No products';
      return `- Trend: ${m.trendName} (match: ${m.matchScore}%)\n  Products: ${productSummary}`;
    }).join('\n');

    const systemPrompt = `You are a revenue forecasting expert combining trend analysis with inventory data. Generate realistic revenue projections based on trend momentum and product availability.

Consider:
- Trend match score indicates product-trend alignment
- Higher match scores = higher conversion potential
- Stock levels limit maximum revenue
- Price points affect volume
- Trend lifecycle affects sustainability
- Seasonality and market conditions

Provide conservative, moderate, and optimistic scenarios.`;

    const userPrompt = `Forecast revenue for these trend-matched products over ${timeframeWeeks || 4} weeks:

${matchSummaries}

${historicalData ? `Historical Context: ${JSON.stringify(historicalData)}` : ''}

Return a JSON object:
{
  "forecasts": [
    {
      "trendName": "string",
      "products": [
        {
          "name": "string",
          "projectedUnits": { "conservative": number, "moderate": number, "optimistic": number },
          "projectedRevenue": { "conservative": number, "moderate": number, "optimistic": number },
          "confidenceScore": number
        }
      ],
      "totalRevenue": { "conservative": number, "moderate": number, "optimistic": number },
      "peakWeek": number,
      "riskFactors": ["string"]
    }
  ],
  "summary": {
    "totalProjectedRevenue": { "conservative": number, "moderate": number, "optimistic": number },
    "topOpportunity": "string",
    "biggestRisk": "string",
    "recommendedFocus": "string"
  },
  "weeklyBreakdown": [
    { "week": 1, "revenue": { "conservative": number, "moderate": number, "optimistic": number } }
  ]
}`;

    console.log('[FORECAST-REVENUE] Analyzing', trendMatches.length, 'trend matches');

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
      console.error('[FORECAST-REVENUE] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Forecast generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No forecast generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let forecast;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecast = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('[FORECAST-REVENUE] Parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse forecast' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[FORECAST-REVENUE] Successfully generated forecast');

    return new Response(
      JSON.stringify({
        success: true,
        ...forecast,
        timeframeWeeks: timeframeWeeks || 4,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[FORECAST-REVENUE] Error:', error);
    const message = error instanceof Error ? error.message : 'Forecast failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
