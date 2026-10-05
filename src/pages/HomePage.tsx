import { Shield, Siren, Image, Mic, Video, Phone, Lightbulb, ChevronRight, AlertCircle, MessageCircle, Activity, LockKeyhole, ScanLine } from "lucide-react";
import type { PageId } from "@/types";

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-[2rem] bg-[#090a0a] border border-white/10 p-6 md:p-8 overflow-hidden relative">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-2xl bg-brand-400 text-[#090a0a] flex items-center justify-center"><Shield className="w-5 h-5" /></div>
              <div><p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Personal safety system</p><h1 className="font-display text-2xl font-bold tracking-tight">SheShield</h1></div>
            </div>
            <p className="text-white/45 text-xs uppercase tracking-[0.18em] mb-3">Good to see you</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">Stay sharp.<br /><span className="text-brand-400">Move safely.</span></h2>
            <p className="text-sm text-white/55 leading-relaxed mt-4 max-w-md">Your private toolkit for checking suspicious media, getting clear safety guidance, and reaching help quickly.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 min-w-[180px]">
            <div className="relative w-11 h-11 rounded-full border-4 border-brand-400/20 border-t-brand-400 flex items-center justify-center"><span className="text-sm font-bold">4</span></div>
            <div><p className="text-[10px] text-white/40 uppercase tracking-wider">Safety level</p><p className="font-display font-semibold">Protected</p></div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-[#b8c4c3] text-[#090a0a] p-5 md:p-6">
        <div className="flex items-center justify-between mb-4"><div><p className="text-[10px] uppercase tracking-[0.18em] opacity-50">Quick action</p><h2 className="font-display text-xl font-bold mt-1">Emergency access</h2></div><Siren className="w-6 h-6" /></div>
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:112" className="flex items-center justify-center gap-2 bg-[#090a0a] hover:bg-brand-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[.98]"><Siren className="w-5 h-5" /> Call 112</a>
          <button onClick={() => onNavigate("emergency")} className="flex items-center justify-center gap-2 bg-white/50 hover:bg-white/70 font-bold py-4 rounded-2xl transition-all active:scale-[.98]"><Activity className="w-5 h-5" /> Open hub</button>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3 px-1"><div><p className="text-[10px] text-[#090a0a]/45 uppercase tracking-[0.18em]">Tools</p><h2 className="font-display text-xl font-bold text-[#090a0a]">Check your media</h2></div><ScanLine className="w-5 h-5 text-[#090a0a]/50" /></div>
        <div className="grid gap-3 md:grid-cols-3">
          <FeatureCard icon={Image} title="Image scan" description="Find signs of synthetic or manipulated images." tone="blue" onClick={() => onNavigate("image-analyzer")} />
          <FeatureCard icon={Mic} title="Audio scan" description="Check recordings for scam patterns or synthetic voices." tone="lilac" onClick={() => onNavigate("audio-analyzer")} />
          <FeatureCard icon={Video} title="Video scan" description="Review key frames for suspicious inconsistencies." tone="yellow" onClick={() => onNavigate("video-analyzer")} />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3 px-1"><div><p className="text-[10px] text-[#090a0a]/45 uppercase tracking-[0.18em]">More support</p><h2 className="font-display text-xl font-bold text-[#090a0a]">Safety tools</h2></div><LockKeyhole className="w-5 h-5 text-[#090a0a]/50" /></div>
        <div className="grid gap-3 md:grid-cols-3">
          <FeatureCard icon={MessageCircle} title="AI assistant" description="Ask for calm, practical safety guidance." tone="mint" onClick={() => onNavigate("ai-assistant")} />
          <FeatureCard icon={Phone} title="Safe exit" description="Create a simulated incoming call." tone="gray" onClick={() => onNavigate("simulated-call")} />
          <FeatureCard icon={Lightbulb} title="Safety tips" description="Browse useful guidance, even offline." tone="green" onClick={() => onNavigate("safety-tips")} />
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-[#090a0a]/90 border border-white/10 p-4"><AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-white/45 leading-relaxed">SheShield offers advisory analysis and safety tools. For immediate danger, contact local emergency services.</p></div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, tone, onClick }: { icon: typeof Shield; title: string; description: string; tone: "blue" | "lilac" | "yellow" | "mint" | "gray" | "green"; onClick: () => void }) {
  const tones = { blue: "bg-[#a9bddc]", lilac: "bg-[#b7a1d8]", yellow: "bg-[#e5cf55]", mint: "bg-[#9fc7ba]", gray: "bg-[#c2cbca]", green: "bg-[#b9ce87]" };
  return <button onClick={onClick} className={`group w-full min-h-[142px] flex flex-col justify-between text-left p-4 rounded-[1.4rem] ${tones[tone]} text-[#090a0a] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 active:scale-[.98]`}><div className="flex items-start justify-between"><span className="w-9 h-9 rounded-xl bg-white/75 flex items-center justify-center"><Icon className="w-[18px] h-[18px]" /></span><ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" /></div><div><h3 className="font-display font-bold text-sm">{title}</h3><p className="text-xs mt-1 leading-relaxed opacity-75">{description}</p></div></button>;
}
