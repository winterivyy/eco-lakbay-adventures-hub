import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import VideosSection from "@/components/VideosSection";

// --- Integration Starts Here ---
import { VideoProvider } from "@/components/VideoProvider"; // Adjust the path if needed
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer"; // Adjust the path if needed

const Index = () => {
  return (
    // 1. Wrap everything in the VideoProvider
    <VideoProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <HeroSection />
        <StatsSection />
        <DestinationsPreview />
        <VideosSection />
        <HowItWorks />
        <CTASection />
        
        <Footer />
      </div>

      {/* 2. Place the player here, so it can float above all other content */}
      <FloatingVideoPlayer />
    </VideoProvider>
  );
};

export default Index;
