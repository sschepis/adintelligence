# @concentrik/creative-video-planner — Design Doc

## Purpose
Generate a strict, validated, Shotstack-compatible `ProductionManifest` from a creative brief + brand DNA, with timing analysis and surgical edit utilities.

## Edge functions / libs consolidated
- `plan-video-ad` (streamed stages)
- `src/lib/manifestValidation.ts`
- `src/lib/manifestTimingAnalysis.ts`
- `src/lib/manifestEnums.ts`
- `src/lib/manifestExport.ts` (export utilities live here)

## Public API
```ts
const planner = new VideoPlanner(gateway);
const manifest = await planner.plan({ brief, brandDNA, aspectRatio: "9:16", targetDuration: 30 }, { stream: true });
const v = planner.validate(manifest);
const issues = planner.analyzeTiming(manifest);
const fixed = planner.retileShot(manifest, 2);
const shotstackJson = planner.toShotstack(manifest);
```

## Architecture
- **Strict schema**: Zod-defined `ProductionManifest`. Validation enforces: contiguous shots (no gaps/overlaps within tolerance), shot count bounds, enum values for `cameraMotion`/`transition`, total duration sum equality, aspect-ratio constraints.
- **Streaming planner**: emits `brief-parsed`, `dna-extracted`, `shots-generated`, `validated`, `done` so the UI can show stage progress before approval.
- **Timing utilities**: pure functions for `analyzeTiming` (detect overlap/gap with delta), `retileShot` (snap one shot to predecessor's end and cascade), `redistributeDuration`.
- **Adapters**: `toShotstack(manifest)` outputs render-engine JSON. Future adapters: Remotion, Creatomate.

## Why a separate package
This is the most schema-heavy domain in the app and the validation/timing logic is reusable for any video tooling. It's also the most likely candidate to be open-sourced.

## Models
- Planning: `gemini-2.5-pro` (long structured output, multi-constraint reasoning).
- Validation: pure code, no LLM.

## Out of scope
- Actual rendering (handled by Shotstack/Remotion service).
- Storyboard image generation (delegated to `@concentrik/creative-visual-forge`).
- Job persistence (host app's `video_ad_jobs` table).

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
