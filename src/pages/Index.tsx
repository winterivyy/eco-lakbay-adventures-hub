import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DestinationsPreview from "@/components/DestinationsPreview";
import QuizSection from "@/components/QuizSection";
import VideosSection from "@/components/VideosSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection"; // 👈 You have this import, we can add it in!

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Use a <main> tag for the primary page content for better accessibility and SEO */}
      <main>
        
        {/* The HeroSection typically handles its own background and styling, so it stands alone. */}
        <HeroSection />

        {/* Section 1: Social Proof & Core Offering (Light Background) */}
        {/* We use a section wrapper for consistent padding and max-width. */}
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-20">
            <StatsSection />
            <DestinationsPreview />
          </div>
        </section>

        {/* Section 2: Interactive Map (Slightly different background to stand out) */}
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MapSection /> 
          </div>
        </section>

        {/* Section 3: Engagement & Media (Dark Background) */}
        {/* A dark background creates a high-contrast "feature" area that breaks up the page flow. */}
        <section className="py-16 md:py-20 bg-slate-900 text-slate-50 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-20">
            <QuizSection />
            <VideosSection />
          </div>
        </section>

        {/* Section 4: Informational Section (Back to light background) */}
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HowItWorks />
          </div>
        </section>
        
        {/* The CTASection often has its own unique background, so it can stand alone as well. */}
        <CTASection />

      </main>

      <Footer />
    </div>
  );
};

export default Index;