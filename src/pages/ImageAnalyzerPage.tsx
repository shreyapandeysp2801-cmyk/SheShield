import { useRef, useState } from "react";
import { Upload, ImageIcon, Loader2, X, FileImage, Sparkles } from "lucide-react";
import { AnalysisReport } from "@/components/AnalysisReport";
import type { AnalysisResult } from "@/types";

export function ImageAnalyzerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult: AnalysisResult = {
        status: data.status || "needs_review",
        verdict: data.verdict,
        ai_percentage: data.ai_percentage,
        real_percentage: data.real_percentage,
        summary: data.summary || "Analysis completed.",
        observations: Array.isArray(data.observations) ? data.observations : [],
        limitations: Array.isArray(data.limitations) ? data.limitations : [],
        recommended_actions: Array.isArray(data.recommended_actions) ? data.recommended_actions : [],
      };

      setResult(analysisResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong during analysis.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        icon={ImageIcon}
        title="AI Image Detector"
        subtitle="Upload an image to find out whether it's AI-generated or a real photograph."
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border border-white/15 hover:border-brand-400 rounded-[1.75rem] p-8 md:p-14 text-center transition-all bg-[#090a0a] hover:bg-[#111313] group"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#b7a1d8] text-[#090a0a] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-display text-base font-semibold text-white">Upload an image to scan</p>
          <p className="text-xs text-white/45 mt-2">JPEG, PNG, WebP — up to 10MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#090a0a]">
            <img src={previewUrl!} alt="Uploaded preview" className="w-full max-h-72 object-contain" />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-400">
            <FileImage className="w-4 h-4" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-ink-600">•</span>
            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-300 disabled:opacity-60 text-[#090a0a] font-bold py-4 rounded-2xl transition-all active:scale-[.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Detect AI Image
                </>
              )}
            </button>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
      )}

      {result && <AnalysisReport result={result} />}

      {!result && !loading && !selectedFile && (
        <div className="rounded-2xl bg-[#090a0a] border border-white/10 p-4">
          <p className="text-xs text-white/45 leading-relaxed">
            This tool uses Sightengine's specialized AI-generated image detection model to analyze your image for synthetic patterns and artifacts. It returns a confidence score showing how likely the image is AI-generated or real.
          </p>
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Upload;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-brand-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}
