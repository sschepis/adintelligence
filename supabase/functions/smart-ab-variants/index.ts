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
    const { originalCreative, winningPatterns, targetAudience, variantCount = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Generating smart A/B variants for:", originalCreative?.headline);

    const prompt = `You are an expert marketing creative optimizer. Generate ${variantCount} A/B test variants based on the original creative and winning patterns.

Original Creative:
- Headline: ${originalCreative?.headline || 'N/A'}
- Body: ${originalCreative?.body || 'N/A'}
- CTA: ${originalCreative?.cta || 'N/A'}
- Visual style: ${originalCreative?.visualStyle || 'N/A'}

Winning Patterns from past campaigns:
${winningPatterns?.map((p: any) => `- ${p.pattern}: +${p.improvement}% conversion`).join('\n') || 'None provided'}

Target Audience: ${targetAudience || 'General'}

Generate variants with different approaches:
1. Emotional appeal variant
2. Social proof variant  
3. Urgency/scarcity variant

Return JSON with this exact structure:
{
  "variants": [
    {
      "id": "variant-1",
      "name": "Emotional Appeal",
      "headline": "string",
      "body": "string",
      "cta": "string",
      "visualSuggestion": "string",
      "hypothesis": "string explaining why this might work",
      "predictedLift": number (percentage)
    }
  ],
  "testingStrategy": {
    "recommendedDuration": "string",
    "minimumSampleSize": number,
    "primaryMetric": "string",
    "confidenceTarget": number
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
          { role: "system", content: "You are a marketing AI that generates A/B test variants. Always respond with valid JSON only." },
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
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { variants: [], testingStrategy: {} };

    console.log("Generated", result.variants?.length || 0, "variants");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in smart-ab-variants:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
