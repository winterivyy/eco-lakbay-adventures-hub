import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import Footer from "@/components/Footer";

// --- NEW COMPONENTS TO CREATE (code will be provided below) ---
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* 1. Hero: Your inspiring welcome message. */}
      <HeroSection />

      {/* 2. Stats: Immediate proof of your impact. */}
      <StatsSection />

      {/* 3. Destinations: Your core product, the main event. */}
      <DestinationsPreview />

      {/* 4. How It Works: A simple, clear guide for the user. */}
      <HowItWorks />

      {/* 5. Final Call to Action: A clear final prompt before the footer. */}
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default Index;
