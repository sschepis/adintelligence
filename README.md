# instinctsai

AI-powered commerce platform for trend-driven marketing, brand intelligence, and creative production. Spot emerging trends, generate brand-consistent content, forecast demand, optimize campaigns, and plan manufacturing — all from a single interface.

## Architecture

Monorepo with a React SPA frontend backed by Supabase (PostgreSQL + 47 Edge Functions) and 10 modular TypeScript packages under the `@instinctsai` namespace.

```
adintelligence/
  src/                     React app (pages, components, hooks, contexts)
  packages/
    shared/                Zod schemas, error classes, model constants, utilities
    gateway-client/        Lovable AI Gateway HTTP client (auth, SSE, tool-call loop)
    brand-dna-engine/      Website ingestion, brand voice/personality extraction, drift detection
    signals-trend-intel/   Trend analysis, lifecycle prediction, competitor intel, market gaps
    commerce-demand-ai/    Revenue forecasting, dynamic pricing, demand planning
    creative-copy-forge/   Brand-aware text generation, A/B variants
    creative-visual-forge/ Image generation, storyboard frames, product image analysis
    creative-video-planner/ Shotstack video manifests, timing analysis
    campaigns-optimizer/   Campaign morphs, focus-group simulation, optimal timing
    assistant-conversational/ Chat assistant, analytics Q&A, voice-to-brief
  supabase/
    functions/             47 Deno Edge Functions
    migrations/            PostgreSQL schema migrations
  scripts/
    trend-to-shelf.ts      End-to-end demo wiring all packages
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript 5.8, Vite 5, Tailwind CSS, shadcn/ui (Radix), React Router, TanStack Query, Framer Motion, Recharts, Three.js |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth), Deno runtime |
| AI | Lovable AI Gateway routing to Gemini 2.5 Flash/Pro, GPT-5, image generation models |
| Testing | Vitest, Testing Library, jsdom |
| Packages | Zod validation, SSE streaming, typed error hierarchy |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase CLI (for Edge Functions)

### Install and Run

```bash
# Install dependencies (includes all workspace packages)
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Debug/development build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Packages

All packages follow shared conventions defined in [packages/SHARED_DESIGN.md](packages/SHARED_DESIGN.md): canonical model constants, Zod-validated outputs, typed errors, SSE streaming events, and stateless design.

### Foundation

- **[@instinctsai/shared](packages/shared/)** — Zod schemas (`BrandProfile`, `StreamEvent`, `ToolDefinition`), error classes (`GatewayError`, `ValidationError`, `RateLimitError`, `CreditsExhaustedError`), model constants (`MODELS.FAST`, `.PRO`, `.REASONING`, etc.), and utilities (`extractJSON`, `safeParse`).
- **[@instinctsai/gateway-client](packages/gateway-client/)** — HTTP client for the Lovable AI Gateway. Handles authentication, retries, SSE streaming, JSON-mode parsing, and the tool-call loop. Every other package depends on this.

### Brand & Signals

- **[@instinctsai/brand-dna-engine](packages/brand-dna-engine/)** — Crawls a website and extracts structured brand DNA (voice, personality, story, guardrails). Scores content for brand consistency and detects brand drift over time.
- **[@instinctsai/signals-trend-intel](packages/signals-trend-intel/)** — Turns social and search signals into trend analyses, lifecycle predictions (emerging/rising/peak/declining), competitor reports, market gap detection, and share-of-voice.

### Commerce

- **[@instinctsai/commerce-demand-ai](packages/commerce-demand-ai/)** — Hybrid statistical + LLM revenue forecasting, dynamic pricing recommendations, per-SKU demand planning, and tech-pack-ready manufacturing briefs.

### Creative

- **[@instinctsai/creative-copy-forge](packages/creative-copy-forge/)** — Long-form and variant text generation with brand-DNA injection, guardrail post-filtering, targeted rewrites, and A/B-ready ad copy.
- **[@instinctsai/creative-visual-forge](packages/creative-visual-forge/)** — Brand-consistent image generation, storyboard frames with style anchoring, retry-only-failed-frames, and vision-based product image analysis.
- **[@instinctsai/creative-video-planner](packages/creative-video-planner/)** — Generates Shotstack-compatible `ProductionManifest` from a brief + brand DNA. Validates structure, analyzes timing (gaps/overlaps), retiles shots, and exports to Shotstack JSON.

### Conversation & Optimization

- **[@instinctsai/assistant-conversational](packages/assistant-conversational/)** — Glass-box chat assistant with visible reasoning and tool calls. Includes NL-to-data analytics Q&A and voice-to-brief transcription.
- **[@instinctsai/campaigns-optimizer](packages/campaigns-optimizer/)** — Real-time campaign morph suggestions ranked by expected lift, persona-based focus-group simulation, optimal posting time recommendations, performance reports, and competitor digests.

## End-to-End Flow

The platform connects all packages in a pipeline from trend detection to market launch:

```
Trend Signal → Trend Analysis → Market Gaps → Demand Forecast
     ↓              ↓               ↓              ↓
Brand DNA → Copy Generation → Visual Assets → Video Manifest
     ↓              ↓               ↓              ↓
Campaign Optimization → Focus Group Simulation → Launch
```

See [scripts/trend-to-shelf.ts](scripts/trend-to-shelf.ts) for a complete mock implementation of this flow.

## Testing

```bash
# Run all tests (frontend + packages)
npx vitest run

# Run tests in watch mode
npx vitest
```

Tests cover both the React frontend (`src/**/*.test.{ts,tsx}`) and all workspace packages (`packages/**/test/**/*.test.ts`).

## Project Structure

The frontend is organized as:

- **`src/pages/`** — 37 route pages (Landing, Auth, BrandSettings, SignalIntelligence, CommerceLoop, VisualForge, WritingForge, SimulationStudio, Analytics, Admin, etc.)
- **`src/components/`** — Reusable UI components organized by domain
- **`src/hooks/`** — 57+ custom hooks for data fetching, real-time subscriptions, and business logic
- **`src/contexts/`** — React contexts (Brand, Sidebar)
- **`src/integrations/`** — Third-party service wrappers

## Supabase

The backend runs on Supabase with 47 Edge Functions organized by domain:

- **Brand** — `scan-website`, `brand-ingestion-agent`, `analyze-brand-voice`, `score-brand-consistency`
- **Trends** — `analyze-trend`, `predict-trend-lifecycle`, `share-of-voice`, `market-gap-detection`
- **Commerce** — `forecast-revenue`, `plan-demand`, `dynamic-pricing`, `generate-manufacturing-brief`
- **Creative** — `generate-content`, `generate-storyboard-frame`, `plan-video-ad`, `analyze-product-image`, `smart-ab-variants`
- **Campaigns** — `campaign-morph-suggestions`, `simulate-focus-group`, `optimal-timing`, `generate-performance-report`
- **Assistant** — `glass-box-chat`, `conversational-analytics`, `voice-to-brief`
- **Integrations** — Rainforest, Apify, DataForSEO, Shopify, Stripe

Deploy functions with the Supabase CLI:

```bash
supabase functions deploy <function-name>
```

## License

Private — all rights reserved.
