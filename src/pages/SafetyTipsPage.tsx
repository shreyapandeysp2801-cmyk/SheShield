import { Lightbulb, Eye, Heart, Share2, Phone, MapPin, Shield, Users, Zap, Lock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/pages/ImageAnalyzerPage";
import { safetyTips } from "@/data/safetyTips";

const iconMap: Record<string, typeof Eye> = {
  Eye,
  Heart,
  Share2,
  Phone,
  MapPin,
  Shield,
  Users,
  Zap,
  Lock,
  MessageCircle,
};

export function SafetyTipsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Lightbulb}
        title="Safety Tips"
        subtitle="Essential women's safety tips that work offline — no internet connection needed."
      />

      <div className="rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-700/5 border border-brand-500/30 p-4">
        <p className="text-sm text-ink-200 leading-relaxed">
          These tips are always available, even without internet. Bookmark this page or keep it open for quick reference.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {safetyTips.map((tip, i) => {
          const Icon = iconMap[tip.icon] ?? Lightbulb;
          return (
            <div
              key={i}
              className="rounded-2xl bg-ink-800/50 border border-ink-700 hover:border-brand-500/30 p-4 transition-colors animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{tip.title}</h3>
                  <p className="text-xs text-ink-400 mt-1 leading-relaxed">{tip.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <Lightbulb className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-400 leading-relaxed">
          Remember: the best safety tool is awareness. Trust your instincts, stay connected with trusted contacts, and don't hesitate to seek help when you need it.
        </p>
      </div>
    </div>
  );
}
