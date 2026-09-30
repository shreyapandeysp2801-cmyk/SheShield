import { useState } from "react";
import { Siren, MapPin, Phone, Copy, Check, Navigation, Share2, Lightbulb, AlertCircle, ShieldAlert, Heart, Baby, Car } from "lucide-react";
import { PageHeader } from "@/pages/ImageAnalyzerPage";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import type { PageId } from "@/types";

interface EmergencyHubPageProps {
  onNavigate: (page: PageId) => void;
}

export function EmergencyHubPage({ onNavigate }: EmergencyHubPageProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please allow location permissions to use this feature."
            : "Could not retrieve your location. Please try again."
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const mapLink = location
    ? `https://www.google.com/maps?q=${location.lat},${location.lon}`
    : null;

  const handleCopy = () => {
    if (mapLink) {
      navigator.clipboard.writeText(mapLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (mapLink && navigator.share) {
      try {
        await navigator.share({ title: "My Location — SheShield", url: mapLink });
      } catch {
        // user cancelled share
      }
    } else if (mapLink) {
      handleCopy();
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Siren}
        title="Emergency Hub"
        subtitle="Quick access to emergency calling, location sharing, and safety tools."
      />

      {/* Call 112 */}
      <a
        href="tel:112"
        className="block rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-center shadow-2xl shadow-brand-500/30 active:scale-[0.98] transition-transform"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
          <Phone className="w-10 h-10 text-white" />
        </div>
        <p className="text-3xl font-extrabold text-white tracking-wide">Call 112</p>
        <p className="text-sm text-brand-100 mt-1">Tap to call emergency services</p>
      </a>

      {/* National Cyber Crime Helpline */}
      <a
        href="tel:1930"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-ink-800 to-ink-800/50 border border-brand-500/30 p-4 hover:border-brand-500/60 active:scale-[0.98] transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-6 h-6 text-brand-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">National Cyber Crime</p>
          <p className="text-xs text-ink-400 mt-0.5">Report online fraud, scams & cybercrime</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-extrabold text-brand-400">1930</span>
          <span className="text-[10px] text-ink-500">Tap to call</span>
        </div>
      </a>

      {/* Helpline Directory */}
      <div className="rounded-3xl bg-ink-800/50 border border-ink-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Siren className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Helpline Directory</h2>
        </div>
        <div className="space-y-2.5">
          <a
            href="tel:181"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-pink-500/15 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Women Safety Helpline</p>
              <p className="text-xs text-ink-400 mt-0.5">24/7 support for women in distress</p>
            </div>
            <span className="text-lg font-extrabold text-brand-400">181</span>
          </a>

          <a
            href="tel:1098"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Baby className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Child Helpline</p>
              <p className="text-xs text-ink-400 mt-0.5">Child care & protection, 24/7</p>
            </div>
            <span className="text-lg font-extrabold text-brand-400">1098</span>
          </a>

          <a
            href="tel:112"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Police Emergency</p>
              <p className="text-xs text-ink-400 mt-0.5">Single emergency number for police</p>
            </div>
            <span className="text-lg font-extrabold text-brand-400">112</span>
          </a>

          <a
            href="tel:108"
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/50 border border-ink-700 hover:border-brand-500/40 active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Ambulance / Hospital</p>
              <p className="text-xs text-ink-400 mt-0.5">Medical emergency (108 or 102)</p>
            </div>
            <span className="text-lg font-extrabold text-brand-400">108</span>
          </a>
        </div>
      </div>

      {/* Emergency Contacts */}
      <EmergencyContacts />

      {/* Share Location */}
      <div className="rounded-3xl bg-ink-800/50 border border-ink-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Share My Location</h2>
        </div>

        {!location ? (
          <button
            onClick={handleShareLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 bg-ink-700 hover:bg-ink-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {locationLoading ? (
              <>
                <Navigation className="w-5 h-5 animate-spin" /> Getting your location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 text-brand-400" /> Share My Location
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3 animate-slide-up">
            <div className="rounded-xl bg-ink-900/70 border border-ink-600 p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Location detected</span>
              </div>
              <p className="text-sm text-white font-mono">
                {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
              </p>
              <a
                href={mapLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4" /> Open in Maps
              </a>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        )}

        {locationError && (
          <p className="mt-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {locationError}
          </p>
        )}
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("simulated-call")}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-ink-800/50 hover:bg-ink-800 border border-ink-700 hover:border-brand-500/40 transition-all"
        >
          <Phone className="w-8 h-8 text-brand-400" />
          <span className="text-sm font-bold text-white text-center">Fake Incoming Call</span>
        </button>
        <button
          onClick={() => onNavigate("safety-tips")}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-ink-800/50 hover:bg-ink-800 border border-ink-700 hover:border-brand-500/40 transition-all"
        >
          <Lightbulb className="w-8 h-8 text-brand-400" />
          <span className="text-sm font-bold text-white text-center">Safety Tips</span>
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-2xl bg-ink-800/50 border border-ink-700 p-4">
        <AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-400 leading-relaxed">
          The Call 112 button uses your device's dialer. On devices without cellular capability or when offline, the call may not complete. Location sharing requires browser permission and is shared only when you choose to — SheShield does not track you continuously.
        </p>
      </div>
    </div>
  );
}
