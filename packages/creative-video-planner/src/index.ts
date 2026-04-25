// @concentrik/creative-video-planner — Video ad manifest planning and timing utilities
// See ../SHARED_DESIGN.md for cross-package conventions.

import { z } from "zod";
import type { GatewayClient } from "@concentrik/gateway-client";
import { MODELS, extractJSON } from "@concentrik/shared";
import type { AspectRatio } from "@concentrik/shared";

export type { AspectRatio } from "@concentrik/shared";

export interface ProductionManifest {
  title: string;
  concept: string;
  totalDurationSeconds: number;
  aspectRatio: AspectRatio;
  shots: Shot[];
  soundtrack?: { mood: string; bpm?: number; description?: string };
  voiceoverScript?: string;
  voiceover?: { voice: string; script: string };
}

export interface Shot {
  index: number;
  startSeconds: number;
  durationSeconds: number;
  cameraMotion: string;
  transition: string;
  visualPrompt: string;
  voiceoverLine?: string;
  thumbnailUrl?: string;
  onScreenText?: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface TimingIssue {
  kind: "overlap" | "gap";
  betweenShots: [number, number];
  deltaSeconds: number;
}

// ── Constants ───────────────────────────────────────────────────────────

const CAMERA_MOTIONS = [
  "static", "pan-left", "pan-right", "zoom-in", "zoom-out", "dolly", "tilt",
] as const;

const TRANSITIONS = ["cut", "fade", "dissolve", "wipe", "slide"] as const;

const ASPECTS = ["16:9", "9:16", "1:1", "4:5"] as const;

const MANIFEST_TOOL = {
  type: "function" as const,
  function: {
    name: "emit_production_manifest",
    description: "Emit a Shotstack-compatible video ad production manifest with shots, voiceover, and music.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        concept: { type: "string" },
        durationSeconds: { type: "number" },
        aspectRatio: { type: "string", enum: [...ASPECTS] },
        soundtrack: {
          type: "object",
          properties: { mood: { type: "string" }, description: { type: "string" } },
          required: ["mood", "description"],
        },
        voiceover: {
          type: "object",
          properties: { voice: { type: "string" }, script: { type: "string" } },
          required: ["voice", "script"],
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
            required: ["index", "startSeconds", "durationSeconds", "visualPrompt", "cameraMotion", "transition"],
          },
        },
      },
      required: ["title", "concept", "durationSeconds", "aspectRatio", "soundtrack", "voiceover", "shots"],
    },
  },
};

// ── Main class ──────────────────────────────────────────────────────────

export class VideoPlanner {
  constructor(private _gateway: GatewayClient) {}

