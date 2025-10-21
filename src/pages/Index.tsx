import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import QuizSection from "@/components/QuizSection";
import VideosSection from "@/components/VideosSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection"; // 👈 new import

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <DestinationsPreview />

      {/* 🌍 Add the Map Section here */}
      <MapSection />

      <QuizSection />
      <VideosSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
