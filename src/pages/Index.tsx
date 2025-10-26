import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import QuizSection from "@/components/QuizSection";
import VideosSection from "@/components/VideosSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Destinations from "@/pages/Destinations"; 
import MapSection from "@/components/MapSection"; // 👈 new import

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <StatsSection />
       <div>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">Featured Eco-Destinations</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover top-rated sustainable destinations verified by our program.</p>
            </div>
            <Destinations isPreview={true} limit={3} />
          </div>
      <QuizSection />
      <VideosSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
