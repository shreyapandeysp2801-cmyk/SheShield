import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HomePage } from "@/pages/HomePage";
import { ImageAnalyzerPage } from "@/pages/ImageAnalyzerPage";
import { AudioAnalyzerPage } from "@/pages/AudioAnalyzerPage";
import { VideoAnalyzerPage } from "@/pages/VideoAnalyzerPage";
import { EmergencyHubPage } from "@/pages/EmergencyHubPage";
import { SimulatedCallPage } from "@/pages/SimulatedCallPage";
import { SafetyTipsPage } from "@/pages/SafetyTipsPage";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import type { PageId } from "@/types";

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("home");

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#aeb8b8] text-white selection:bg-brand-400/30">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className={`md:ml-64 min-h-screen pb-24 md:pb-8 ${currentPage === "home" ? "bg-[#aeb8b8]" : "bg-[#090a0a]"}`}>
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-10 md:py-10">
          {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
          {currentPage === "image-analyzer" && <ImageAnalyzerPage />}
          {currentPage === "audio-analyzer" && <AudioAnalyzerPage />}
          {currentPage === "video-analyzer" && <VideoAnalyzerPage />}
          {currentPage === "emergency" && <EmergencyHubPage onNavigate={handleNavigate} />}
          {currentPage === "simulated-call" && <SimulatedCallPage />}
          {currentPage === "safety-tips" && <SafetyTipsPage />}
          {currentPage === "ai-assistant" && <AIAssistantPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
