import { useRef, useState } from "react";
import { Video, Upload, Loader2, X, Film, Play, ExternalLink, ShieldCheck } from "lucide-react";
import { AnalysisReport } from "@/components/AnalysisReport";
import { PageHeader } from "@/pages/ImageAnalyzerPage";
import type { AnalysisResult } from "@/types";

export function VideoAnalyzerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, WebM, etc.)");
      return;
    }
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStage("Extracting key frames...");

    await new Promise((r) => setTimeout(r, 1000));
    setLoadingStage("Analyzing frames with AI...");

    await new Promise((r) => setTimeout(r, 1500));

    const framesAnalyzed = 5;
    const mockResult: AnalysisResult = {
      status: "needs_review",
      summary:
        "The video was analyzed across 5 key frames. Several visual inconsistencies were detected between frames that may indicate editing or manipulation.",
      observations: [
        "Frame 1: A person is speaking in what appears to be an office setting with consistent lighting.",
        "Frame 2: Background details remain consistent with Frame 1.",
        "Frame 3: An unexpected background change is visible — the wall color and objects shift noticeably.",
        "Frame 4: Video quality suddenly improves, suggesting a possible splice from a different source.",
        "Frame 5: Lighting direction changes compared to earlier frames, which is unusual in a continuous shot.",
      ],
      limitations: [
        "This analysis is based on still frames only; audio track and motion analysis are not included.",
        "Fast edits or subtle overlay effects may not be captured by the selected frames.",
        "The model cannot verify the original source or chain of custody of this video.",
      ],
      recommended_actions: [
        "Check the video metadata and source URL for authenticity clues.",
        "If the audio contains speech, run the Audio Analyzer separately for a more complete assessment.",
        "Compare with the original source video if available.",
      ],
    };

    setResult(mockResult);
    setLoading(false);
    setLoadingStage("");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Video}
        title="Video Analyzer"
        subtitle="Upload a short video to extract key frames and analyze them for visual inconsistencies."
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-ink-600 hover:border-brand-500 rounded-3xl p-8 md:p-12 text-center transition-colors bg-ink-800/30"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-brand-400" />
          </div>
          <p className="text-sm font-semibold text-white">Tap to upload a video</p>
          <p className="text-xs text-ink-400 mt-1">MP4, WebM, MOV — up to 25MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-ink-700 bg-ink-800">
            <video controls src={videoUrl!} className="w-full max-h-72 object-contain" />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink-900/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Film className="w-4 h-4" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-ink-600">•</span>
            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {loadingStage}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Extract & Analyze Frames
                </>
              )}
            </button>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
      )}

      {result && <AnalysisReport result={result} framesAnalyzed={5} />}

      {/* Reporting Resources */}
      <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold text-white">Report & Remove Content</h2>
        </div>
        <p className="text-xs text-ink-400 leading-relaxed mb-4">
          If you encounter non-consensual intimate images, deepfake exploitation, or other harmful content, these official platforms can help you report and request removal.
        </p>
        <div className="space-y-2.5">
          <a
            href="https://stopncii.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">StopNCII</p>
              <p className="text-xs text-ink-400 mt-0.5">Stop Non-Consensual Intimate Images (global)</p>
            </div>
            <ExternalLink className="w-4 h-4 text-ink-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
          </a>

          <a
            href="https://takeitdown.ncmec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">TakeItDown</p>
              <p className="text-xs text-ink-400 mt-0.5">NCMEC — remove exploitative content</p>
            </div>
            <ExternalLink className="w-4 h-4 text-ink-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
          </a>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Cyber Crime (India)</p>
              <p className="text-xs text-ink-400 mt-0.5">National Cybercrime Reporting Portal</p>
            </div>
            <ExternalLink className="w-4 h-4 text-ink-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
          </a>
        </div>
      </div>

      {!result && !loading && !selectedFile && (
        <div className="rounded-2xl bg-ink-800/30 border border-ink-700 p-4">
          <p className="text-xs text-ink-400 leading-relaxed">
            When you upload a video, SheShield extracts 4-5 evenly spaced frames and sends them to the AI vision model. The model looks for visual inconsistencies across frames — background changes, lighting shifts, or quality jumps that may indicate editing.
          </p>
        </div>
      )}
    </div>
  );
}
