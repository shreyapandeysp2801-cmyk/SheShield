export type AnalysisStatus = "safe" | "needs_review" | "danger";

export type DetectionVerdict = "likely_real" | "likely_ai" | "uncertain";

export interface AnalysisResult {
  status: AnalysisStatus;
  verdict?: DetectionVerdict;
  ai_percentage?: number;
  real_percentage?: number;
  summary: string;
  observations: string[];
  limitations: string[];
  recommended_actions: string[];
}

export type PageId =
  | "home"
  | "image-analyzer"
  | "audio-analyzer"
  | "video-analyzer"
  | "emergency"
  | "simulated-call"
  | "safety-tips";

export interface SafetyTip {
  icon: string;
  title: string;
  description: string;
}
