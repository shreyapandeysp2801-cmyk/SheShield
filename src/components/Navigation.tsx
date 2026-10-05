import { Home, Image, Mic, Video, Siren, Phone, Lightbulb, MessageCircle, ShieldCheck, Settings2 } from "lucide-react";
import type { PageId } from "@/types";

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Overview", icon: Home },
  { id: "image-analyzer", label: "Image scan", icon: Image },
  { id: "audio-analyzer", label: "Audio scan", icon: Mic },
  { id: "video-analyzer", label: "Video scan", icon: Video },
  { id: "emergency", label: "Emergency", icon: Siren },
  { id: "simulated-call", label: "Safe exit", icon: Phone },
  { id: "safety-tips", label: "Safety tips", icon: Lightbulb },
  { id: "ai-assistant", label: "AI assistant", icon: MessageCircle },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#090a0a] border-r border-white/10 flex-col z-50">
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-brand-400 text-[#090a0a] flex items-center justify-center shadow-lg shadow-brand-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight">SheShield</h1>
                <p className="text-[10px] text-white/45 uppercase tracking-[0.18em]">Digital safety</p>
              </div>
            </button>
            <Settings2 className="w-4 h-4 text-white/35" />
          </div>
        </div>
        <div className="px-3 py-5 flex-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-white text-[#090a0a]" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.id === "image-analyzer" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="rounded-2xl bg-[#b8c4c3] p-4 text-[#090a0a]">
            <p className="text-xs font-semibold">Need immediate help?</p>
            <a href="tel:112" className="mt-3 flex items-center justify-center gap-2 w-full bg-[#090a0a] hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl transition-colors">
              <Siren className="w-4 h-4" /> Call 112
            </a>
          </div>
          <p className="text-[9px] text-white/25 font-medium tracking-wider uppercase text-center mt-4">Private by design</p>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#090a0a]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex justify-around items-center px-1 py-2 overflow-x-auto">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const isEmergency = item.id === "emergency";
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg min-w-[58px] transition-all duration-200 ${active ? "text-brand-400" : "text-white/45"}`}>
                <div className={`relative ${isEmergency && !active ? "bg-brand-400 p-1.5 rounded-full -mt-4" : ""}`}>
                  <Icon className={`${isEmergency && !active ? "w-5 h-5 text-[#090a0a]" : "w-5 h-5"}`} />
                </div>
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
