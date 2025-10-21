// pages/index.tsx (or your homepage file)

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import QuizSection from "@/components/QuizSection";
import VideosSection from "@/components/VideosSection";

// --- 1. IMPORT YOUR NEW MAP COMPONENT ---
import MapPampanga from "@/components/MapPampanga";

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

      {/* --- 4. NEW MAP SECTION --- */}
      {/* This is the perfect place to add the map. It logically follows the destination previews. */}
      <section id="map-preview" className="max-w-7xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Find Them on the Map</h2>
          <p className="text-muted-foreground mt-2">
            Explore Pampanga's top eco-tourism spots interactively.
          </p>
        </div>
        <MapPampanga />
      </section>

      {/* 5. Quiz: short environment quiz awarding a green point on completion */}
      <QuizSection />

      {/* 6. Videos: educational / promotional YouTube videos */}
      <VideosSection />

      {/* 7. How It Works: A simple, clear guide for the user. */}
      <HowItWorks />

      {/* 8. Final Call to Action: A clear final prompt before the footer. */}
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default Index;
