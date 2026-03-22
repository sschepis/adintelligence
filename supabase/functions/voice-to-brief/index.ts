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
    const { transcript, brandContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert marketing strategist. Convert spoken campaign ideas into structured campaign briefs.

Brand Context:
- Name: ${brandContext?.name || 'Unknown Brand'}
- Voice: ${JSON.stringify(brandContext?.voice || {})}
- Personality: ${JSON.stringify(brandContext?.personality || {})}

Generate a structured campaign brief in JSON format:
{
  "brief": {
    "title": "Campaign title",
    "objective": "Clear campaign objective",
    "targetAudience": "Specific target audience description",
    "keyMessages": ["message 1", "message 2", "message 3"],
    "channels": ["channel 1", "channel 2"],
    "budget": "Suggested budget range if mentioned",
    "timeline": "Suggested timeline if mentioned",
    "creativeDirection": "Visual and creative guidance",
    "callToAction": "Primary CTA"
  }
}

Be specific and actionable. Infer reasonable defaults for any missing information based on the brand context.`;

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
          { role: 'user', content: `Convert this spoken campaign idea into a structured brief:\n\n"${transcript}"` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        brief: {
          title: "Campaign Brief",
          objective: transcript,
          targetAudience: "To be defined",
          keyMessages: [transcript],
          channels: ["Social Media"],
          creativeDirection: "To be developed",
          callToAction: "Learn More"
        }
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Voice to brief error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      brief: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
