# @concentrik/creative-copy-forge — Design Doc

## Purpose
Brand-aware text generation across all copy surfaces: blog, product, email, ads, social, landing pages. Handles single generation, variant fan-out, targeted rewrites, and A/B-ready ad variants.

## Edge functions consolidated
- `generate-content`
- `smart-ab-variants`

## Public API
```ts
const forge = new CopyForge(gateway);
const c = await forge.generate({ contentType: "ad-headline", brief, brandDNA, keywords });
const variants = await forge.generateVariants({ baseCopy: c.primary, count: 5, axis: "tone", brandDNA });
const rewritten = await forge.rewrite(text, "make it punchier", brandDNA);
const ads = await forge.smartABVariants({ headline, body, cta }, 4);
```

## Architecture
- **Prompt templates per `contentType`** with strict length/format expectations.
- **Brand DNA injection**: voice samples, forbidden terms, vocabulary lifted into the system prompt; guardrail post-filter rejects outputs containing forbidden terms and triggers regeneration with a corrective hint.
- **Variant axes**: structured prompt asks for *meaningful* variation along one axis (tone/length/angle/cta) instead of "give me 5 versions" which produces near-duplicates.
- **Streaming**: `generate()` supports streaming via `gateway.stream()` for long-form (blog).

## Integration with Brand DNA
Pairs naturally with `@concentrik/brand-dna-engine`'s `scoreConsistency` for a generate → score → regenerate-if-low loop (host app decides threshold).

## Models
- Short-form (ads, headlines): `gemini-2.5-flash`
- Long-form (blog): `gemini-2.5-pro`
- Bulk variant fan-out: `gemini-2.5-flash-lite`

## Out of scope
- Image/video generation.
- Translation (could become `@concentrik/i18n` later).

---

📐 Conforms to [SHARED_DESIGN.md](../SHARED_DESIGN.md) — model names, tool-call shapes, streaming events, and error types are defined there.
