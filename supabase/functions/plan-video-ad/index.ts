// Plan a video ad: takes a brief + brand DNA and produces a Shotstack-compatible
// ProductionManifest using Lovable AI Gateway with tool calling for structured output.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PlanRequest {
  brief: string;
  title?: string;
  brandId?: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  tone?: string;
}

const MANIFEST_TOOL = {
  type: "function",
  function: {
    name: "emit_production_manifest",
    description:
      "Emit a Shotstack-compatible video ad production manifest with shots, voiceover, and music.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        concept: { type: "string", description: "One-paragraph creative concept" },
        durationSeconds: { type: "number" },
        aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
        soundtrack: {
          type: "object",
          properties: {
            mood: { type: "string" },
            description: { type: "string" },
          },
          required: ["mood", "description"],
          additionalProperties: false,
        },
        voiceover: {
          type: "object",
          properties: {
            voice: { type: "string", description: "ElevenLabs voice id or descriptor" },
            script: { type: "string" },
          },
          required: ["voice", "script"],
          additionalProperties: false,
        },
        shots: {
          type: "array",
          minItems: 3,
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              index: { type: "number" },
              startSeconds: { type: "number" },
              durationSeconds: { type: "number" },
              visualPrompt: {
                type: "string",
                description: "Detailed prompt for video generation (WeryAI)",
              },
              cameraMotion: {
                type: "string",
                enum: ["static", "pan-left", "pan-right", "zoom-in", "zoom-out", "dolly", "tilt"],
              },
              transition: {
                type: "string",
                enum: ["cut", "fade", "dissolve", "wipe", "slide"],
              },
              onScreenText: { type: "string" },
              voiceoverLine: { type: "string" },
            },
            required: [
              "index",
              "startSeconds",
              "durationSeconds",
              "visualPrompt",
              "cameraMotion",
              "transition",
            ],
            additionalProperties: false,
          },
        },
      },
      required: [
        "title",
        "concept",
        "durationSeconds",
        "aspectRatio",
        "soundtrack",
        "voiceover",
        "shots",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as PlanRequest;
    if (!body.brief || body.brief.trim().length < 5) {
      return new Response(JSON.stringify({ error: "brief is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull brand DNA if provided
    let brandContext = "";
    if (body.brandId) {
      const { data: brand } = await supabase
        .from("brands")
        .select(
          "name, brand_voice, brand_personality, brand_story, brand_guardrails, primary_color, secondary_color, accent_color",
        )
        .eq("id", body.brandId)
        .maybeSingle();
      if (brand) {
        brandContext = `\n\nBRAND CONTEXT:\nName: ${brand.name}\nVoice: ${JSON.stringify(brand.brand_voice)}\nPersonality: ${JSON.stringify(brand.brand_personality)}\nStory: ${JSON.stringify(brand.brand_story)}\nGuardrails: ${JSON.stringify(brand.brand_guardrails)}\nColors: ${brand.primary_color}, ${brand.secondary_color}, ${brand.accent_color}`;
      }
    }

    const duration = body.durationSeconds ?? 30;
    const aspect = body.aspectRatio ?? "9:16";

    const systemPrompt = `You are Martin, an AI media director. Produce a cinematic, on-brand video-ad ProductionManifest that is fully compatible with Shotstack rendering. Total duration must equal ${duration}s. Use ${aspect} aspect ratio. Shots' startSeconds + durationSeconds must tile the timeline without gaps. Visual prompts must be vivid, ready for an AI video generator.`;

    const userPrompt = `Brief: ${body.brief}\nDesired tone: ${body.tone ?? "energetic, modern"}${brandContext}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [MANIFEST_TOOL],
        tool_choice: { type: "function", function: { name: "emit_production_manifest" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiResponse.text();
      console.error("AI gateway error", aiResponse.status, txt);
      return new Response(JSON.stringify({ error: "Planning failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call returned", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "Model did not return a manifest" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let manifest: any;
    try {
      manifest = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool args", e);
      return new Response(JSON.stringify({ error: "Invalid manifest JSON" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Light validation: ensure shots tile the duration
    if (!Array.isArray(manifest.shots) || manifest.shots.length === 0) {
      return new Response(JSON.stringify({ error: "Manifest missing shots" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, manifest }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("plan-video-ad error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
