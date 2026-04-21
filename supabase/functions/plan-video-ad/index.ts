// Plan a video ad with phased SSE streaming + strict server-side validation.
// Phases emitted: parse → dna → storyboard → validation → manifest
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

const CAMERA_MOTIONS = [
  "static", "pan-left", "pan-right", "zoom-in", "zoom-out", "dolly", "tilt",
] as const;
const TRANSITIONS = ["cut", "fade", "dissolve", "wipe", "slide"] as const;
const ASPECTS = ["16:9", "9:16", "1:1"] as const;

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
        concept: { type: "string" },
        durationSeconds: { type: "number" },
        aspectRatio: { type: "string", enum: [...ASPECTS] },
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
            voice: { type: "string" },
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
              visualPrompt: { type: "string" },
              cameraMotion: { type: "string", enum: [...CAMERA_MOTIONS] },
              transition: { type: "string", enum: [...TRANSITIONS] },
              onScreenText: { type: "string" },
              voiceoverLine: { type: "string" },
            },
            required: [
              "index", "startSeconds", "durationSeconds",
              "visualPrompt", "cameraMotion", "transition",
            ],
            additionalProperties: false,
          },
        },
      },
      required: [
        "title", "concept", "durationSeconds", "aspectRatio",
        "soundtrack", "voiceover", "shots",
      ],
      additionalProperties: false,
    },
  },
};

interface ValidationError {
  path: string;
  message: string;
}

function validateManifest(m: any, expectedDuration: number, expectedAspect: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const push = (path: string, message: string) => errors.push({ path, message });

  if (!m || typeof m !== "object") {
    push("", "Manifest is not an object");
    return errors;
  }
  if (typeof m.title !== "string" || m.title.length < 2) push("title", "Title must be a non-empty string");
  if (typeof m.concept !== "string" || m.concept.length < 10) push("concept", "Concept must be at least 10 chars");
  if (typeof m.durationSeconds !== "number" || m.durationSeconds <= 0) push("durationSeconds", "Must be positive");
  else if (Math.abs(m.durationSeconds - expectedDuration) > 0.5) {
    push("durationSeconds", `Expected ~${expectedDuration}s, got ${m.durationSeconds}s`);
  }
  if (!ASPECTS.includes(m.aspectRatio)) push("aspectRatio", `Must be one of ${ASPECTS.join(", ")}`);
  else if (m.aspectRatio !== expectedAspect) push("aspectRatio", `Expected ${expectedAspect}`);

  if (!m.soundtrack || typeof m.soundtrack.mood !== "string" || typeof m.soundtrack.description !== "string") {
    push("soundtrack", "Must include mood and description");
  }
  if (!m.voiceover || typeof m.voiceover.voice !== "string" || typeof m.voiceover.script !== "string") {
    push("voiceover", "Must include voice and script");
  }

  if (!Array.isArray(m.shots)) {
    push("shots", "Must be an array");
    return errors;
  }
  if (m.shots.length < 3) push("shots", "At least 3 shots required");
  if (m.shots.length > 12) push("shots", "At most 12 shots allowed");

  let cursor = 0;
  m.shots.forEach((s: any, i: number) => {
    const p = `shots[${i}]`;
    if (typeof s.startSeconds !== "number") push(`${p}.startSeconds`, "Must be a number");
    else if (Math.abs(s.startSeconds - cursor) > 0.5) {
      push(`${p}.startSeconds`, `Expected ${cursor}s (no gaps), got ${s.startSeconds}s`);
    }
    if (typeof s.durationSeconds !== "number" || s.durationSeconds <= 0) {
      push(`${p}.durationSeconds`, "Must be > 0");
    } else if (s.durationSeconds < 1) {
      push(`${p}.durationSeconds`, "Each shot must be at least 1s");
    }
    if (typeof s.visualPrompt !== "string" || s.visualPrompt.length < 10) {
      push(`${p}.visualPrompt`, "Visual prompt must be at least 10 chars");
    }
    if (!CAMERA_MOTIONS.includes(s.cameraMotion)) {
      push(`${p}.cameraMotion`, `Must be one of ${CAMERA_MOTIONS.join(", ")}`);
    }
    if (!TRANSITIONS.includes(s.transition)) {
      push(`${p}.transition`, `Must be one of ${TRANSITIONS.join(", ")}`);
    }
    cursor = (s.startSeconds ?? cursor) + (s.durationSeconds ?? 0);
  });

  if (Math.abs(cursor - (m.durationSeconds ?? expectedDuration)) > 0.5) {
    push("shots", `Shots tile to ${cursor}s but durationSeconds is ${m.durationSeconds}s`);
  }

  return errors;
}

