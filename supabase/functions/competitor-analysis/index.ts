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
    const { competitorAds, competitorDomains, industry, brandContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Analyzing competitor strategies for:", competitorDomains?.join(', '));

    const prompt = `You are a competitive intelligence AI. Analyze competitor advertising strategies and extract actionable insights.

Industry: ${industry || 'E-commerce'}
Your Brand Context: ${brandContext || 'N/A'}

Competitor Domains: ${competitorDomains?.join(', ') || 'N/A'}

Competitor Ads Data:
${competitorAds?.map((ad: any) => `
Competitor: ${ad.competitor}
Headline: ${ad.headline}
Body: ${ad.body}
CTA: ${ad.cta}
Platform: ${ad.platform}
`).join('\n---\n') || 'No ad data provided'}

Analyze:
1. Common messaging themes
2. Unique value propositions
3. CTA strategies
4. Visual style patterns
5. Gaps/opportunities

Return JSON with this exact structure:
{
  "competitorProfiles": [
    {
      "name": "string",
      "positioning": "string",
      "primaryMessage": "string",
      "targetAudience": "string",
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "marketPatterns": {
    "commonThemes": ["string"],
    "dominantCTAs": ["string"],
    "visualTrends": ["string"],
    "pricingStrategies": ["string"]
  },
  "opportunities": [
    {
      "opportunity": "string",
      "rationale": "string",
      "priority": "high" | "medium" | "low",
      "actionableSteps": ["string"]
    }
  ],
  "differentiationSuggestions": [
    {
      "area": "string",
      "suggestion": "string",
      "competitiveAdvantage": "string"
    }
  ],
  "threatAssessment": {
    "immediateThreats": ["string"],
    "emergingCompetitors": ["string"],
    "marketShifts": ["string"]
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
          { role: "system", content: "You are a competitive intelligence AI. Always respond with valid JSON only." },
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

    console.log("Competitor analysis complete");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in competitor-analysis:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
