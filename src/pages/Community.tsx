import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Community = () => {
  const posts = [
    {
      id: 1,
      author: "Maria Santos",
      avatar: "MS",
      time: "2 hours ago",
      type: "Event",
      title: "River Cleanup at Pampanga River - Join Us!",
      content: "Organizing a community river cleanup this Saturday. Let's protect our waterways together! 🌊 Free lunch and drinks provided for all volunteers.",
      likes: 24,
      comments: 8,
      greenPoints: 50,
      image: "🧹"
    },
    {
      id: 2,
      author: "Eco Lodge Arayat",
      avatar: "EL",
      time: "4 hours ago",
      type: "Business Update",
      title: "New Solar Panel Installation Complete!",
      content: "We're excited to announce that our lodge is now 100% solar powered! This reduces our carbon footprint by 80% and provides cleaner energy for our guests.",
      likes: 42,
      comments: 12,
      greenPoints: 100,
      image: "☀️"
    },
    {
      id: 3,
      author: "Juan dela Cruz",
      avatar: "JD",
      time: "6 hours ago",
      type: "Trip Report",
      title: "Amazing Sustainable Adventure at Mount Arayat",
      content: "Just completed a 3-day eco-trek at Mount Arayat. The sustainable trails and zero-waste camping were incredible. Highly recommend for conscious travelers!",
      likes: 18,
      comments: 5,
      greenPoints: 75,
      image: "🏔️"
    },
    {
      id: 4,
      author: "Green Pampanga Initiative",
      avatar: "GP",
      time: "1 day ago",
      type: "Educational",
      title: "5 Ways to Reduce Your Travel Carbon Footprint",
      content: "Tips for eco-conscious travelers: 1) Choose local transportation 2) Stay at green-certified accommodations 3) Support local businesses 4) Minimize waste 5) Offset your emissions",
      likes: 67,
      comments: 23,
      greenPoints: 25,
      image: "📚"
    }
  ];

  const upcomingEvents = [
    {
      title: "Mangrove Planting Day",
      date: "Dec 15, 2024",
      location: "Candaba Wetlands",
      participants: 45
    },
    {
      title: "Sustainable Tourism Workshop",
      date: "Dec 20, 2024",
      location: "Clark Green City",
      participants: 32
    },
    {
      title: "Cultural Heritage Walk",
      date: "Dec 22, 2024",
      location: "San Fernando",
      participants: 28
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            EcoLakbay Community
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Connect with fellow eco-travelers, local businesses, and conservation enthusiasts. 
            Share experiences, join events, and build a sustainable tourism community.
          </p>
          <Button variant="gold" size="lg">
            Share Your Story
          </Button>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-hover transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-forest text-white">
                              {post.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-forest">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{post.time}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {post.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{post.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-forest mb-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors">
                                <span>❤️</span>
                                <span className="text-sm">{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors">
                                <span>💬</span>
                                <span className="text-sm">{post.comments}</span>
                              </button>
                              <button className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors">
                                <span>📤</span>
                                <span className="text-sm">Share</span>
                              </button>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-amber">🌟</span>
                              <span className="text-sm font-medium">+{post.greenPoints} points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="border-l-2 border-forest pl-4">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                        <p className="text-xs text-amber font-medium">{event.participants} joining</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Events
                  </Button>
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">Green Champions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Ana Rodriguez", "Mike Chen", "Sarah Lopez"].map((name, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}</span>
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                        <span className="text-xs text-amber font-medium">
                          {1250 - index * 200} pts
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="eco" size="sm" className="w-full mt-4">
                    View Leaderboard
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-forest">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      📝 Share Trip Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      📅 Create Event
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      💡 Share Eco Tip
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      🤝 Find Travel Buddy
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

export default Community;