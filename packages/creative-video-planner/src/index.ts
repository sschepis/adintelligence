// @concentrik/creative-video-planner — STUB
import type { GatewayClient } from "@concentrik/gateway-client";

export interface ProductionManifest {
  title: string;
  concept: string;
  totalDurationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  shots: Shot[];
  soundtrack?: { mood: string; bpm?: number };
  voiceoverScript?: string;
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
}

export interface ValidationIssue { path: string; message: string; severity: "error" | "warning"; }
export interface ValidationResult { ok: boolean; issues: ValidationIssue[]; }
export interface TimingIssue { kind: "overlap" | "gap"; betweenShots: [number, number]; deltaSeconds: number; }

export class VideoPlanner {
  constructor(private _gateway: GatewayClient) {}
  async plan(_input: { brief: string; brandDNA: unknown; aspectRatio: ProductionManifest["aspectRatio"]; targetDuration: number }, _opts?: { stream?: boolean }): Promise<ProductionManifest> { throw new Error("STUB"); }
  validate(_m: ProductionManifest): ValidationResult { throw new Error("STUB"); }
  analyzeTiming(_m: ProductionManifest): TimingIssue[] { throw new Error("STUB"); }
  retileShot(_m: ProductionManifest, _shotIndex: number): ProductionManifest { throw new Error("STUB"); }
  toShotstack(_m: ProductionManifest): unknown { throw new Error("STUB"); }
}
