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
import { Edit, Plus, Star, MessageSquare, BarChart2 } from 'lucide-react';
import { EditDestinationModal } from '@/components/EditDestinationModal'; // We can reuse the admin's edit modal!

// Define the shape of a user's destination
interface UserDestination {
  id: string;
  business_name: string;
  city: string;
  province: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  rating: number;
  review_count: number;
  // Include all other fields needed for the Edit modal
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
      
      setDestinations((data || []) as any);
      calculateStats((data || []) as any);

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

  const handleOpenEditModal = (destination: UserDestination) => {
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Destinations</CardTitle>
                <Button onClick={() => navigate('/register-destination')}>
                  <Plus className="mr-2 h-4 w-4" /> Register New Destination
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {destinations.length > 0 ? (
                    destinations.map((dest) => (
                      <div key={dest.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold text-lg">{dest.business_name}</p>
                          <p className="text-sm text-muted-foreground">{dest.city}, {dest.province}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-bold">{dest.rating?.toFixed(1) || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Rating</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">{dest.review_count || 0}</p>
                            <p className="text-xs text-muted-foreground">Reviews</p>
                          </div>
                          <Badge variant={statusColors[dest.status] || 'default'} className="capitalize w-24 text-center justify-center">
                            {dest.status}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(dest)}
                            disabled={dest.status !== 'approved'}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium">No destinations registered yet.</h3>
                      <p className="text-muted-foreground mt-2">Start by registering your first eco-friendly destination.</p>
                      <Button className="mt-4" onClick={() => navigate('/register-destination')}>
                        Register Your First Destination
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>

      <EditDestinationModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditModal}
        destination={editingDestination}
      />
    </>
  );
};

export default DestinationDashboard;
