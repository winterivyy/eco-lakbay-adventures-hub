import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Users, TrendingUp, MapPin } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isAdmin, role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [userDestinations, setUserDestinations] = useState<any[]>([]);
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, loading, navigate, toast, isAdmin]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Load user destinations
      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });

      if (destinationsError) throw destinationsError;

      setUserDestinations(destinationsData || []);

      // If admin, load all destinations and users
      if (isAdmin) {
        // Load all destinations for admin
        const { data: allDestinationsData, error: allDestinationsError } = await supabase
          .from('destinations')
          .select('*')
          .order('created_at', { ascending: false });

        if (allDestinationsError) throw allDestinationsError;
        setAllDestinations(allDestinationsData || []);

        // Load all users for admin
        const { data: allUsersData, error: allUsersError } = await supabase
          .from('profiles')
          .select('*')
          .order('points', { ascending: false });

        if (allUsersError) throw allUsersError;
        setAllUsers(allUsersData || []);

        // Load statistics
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, created_at');
        
        const { data: calculatorData, error: calculatorError } = await supabase
          .from('calculator_entries')
          .select('carbon_footprint');

        if (!postsError && !calculatorError) {
          const totalPosts = postsData?.length || 0;
          const totalCalculations = calculatorData?.length || 0;
          const totalCarbonSaved = calculatorData?.reduce((sum, entry) => sum + (entry.carbon_footprint || 0), 0) || 0;
          
          setStats({
            totalPosts,
            totalCalculations,
            totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: "User profile has been updated successfully."
      });

      // Refresh users list
      const { data: updatedUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });
      
      setAllUsers(updatedUsers || []);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile.",
        variant: "destructive"
      });
    }
  };

  const handleApproveDestination = async (destinationId: string) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .update({ status: 'approved' })
        .eq('id', destinationId);

      if (error) throw error;

      toast({
        title: "Destination Approved",
        description: "The destination has been approved successfully."
      });

      loadUserData(); // Refresh data
    } catch (error) {
      console.error('Error approving destination:', error);
      toast({
        title: "Error",
        description: "Failed to approve destination.",
        variant: "destructive"
      });
    }
  };

  const handleRejectDestination = async (destinationId: string) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .update({ status: 'rejected' })
        .eq('id', destinationId);

      if (error) throw error;

      toast({
        title: "Destination Rejected",
        description: "The destination has been rejected."
      });

      loadUserData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting destination:', error);
      toast({
        title: "Error",
        description: "Failed to reject destination.",
        variant: "destructive"
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const userName = profile?.full_name || user.email?.split('@')[0] || 'EcoLakbay User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  // Mock stats for now - these would come from actual calculations
  const userStats = {
    name: userName,
    greenPoints: 0, // TODO: Calculate from actual trips
    level: "Eco Starter",
    tripsCompleted: userDestinations.filter(d => d.status === 'approved').length,
    carbonSaved: 0, // TODO: Calculate from calculator entries
    rank: 0, // TODO: Calculate actual ranking
    nextLevelPoints: 500
  };

  const recentDestinations = userDestinations.slice(0, 3).map(dest => ({
    destination: dest.business_name,
    date: new Date(dest.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    status: dest.status,
    type: dest.business_type
  }));

  const achievements = [
    { title: "First Eco Trip", icon: "🌱", unlocked: true },
    { title: "Carbon Saver", icon: "🌍", unlocked: true },
    { title: "Community Helper", icon: "🤝", unlocked: true },
    { title: "Green Ambassador", icon: "🏆", unlocked: false },
    { title: "Eco Master", icon: "🌟", unlocked: false },
    { title: "Planet Protector", icon: "🛡️", unlocked: false }
  ];

  const levelProgress = (userStats.greenPoints / userStats.nextLevelPoints) * 100;

  // Admin Dashboard
  if (isAdmin) {
    const totalDestinations = allDestinations.length;
    const pendingDestinations = allDestinations.filter(d => d.status === 'pending').length;
    const approvedDestinations = allDestinations.filter(d => d.status === 'approved').length;
    const totalUsers = allUsers.length;
    const totalPoints = allUsers.reduce((sum, user) => sum + (user.points || 0), 0);

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-white text-red-600 text-2xl font-bold">
                  {userStats.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                  <Badge variant="destructive">ADMIN</Badge>
                </div>
                <p className="text-xl text-white/90">
                  Managing EcoLakbay Platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="shadow-eco">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600 mb-2">{totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-eco">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600 mb-2">{totalDestinations}</div>
                  <div className="text-sm text-muted-foreground">Destinations</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-eco">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-amber-600 mb-2">{stats.totalPosts || 0}</div>
                  <div className="text-sm text-muted-foreground">Community Posts</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-eco">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalCalculations || 0}</div>
                  <div className="text-sm text-muted-foreground">Calculations Made</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-eco">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="text-3xl font-bold text-nature mb-2">{stats.totalCarbonSaved || 0}kg</div>
                  <div className="text-sm text-muted-foreground">CO₂ Calculated</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Destinations */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Pending Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allDestinations.filter(d => d.status === 'pending').map((dest) => (
                      <div key={dest.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div>
                          <h4 className="font-semibold text-forest">{dest.business_name}</h4>
                          <p className="text-sm text-muted-foreground">{dest.city}, {dest.province}</p>
                          <p className="text-xs text-muted-foreground">{dest.business_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApproveDestination(dest.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectDestination(dest.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingDestinations === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pending destinations</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Users Management */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                          </div>
                          <div>
                            <h4 className="font-semibold text-forest">{user.full_name || "Anonymous"}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-amber-600">{user.points || 0} pts</div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User: {user.full_name || user.email}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Full Name</Label>
                                  <Input 
                                    defaultValue={user.full_name || ""} 
                                    onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Points</Label>
                                  <Input 
                                    type="number"
                                    defaultValue={user.points || 0} 
                                    onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})}
                                  />
                                </div>
                                <div>
                                  <Label>Bio</Label>
                                  <Input 
                                    defaultValue={user.bio || ""} 
                                    onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <Input 
                                    defaultValue={user.location || ""} 
                                    onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleUpdateUser(user.user_id, editingUser)}
                                  className="w-full"
                                >
                                  Update User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Regular User Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-white text-forest text-2xl font-bold">
                {userStats.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userStats.name}!</h1>
              <p className="text-xl text-white/90">
                Level: {userStats.level} • Rank #{userStats.rank} globally
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Green Points & Level */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-2xl text-forest">Green Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber mb-2">
                        {userStats.greenPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Green Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-forest mb-2">
                        {userStats.tripsCompleted}
                      </div>
                      <div className="text-sm text-muted-foreground">Eco Trips</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-nature mb-2">
                        {userStats.carbonSaved}kg
                      </div>
                      <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress to {userStats.level} Pro</span>
                      <span className="text-sm text-muted-foreground">
                        {userStats.greenPoints}/{userStats.nextLevelPoints}
                      </span>
                    </div>
                    <Progress value={levelProgress} className="h-3" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {userStats.nextLevelPoints - userStats.greenPoints} points to next level
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="eco" className="flex-1">
                      Redeem Points
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Destinations */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Your Registered Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDestinations.length > 0 ? (
                      recentDestinations.map((dest, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">
                              {dest.type === 'hotel' ? "🏨" : 
                               dest.type === 'restaurant' ? "🍽️" : 
                               dest.type === 'attraction' ? "🏞️" : "🏢"}
                            </div>
                            <div>
                              <h4 className="font-semibold text-forest">{dest.destination}</h4>
                              <p className="text-sm text-muted-foreground">Registered {dest.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              dest.status === 'approved' ? 'default' : 
                              dest.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {dest.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No destinations registered yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate('/register-destination')}
                        >
                          Register Your First Destination
                        </Button>
                      </div>
                    )}
                  </div>
                  {recentDestinations.length > 0 && (
                    <Button variant="outline" className="w-full mt-4">
                      View All Destinations
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Achievements */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>
                          {achievement.icon}
                        </div>
                        <div className={`text-xs ${achievement.unlocked ? 'text-forest' : 'text-muted-foreground'}`}>
                          {achievement.title}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Badges
                  </Button>
                </CardContent>
              </Card>

              {/* Leaderboard Position */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Your Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <div className="text-2xl font-bold text-amber mb-2">
                      #{userStats.rank}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Global Eco Ranking
                    </div>
                    <Badge variant="secondary" className="bg-gradient-accent text-white">
                      Top 1% Eco Travelers
                    </Badge>
                  </div>
                  <Button variant="eco" size="sm" className="w-full mt-4">
                    View Leaderboard
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      🗺️ Plan New Trip
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      🧮 Calculate Carbon
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      📝 Write Review
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      🎁 Redeem Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;