import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostModal } from "@/components/CreatePostModal";
import { EditPostModal } from "@/components/EditPostModal";
import { CreateEventModal } from "@/components/CreateEventModal"; // The new modal
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Heart,
  MessageSquare,
  Share2,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- INTERFACES FOR TYPE SAFETY ---
interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  author_id: string;
  likes_count?: number;
  comments_count?: number;
  profiles: Profile | null;
  userLiked: boolean;
}

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  points?: number;
}

interface Comment {
  id: string;
  created_at: string;
  content: string;
  profiles: { full_name: string; avatar_url?: string } | null;
}

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
}

// --- MAIN COMPONENT ---
const Community = () => {
  // --- STATE MANAGEMENT ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [topProfiles, setTopProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  
  // Modal-specific state
  const [viewAllEventsOpen, setViewAllEventsOpen] = useState(false);
  const [viewLeaderboardOpen, setViewLeaderboardOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  // State for events and leaderboard data
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allEventsParticipants, setAllEventsParticipants] = useState<{[key: string]: number}>({});
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  const [fullLeaderboard, setFullLeaderboard] = useState<Profile[]>([]);

  // --- HOOKS ---
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  // Data for the sidebar preview card
  const upcomingEventsPreview = [
    { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 },
    { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 },
    { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 },
  ];

  // --- DATA FETCHING LOGIC ---
  const fetchPostsAndProfiles = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (postsError) throw postsError;
      
      const { data: topProfilesData, error: topProfilesError } = await supabase.from("profiles").select("user_id, full_name, points, avatar_url").order("points", { ascending: false, nullsLast: true }).limit(5);
      if (topProfilesError) throw topProfilesError;
      setTopProfiles(topProfilesData || []);
      
      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map((post) => post.author_id))];
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds);
        if (profilesError) throw profilesError;

        let userLikes: string[] = [];
        if (user) {
          const { data: likesData } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
          userLikes = likesData?.map((l) => l.post_id) || [];
          const { data: currentUserProfile } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
          setProfile(currentUserProfile);
        }
        
        const postsWithData = postsData.map((post) => ({
          ...post,
          profiles: profilesData?.find((p) => p.user_id === post.author_id) || null,
          userLiked: userLikes.includes(post.id),
        }));
        
        setPosts(postsWithData as Post[]);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.error("Error loading community feed:", error);
      toast({ title: "Error loading community feed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFullLeaderboard = async () => {
    setIsModalLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, points, avatar_url").order("points", { ascending: false, nullsLast: true });
      if (error) throw error;
      setFullLeaderboard(data || []);
    } catch (error) {
      console.error("Error fetching full leaderboard:", error);
      toast({ title: "Could not load leaderboard", variant: "destructive" });
    } finally {
      setIsModalLoading(false);
    }
  };
  
  const fetchAllEvents = async () => {
    setIsModalLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabase.from("events").select("id, title, date, location").order("date", { ascending: true });
      if (eventsError) throw eventsError;

      if (eventsData) {
        // We can get the counts more efficiently like this.
        // This RPC call assumes you have the `event_participants` table setup.
        // It's more complex, a simple fetch would also work but be less performant.
        // For simplicity, let's stick to a simpler method if RPC is too advanced.
        
        // Let's do a map for counts instead.
        const countsPromises = eventsData.map(event =>
            supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', event.id)
        );
        const countsResults = await Promise.all(countsPromises);

        const countsMap = eventsData.reduce((acc, event, index) => {
            acc[event.id] = countsResults[index].count || 0;
            return acc;
        }, {} as {[key: string]: number});
        
        setAllEvents(eventsData || []);
        setAllEventsParticipants(countsMap);
      }
    } catch (error: any) {
      console.error("Error fetching all events:", error);
      toast({ title: "Could not load events.", description: error.message, variant: "destructive" });
    } finally {
      setIsModalLoading(false);
    }
  };

  const fetchJoinedEvents = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase.from('event_participants').select('event_id').eq('user_id', user.id);
        if (error) throw error;
        const joinedIds = new Set(data.map(item => item.event_id));
        setJoinedEvents(joinedIds);
    } catch (error) {
        console.error("Could not fetch joined events", error);
    }
  }

  // --- useEffect HOOKS ---
  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  useEffect(() => {
    if (viewAllEventsOpen) {
      fetchAllEvents();
      fetchJoinedEvents();
    }
  }, [viewAllEventsOpen, user]);

  useEffect(() => {
    if (viewLeaderboardOpen) {
      fetchFullLeaderboard();
    }
  }, [viewLeaderboardOpen]);


  // --- EVENT HANDLERS ---
  const handleLike = async (postId: string) => { /* ... Omitted for brevity, keep your existing function ... */ };
  const handleAddComment = async (postId: string) => { /* ... Omitted for brevity, keep your existing function ... */ };
  const handleShare = async (post: Post) => { /* ... Omitted for brevity, keep your existing function ... */ };
  const toggleComments = (postId: string) => { /* ... Omitted for brevity, keep your existing function ... */ };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
        toast({ title: "Please log in to join events", variant: "destructive" });
        return;
    }
    
    // Optimistic UI update
    setJoinedEvents(prev => new Set(prev).add(eventId));
    setAllEventsParticipants(prev => ({...prev, [eventId]: (prev[eventId] || 0) + 1 }));

    try {
        const { error } = await supabase.from('event_participants').insert({ event_id: eventId, user_id: user.id });
        if (error) {
            // Gracefully handle if user already joined
            if (error.code === '23505') {
                 toast({ title: "You've already joined this event!" });
                 return;
            }
            throw error;
        }
        toast({ title: "You've joined the event!", description: "See you there!" });
    } catch (error: any) {
        console.error("Error joining event", error);
        toast({ title: "Failed to join event", description: error.message, variant: "destructive" });
        // Revert optimistic update on failure
        setJoinedEvents(prev => {
            const newSet = new Set(prev);
            newSet.delete(eventId);
            return newSet;
        });
        setAllEventsParticipants(prev => ({...prev, [eventId]: (prev[eventId] || 1) - 1 }));
    }
  }

  // --- HELPER FUNCTIONS ---
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatEventDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const getInitials = (n?: string) => n?.split(" ").map((i) => i[0]).join("").toUpperCase() || "U";
  const getRankIndicator = (i: number) => ["🏆", "🥈", "🥉"][i] || `${i + 1}.`;

 return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="bg-gradient-hero py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">EcoLakbay Community</h1>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">Connect with eco-travelers, share your stories, and inspire sustainable adventures.</p>
        <Button variant="gold" size="lg" onClick={() => setCreatePostModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Share Your Story
        </Button>
      </div>
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Rendering Logic - Keep as is */}
        </div>
        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
            <CardContent>
              {upcomingEventsPreview.map((e, i) => (
                <div key={i} className="border-l-2 border-forest pl-3 mb-3 last:mb-0">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date} • {e.location}</p>
                  <p className="text-xs text-amber">{e.participants} joining</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setViewAllEventsOpen(true)}>View All Events</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Green Champions</CardTitle></CardHeader>
            <CardContent>
              {topProfiles.map((p, i) => (
                <div key={p.user_id} className="flex justify-between items-center mb-2 last:mb-0">
                  <div className="flex items-center gap-2"><span className="w-6 text-center">{getRankIndicator(i)}</span><span>{p.full_name}</span></div>
                  <Badge variant="gold">{p.points || 0} pts</Badge>
                </div>
              ))}
              <Button variant="eco" className="w-full mt-4" onClick={() => setViewLeaderboardOpen(true)}>View Leaderboard</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Footer />
      {/* --- MODALS --- */}
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} onPostCreated={fetchPostsAndProfiles} />
      <EditPostModal open={editPostModalOpen} onOpenChange={setEditPostModalOpen} onPostUpdated={fetchPostsAndProfiles} post={editingPost} />
      <CreateEventModal open={createEventModalOpen} onOpenChange={setCreateEventModalOpen} onEventCreated={() => { fetchAllEvents(); fetchJoinedEvents(); }} />

      <Dialog open={viewAllEventsOpen} onOpenChange={setViewAllEventsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader><DialogTitle>All Upcoming Events</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1 -mx-1">
            {isModalLoading ? (<p className="text-center text-muted-foreground py-4">Loading events...</p>) 
            : allEvents.length > 0 ? (
              allEvents.map((e) => {
                const isJoined = joinedEvents.has(e.id);
                return (
                  <Card key={e.id}>
                    <CardContent className="pt-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-sm text-muted-foreground">{formatEventDate(e.date)} • {e.location}</p>
                        <p className="text-sm text-amber">{allEventsParticipants[e.id] || 0} joining</p>
                      </div>
                      <Button size="sm" onClick={() => handleJoinEvent(e.id)} disabled={isJoined}>
                        {isJoined ? "Joined" : "Join"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            ) : (<p className="text-center text-muted-foreground py-4">No upcoming events found.</p>)}
          </div>
          {isAdmin && <Button className="mt-4 w-full" onClick={() => setCreateEventModalOpen(true)}>+ Create New Event</Button>}
        </DialogContent>
      </Dialog>

      {/* FIX: "Leaderboard" Modal */}
      <Dialog open={viewLeaderboardOpen} onOpenChange={setViewLeaderboardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Green Champions Leaderboard</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1 -mx-1">
            {isModalLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading leaderboard...</p>
            ) : fullLeaderboard.length > 0 ? (
              fullLeaderboard.map((p, i) => (
                <div key={p.user_id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-8 text-center text-lg text-muted-foreground">{getRankIndicator(i)}</span>
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={p.avatar_url} />
                      <AvatarFallback>{getInitials(p.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.full_name}</span>
                  </div>
                  <Badge variant="gold">{p.points || 0} pts</Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Leaderboard is empty.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;