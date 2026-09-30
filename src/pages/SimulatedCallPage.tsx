import { useState, useEffect } from "react";
import { Phone, PhoneOff, AlertCircle, User } from "lucide-react";
import { PageHeader } from "@/pages/ImageAnalyzerPage";

export function SimulatedCallPage() {
  const [callState, setCallState] = useState<"idle" | "ringing" | "active">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState("Mom");
  const [callerId, setCallerId] = useState("+1 (555) 123-4567");

  useEffect(() => {
    if (callState !== "active") return;
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStartCall = () => {
    setCallState("ringing");
    setCallDuration(0);
  };

  const handleAccept = () => setCallState("active");
  const handleDecline = () => {
    setCallState("idle");
    setCallDuration(0);
  };

  if (callState === "idle") {
    return (
      <div className="space-y-5">
        <PageHeader
          icon={Phone}
          title="Simulated Incoming Call"
          subtitle="Fake an incoming phone call to safely exit uncomfortable or unsafe situations."
        />

        <div className="rounded-3xl bg-gradient-to-br from-brand-500/15 to-brand-700/5 border border-brand-500/30 p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-brand-500/20 flex items-center justify-center mb-4">
            <Phone className="w-10 h-10 text-brand-400" />
          </div>
          <p className="text-sm text-ink-200 leading-relaxed mb-5">
            When activated, your screen will display a realistic incoming call interface. Use it to politely excuse yourself from any situation.
          </p>
          <button
            onClick={handleStartCall}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            <Phone className="w-5 h-5" /> Trigger Fake Call
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-yellow-400">Simulation Only</p>
            <p className="text-xs text-ink-300 leading-relaxed mt-1">
              This is a visual simulation only. No real call will be placed and no telephony services are used. The caller name and number are fictional.
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
          <h3 className="text-sm font-bold text-white mb-3">Customize Caller</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ink-400 font-medium">Caller Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Mom, Dad, Boss..."
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-ink-900/70 border border-ink-600 text-sm text-white placeholder-ink-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400 font-medium">Caller ID</label>
              <input
                type="tel"
                value={callerId}
                onChange={(e) => setCallerId(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-ink-900/70 border border-ink-600 text-sm text-white placeholder-ink-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen call simulation
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-ink-800 via-ink-900 to-black flex flex-col items-center justify-between py-16 px-6 animate-fade-in">
      {/* Simulation banner */}
      <div className="w-full flex items-center justify-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-2">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">SIMULATION — No real call</span>
      </div>

      {/* Caller info */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-2xl shadow-brand-500/40">
          {callState === "ringing" ? (
            <div className="animate-ring">
              <Phone className="w-14 h-14 text-white" />
            </div>
          ) : (
            <User className="w-14 h-14 text-white" />
          )}
        </div>
        <div className="text-center">
          {callState === "ringing" ? (
            <>
              <h2 className="text-2xl font-bold text-white">{callerName || "Unknown"}</h2>
              <p className="text-sm text-ink-400 mt-1">Mobile · {callerId || "Private Number"}</p>
              <p className="text-xs text-brand-400 mt-3 animate-pulse">incoming call...</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">{callerName || "Unknown"}</h2>
              <p className="text-lg text-green-400 mt-2 font-mono">{formatDuration(callDuration)}</p>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-12">
        <button
          onClick={handleDecline}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-red-500/40">
            <PhoneOff className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-medium text-ink-300">Decline</span>
        </button>

        {callState === "ringing" && (
          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-green-500/40 animate-pulse-slow">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-medium text-ink-300">Accept</span>
          </button>
        )}
      </div>
    </div>
  );
}
