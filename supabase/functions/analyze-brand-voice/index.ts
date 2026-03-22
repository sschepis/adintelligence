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
    const { websiteContent, socialContent, brandName } = await req.json();

    if (!websiteContent && !socialContent) {
      return new Response(
        JSON.stringify({ error: 'Website or social content required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const combinedContent = [
      websiteContent ? `WEBSITE CONTENT:\n${websiteContent.substring(0, 8000)}` : '',
      socialContent ? `SOCIAL MEDIA CONTENT:\n${socialContent.substring(0, 4000)}` : ''
    ].filter(Boolean).join('\n\n');

    const systemPrompt = `You are a brand voice analyst expert. Analyze the provided brand content and extract their unique communication DNA.

Return a JSON object with this exact structure:
{
  "toneSpectrum": {
    "formal": <0-100>,
    "playful": <0-100>,
    "authoritative": <0-100>,
    "friendly": <0-100>,
    "professional": <0-100>,
    "casual": <0-100>
  },
  "vocabulary": {
    "preferred": ["word1", "word2", ...max 20 words/phrases they frequently use],
    "avoided": ["word1", "word2", ...words they seem to avoid]
  },
  "sentenceStyle": "short" | "medium" | "long",
  "emotionalSignature": ["emotion1", "emotion2", ...max 5 primary emotions conveyed],
  "communicationPatterns": ["pattern1", "pattern2", ...max 5 communication patterns],
  "voiceSummary": "A 2-3 sentence summary of the brand's voice",
  "uniqueTraits": ["trait1", "trait2", ...max 5 unique voice characteristics]
}

Be precise and analytical. Base scores on actual content analysis, not assumptions.`;

    const userPrompt = `Analyze this brand's voice${brandName ? ` (${brandName})` : ''}:\n\n${combinedContent}`;

    console.log('Analyzing brand voice...');

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
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    let voiceAnalysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        voiceAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse voice analysis');
    }

    console.log('Voice analysis complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        voiceAnalysis,
        analyzedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing brand voice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze brand voice';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
