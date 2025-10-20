import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  CalendarPlus,
} from "lucide-react";
import { CreatePostModal } from "@/components/CreatePostModal";
import { EditPostModal } from "@/components/EditPostModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const upcomingEvents = [
    { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba", participants: 45 },
    { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark", participants: 32 },
    { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 },
  ];

  const fetchPostsAndProfiles = async () => {
    setLoading(true);
    try {
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: topProfilesData } = await supabase
        .from("profiles")
        .select("full_name, points")
        .order("points", { ascending: false, nullsLast: true })
        .limit(5);

      setProfiles(topProfilesData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load community feed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  const handleCreateEvent = () => {
    if (!isAdmin) return;
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast({ title: "Missing fields", description: "Please fill in all event details." });
      return;
    }
    toast({ title: "Event Created", description: `${newEvent.title} has been added.` });
    setNewEvent({ title: "", date: "", location: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO SECTION */}
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-4">EcoLakbay Community</h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with fellow eco-travelers, join events, and share sustainable tourism stories.
          </p>
          <Button variant="gold" size="lg" onClick={() => setCreatePostModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Share Your Story
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
        {/* FEED */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading community feed...</p>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No posts yet. Be the first to share your story!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* UPCOMING EVENTS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-forest">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="border-l-2 border-forest pl-4">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                    <p className="text-xs text-amber font-medium">{event.participants} joining</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setEventsModalOpen(true)}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* LEADERBOARD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-forest">Green Champions</CardTitle>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No champions yet. Start posting!
                </p>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}</span>
                        <span>{profile.full_name}</span>
                      </div>
                      <span className="text-xs text-amber">{profile.points || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="eco"
                size="sm"
                className="w-full mt-4"
                onClick={() => setLeaderboardModalOpen(true)}
              >
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EVENTS MODAL */}
      <Dialog open={eventsModalOpen} onOpenChange={setEventsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>All Events</DialogTitle>
            <DialogDescription>Browse or manage upcoming events.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {upcomingEvents.map((e, i) => (
              <div key={i} className="border p-3 rounded-lg">
                <h4 className="font-semibold">{e.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {e.date} — {e.location}
                </p>
                <p className="text-xs text-amber">{e.participants} joining</p>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-6 border-t pt-4 space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CalendarPlus className="w-4 h-4" /> Create New Event
              </h4>
              <Input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Input
                placeholder="Date (e.g. Dec 31, 2024)"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <DialogFooter>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LEADERBOARD MODAL */}
      <Dialog open={leaderboardModalOpen} onOpenChange={setLeaderboardModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Leaderboard</DialogTitle>
            <DialogDescription>Top Green Champions</DialogDescription>
          </DialogHeader>
          {profiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No leaderboard data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {profiles.map((p, i) => (
                <div key={i} className="flex justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span>{i + 1}.</span>
                    <span>{p.full_name}</span>
                  </div>
                  <span className="text-xs text-amber">{p.points || 0} pts</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />

      {/* Post Modals */}
      <CreatePostModal
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
        onPostCreated={fetchPostsAndProfiles}
      />
      <EditPostModal
        open={editPostModalOpen}
        onOpenChange={setEditPostModalOpen}
        onPostUpdated={fetchPostsAndProfiles}
        post={editingPost}
      />
    </div>
  );
};

export default Community;
