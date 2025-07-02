import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const userStats = {
    name: "Maria Santos",
    greenPoints: 1245,
    level: "Eco Explorer",
    tripsCompleted: 12,
    carbonSaved: 45.2,
    rank: 8,
    nextLevelPoints: 1500
  };

  const recentTrips = [
    {
      destination: "Mount Arayat",
      date: "Nov 28, 2024",
      carbonSaved: 3.2,
      points: 85,
      rating: 5
    },
    {
      destination: "Candaba Wetlands",
      date: "Nov 15, 2024",
      carbonSaved: 2.1,
      points: 65,
      rating: 4
    },
    {
      destination: "Clark Green City",
      date: "Oct 22, 2024",
      carbonSaved: 4.5,
      points: 95,
      rating: 5
    }
  ];

  const achievements = [
    { title: "First Eco Trip", icon: "🌱", unlocked: true },
    { title: "Carbon Saver", icon: "🌍", unlocked: true },
    { title: "Community Helper", icon: "🤝", unlocked: true },
    { title: "Green Ambassador", icon: "🏆", unlocked: false },
    { title: "Eco Master", icon: "🌟", unlocked: false },
    { title: "Planet Protector", icon: "🛡️", unlocked: false }
  ];

  const levelProgress = (userStats.greenPoints / userStats.nextLevelPoints) * 100;

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

              {/* Recent Trips */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Recent Eco Adventures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTrips.map((trip, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {index === 0 ? "🏔️" : index === 1 ? "🦅" : "🌆"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-forest">{trip.destination}</h4>
                            <p className="text-sm text-muted-foreground">{trip.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-amber">⭐</span>
                            <span className="text-sm font-medium">{trip.rating}/5</span>
                          </div>
                          <div className="text-xs text-forest">
                            +{trip.points} points • {trip.carbonSaved}kg CO₂ saved
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Trips
                  </Button>
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