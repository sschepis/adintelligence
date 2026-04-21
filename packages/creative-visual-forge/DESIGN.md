# @concentrik/creative-visual-forge — Design Doc

## Purpose
All image-side AI: generate brand-consistent imagery, render storyboard frames for the video planner, and analyze existing product images for color/style/luxury signals.

## Edge functions consolidated
- `generate-creative-asset`
- `generate-storyboard-frame`
- `analyze-product-image`

## Public API
```ts
const visual = new VisualForge(gateway);
const img = await visual.generate({ assetType: "hero", prompt, aspectRatio: "16:9", brandDNA });
const frame = await visual.generateStoryboardFrame({ shotPrompt, styleAnchor, aspectRatio: "9:16", brandDNA });
const retried = await visual.retryFailedFrames(failedShots, { aspectRatio: "9:16", styleAnchor });
const analysis = await visual.analyzeProductImage(url, trendColors);
```

## Architecture
- **Prompt builder**: composes a final prompt from `assetType` template + brand color/style guidance + user prompt. Negative-prompt block injects guardrail "don'ts."
- **Style anchor**: optional `styleAnchor` (string descriptor or reference URL) ensures storyboard frames look like one campaign, not 6 unrelated images.
- **Retry-only API**: critical for storyboard UX — regenerates only failed shots while preserving successful ones.
- **Analysis**: vision model returns structured color palette, dominant aesthetic, luxury score (0-100), and optional similarity score against an external `trendColors` palette.
- **Caching**: analysis results keyed by `imageUrl` (host app currently caches in `visual_analysis_cache`).

## Models
- Generation: `google/gemini-3-pro-image-preview` (premium) / `gemini-3.1-flash-image-preview` (fast)
- Analysis: `gemini-2.5-pro` (multimodal reasoning)

## Out of scope
- Storage / CDN (host app uploads to Supabase Storage).
- Video rendering.
