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
    const { content, brandDNA } = await req.json();

    if (!content || !brandDNA) {
      return new Response(
        JSON.stringify({ error: 'Content and brandDNA required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a brand consistency analyst. Score how well the provided content aligns with the brand's DNA profile.

Brand DNA Profile:
${JSON.stringify(brandDNA, null, 2)}

Return a JSON object with this exact structure:
{
  "overall": <0-100 overall consistency score>,
  "voiceAlignment": <0-100 how well voice matches>,
  "personalityAlignment": <0-100 how well personality matches>,
  "guardrailsCompliance": <0-100 adherence to guardrails>,
  "breakdown": [
    {
      "metric": "metric name",
      "score": <0-100>,
      "details": "specific feedback"
    }
  ],
  "violations": ["list of any guardrail violations found"],
  "suggestions": ["suggestions for improving alignment"],
  "driftLevel": "none" | "minor" | "moderate" | "significant"
}

Be precise and provide actionable feedback.`;

    const userPrompt = `Score this content for brand consistency:\n\n${content.substring(0, 5000)}`;

    console.log('Scoring brand consistency...');

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
    const responseContent = data.choices?.[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let consistencyScore;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        consistencyScore = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse consistency score');
    }

    console.log('Consistency scoring complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        consistencyScore,
        scoredAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scoring consistency:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to score consistency';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
