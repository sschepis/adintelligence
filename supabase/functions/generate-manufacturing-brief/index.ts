import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trendName, trendKeywords, trendColors, existingCategories, gapCategories } = await req.json();

    if (!trendName) {
      return new Response(
        JSON.stringify({ error: 'Trend name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating manufacturing brief for trend: ${trendName}`);
    console.log(`Gap categories: ${gapCategories?.join(', ') || 'none specified'}`);

    const systemPrompt = `You are a fashion product development expert specializing in trend-driven manufacturing recommendations. 
Your role is to analyze trending aesthetics and create detailed product development briefs for manufacturers.

You must respond with valid JSON only, no markdown or additional text.`;

    const userPrompt = `Generate a comprehensive manufacturing brief for products that would align with the "${trendName}" trend.

Trend Details:
- Keywords: ${trendKeywords?.join(', ') || 'Not specified'}
- Color Palette: ${trendColors?.join(', ') || 'Not specified'}
- Categories we already have: ${existingCategories?.join(', ') || 'None'}
- Categories with gaps (need new products): ${gapCategories?.join(', ') || 'All categories'}

Create a detailed manufacturing brief with the following JSON structure:
{
  "trendName": "${trendName}",
  "briefTitle": "A compelling title for this product development initiative",
  "executiveSummary": "2-3 sentence overview of the opportunity",
  "marketOpportunity": {
    "demandSignals": ["List 3-4 market signals indicating demand"],
    "targetDemographic": "Description of target customer",
    "projectedMargin": "Estimated margin range (e.g., '45-55%')",
    "urgencyLevel": "high/medium/low"
  },
  "productRecommendations": [
    {
      "productName": "Specific product name",
      "category": "Category name",
      "description": "Detailed product description",
      "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
      "materials": ["Recommended material 1", "Material 2"],
      "colorways": ["Color 1", "Color 2", "Color 3"],
      "pricePoint": {
        "wholesale": "$XX",
        "retail": "$XX",
        "margin": "XX%"
      },
      "moq": "Minimum order quantity",
      "leadTime": "Estimated production time"
    }
  ],
  "designGuidelines": {
    "aestheticDirection": "Overall design philosophy",
    "mustHaveElements": ["Element 1", "Element 2"],
    "avoidElements": ["Element to avoid 1", "Element 2"],
    "qualityIndicators": ["Quality marker 1", "Quality marker 2"]
  },
  "productionNotes": {
    "recommendedManufacturers": "Region or type of manufacturer",
    "certifications": ["Certification 1", "Certification 2"],
    "sustainabilityConsiderations": "Environmental notes"
  },
  "timelineRecommendation": {
    "idealLaunchWindow": "When to launch",
    "trendLongevity": "Expected trend duration",
    "seasonality": "Best seasons for this product"
  }
}

Generate 3-5 product recommendations focusing on the gap categories. Be specific, actionable, and commercially viable.`;

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing JSON...');

    // Parse the JSON response
    let brief;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      brief = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Return a structured error response
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse manufacturing brief',
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Manufacturing brief generated successfully');

    return new Response(
      JSON.stringify(brief),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating manufacturing brief:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate manufacturing brief';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
