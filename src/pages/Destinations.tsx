import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { DestinationRatingModal } from "@/components/DestinationRatingModal";
import { supabase } from "@/integrations/supabase/client";
import fallbackImage from "@/assets/zambales-real-village.jpg";

// Interface matches your database schema, now including optional lat/lon
interface Destination {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  address: string;
  city: string;
  province: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  images?: string[];
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any; // Allow other properties
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      setError(null);
      // The select('*') already gets us all the columns we need, including the new lat/lon
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        setError("Failed to load destinations.");
      } else if (data) {
        setDestinations(data as Destination[]);
      }
      setIsLoading(false);
    };
    fetchDestinations();
  }, []);

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };
  
  const handleRateClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(false);
    setIsRatingModalOpen(true);
  };

  const handleViewOnMap = (destination: Destination | null) => {
    if (!destination) return;
    let googleMapsUrl = '';
    
    // Prioritize precise coordinates if they exist
    if (destination.latitude && destination.longitude) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    } else {
      // Fallback to searching by address
      const query = encodeURIComponent(`${destination.business_name}, ${destination.address}, ${destination.city}, ${destination.province}`);
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (error) return <div className="flex flex-col items-center py-20 text-destructive"><AlertCircle className="w-12 h-12 mb-4" /><p>{error}</p></div>;
    if (destinations.length === 0) return <div className="text-center py-20"><h2 className="text-2xl font-semibold">No Destinations Found</h2></div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((destination) => (
          <Card key={destination.id} className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer flex flex-col" onClick={() => handleDestinationClick(destination)}>
            <CardHeader className="p-0">
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={(destination.images && destination.images[0]) ? destination.images[0] : fallbackImage}
                  alt={destination.business_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-forest">{destination.business_name}</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-accent text-white border-0">{destination.business_type}</Badge>
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {destination.city}, {destination.province}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden">{destination.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-amber fill-amber" />
                        <span className="font-medium text-sm">{destination.rating?.toFixed(1) || 'New'}</span>
                        <span className="text-muted-foreground text-xs">({destination.review_count || 0} reviews)</span>
                    </div>
                    <Button variant="eco" size="sm">View Details</Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Sustainable Destinations</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">Discover verified eco-friendly destinations that promote environmental conservation and support local communities.</p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12"><h2 className="text-2xl font-bold text-forest">{isLoading ? 'Loading...' : `${destinations.length} Eco-Certified Destinations`}</h2></div>
          {renderContent()}
        </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDestination && (
            <>
              <DialogHeader>
                <div className="w-full h-64 mb-4 rounded-lg overflow-hidden">
                    <img 
                      // Correctly use `selectedDestination` here
                      src={(selectedDestination.images && selectedDestination.images[0]) ? selectedDestination.images[0] : fallbackImage} 
                      // And also here
                      alt={selectedDestination.business_name}
                      className="w-full h-full object-cover"
                    />
                </div>
                <DialogTitle className="text-3xl text-forest mb-2">{selectedDestination.business_name}</DialogTitle>
                <div className="flex flex-col sm:flex-row sm:justify-between text-muted-foreground">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedDestination.address}</p>
                    <a href={selectedDestination.website || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-eco hover:underline">{selectedDestination.website}</a>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div><h3 className="text-lg font-semibold text-forest mb-2">About this Destination</h3><p className="text-muted-foreground leading-relaxed">{selectedDestination.description}</p></div>
                {selectedDestination.sustainability_practices && (<div><h3 className="text-lg font-semibold text-forest mb-2">Our Sustainability Practices</h3><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{selectedDestination.sustainability_practices}</p></div>)}

                {/* --- The Action buttons section is now updated --- */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button variant="eco" className="flex-1" onClick={() => handleRateClick(selectedDestination)}>⭐ Leave a Review</Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleViewOnMap(selectedDestination)}>
                    <MapPin className="mr-2 h-4 w-4" />View on Map
                  </Button>
                   <Button variant="outline" asChild><a href={`mailto:${selectedDestination.email}`}>Contact</a></Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <DestinationRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        destination={selectedDestination}
      />

      <Footer />
    </div>
  );
};

export default Destinations;
