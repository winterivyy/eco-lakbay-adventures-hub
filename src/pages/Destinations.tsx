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
import { cn } from "@/lib/utils";
import { getPublicUrlFromPath } from "@/utils/getPublicUrlFromPath";

// Interface for a single destination, matching your database schema
interface Destination {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  address: string;
  city: string;
  province: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}
const BUCKET_NAME = 'destination-photos';
const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // This is the complete data fetching function
  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('destinations')
          .select('*')
          .eq('status', 'approved');

        if (dbError) throw dbError;
        if (data) {
          setDestinations(data);
        }
      } catch (err: any) {
        setError("Failed to load destinations. Please try again later.");
        console.error("Error fetching destinations:", err);
      } finally {
        setIsLoading(false); // This ensures the loading state is always turned off
      }
    };

    fetchDestinations();
  }, []); // Empty array ensures this runs only once

const getPublicUrlFromPath = (path: string | null | undefined): string => {
      if (!path) return fallbackImage;
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      return data.publicUrl;
  }

   const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentImageIndex(0); // Reset to the first image
    setIsModalOpen(true);
  };
  
  const handleRateClick = (destination: Destination | null) => {
    if (!destination) return;
    setSelectedDestination(destination);
    setIsModalOpen(false);
    setIsRatingModalOpen(true);
  };

  const handleViewOnMap = (destination: Destination | null) => {
    if (!destination) return;
    let googleMapsUrl = '';
    if (destination.latitude && destination.longitude) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    } else {
      const query = encodeURIComponent(`${destination.business_name}, ${destination.address}, ${destination.city}, ${destination.province}`);
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };
  
  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-forest" /></div>;
    if (error) return <div className="text-center py-20 text-destructive">{error}</div>;
    if (destinations.length === 0) return <div className="text-center py-20"><h2 className="text-2xl font-semibold">No Destinations Found</h2><p className="text-muted-foreground">Check back soon for new sustainable places to visit!</p></div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((destination) => (
          <Card key={destination.id} onClick={() => handleDestinationClick(destination)} className="group flex flex-col cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="w-full h-48 overflow-hidden">
               <img 
                  // Use the new, correct helper function
                  src={getPublicUrlFromPath(destination.images?.[0])}
                  alt={destination.business_name}
                  className="w-full h-full object-cover"
                />    </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2"><CardTitle className="text-xl text-forest">{destination.business_name}</CardTitle><Badge variant="secondary">{destination.business_type}</Badge></div>
                <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {destination.city}, {destination.province}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-4 pt-0">
                <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden">{destination.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-amber fill-amber" /><span className="font-medium text-sm">{destination.rating?.toFixed(1) || 'New'}</span><span className="text-muted-foreground text-xs ml-1">({destination.review_count || 0})</span></div>
                    <Button variant="outline" size="sm">View Details</Button>
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
          {selectedDestination && ( // We use `selectedDestination` for the entire modal
            <>
              <DialogHeader className="space-y-4">
                <div className="w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedDestination.images?.[currentImageIndex] || fallbackImage}
                    alt={`${selectedDestination.business_name} photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {(selectedDestination.images?.length ?? 0) > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedDestination.images?.map((imgSrc: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn( "w-16 h-16 rounded-md overflow-hidden ...", index === currentImageIndex && "ring-2 ...")}>
                        <img src={imgSrc} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <DialogTitle className="text-3xl text-forest !mt-2">{selectedDestination.business_name}</DialogTitle>
                <div className="flex flex-col sm:flex-row sm:justify-between text-muted-foreground pt-0 !mt-1">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedDestination.address}</p>
                  <a href={selectedDestination.website || '#'} target="_blank" rel="noopener noreferrer">{selectedDestination.website}</a>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div><h3 className="font-semibold ...">About this Destination</h3><p>{selectedDestination.description}</p></div>
                {selectedDestination.sustainability_practices && (<div><h3 className="font-semibold ...">Our Sustainability Practices</h3><p>{selectedDestination.sustainability_practices}</p></div>)}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button variant="eco" className="flex-1" onClick={() => handleRateClick(selectedDestination)}>⭐ Leave a Review</Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleViewOnMap(selectedDestination)}><MapPin className="mr-2 h-4 w-4" />View on Map</Button>
                  <Button variant="outline" asChild><a href={`mailto:${selectedDestination.email}`}>Contact</a></Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <DestinationRatingModal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} destination={selectedDestination} />
      <Footer />
    </div>
  );
};

export default Destinations;
