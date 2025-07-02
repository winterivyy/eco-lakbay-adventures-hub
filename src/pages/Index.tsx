import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <DestinationsPreview />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default Index;
