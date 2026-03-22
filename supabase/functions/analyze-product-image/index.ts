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
    const { imageUrl, trendColors } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing product image:', imageUrl);
    console.log('Trend colors to match:', trendColors);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert color analyst for fashion and product imagery. Analyze product images to extract dominant colors and patterns. Return a JSON response with:
- dominantColors: array of color names (e.g., "beige", "navy", "gold")
- colorHexCodes: array of approximate hex codes for the dominant colors
- patterns: array of detected patterns (e.g., "solid", "striped", "leopard", "floral")
- aestheticStyle: one of ["minimalist", "bold", "classic", "bohemian", "edgy", "romantic", "sporty"]
- luxuryScore: 1-10 rating of perceived luxury/quality from visual cues

Only return valid JSON, no markdown or extra text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: trendColors 
                  ? `Analyze this product image and determine how well it matches these trend colors: ${trendColors.join(', ')}. Extract the dominant colors and patterns.`
                  : 'Analyze this product image. Extract the dominant colors, patterns, and aesthetic style.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON response
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return default analysis if parsing fails
      analysis = {
        dominantColors: [],
        colorHexCodes: [],
        patterns: ['solid'],
        aestheticStyle: 'classic',
        luxuryScore: 5
      };
    }

    // Calculate trend color match score if trend colors provided
    let colorMatchScore = 0;
    if (trendColors && trendColors.length > 0 && analysis.dominantColors) {
      const matchingColors = analysis.dominantColors.filter((color: string) =>
        trendColors.some((tc: string) => 
          color.toLowerCase().includes(tc.toLowerCase()) || 
          tc.toLowerCase().includes(color.toLowerCase())
        )
      );
      colorMatchScore = Math.round((matchingColors.length / Math.max(trendColors.length, 1)) * 100);
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        colorMatchScore,
        imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing product image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
