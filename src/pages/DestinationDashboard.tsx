import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Star, MessageSquare, BarChart2, Loader2, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DestinationCard } from '@/components/DestinationCard'; 
import { EditDestinationModal } from '@/components/EditDestinationModal';
import { DestinationRatingModal } from '@/components/DestinationRatingModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import fallbackImage from '@/assets/zambales-real-village.jpg';


// --- Define your bucket name ---
const BUCKET_NAME = 'destination-photos'; // We can reuse the admin's edit modal!

// Define the shape of a user's destination
interface UserDestination {
  id: string;
  business_name: string;
  city: string;
  province: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  rating: number | null;
  review_count: number | null;
  images: string[] | null;
  description: string;
  [key: string]: any;
}

// Helper for status badge colors
const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  archived: 'outline',
};

const DestinationDashboard = () => {
 const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [destinations, setDestinations] = useState<UserDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ /* ... */ });

    // --- State for BOTH modals is now here ---
    const [selectedDestination, setSelectedDestination] = useState<UserDestination | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    
    // --- State for the view modal's content ---
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Please sign in", description: "You must be logged in to view your dashboard.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    if (user) {
      fetchUserDestinations();
    }
  }, [user, authLoading]);

  const fetchUserDestinations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*') // Select all columns from destinations
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDestinations(data || []);
      calculateStats(data || []);

    } catch (error: any) {
      console.error("Error fetching user destinations:", error);
      toast({ title: "Error", description: `Could not load your destinations: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const getInitials = (name: string | null): string => {
        if (!name) return "U";
        return name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
    };
   const fetchReviews = async (destinationId: string) => {
        setReviewsLoading(true);
        setReviews([]);
        try {
            const { data, error } = await supabase.from('destination_ratings').select(`*, profiles(full_name, avatar_url)`).eq('destination_id', destinationId).order('created_at', { ascending: false });
            if (error) throw error;
            setReviews(data as Review[]);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

  const calculateStats = (data: UserDestination[]) => {
    const approvedDests = data.filter(d => d.status === 'approved');
    const totalReviews = approvedDests.reduce((sum, d) => sum + (d.review_count || 0), 0);
    const totalRatingSum = approvedDests.reduce((sum, d) => sum + (d.rating || 0) * (d.review_count || 0), 0);
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;
    
    setStats({
      approved: approvedDests.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: totalReviews
    });
  };
  // --- NEW ---: Add the same helper function from your main Destinations page
  const getPublicUrlFromPath = (path: string | null | undefined): string => {
    if (!path) return fallbackImage;
    // Check if it's already a full URL (from old data)
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  };
 const handleRateClick = (destination: UserDestination | null) => {
        setSelectedDestination(destination);
        setIsViewModalOpen(false);
        setIsRatingModalOpen(true);
    };

    // --- MODIFIED ---: Click handler for the VIEW modal
    const handleCardClick = (destination: UserDestination) => {
        setSelectedDestination(destination);
        setCurrentImageIndex(0);
        fetchReviews(destination.id);
        setIsViewModalOpen(true);
    };
    
    // --- Handlers for the EDIT modal ---
    const handleEditClick = (destination: UserDestination) => {
        setSelectedDestination(destination);
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => setIsEditModalOpen(false);
    const handleSaveEditModal = () => {
        handleCloseEditModal();
        toast({ title: "Success", description: "Your destination has been updated." });
        fetchUserDestinations();
    };
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="bg-gradient-hero py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Destination Dashboard</h1>
            <p className="text-xl text-white/90">Manage your registered eco-friendly destinations.</p>
          </div>
        </div>

        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Destinations</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved} / {destinations.length}</div>
                  <p className="text-xs text-muted-foreground">Total destinations approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating} / 5</div>
                  <p className="text-xs text-muted-foreground">Across all your approved destinations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">Total reviews received</p>
                </CardContent>
              </Card>
            </div>

            {/* Destinations List */}
           <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-forest">Your Destinations</h2>
                <Button onClick={() => navigate('/register-destination')}>
                    <Plus className="mr-2 h-4 w-4" /> Register New Destination
                </Button>
            </div>
              
                             {/* --- THIS IS THE NEW UI --- */}
                        {destinations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {destinations.map((dest) => (
                                    <DestinationCard
                                        key={dest.id}
                                        destination={dest}
                                        onClick={() => handleCardClick(dest)} // Card click opens VIEW modal
                                        actionButton={
                                            <Button variant="outline" size="sm" onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click
                                                handleEditClick(dest);
                                            }}>
                                                <Edit className="mr-2 h-4 w-4"/> Edit
                                            </Button>
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <h3 className="text-xl font-medium">No destinations registered yet.</h3>
                                <p className="text-muted-foreground mt-2">Start by registering your first eco-friendly destination.</p>
                                <Button className="mt-6" onClick={() => navigate('/register-destination')}>
                                    <Plus className="mr-2 h-4 w-4"/> Register Your First Destination
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>

                        {/* The Dialog component now contains the full content for the detailed view */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                 {selectedDestination && (
                    <>
                        <DialogHeader className="space-y-4">
                            <div className="w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden relative"><img src={getPublicUrlFromPath(selectedDestination.images?.[currentImageIndex])} alt={`${selectedDestination.business_name} photo ${currentImageIndex + 1}`} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }} /></div>
                            {(selectedDestination.images?.length ?? 0) > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">{selectedDestination.images?.map((imgPath: string, index: number) => (<button key={index} onClick={() => setCurrentImageIndex(index)} className={cn("w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0", index === currentImageIndex ? "border-forest" : "border-transparent")}><img src={getPublicUrlFromPath(imgPath)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" /></button>))}</div>
                            )}
                            <DialogTitle className="text-3xl text-forest !mt-2">{selectedDestination.business_name}</DialogTitle>
                            {/* Adding DialogDescription to fix accessibility warning */}
                            <DialogDescription className="sr-only">Details for {selectedDestination.business_name}</DialogDescription>
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
                                ) : (<p className="text-center text-muted-foreground py-8">No reviews yet for this destination.</p>)}
                            </div>
                            
                            {/* We don't need a "Leave a Review" button on the owner's dashboard */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                <Button variant="outline" className="flex-1" onClick={() => handleViewOnMap(selectedDestination)}><MapPin className="mr-2 h-4 w-4" />View on Map</Button>
                                {selectedDestination.email && <Button variant="outline" asChild><a href={`mailto:${selectedDestination.email}`}>Contact</a></Button>}
                            </div>
                        </div>
                    </>
                 )}
              </DialogContent>
            </Dialog>

            {/* 2. The EDIT modal */}
            <EditDestinationModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSave={handleSaveEditModal}
                destination={selectedDestination}
                onDelete={() => {
                    handleCloseEditModal();
                    fetchUserDestinations();
                }}
            />

            {/* 3. The RATING modal */}
            <DestinationRatingModal 
                isOpen={isRatingModalOpen} 
                onClose={() => setIsRatingModalOpen(false)} 
                destination={selectedDestination} 
            />
        </>
  );
};

export default DestinationDashboard;
