import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userDestinations, setUserDestinations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      setProfile(profileData);
      const { data: destData } = await supabase.from('destinations').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false });
      setUserDestinations(destData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
            </div>
            <Footer />
        </div>
    );
  }

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userStats = { name: userName, greenPoints: profile?.points || 0, level: "Eco Starter", tripsCompleted: userDestinations.filter(d => d.status === 'approved').length, carbonSaved: 0, rank: 0, nextLevelPoints: 500 };
  const recentDestinations = userDestinations.slice(0, 3).map(dest => ({ destination: dest.business_name, date: new Date(dest.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), status: dest.status, type: dest.business_type }));
  const achievements = [ { title: "First Eco Trip", icon: "🌱", unlocked: true }, { title: "Carbon Saver", icon: "🌍", unlocked: true }, { title: "Community Helper", icon: "🤝", unlocked: true }, { title: "Green Ambassador", icon: "🏆", unlocked: false }, { title: "Eco Master", icon: "🌟", unlocked: false }, { title: "Planet Protector", icon: "🛡️", unlocked: false } ];
  const levelProgress = userStats.nextLevelPoints > 0 ? (userStats.greenPoints / userStats.nextLevelPoints) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20"><AvatarFallback className="bg-white text-forest text-2xl font-bold">{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div><h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1><p className="text-xl text-white/90">Level: {userStats.level} • Rank #{userStats.rank} globally</p></div>
            </div>
        </div>
      </div>
      <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-eco">
                        <CardHeader><CardTitle className="text-2xl text-forest">Green Wallet</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center"><div className="text-3xl font-bold text-amber mb-2">{userStats.greenPoints.toLocaleString()}</div><div className="text-sm text-muted-foreground">Green Points</div></div>
                                <div className="text-center"><div className="text-3xl font-bold text-forest mb-2">{userStats.tripsCompleted}</div><div className="text-sm text-muted-foreground">Eco Trips</div></div>
                                <div className="text-center"><div className="text-3xl font-bold text-nature mb-2">{userStats.carbonSaved}kg</div><div className="text-sm text-muted-foreground">CO₂ Saved</div></div>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2"><span className="text-sm font-medium">Progress to {userStats.level} Pro</span><span className="text-sm text-muted-foreground">{userStats.greenPoints}/{userStats.nextLevelPoints}</span></div>
                                <Progress value={levelProgress} className="h-3" />
                                <div className="text-xs text-muted-foreground mt-1">{userStats.nextLevelPoints - userStats.greenPoints} points to next level</div>
                            </div>
                            <div className="mt-6 flex gap-3"><Button variant="eco" className="flex-1">Redeem Points</Button><Button variant="outline" className="flex-1">View Rewards</Button></div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-eco">
                        <CardHeader><CardTitle className="text-xl text-forest">Your Registered Destinations</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">{recentDestinations.length > 0 ? (recentDestinations.map((dest, index) => (<div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl">{dest.type === 'hotel' ? "🏨" : dest.type === 'restaurant' ? "🍽️" : dest.type === 'attraction' ? "🏞️" : "🏢"}</div>
                                    <div><h4 className="font-semibold text-forest">{dest.destination}</h4><p className="text-sm text-muted-foreground">Registered {dest.date}</p></div>
                                </div>
                                <div className="text-right"><Badge variant={dest.status === 'approved' ? 'default' : dest.status === 'pending' ? 'secondary' : 'destructive'}>{dest.status}</Badge></div>
                            </div>))) : (<div className="text-center py-8 text-muted-foreground"><p>No destinations registered yet.</p><Button variant="outline" className="mt-4" onClick={() => navigate('/register-destination')}>Register Your First Destination</Button></div>)}</div>
                            {recentDestinations.length > 0 && (<Button variant="outline" className="w-full mt-4">View All Destinations</Button>)}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="shadow-eco">
                        <CardHeader><CardTitle className="text-xl text-forest">Achievements</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">{achievements.map((achievement, index) => (<div key={index} className="text-center"><div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>{achievement.icon}</div><div className={`text-xs ${achievement.unlocked ? 'text-forest' : 'text-muted-foreground'}`}>{achievement.title}</div></div>))}</div>
                            <Button variant="outline" size="sm" className="w-full mt-4">View All Badges</Button>
                        </CardContent>
                    </Card>
                    <Card className="shadow-eco">
                        <CardHeader><CardTitle className="text-xl text-forest">Your Ranking</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center"><div className="text-4xl mb-4">🏆</div><div className="text-2xl font-bold text-amber mb-2">#{userStats.rank}</div><div className="text-sm text-muted-foreground mb-4">Global Eco Ranking</div><Badge variant="secondary" className="bg-gradient-accent text-white">Top 1% Eco Travelers</Badge></div>
                            <Button variant="eco" size="sm" className="w-full mt-4">View Leaderboard</Button>
                        </CardContent>
                    </Card>
                    <Card className="shadow-eco">
                        <CardHeader><CardTitle className="text-xl text-forest">Quick Actions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button variant="outline" size="sm" className="w-full justify-start">🗺️ Plan New Trip</Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">🧮 Calculate Carbon</Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">📝 Write Review</Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">🎁 Redeem Rewards</Button>
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

export default UserDashboard;
