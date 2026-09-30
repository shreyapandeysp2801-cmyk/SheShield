import { Shield, Siren, Image, Mic, Video, Phone, Lightbulb, ChevronRight, AlertCircle } from "lucide-react";
import type { PageId } from "@/types";

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 border border-ink-700 p-6 md:p-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-xl shadow-brand-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">SheShield</h1>
              <p className="text-xs md:text-sm text-brand-400 font-medium">Your Digital Safety Shield</p>
            </div>
          </div>
          <p className="text-sm md:text-base text-ink-300 leading-relaxed max-w-md">
            AI-powered media analysis and emergency tools to help you stay safe, verify suspicious content, and act fast in critical situations.
          </p>
        </div>
      </div>

      {/* Emergency Quick Access */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-700/5 border border-brand-500/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Siren className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Emergency Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:112"
            className="flex flex-col items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-brand-500/30"
          >
            <Siren className="w-7 h-7" />
            <span className="text-sm">Call 112</span>
          </a>
          <button
            onClick={() => onNavigate("emergency")}
            className="flex flex-col items-center justify-center gap-2 bg-ink-800 hover:bg-ink-700 active:scale-95 text-white font-bold py-5 rounded-2xl border border-ink-600 transition-all duration-200"
          >
            <Lightbulb className="w-7 h-7 text-brand-400" />
            <span className="text-sm">Emergency Hub</span>
          </button>
        </div>
      </div>

      {/* AI Analyzers */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 px-1">AI Media Analyzers</h2>
        <div className="space-y-3">
          <FeatureCard
            icon={Image}
            title="Image Analyzer"
            description="Upload an image to detect manipulation, deepfakes, or suspicious edits."
            onClick={() => onNavigate("image-analyzer")}
          />
          <FeatureCard
            icon={Mic}
            title="Audio Analyzer"
            description="Upload or record audio to transcribe and detect scam patterns or synthetic voices."
            onClick={() => onNavigate("audio-analyzer")}
          />
          <FeatureCard
            icon={Video}
            title="Video Analyzer"
            description="Upload a video clip to extract key frames and analyze for inconsistencies."
            onClick={() => onNavigate("video-analyzer")}
          />
        </div>
      </div>

      {/* Safety Tools */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 px-1">Safety Tools</h2>
        <div className="space-y-3">
          <FeatureCard
            icon={Phone}
            title="Simulated Incoming Call"
            description="Fake an incoming phone call to safely exit uncomfortable situations."
            onClick={() => onNavigate("simulated-call")}
          />
          <FeatureCard
            icon={Lightbulb}
            title="Safety Tips"
            description="Browse essential women's safety tips — works offline, no internet needed."
            onClick={() => onNavigate("safety-tips")}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-400 leading-relaxed">
          SheShield provides advisory AI analysis and safety tools. It does not replace professional help, official emergency services, or your own judgment.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-ink-800/50 hover:bg-ink-800 border border-ink-700 hover:border-brand-500/40 transition-all duration-200 text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-ink-500 group-hover:text-brand-400 transition-colors flex-shrink-0" />
    </button>
  );
}
