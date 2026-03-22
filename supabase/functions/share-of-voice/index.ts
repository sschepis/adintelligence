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
    const { brandName, competitors, keywords, socialData, searchData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calculating share of voice for:", brandName);

    const prompt = `You are a brand analytics AI. Calculate share of voice and sentiment analysis.

Brand: ${brandName || 'Unknown'}
Competitors: ${competitors?.join(', ') || 'N/A'}
Tracked Keywords: ${keywords?.join(', ') || 'N/A'}

Social Media Data:
${socialData?.map((d: any) => `- ${d.platform}: ${d.mentions} mentions, ${d.sentiment}% positive`).join('\n') || 'No social data'}

Search Data:
${searchData?.map((d: any) => `- "${d.keyword}": Brand rank #${d.brandRank}, Top competitor #${d.competitorRank}`).join('\n') || 'No search data'}

Calculate:
1. Overall share of voice
2. Sentiment breakdown
3. Trending topics
4. Competitor comparison

Return JSON with this exact structure:
{
  "overallShareOfVoice": {
    "brand": number (percentage),
    "competitors": [
      {
        "name": "string",
        "share": number (percentage)
      }
    ]
  },
  "sentiment": {
    "positive": number,
    "neutral": number,
    "negative": number,
    "trend": "improving" | "stable" | "declining"
  },
  "mentionsByPlatform": [
    {
      "platform": "string",
      "mentions": number,
      "share": number,
      "sentiment": number,
      "trending": boolean
    }
  ],
  "topTopics": [
    {
      "topic": "string",
      "mentions": number,
      "sentiment": number,
      "brandAssociation": number
    }
  ],
  "competitorComparison": [
    {
      "competitor": "string",
      "shareOfVoice": number,
      "sentimentDiff": number,
      "trend": "gaining" | "stable" | "losing"
    }
  ],
  "alerts": [
    {
      "type": "opportunity" | "threat" | "trend",
      "message": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendations": ["string"]
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
          { role: "system", content: "You are a brand analytics AI. Always respond with valid JSON only." },
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

    console.log("Share of voice calculated:", result.overallShareOfVoice?.brand);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in share-of-voice:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
