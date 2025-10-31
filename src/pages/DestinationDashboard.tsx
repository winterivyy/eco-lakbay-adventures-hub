import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Star, MessageSquare, BarChart2, MapPin } from 'lucide-react';
import { EditDestinationModal } from '@/components/EditDestinationModal';
import fallbackImage from '@/assets/zambales-real-village.jpg'; // Import the fallback image

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
  const [stats, setStats] = useState({ approved: 0, averageRating: 0, totalReviews: 0 });

  const [editingDestination, setEditingDestination] = useState<UserDestination | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
 const handleEditClick = (destination: UserDestination) => {
    if (destination.status !== 'approved') {
        if (!confirm(`This destination is currently "${destination.status}". You can edit the details, but it will need to be re-approved by an admin to be visible. Do you want to continue?`)) {
            return;
        }
    }
    setEditingDestination(destination);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleSaveEditModal = () => {
    handleCloseEditModal();
    toast({ title: "Success", description: "Your destination has been updated." });
    fetchUserDestinations(); // Refresh data after saving
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
                                    <Card key={dest.id} className="group flex flex-col overflow-hidden">
                                        <CardHeader className="p-0 relative">
                                            <div className="absolute top-2 right-2 z-10"><Badge variant={statusColors[dest.status] || 'default'} className="capitalize">{dest.status}</Badge></div>
                                            <div className="w-full h-48 overflow-hidden">
                                                <img src={getPublicUrlFromPath(dest.images?.[0])} alt={dest.business_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={e => { e.currentTarget.src = fallbackImage; }}/>
                                            </div>
                                            <div className="p-4">
                                                <CardTitle className="text-xl text-forest">{dest.business_name}</CardTitle>
                                                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {dest.city}, {dest.province}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex flex-col justify-between p-4 pt-0">
                                            <p className="text-muted-foreground mb-4 leading-relaxed h-20 overflow-hidden text-sm">{dest.description}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center space-x-1"><Star className="h-4 w-4 text-amber fill-amber" /><span className="font-medium text-sm">{dest.rating?.toFixed(1) || 'N/A'}</span><span className="text-muted-foreground text-xs ml-1">({dest.review_count || 0} reviews)</span></div>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(dest)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <h3 className="text-xl font-medium">No destinations registered yet.</h3>
                                <p className="text-muted-foreground mt-2">Start by registering your first eco-friendly destination to manage it here.</p>
                                <Button className="mt-6" onClick={() => navigate('/register-destination')}><Plus className="mr-2 h-4 w-4"/> Register Your First Destination</Button>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>

            {/* This modal logic is correct */}
            {editingDestination && (
                <EditDestinationModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveEditModal}
                    destination={editingDestination}
                    onDelete={() => { /* Not implemented yet, so an empty function is fine */ }}
                />
            )}
        </>
  );
};

export default DestinationDashboard;
