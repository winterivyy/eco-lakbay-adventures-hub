import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, Loader2, Search, X } from "lucide-react";
import { DestinationRatingModal } from "@/components/DestinationRatingModal";
import { supabase } from "@/integrations/supabase/client";
import fallbackImage from "@/assets/zambales-real-village.jpg";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// --- Type Definitions (Merged for this component) ---
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
  website?: string;
  email?: string;
  sustainability_practices?: string;
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

const BUCKET_NAME = 'destination-photos';
interface DestinationsProps {
  isPreview?: boolean;
  limit?: number;
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const [provinces, setProvinces] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const ratingOptions = [
    { value: 'all', label: 'Any Rating' },
    { value: '4', label: '4 Stars & Up' },
    { value: '3', label: '3 Stars & Up' },
    { value: '2', label: '2 Stars & Up' },
  ];

  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase.from('destinations').select('*').eq('status', 'approved');
        if (dbError) throw dbError;
        if (data) {
          setDestinations(data);
          const uniqueProvinces = [...new Set(data.map(d => d.province).filter(Boolean))].sort();
          const uniqueTypes = [...new Set(data.map(d => d.business_type).filter(Boolean))].sort();
          setProvinces(['All Provinces', ...uniqueProvinces]);
          setBusinessTypes(['All Types', ...uniqueTypes]);
        }
      } catch (err: any) {
        setError("Failed to load destinations. Please try again later.");
        console.error("Error fetching destinations:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    const minRating = selectedRating && selectedRating !== 'all' ? parseFloat(selectedRating) : 0;
    return destinations.filter(destination => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm ? (
        destination.business_name.toLowerCase().includes(searchTermLower) ||
        destination.city.toLowerCase().includes(searchTermLower) ||
        destination.province.toLowerCase().includes(searchTermLower) ||
        destination.description.toLowerCase().includes(searchTermLower)
      ) : true;
      const matchesProvince = selectedProvince && selectedProvince !== 'All Provinces' ? destination.province === selectedProvince : true;
      const matchesType = selectedType && selectedType !== 'All Types' ? destination.business_type === selectedType : true;
      const matchesRating = minRating > 0 ? (destination.rating || 0) >= minRating : true;
      return matchesSearch && matchesProvince && matchesType && matchesRating;
    });
  }, [destinations, searchTerm, selectedProvince, selectedType, selectedRating]);

  const fetchReviews = async (destinationId: string) => {
    setReviewsLoading(true);
    setReviews([]);
    try {
      const { data, error } = await supabase.from('destination_ratings').select(`*, profiles (full_name, avatar_url)`).eq('destination_id', destinationId).order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data as Review[]);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    fetchReviews(destination.id);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProvince('');
    setSelectedType('');
    setSelectedRating('');
  };

  const isFiltered = searchTerm || selectedProvince || selectedType || selectedRating;

  const getPublicUrlFromPath = (path: string | null | undefined): string => {
    if (!path) return fallbackImage;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
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

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

   // If it's preview mode, we only render the content grid and a "View All" button
  if (isPreview) {
    return (
      <>
        {isLoading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-forest" /></div>}
        {error && <div className="text-center py-20 text-destructive">{error}</div>}
        {filteredDestinations.length > 0 && (
          <div className="text-center">
            {renderContent()}
            <Button 
              variant="eco" 
              size="lg" 
              className="mt-12" 
              onClick={() => navigate('/destinations')}
            >
              View All Destinations
            </Button>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-forest" /></div>;
    if (error) return <div className="text-center py-20 text-destructive">{error}</div>;

    if (filteredDestinations.length === 0) return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">No Destinations Found</h2>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    );
  

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} onClick={() => handleDestinationClick(destination)} className="group flex flex-col cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="w-full h-48 overflow-hidden">
                <img src={getPublicUrlFromPath(destination.images?.[0])} alt={destination.business_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={e => { e.currentTarget.src = fallbackImage; }} />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2"><CardTitle className="text-xl text-forest">{destination.business_name}</CardTitle><Badge variant="secondary">{destination.business_type}</Badge></div>
                <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {destination.city}, {destination.province}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-4 pt-0">
              <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden text-sm">{destination.description}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-amber fill-amber" /><span className="font-medium text-sm">{destination.rating?.toFixed(1) || 'New'}</span><span className="text-muted-foreground text-xs ml-1">({destination.review_count || 0} reviews)</span></div>
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
          <Card className="mb-12">
            <CardHeader><CardTitle>Find Your Destination</CardTitle><CardDescription>Use the search and filters below to discover your next sustainable adventure.</CardDescription></CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="text" placeholder="Search destinations, city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Provinces" /></SelectTrigger><SelectContent>{provinces.map(province => (<SelectItem key={province} value={province}>{province}</SelectItem>))}</SelectContent></Select>
                <Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger><SelectContent>{businessTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="w-full md:w-[180px]"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Any Rating" /></div></SelectTrigger>
                  <SelectContent>{ratingOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </CardContent>
            {isFiltered && (<CardFooter><Button variant="ghost" onClick={handleResetFilters} className="text-sm text-muted-foreground"><X className="w-4 h-4 mr-2" /> Reset Filters</Button></CardFooter>)}
          </Card>

          <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-forest">{isLoading ? 'Loading...' : `${filteredDestinations.length} Eco-Certified Destination${filteredDestinations.length !== 1 ? 's' : ''} Found`}</h2></div>
          {renderContent()}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDestination && (
            <>
              <DialogHeader className="space-y-4">
                <div className="w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden relative"><img src={getPublicUrlFromPath(selectedDestination.images?.[currentImageIndex])} alt={`${selectedDestination.business_name} photo ${currentImageIndex + 1}`} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = fallbackImage; }} /></div>
                {(selectedDestination.images?.length ?? 0) > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">{selectedDestination.images?.map((imgPath: string, index: number) => (<button key={index} onClick={() => setCurrentImageIndex(index)} className={cn("w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0", index === currentImageIndex ? "border-forest" : "border-transparent")}><img src={getPublicUrlFromPath(imgPath)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" /></button>))}</div>
                )}
                <DialogTitle className="text-3xl text-forest !mt-2">{selectedDestination.business_name}</DialogTitle>
                <div className="flex flex-col sm:flex-row sm:justify-between text-muted-foreground pt-0 !mt-1"><p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedDestination.address}</p><a href={selectedDestination.website || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-forest hover:underline">{selectedDestination.website}</a></div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div><h3 className="font-semibold text-foreground mb-2">About this Destination</h3><p className="text-muted-foreground">{selectedDestination.description}</p></div>
                {selectedDestination.sustainability_practices && (<div><h3 className="font-semibold text-foreground mb-2">Our Sustainability Practices</h3><p className="text-muted-foreground whitespace-pre-line">{selectedDestination.sustainability_practices}</p></div>)}
                
                <div>
                  <h3 className="text-lg font-semibold text-forest mb-4">Reviews from our Community</h3>
                  {reviewsLoading ? (<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>) 
                  : reviews.length > 0 ? (
                    <div className="space-y-4">{reviews.map((review) => (
                        <div key={review.id} className="flex gap-4 p-4 border rounded-lg bg-muted/50">
                          <Avatar><AvatarImage src={review.profiles?.avatar_url} /><AvatarFallback>{getInitials(review.profiles?.full_name)}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1"><p className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</p><div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-amber fill-amber" />{review.overall_score.toFixed(1)}</div></div>
                            <p className="text-muted-foreground text-sm italic">"{review.comments}"</p>
                          </div>
                        </div>))}
                    </div>
                  ) : (<p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to leave one!</p>)}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button variant="eco" className="flex-1" onClick={() => handleRateClick(selectedDestination)}>⭐ Leave a Review</Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleViewOnMap(selectedDestination)}><MapPin className="mr-2 h-4 w-4" />View on Map</Button>
                  {selectedDestination.email && <Button variant="outline" asChild><a href={`mailto:${selectedDestination.email}`}>Contact</a></Button>}
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