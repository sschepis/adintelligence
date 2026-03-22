import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendData {
  name: string;
  volume?: string;
  velocity?: string;
  platform?: string;
  sentiment_score?: number;
  saved_at?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trends, brandContext } = await req.json();
    
    if (!trends || !Array.isArray(trends) || trends.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No trends provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[PREDICT-TREND] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trendSummaries = trends.map((t: TrendData) => 
      `- ${t.name}: volume=${t.volume || 'unknown'}, velocity=${t.velocity || 'unknown'}, platform=${t.platform || 'multi'}, sentiment=${t.sentiment_score || 'N/A'}`
    ).join('\n');

    const systemPrompt = `You are an expert trend analyst with deep knowledge of social media dynamics, consumer behavior, and market cycles. Analyze trends and predict their lifecycle stages.

Your predictions should include:
1. Current lifecycle stage (emerging, growing, peak, declining, stable)
2. Predicted days until peak (if not yet peaked)
3. Predicted days of relevance remaining
4. Confidence score (0-100)
5. Key factors influencing the prediction
6. Recommended action timing

Consider:
- Velocity indicates growth rate
- Volume indicates current reach
- Platform affects lifecycle duration (TikTok trends are shorter, Pinterest longer)
- Sentiment affects sustainability
- Brand relevance affects actionability`;

    const userPrompt = `Analyze these trends and predict their lifecycle:

${trendSummaries}

${brandContext ? `Brand Context: ${JSON.stringify(brandContext)}` : ''}

Return a JSON object with this structure:
{
  "predictions": [
    {
      "trendName": "string",
      "currentStage": "emerging|growing|peak|declining|stable",
      "daysUntilPeak": number | null,
      "daysOfRelevance": number,
      "confidence": number,
      "keyFactors": ["string"],
      "recommendedAction": "string",
      "optimalActionWindow": "string",
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": {
    "hottest": "string (trend name)",
    "mostUrgent": "string (trend name)",
    "bestLongTerm": "string (trend name)"
  }
}`;

    console.log('[PREDICT-TREND] Analyzing', trends.length, 'trends');

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
      console.error('[PREDICT-TREND] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[PREDICT-TREND] No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No prediction generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response
    let predictions;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        predictions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[PREDICT-TREND] Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse predictions', rawContent: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[PREDICT-TREND] Successfully generated predictions for', predictions.predictions?.length || 0, 'trends');

    return new Response(
      JSON.stringify({
        success: true,
        ...predictions,
        analyzedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[PREDICT-TREND] Error:', error);
    const message = error instanceof Error ? error.message : 'Prediction failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
