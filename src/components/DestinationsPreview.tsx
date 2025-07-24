import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react"; // For loading indicator

// Import a fallback image in case a destination has none
import fallbackImage from "@/assets/zambales-real-village.jpg";

// Define an interface for the data we expect, matching your schema
interface DestinationPreview {
  id: string;
  business_name: string;
  city: string;
  province: string;
  rating: number | null;
  description: string;
  images: string[] | null;
}

const DestinationsPreview = () => {
  const navigate = useNavigate();
  
  // 1. Add state for loading and storing dynamic data
  const [destinations, setDestinations] = useState<DestinationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch data from Supabase when the component loads
  useEffect(() => {
    const fetchFeaturedDestinations = async () => {
      setLoading(true);
      setError(null);

      // This query gets the top 6 approved destinations with the highest rating
      const { data, error } = await supabase
        .from('destinations')
        .select('id, business_name, city, province, rating, description, images')
        .eq('status', 'approved')
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(6);

      if (error) {
        console.error("Error fetching featured destinations:", error);
        setError("Could not load featured destinations.");
      } else {
        setDestinations(data as DestinationPreview[]);
      }
      setLoading(false);
    };

    fetchFeaturedDestinations();
  }, []); // Empty array means this runs only once on mount

  const handleViewAllDestinations = () => {
    navigate("/destinations");
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">
            Featured Eco-Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover some of the best sustainable and breathtaking destinations, 
            verified by our eco-certification program.
          </p>
        </div>

        {/* 3. Handle Loading and Error states */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        )}

        {error && (
          <div className="text-center text-destructive h-64">
            <p>{error}</p>
          </div>
        )}

        {/* 4. Render the dynamic data */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <Card 
                key={destination.id} 
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                onClick={handleViewAllDestinations} // Navigate to the full list
              >
                <CardHeader className="p-0">
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={(destination.images && destination.images[0]) || fallbackImage}
                      alt={destination.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <CardTitle className="text-xl text-forest group-hover:text-forest-light transition-colors">
                      {destination.business_name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">{destination.city}, {destination.province}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden">
                    {destination.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-amber">⭐</span>
                      <span className="font-medium text-sm">{destination.rating?.toFixed(1) || 'New'}</span>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-forest hover:text-white">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="eco" size="lg" onClick={handleViewAllDestinations}>
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DestinationsPreview;
