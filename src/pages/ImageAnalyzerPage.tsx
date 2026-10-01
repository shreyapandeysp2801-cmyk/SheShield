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
    <div className="space-y-5">
      <PageHeader
        icon={ImageIcon}
        title="AI Image Detector"
        subtitle="Upload an image to find out whether it's AI-generated or a real photograph."
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-ink-600 hover:border-brand-500 rounded-3xl p-8 md:p-12 text-center transition-colors bg-ink-800/30"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-brand-400" />
          </div>
          <p className="text-sm font-semibold text-white">Tap to upload an image</p>
          <p className="text-xs text-ink-400 mt-1">JPEG, PNG, WebP — up to 10MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-ink-700 bg-ink-800">
            <img src={previewUrl!} alt="Uploaded preview" className="w-full max-h-72 object-contain" />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink-900/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-500 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
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
        <div className="rounded-2xl bg-ink-800/30 border border-ink-700 p-4">
          <p className="text-xs text-ink-400 leading-relaxed">
            This tool sends your image to an AI vision model that examines it for signs of AI generation — unnatural textures, inconsistent lighting, warped details, and other artifacts. Results are advisory and shown with limitations.
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