function sseEncoder() {
  const encoder = new TextEncoder();
  return (event: string, data: unknown) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const wantsStream = req.headers.get("accept")?.includes("text/event-stream");

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
      return new Response(JSON.stringify({ error: "brief must be at least 5 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const duration = body.durationSeconds ?? 30;
    const aspect = body.aspectRatio ?? "9:16";

    if (!ASPECTS.includes(aspect)) {
      return new Response(JSON.stringify({ error: `aspectRatio must be one of ${ASPECTS.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (duration < 5 || duration > 180) {
      return new Response(JSON.stringify({ error: "durationSeconds must be between 5 and 180" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const runPlan = async (
      emit: (event: string, data: unknown) => void,
    ): Promise<{ manifest?: unknown; errors?: ValidationError[]; httpError?: { status: number; body: unknown } }> => {
      emit("phase", { phase: "parse", label: "Parsing brief", progress: 10 });

      // DNA phase
      let brandContext = "";
      if (body.brandId) {
        emit("phase", { phase: "dna", label: "Loading brand DNA", progress: 25 });
        const { data: brand } = await supabase
          .from("brands")
          .select(
            "name, brand_voice, brand_personality, brand_story, brand_guardrails, primary_color, secondary_color, accent_color",
          )
          .eq("id", body.brandId)
          .maybeSingle();
        if (brand) {
          brandContext = `\n\nBRAND CONTEXT:\nName: ${brand.name}\nVoice: ${JSON.stringify(brand.brand_voice)}\nPersonality: ${JSON.stringify(brand.brand_personality)}\nStory: ${JSON.stringify(brand.brand_story)}\nGuardrails: ${JSON.stringify(brand.brand_guardrails)}\nColors: ${brand.primary_color}, ${brand.secondary_color}, ${brand.accent_color}`;
          emit("dna", {
            name: brand.name,
            colors: [brand.primary_color, brand.secondary_color, brand.accent_color].filter(Boolean),
          });
        }
      } else {
        emit("phase", { phase: "dna", label: "No brand selected — using brief only", progress: 25 });
      }

      emit("phase", { phase: "storyboard", label: "Directing shot list", progress: 50 });

      const systemPrompt = `You are Martin, an AI media director. Produce a cinematic, on-brand video-ad ProductionManifest that is fully compatible with Shotstack rendering. Total duration must equal ${duration}s exactly. Use ${aspect} aspect ratio. Shots' startSeconds + durationSeconds must tile the timeline without gaps starting at 0. Visual prompts must be vivid, ready for an AI video generator. Each shot >= 1s.`;
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
          return { httpError: { status: 429, body: { error: "Rate limit exceeded, try again shortly." } } };
        }
        if (aiResponse.status === 402) {
          return { httpError: { status: 402, body: { error: "AI credits exhausted." } } };
        }
        const txt = await aiResponse.text();
        console.error("AI gateway error", aiResponse.status, txt);
        return { httpError: { status: 500, body: { error: "Planning failed" } } };
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        return { httpError: { status: 502, body: { error: "Model did not return a manifest" } } };
      }

      let manifest: any;
      try {
        manifest = JSON.parse(toolCall.function.arguments);
      } catch {
        return { httpError: { status: 502, body: { error: "Invalid manifest JSON" } } };
      }

      emit("phase", { phase: "validation", label: "Validating timeline", progress: 85 });
      const errors = validateManifest(manifest, duration, aspect);
      if (errors.length) {
        return { errors };
      }

      emit("phase", { phase: "manifest", label: "Manifest ready", progress: 100 });
      return { manifest };
    };

    if (wantsStream) {
      const enc = sseEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const emit = (event: string, data: unknown) => {
            try { controller.enqueue(enc(event, data)); } catch { /* closed */ }
          };
          try {
            const res = await runPlan(emit);
            if (res.httpError) {
              emit("error", res.httpError.body);
            } else if (res.errors) {
              emit("validation_error", { errors: res.errors });
            } else {
              emit("manifest", { manifest: res.manifest });
            }
          } catch (err) {
            emit("error", { error: err instanceof Error ? err.message : String(err) });
          } finally {
            try { controller.close(); } catch { /* ignore */ }
          }
        },
      });
      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback
    const noop = () => {};
    const res = await runPlan(noop);
    if (res.httpError) {
      return new Response(JSON.stringify(res.httpError.body), {
        status: res.httpError.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.errors) {
      return new Response(JSON.stringify({ error: "Manifest validation failed", validationErrors: res.errors }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, manifest: res.manifest }), {
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