  async plan(
    input: { brief: string; brandDNA: unknown; aspectRatio: AspectRatio; targetDuration: number },
    _opts?: { stream?: boolean },
  ): Promise<ProductionManifest> {
    const systemPrompt = `You are Martin, an AI media director. Produce a cinematic, on-brand video-ad ProductionManifest that is fully compatible with Shotstack rendering. Total duration must equal ${input.targetDuration}s exactly. Use ${input.aspectRatio} aspect ratio. Shots' startSeconds + durationSeconds must tile the timeline without gaps starting at 0. Visual prompts must be vivid, ready for an AI video generator. Each shot >= 1s.`;

    const brandContext = input.brandDNA ? `\n\nBrand DNA: ${JSON.stringify(input.brandDNA)}` : "";
    const userPrompt = `Brief: ${input.brief}${brandContext}`;

    const content = await this._gateway.chat({
      model: MODELS.PRO,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        name: MANIFEST_TOOL.function.name,
        description: MANIFEST_TOOL.function.description,
        parameters: MANIFEST_TOOL.function.parameters,
      }],
      toolChoice: { type: "function", function: { name: "emit_production_manifest" } },
      temperature: 0.7,
    });

    const parsed = extractJSON<Record<string, unknown>>(content);

    const manifest: ProductionManifest = {
      title: (parsed.title as string) ?? "",
      concept: (parsed.concept as string) ?? "",
      totalDurationSeconds: (parsed.durationSeconds as number) ?? input.targetDuration,
      aspectRatio: (parsed.aspectRatio as AspectRatio) ?? input.aspectRatio,
      shots: ((parsed.shots as Shot[]) ?? []).map((s, i) => ({
        index: s.index ?? i,
        startSeconds: s.startSeconds ?? 0,
        durationSeconds: s.durationSeconds ?? 1,
        cameraMotion: s.cameraMotion ?? "static",
        transition: s.transition ?? "cut",
        visualPrompt: s.visualPrompt ?? "",
        voiceoverLine: s.voiceoverLine,
        onScreenText: s.onScreenText,
      })),
      soundtrack: parsed.soundtrack as ProductionManifest["soundtrack"],
      voiceover: parsed.voiceover as ProductionManifest["voiceover"],
    };

    return manifest;
  }

  validate(m: ProductionManifest): ValidationResult {
    const issues: ValidationIssue[] = [];
    const pushErr = (path: string, message: string) => issues.push({ path, message, severity: "error" });
    const pushWarn = (path: string, message: string) => issues.push({ path, message, severity: "warning" });

    if (!m.title || m.title.length < 2) pushErr("title", "Title must be a non-empty string");
    if (!m.concept || m.concept.length < 10) pushErr("concept", "Concept must be at least 10 chars");

    if (typeof m.totalDurationSeconds !== "number" || m.totalDurationSeconds <= 0) {
      pushErr("totalDurationSeconds", "Must be positive");
    }

    if (!ASPECTS.includes(m.aspectRatio as typeof ASPECTS[number])) {
      pushErr("aspectRatio", `Must be one of ${ASPECTS.join(", ")}`);
    }

    if (!Array.isArray(m.shots)) {
      pushErr("shots", "Must be an array");
      return { ok: false, issues };
    }

    if (m.shots.length < 3) pushErr("shots", "At least 3 shots required");
    if (m.shots.length > 12) pushWarn("shots", "More than 12 shots is unusual");

    let cursor = 0;
    m.shots.forEach((s, i) => {
      const p = `shots[${i}]`;
      if (typeof s.startSeconds !== "number") {
        pushErr(`${p}.startSeconds`, "Must be a number");
      } else if (Math.abs(s.startSeconds - cursor) > 0.5) {
        pushErr(`${p}.startSeconds`, `Expected ${cursor.toFixed(1)}s (no gaps), got ${s.startSeconds}s`);
      }
      if (typeof s.durationSeconds !== "number" || s.durationSeconds <= 0) {
        pushErr(`${p}.durationSeconds`, "Must be > 0");
      } else if (s.durationSeconds < 1) {
        pushErr(`${p}.durationSeconds`, "Each shot must be at least 1s");
      }
      if (!s.visualPrompt || s.visualPrompt.length < 10) {
        pushErr(`${p}.visualPrompt`, "Visual prompt must be at least 10 chars");
      }
      if (!CAMERA_MOTIONS.includes(s.cameraMotion as typeof CAMERA_MOTIONS[number])) {
        pushErr(`${p}.cameraMotion`, "Invalid camera motion");
      }
      if (!TRANSITIONS.includes(s.transition as typeof TRANSITIONS[number])) {
        pushErr(`${p}.transition`, "Invalid transition");
      }
      cursor = (s.startSeconds ?? cursor) + (s.durationSeconds ?? 0);
    });

    if (m.shots.length && Math.abs(cursor - m.totalDurationSeconds) > 0.5) {
      pushErr("shots", `Shots tile to ${cursor.toFixed(1)}s but totalDurationSeconds is ${m.totalDurationSeconds}s`);
    }

    return { ok: issues.filter((i) => i.severity === "error").length === 0, issues };
  }

  analyzeTiming(m: ProductionManifest): TimingIssue[] {
    if (!m?.shots?.length) return [];
    const issues: TimingIssue[] = [];
    let cursor = 0;

    m.shots.forEach((s, i) => {
      const start = Number(s.startSeconds ?? cursor);
      const dur = Number(s.durationSeconds ?? 0);
      const delta = start - cursor;
      if (Math.abs(delta) > 0.1) {
        issues.push({
          kind: delta > 0 ? "gap" : "overlap",
          betweenShots: [i - 1, i] as [number, number],
          deltaSeconds: Math.abs(delta),
        });
      }
      cursor = start + dur;
    });

    return issues;
  }

  retileShot(m: ProductionManifest, shotIndex: number): ProductionManifest {
    if (!m.shots[shotIndex]) return m;
    const shots = [...m.shots];
    const prev = shots[shotIndex - 1];
    const newStart = prev ? prev.startSeconds + prev.durationSeconds : 0;
    shots[shotIndex] = { ...shots[shotIndex], startSeconds: newStart };

    let cursor = newStart + shots[shotIndex].durationSeconds;
    for (let i = shotIndex + 1; i < shots.length; i++) {
      shots[i] = { ...shots[i], startSeconds: cursor };
      cursor += shots[i].durationSeconds;
    }

    const total = shots.reduce((acc, s) => acc + s.durationSeconds, 0);
    return { ...m, shots, totalDurationSeconds: total };
  }

  toShotstack(m: ProductionManifest): unknown {
    const transitionMap: Record<string, string> = {
      fade: "fade", dissolve: "fade", wipe: "slideLeft", slide: "slideLeft", cut: "none",
    };

    return {
      timeline: {
        tracks: [
          {
            clips: m.shots.map((shot) => ({
              asset: {
                type: "image",
                src: shot.thumbnailUrl ?? "",
              },
              start: shot.startSeconds,
              length: shot.durationSeconds,
              transition: shot.transition !== "cut"
                ? { in: transitionMap[shot.transition] ?? "fade" }
                : undefined,
            })),
          },
        ],
        soundtrack: m.soundtrack
          ? { src: "", effect: "fadeOut" }
          : undefined,
      },
      output: {
        format: "mp4",
        resolution: m.aspectRatio === "9:16" ? "sd" : "hd",
        aspectRatio: m.aspectRatio,
      },
    };
  }
}
