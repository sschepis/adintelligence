import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "packages/**/test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@concentrik/shared": path.resolve(__dirname, "./packages/shared/src"),
      "@concentrik/gateway-client": path.resolve(__dirname, "./packages/gateway-client/src"),
      "@concentrik/brand-dna-engine": path.resolve(__dirname, "./packages/brand-dna-engine/src"),
      "@concentrik/signals-trend-intel": path.resolve(__dirname, "./packages/signals-trend-intel/src"),
      "@concentrik/commerce-demand-ai": path.resolve(__dirname, "./packages/commerce-demand-ai/src"),
      "@concentrik/creative-copy-forge": path.resolve(__dirname, "./packages/creative-copy-forge/src"),
      "@concentrik/creative-visual-forge": path.resolve(__dirname, "./packages/creative-visual-forge/src"),
      "@concentrik/creative-video-planner": path.resolve(__dirname, "./packages/creative-video-planner/src"),
      "@concentrik/assistant-conversational": path.resolve(__dirname, "./packages/assistant-conversational/src"),
      "@concentrik/campaigns-optimizer": path.resolve(__dirname, "./packages/campaigns-optimizer/src"),
    },
  },
});
