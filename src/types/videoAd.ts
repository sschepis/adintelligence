export type AspectRatio = "16:9" | "9:16" | "1:1";
export type CameraMotion = "static" | "pan-left" | "pan-right" | "zoom-in" | "zoom-out" | "dolly" | "tilt";
export type Transition = "cut" | "fade" | "dissolve" | "wipe" | "slide";

export interface ShotPlan {
  index: number;
  startSeconds: number;
  durationSeconds: number;
  visualPrompt: string;
  cameraMotion: CameraMotion;
  transition: Transition;
  onScreenText?: string;
  voiceoverLine?: string;
}

export interface ProductionManifest {
  title: string;
  concept: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  soundtrack: { mood: string; description: string };
  voiceover: { voice: string; script: string };
  shots: ShotPlan[];
}

export type VideoAdJobStatus =
  | "planning"
  | "queued"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export interface VideoAdJob {
  id: string;
  org_id: string;
  user_id: string;
  brand_id: string | null;
  title: string;
  brief: string | null;
  manifest: ProductionManifest | Record<string, never>;
  status: VideoAdJobStatus;
  progress: number;
  output_url: string | null;
  thumbnail_url: string | null;
  error: string | null;
  provider: string | null;
  provider_job_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
