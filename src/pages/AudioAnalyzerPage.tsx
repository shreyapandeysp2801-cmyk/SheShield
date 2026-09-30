import { useRef, useState } from "react";
import { Mic, Upload, Loader2, X, AudioLines, Square, FileAudio } from "lucide-react";
import { AnalysisReport } from "@/components/AnalysisReport";
import { PageHeader } from "@/pages/ImageAnalyzerPage";
import type { AnalysisResult } from "@/types";

export function AudioAnalyzerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, etc.)");
      return;
    }
    setError(null);
    setResult(null);
    setTranscript(null);
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setSelectedFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setError(null);
      setResult(null);
      setTranscript(null);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions to record audio.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    await new Promise((r) => setTimeout(r, 2000));

    const mockTranscript =
      '"Congratulations! You have been selected for a special investment opportunity. You will double your money in just one week. Click the link to claim your reward now."';

    const mockResult: AnalysisResult = {
      status: "needs_review",
      summary:
        "The audio contains speech with characteristics commonly associated with scam or fraudulent content. The model detected several red flags in both the voice pattern and the transcribed content.",
      observations: [
        `Transcribed text: ${mockTranscript}`,
        "Voice tone sounds uniformly calm and lacks natural conversational intonation.",
        "Content includes phrases typical of known scams ('double your money', 'special opportunity').",
        "Urgency cues detected ('claim your reward now') — a common social engineering tactic.",
        "Background noise is absent, which is atypical for genuine phone calls.",
      ],
      limitations: [
        "Cannot definitively determine if the voice is synthetic or a real person speaking calmly.",
        "Transcription accuracy depends on audio quality and may contain errors.",
        "The model cannot verify the identity or intent of the speaker.",
      ],
      recommended_actions: [
        "Do not follow any instructions or click any links mentioned in the audio.",
        "If this was a call you received, report it to your local fraud or cybercrime authority.",
        "Consult a financial advisor before engaging with any investment offers.",
      ],
    };

    setTranscript(mockTranscript);
    setResult(mockResult);
    setLoading(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setResult(null);
    setTranscript(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Mic}
        title="Audio Analyzer"
        subtitle="Upload or record audio to transcribe speech and detect scam patterns or synthetic voices."
      />

      {!selectedFile && !recording ? (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-ink-600 hover:border-brand-500 rounded-3xl p-8 text-center transition-colors bg-ink-800/30"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-brand-400" />
            </div>
            <p className="text-sm font-semibold text-white">Tap to upload audio</p>
            <p className="text-xs text-ink-400 mt-1">MP3, WAV, M4A — up to 10MB</p>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-ink-700" />
            <span className="text-xs text-ink-500">or</span>
            <div className="flex-1 h-px bg-ink-700" />
          </div>

          <button
            onClick={handleStartRecording}
            className="w-full flex items-center justify-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            <Mic className="w-5 h-5 text-brand-400" /> Record Live Audio
          </button>
        </div>
      ) : recording ? (
        <div className="rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-700/5 border border-brand-500/40 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-500 flex items-center justify-center mb-4 animate-pulse">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-bold text-white">Recording...</p>
          <p className="text-xs text-ink-400 mt-1">Tap stop when finished</p>
          <button
            onClick={handleStopRecording}
            className="mt-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors mx-auto"
          >
            <Square className="w-4 h-4 fill-white" /> Stop Recording
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-ink-700 bg-ink-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <AudioLines className="w-6 h-6 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selectedFile?.name || "Recording"}</p>
                <p className="text-xs text-ink-400">{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center text-white hover:bg-brand-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full mt-3 h-10" />
            )}
          </div>

          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Transcribing & analyzing...
                </>
              ) : (
                <>
                  <FileAudio className="w-5 h-5" /> Analyze Audio
                </>
              )}
            </button>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>
      )}

      {transcript && (
        <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4 animate-slide-up">
          <h4 className="text-sm font-bold text-white mb-2">Transcript</h4>
          <p className="text-sm text-ink-200 leading-relaxed italic">{transcript}</p>
        </div>
      )}

      {result && <AnalysisReport result={result} />}
    </div>
  );
}
