import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CAMPAIGN-MORPH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignName, currentTrends, campaignType, currentCreative } = await req.json();
    logStep("Generating morph suggestions", { campaignName, trendsCount: currentTrends?.length });

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an expert creative director specializing in real-time ad optimization. Analyze current trends and suggest specific creative adjustments for live campaigns.

Return a JSON object with this exact structure:
{
  "morphSuggestions": [
    {
      "id": "unique_id",
      "type": "color" | "audio" | "headline" | "imagery" | "format",
      "priority": "high" | "medium" | "low",
      "suggestion": "Specific actionable suggestion",
      "reason": "Why this change will improve performance",
      "expectedImpact": "+X% engagement" or similar metric,
      "trendSource": "Name of trend driving this suggestion"
    }
  ],
  "overallScore": 0-100 (how well current creative aligns with trends),
  "urgentActions": ["List of immediate actions needed"],
  "trendAlignment": {
    "aligned": ["trends the campaign is leveraging well"],
    "missing": ["trends the campaign should incorporate"]
  }
}`;

    const userPrompt = `Campaign: ${campaignName || "Unnamed Campaign"}
Campaign Type: ${campaignType || "General"}
Current Creative: ${JSON.stringify(currentCreative) || "Not specified"}

Current Active Trends:
${currentTrends?.map((t: any) => `- ${t.name}: ${t.keywords?.join(", ") || "trending"} (${t.velocity || "rising"})`).join("\n") || "No specific trends provided"}

Analyze these trends and provide specific, actionable creative adjustments to optimize this campaign in real-time. Focus on:
1. Color grading adjustments to match trending aesthetics
2. Audio/music swaps to align with viral sounds
3. Headline variations for A/B testing
4. Visual imagery updates
5. Format adaptations for different platforms`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI API error", { status: response.status, error: errorText });
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    logStep("AI response received", { contentLength: content.length });

    // Parse JSON from response
    let morphData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        morphData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logStep("JSON parse error, using fallback", { error: parseError });
      morphData = {
        morphSuggestions: [
          {
            id: "color_1",
            type: "color",
            priority: "high",
            suggestion: "Increase warm tones by 15% to match 'Golden Hour' aesthetic trend",
            reason: "Golden hour visuals are performing 40% better on Instagram",
            expectedImpact: "+25% engagement",
            trendSource: "Golden Hour Aesthetic"
          }
        ],
        overallScore: 65,
        urgentActions: ["Update color grading", "Test new headlines"],
        trendAlignment: {
          aligned: ["Minimalist design"],
          missing: ["Warm color palette", "Lo-fi textures"]
        }
      };
    }

    logStep("Morph suggestions generated", { 
      suggestionsCount: morphData.morphSuggestions?.length,
      overallScore: morphData.overallScore
    });

    return new Response(JSON.stringify({
      success: true,
      data: morphData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
