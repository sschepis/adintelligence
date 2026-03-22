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
    const { platform, targetAudience, contentType, historicalPerformance, timezone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Predicting optimal timing for:", platform);

    const prompt = `You are a social media timing optimization AI. Predict the best times to post/deploy content.

Platform: ${platform || 'Multiple'}
Target Audience: ${targetAudience || 'General'}
Content Type: ${contentType || 'Mixed'}
Timezone: ${timezone || 'UTC'}

Historical Performance Data:
${historicalPerformance?.map((h: any) => `- ${h.day} ${h.time}: ${h.engagement}% engagement`).join('\n') || 'No historical data'}

Analyze platform-specific engagement patterns and recommend optimal posting times.

Return JSON with this exact structure:
{
  "recommendations": [
    {
      "platform": "string",
      "optimalTimes": [
        {
          "day": "Monday" | "Tuesday" | etc,
          "time": "HH:MM",
          "timezone": "string",
          "engagementPrediction": number (percentage),
          "confidence": number (0-100)
        }
      ],
      "peakWindow": {
        "start": "HH:MM",
        "end": "HH:MM",
        "days": ["string"]
      },
      "avoidTimes": [
        {
          "day": "string",
          "time": "HH:MM",
          "reason": "string"
        }
      ]
    }
  ],
  "insights": [
    {
      "insight": "string",
      "actionable": boolean
    }
  ],
  "weeklySchedule": {
    "Monday": ["HH:MM"],
    "Tuesday": ["HH:MM"],
    "Wednesday": ["HH:MM"],
    "Thursday": ["HH:MM"],
    "Friday": ["HH:MM"],
    "Saturday": ["HH:MM"],
    "Sunday": ["HH:MM"]
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
          { role: "system", content: "You are a social media timing AI. Always respond with valid JSON only." },
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

    console.log("Generated timing recommendations");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in optimal-timing:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
