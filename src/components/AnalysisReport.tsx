import type { AnalysisResult, DetectionVerdict } from "@/types";
import { CheckCircle2, AlertTriangle, ShieldAlert, Eye, AlertCircle, Lightbulb, Percent } from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  framesAnalyzed?: number;
}

const verdictConfig: Record<DetectionVerdict, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  likely_real: {
    icon: CheckCircle2,
    label: "Likely Real",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  uncertain: {
    icon: AlertTriangle,
    label: "Uncertain",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  likely_ai: {
    icon: ShieldAlert,
    label: "Likely AI-Generated",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

const statusConfig = {
  safe: { color: "text-green-400", bg: "bg-green-500" },
  needs_review: { color: "text-yellow-400", bg: "bg-yellow-500" },
  danger: { color: "text-red-400", bg: "bg-red-500" },
};

export function AnalysisReport({ result, framesAnalyzed }: AnalysisReportProps) {
  const verdict = result.verdict || (result.status === "safe" ? "likely_real" : result.status === "danger" ? "likely_ai" : "uncertain");
  const vConfig = verdictConfig[verdict];
  const VerdictIcon = vConfig.icon;
  const sConfig = statusConfig[result.status];
  const aiPct = result.ai_percentage ?? null;
  const realPct = result.real_percentage ?? null;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Verdict banner */}
      <div className={`rounded-2xl border ${vConfig.border} ${vConfig.bg} p-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${vConfig.bg} ${vConfig.color}`}>
            <VerdictIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">AI Image Detection</p>
            <p className={`text-lg font-bold ${vConfig.color}`}>{vConfig.label}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-200 leading-relaxed">{result.summary}</p>
        {framesAnalyzed !== undefined && (
          <p className="mt-2 text-xs text-ink-400">Based on analysis of {framesAnalyzed} key frames.</p>
        )}
      </div>

      {/* Confidence scores */}
      {aiPct !== null && (
        <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-brand-400" />
            <h4 className="text-sm font-bold text-white">Confidence Scores</h4>
          </div>

          {/* AI-generated bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400 font-medium">AI-Generated</span>
              <span className="text-white font-bold">{aiPct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${aiPct}%` }}
              />
            </div>
          </div>

          {/* Real bar */}
          {realPct !== null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400 font-medium">Real Photo</span>
                <span className="text-white font-bold">{realPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${realPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Observations */}
      <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-brand-400" />
          <h4 className="text-sm font-bold text-white">Detection Details</h4>
        </div>
        <ul className="space-y-2">
          {result.observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-200">
              <span className={`w-1.5 h-1.5 rounded-full ${sConfig.bg} mt-2 flex-shrink-0`} />
              {obs}
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-bold text-white">Limitations</h4>
        </div>
        <ul className="space-y-2">
          {result.limitations.map((lim, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-300">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-700/5 border border-brand-500/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-brand-400" />
          <h4 className="text-sm font-bold text-white">Recommended Actions</h4>
        </div>
        <ul className="space-y-2">
          {result.recommended_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-ink-500 text-center px-4 leading-relaxed">
        Powered by Sightengine AI-generated image detection. This is an AI-assisted analysis for advisory purposes only. It does not guarantee authenticity and should not replace human judgment or official verification channels.
      </p>
    </div>
  );
}
