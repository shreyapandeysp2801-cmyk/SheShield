import { Home, Image, Mic, Video, Siren, Phone, Lightbulb } from "lucide-react";
import type { PageId } from "@/types";

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "image-analyzer", label: "Image", icon: Image },
  { id: "audio-analyzer", label: "Audio", icon: Mic },
  { id: "video-analyzer", label: "Video", icon: Video },
  { id: "emergency", label: "SOS", icon: Siren },
  { id: "simulated-call", label: "Fake Call", icon: Phone },
  { id: "safety-tips", label: "Tips", icon: Lightbulb },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-ink-900 border-r border-ink-700 flex-col z-50">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-ink-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldIcon />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">SheShield</h1>
            <p className="text-[10px] text-brand-400 font-medium tracking-wider uppercase">Safety Companion</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "text-ink-300 hover:bg-ink-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-ink-700">
          <div className="rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 border border-brand-500/30 p-4">
            <p className="text-xs text-brand-300 font-medium">Emergency?</p>
            <a href="tel:112" className="mt-2 flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg transition-colors">
              <Siren className="w-4 h-4" /> Call 112
            </a>
          </div>
          <p className="text-[9px] text-ink-500 font-medium tracking-wider uppercase text-center mt-3">An initiative by The Paradigm Shift</p>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900/95 backdrop-blur-lg border-t border-ink-700 z-50">
        <div className="flex justify-around items-center px-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const isEmergency = item.id === "emergency";
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg min-w-[58px] transition-all duration-200 ${
                  active ? "text-brand-400" : "text-ink-400"
                }`}
              >
                <div className={`relative ${isEmergency && !active ? "bg-brand-500 p-1.5 rounded-full -mt-4 shadow-lg shadow-brand-500/40" : ""}`}>
                  <Icon className={`${isEmergency && !active ? "w-5 h-5 text-white" : "w-5 h-5"}`} />
                </div>
                <span className={`text-[9px] font-medium ${active ? "text-brand-400" : "text-ink-400"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
