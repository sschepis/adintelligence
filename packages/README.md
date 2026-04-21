# Concentrik AI Packages

Nine modular npm packages that encapsulate the AI-driven functionality of the platform. Each package is independently versionable and can be consumed by this app or external apps.

| Package | Purpose |
|---|---|
| `@concentrik/gateway-client` | Shared Lovable AI Gateway client (auth, SSE, retries, tool-calls) |
| `@concentrik/brand-dna-engine` | Website ingestion, brand voice/personality extraction, consistency scoring |
| `@concentrik/signals-trend-intel` | Trend analysis, lifecycle prediction, competitor & market gap intel |
| `@concentrik/commerce-demand-ai` | Revenue forecasting, dynamic pricing, demand planning, manufacturing briefs |
| `@concentrik/creative-video-planner` | Shotstack-compatible ProductionManifest planning + validation + timing |
| `@concentrik/creative-copy-forge` | Long-form & variant text generation, A/B copy variants |
| `@concentrik/creative-visual-forge` | Image generation, storyboard frames, product image analysis |
| `@concentrik/assistant-conversational` | Glass-box chat, conversational analytics, voice-to-brief |
| `@concentrik/campaigns-optimizer` | Real-time morph suggestions, focus-group simulation, optimal timing |

All packages depend on `@concentrik/gateway-client` for LLM access.
