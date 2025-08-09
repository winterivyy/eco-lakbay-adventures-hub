import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import fallbackImage from "@/assets/zambales-real-village.jpg";

// --- TYPE DEFINITIONS ---
interface DestinationPreview {
  id: string;
  business_name: string;
  city: string;
  province: string;
  rating: number | null;
  description: string;
  images: string[] | null;
  [key: string]: any; 
}

interface Review {
  id: string;
  overall_score: number;
  comments: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

const DestinationsPreview = () => {
  const navigate = useNavigate();
  
  const [destinations, setDestinations] = useState<DestinationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DestinationPreview | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedDestinations = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
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
  }, []);

  const fetchReviews = async (destinationId: string) => {
    setReviewsLoading(true);
    setReviews([]);
    try {
      const { data, error } = await supabase
        .from('destination_ratings')
        .select(`*, profiles (full_name, avatar_url)`)
        .eq('destination_id', destinationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data || []) as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDestinationClick = (destination: DestinationPreview) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
    fetchReviews(destination.id);
  };

  const handleViewAllDestinations = () => navigate("/destinations");
  const getInitials = (name: string | null) => { if (!name) return "U"; return name.split(' ').map(n => n[0]).join('').toUpperCase(); };

  return (
    <>
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">Featured Eco-Destinations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover some of the best sustainable and breathtaking destinations, verified by our eco-certification program.</p>
          </div>

          {loading && <div className="flex justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-forest" /></div>}
          {error && <div className="text-center text-destructive h-64"><p>{error}</p></div>}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination) => (
                <Card 
                  key={destination.id} 
                  className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                  onClick={() => handleDestinationClick(destination)}
                >
                  <CardHeader className="p-0">
                    <div className="w-full h-48 overflow-hidden">
                      <img src={(destination.images && destination.images[0]) || fallbackImage} alt={destination.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    </div>
                    <div className="p-4">
                      <CardTitle className="text-xl text-forest group-hover:text-forest-light transition-colors">{destination.business_name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">{destination.city}, {destination.province}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden">{destination.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-amber fill-amber" /><span className="font-medium text-sm">{destination.rating?.toFixed(1) || 'New'}</span></div>
                      <Button variant="outline" size="sm" className="hover:bg-forest hover:text-white">Learn More</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="eco" size="lg" onClick={handleViewAllDestinations}>View All Destinations</Button>
          </div>
        </div>
      </section>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDestination && (
            <>
              <DialogHeader>
                <div className="w-full h-64 mb-4 rounded-lg overflow-hidden">
                  <img src={(selectedDestination.images && selectedDestination.images[0]) || fallbackImage} alt={selectedDestination.business_name} className="w-full h-full object-cover" />
                </div>
                <DialogTitle className="text-3xl text-forest mb-2">{selectedDestination.business_name}</DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {selectedDestination.address || `${selectedDestination.city}, ${selectedDestination.province}`}</div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div><h3 className="text-lg font-semibold text-forest mb-2">About this Destination</h3><p className="text-muted-foreground leading-relaxed">{selectedDestination.description}</p></div>
                
                {selectedDestination.sustainability_practices && (
                  <div><h3 className="text-lg font-semibold text-forest mb-2">Our Sustainability Practices</h3><p className="text-muted-foreground leading-relaxed whitespace-pre-line">{selectedDestination.sustainability_practices}</p></div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-forest mb-4">Reviews from our Community</h3>
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="flex gap-4 p-4 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={review.profiles?.avatar_url} />
                            <AvatarFallback>{getInitials(review.profiles?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-amber fill-amber" />{review.overall_score.toFixed(1)}</div>
                            </div>
                            <p className="text-muted-foreground text-sm italic">"{review.comments}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No reviews yet for this destination. Be the first to leave one!</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="eco" className="flex-1" onClick={() => navigate(`/destinations`)}>See All Destinations & Rate</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DestinationsPreview;
