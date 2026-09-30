import type { AnalysisResult } from "@/types";
import { CheckCircle2, AlertTriangle, ShieldAlert, Eye, AlertCircle, Lightbulb } from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  framesAnalyzed?: number;
}

const statusConfig = {
  safe: {
    icon: CheckCircle2,
    label: "Appears Safe",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  needs_review: {
    icon: AlertTriangle,
    label: "Needs Review",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  danger: {
    icon: ShieldAlert,
    label: "Potentially Dangerous",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export function AnalysisReport({ result, framesAnalyzed }: AnalysisReportProps) {
  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Status banner */}
      <div className={`rounded-2xl border ${config.border} ${config.bg} p-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${config.bg} ${config.color}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">AI Assessment</p>
            <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-200 leading-relaxed">{result.summary}</p>
        {framesAnalyzed !== undefined && (
          <p className="mt-2 text-xs text-ink-400">Based on analysis of {framesAnalyzed} key frames.</p>
        )}
      </div>

      {/* Observations */}
      <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-brand-400" />
          <h4 className="text-sm font-bold text-white">AI Observations</h4>
        </div>
        <ul className="space-y-2">
          {result.observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
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
        This is an AI-assisted analysis for advisory purposes only. It does not guarantee authenticity and should not replace human judgment or official verification channels.
      </p>
    </div>
  );
}
