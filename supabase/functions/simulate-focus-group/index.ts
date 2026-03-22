import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Persona {
  name: string;
  age: string;
  occupation: string;
  income: string;
  traits: string[];
  buyingBehavior: string;
}

interface BrandDNA {
  voice?: {
    toneSpectrum?: Record<string, number>;
    vocabulary?: { preferred?: string[]; avoided?: string[] };
    emotionalSignature?: string[];
  };
  personality?: {
    archetype?: string;
    traits?: string[];
    values?: string[];
  };
  story?: {
    mission?: string;
    transformationPromise?: string;
  };
  guardrails?: {
    forbiddenWords?: string[];
    avoidTopics?: string[];
    toneAvoid?: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adDescription, trendName, personas, brandDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Running focus group simulation for:", trendName, "with Brand DNA:", brandDNA ? "yes" : "no");

    // Build Brand DNA context for simulation
    let brandContext = "";
    if (brandDNA) {
      const dna = brandDNA as BrandDNA;
      
      brandContext = "\n\nBRAND IDENTITY CONTEXT (evaluate how well the ad aligns with this):";
      
      if (dna.personality?.archetype) {
        brandContext += `\n- Brand Archetype: ${dna.personality.archetype}`;
      }
      
      if (dna.personality?.traits?.length) {
        brandContext += `\n- Brand Traits: ${dna.personality.traits.join(", ")}`;
      }
      
      if (dna.personality?.values?.length) {
        brandContext += `\n- Brand Values: ${dna.personality.values.join(", ")}`;
      }
      
      if (dna.voice?.emotionalSignature?.length) {
        brandContext += `\n- Expected Emotional Tone: ${dna.voice.emotionalSignature.join(", ")}`;
      }
      
      if (dna.story?.mission) {
        brandContext += `\n- Brand Mission: ${dna.story.mission}`;
      }
      
      if (dna.guardrails?.toneAvoid?.length) {
        brandContext += `\n- Tones to Avoid: ${dna.guardrails.toneAvoid.join(", ")}`;
      }
    }

    const systemPrompt = `You are simulating realistic consumer focus group responses. Generate authentic, nuanced feedback from diverse consumer personas watching an advertisement. Each persona should react differently based on their demographics and psychology.${brandContext ? " Also evaluate how well the ad aligns with the brand identity provided." : ""} Respond with valid JSON only.`;

    const personaDescriptions = (personas as Persona[])?.map((p, i) => 
      `Persona ${i + 1}: ${p.name}, ${p.age} years old, ${p.occupation}, ${p.income} income. Traits: ${p.traits.join(", ")}. Buying behavior: ${p.buyingBehavior}`
    ).join("\n\n") || "General consumer audience";

    const userPrompt = `Simulate a focus group watching this advertisement:

Ad Description: "${adDescription}"
Trend/Campaign: "${trendName}"
${brandContext}

Focus Group Personas:
${personaDescriptions}

For each persona, generate their authentic reaction including:
1. Emotional journey (timeline of emotions at different moments)
2. Overall sentiment score (0-100)
3. Purchase intent (0-100)
4. Key quote/feedback
5. Any objections or concerns
6. What moment resonated most
${brandDNA ? "7. Brand alignment score (0-100) - how well does this ad represent the brand identity?" : ""}

Respond in this exact JSON format:
{
  "reactions": [
    {
      "personaIndex": 0,
      "emotionalTimeline": [
        {"time": 0, "emotion": "neutral", "intensity": 60},
        {"time": 5, "emotion": "interest", "intensity": 75},
        {"time": 15, "emotion": "joy", "intensity": 85}
      ],
      "overallSentiment": 78,
      "purchaseIntent": 65,
      "brandAlignment": 82,
      "feedback": "The lifestyle positioning really speaks to me...",
      "keyMoment": "0:15 - The product reveal created strong positive response",
      "objection": "Price point wasn't clearly justified"
    }
  ],
  "aggregateMetrics": {
    "averageSentiment": 75,
    "averagePurchaseIntent": 62,
    "averageBrandAlignment": 80,
    "engagementRate": 80,
    "recommendation": "Strong positive reception overall. Consider extending the hero shot...",
    "brandDriftWarnings": ["Any detected misalignment with brand identity"]
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response received for focus group simulation");

    let simulation;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      simulation = JSON.parse(jsonStr);
    } catch {
      simulation = {
        reactions: [],
        aggregateMetrics: {
          averageSentiment: 70,
          averagePurchaseIntent: 55,
          averageBrandAlignment: 75,
          engagementRate: 65,
          recommendation: content,
          brandDriftWarnings: []
        }
      };
    }

    return new Response(JSON.stringify({ success: true, simulation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in simulate-focus-group function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
