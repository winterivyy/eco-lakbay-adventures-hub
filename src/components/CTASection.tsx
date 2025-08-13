import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-hero rounded-lg shadow-xl text-center text-white py-16 px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Plan Your Sustainable Adventure?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Join thousands of travelers making a positive impact. Discover unique destinations, connect with the community, and travel with purpose.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="gold" onClick={() => navigate('/destinations')}>
              Explore Destinations
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-forest" onClick={() => navigate('/community')}>
              Join the Community
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
