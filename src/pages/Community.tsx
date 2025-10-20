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

// Define interfaces for your data for better type safety
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
    title: string;
    date: string;
    location: string;
    participants: number;
}


const Community = () => {
  // --- STATE ---
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
  
  // FIX: State for the modals
  const [viewAllEventsOpen, setViewAllEventsOpen] = useState(false);
  const [viewLeaderboardOpen, setViewLeaderboardOpen] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [fullLeaderboard, setFullLeaderboard] = useState<Profile[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  // This is your hardcoded data for the sidebar preview
  const upcomingEventsPreview = [
    { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 },
    { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 },
    { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 },
  ];

  // --- DATA FETCHING ---
  const fetchPostsAndProfiles = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, profiles ( user_id, full_name, avatar_url )") // Join profiles directly
        .order("created_at", { ascending: false });
      if (postsError) throw postsError;

      const { data: topProfilesData, error: topProfilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, points, avatar_url")
        .order("points", { ascending: false, nullsLast: true })
        .limit(5);
      if (topProfilesError) throw topProfilesError;
      setTopProfiles(topProfilesData || []);

      let userLikes: string[] = [];
      if (user && postsData) {
        const { data: likesData } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
        userLikes = likesData?.map((l) => l.post_id) || [];
      }
      
      const postsWithLikeStatus = postsData?.map((post) => ({
        ...post,
        userLiked: userLikes.includes(post.id),
      })) || [];

      setPosts(postsWithLikeStatus as Post[]);

    } catch (error) {
      console.error(error);
      toast({ title: "Error loading community feed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  // FIX: Function to fetch ALL events for the modal
  const fetchAllEvents = async () => {
    setIsModalLoading(true);
    // NOTE: This assumes you have an "events" table in Supabase.
    // If you don't, this will fall back to a larger hardcoded list for demonstration.
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      setAllEvents(data || []);
    } catch (error) {
      console.error("Error fetching all events:", error);
      toast({ title: "Could not load events.", description: "Displaying sample events.", variant: "default" });
      // Fallback data
      setAllEvents([
        ...upcomingEventsPreview,
        { title: "Eco-Brick Making Workshop", date: "Jan 05, 2025", location: "Angeles City", participants: 50 },
        { title: "River Cleanup Drive", date: "Jan 12, 2025", location: "Pampanga River", participants: 75 },
        { title: "Community Garden Setup", date: "Jan 19, 2025", location: "Mabalacat", participants: 25 },
      ]);
    } finally {
      setIsModalLoading(false);
    }
  };

  // FIX: Function to fetch the FULL leaderboard for the modal
  const fetchFullLeaderboard = async () => {
    setIsModalLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, points, avatar_url")
        .order("points", { ascending: false, nullsLast: true }); // No .limit()
      if (error) throw error;
      setFullLeaderboard(data || []);
    } catch (error) {
      console.error("Error fetching full leaderboard:", error);
      toast({ title: "Could not load leaderboard", variant: "destructive" });
    } finally {
      setIsModalLoading(false);
    }
  };

  // FIX: Use useEffect to fetch data when a modal opens
  useEffect(() => {
    if (viewAllEventsOpen) {
      fetchAllEvents();
    }
  }, [viewAllEventsOpen]);

  useEffect(() => {
    if (viewLeaderboardOpen) {
      fetchFullLeaderboard();
    }
  }, [viewLeaderboardOpen]);


  const handleLike = async (postId: string) => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const optimisticPost = {
        ...originalPost,
        userLiked: !originalPost.userLiked,
        likes_count: originalPost.userLiked ? (originalPost.likes_count || 1) - 1 : (originalPost.likes_count || 0) + 1,
    };

    const updatedPosts = [...posts];
    updatedPosts[postIndex] = optimisticPost;
    setPosts(updatedPosts);
    
    try {
      if (originalPost.userLiked) {
        await supabase.from("post_likes").delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error("Error updating like:", err);
      setPosts(posts); // Revert on error
      toast({ title: "Failed to update like.", variant: "destructive" });
    }
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase.from("comments").select(`*, profiles(full_name, avatar_url)`).eq("post_id", postId).order("created_at", { ascending: true });
    if (!error) setComments((prev) => ({ ...prev, [postId]: data || [] }));
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;
    const content = newComment[postId].trim();
    
    const tempComment: Comment = {
      id: `temp-${Math.random()}`,
      content,
      created_at: new Date().toISOString(),
      profiles: { full_name: profile?.full_name || "You", avatar_url: profile?.avatar_url },
    };
    
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), tempComment]}));
    setNewComment((prev) => ({ ...prev, [postId]: "" }));

    try {
      const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: user.id, content });
      if(error) throw error;
      fetchComments(postId);
      fetchPostsAndProfiles();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to post comment", variant: "destructive" });
      // Remove optimistic comment on failure
      setComments(prev => ({...prev, [postId]: prev[postId].filter(c => c.id !== tempComment.id)}));
    }
  };

  const handleShare = async (post: Post) => {
    const shareData = { title: post.title, text: post.content.substring(0, 100), url: window.location.href };
    try {
        if (navigator.share) await navigator.share(shareData);
        else {
            await navigator.clipboard.writeText(window.location.href);
            toast({ title: "Link copied!" });
        }
    } catch (error) {
        toast({ title: "Could not share post.", variant: "destructive"})
    }
  };

  const toggleComments = (postId: string) => {
    const willOpen = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: willOpen }));
    if (willOpen && !comments[postId]) fetchComments(postId);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const getInitials = (n?: string) => n?.split(" ").map((i) => i[0]).join("").toUpperCase() || "U";
  const getRankIndicator = (i: number) => ["🏆", "🥈", "🥉"][i] || `${i + 1}.`;


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-gradient-hero py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">EcoLakbay Community</h1>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">
          Connect with eco-travelers, share your stories, and inspire sustainable adventures.
        </p>
        <Button variant="gold" size="lg" onClick={() => setCreatePostModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Share Your Story
        </Button>
      </div>

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* POSTS */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Loading posts...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>{getInitials(post.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Heart className={`w-4 h-4 ${post.userLiked ? "fill-current text-red-500" : ""}`} />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 hover:text-forest transition-colors">
                      <MessageSquare className="w-4 h-4" /> <span>{post.comments_count || 0}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="flex items-center gap-1 hover:text-forest transition-colors">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                  {showComments[post.id] && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {comments[post.id]?.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar className="w-8 h-8"><AvatarImage src={c.profiles?.avatar_url} /><AvatarFallback>{getInitials(c.profiles?.full_name)}</AvatarFallback></Avatar>
                          <div><p className="font-medium text-sm">{c.profiles?.full_name}</p><p className="text-sm">{c.content}</p></div>
                        </div>
                      ))}
                      {user && (
                        <div className="flex gap-2 items-center mt-2">
                          <Input placeholder="Write a comment..." value={newComment[post.id] || ""} onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))} />
                          <Button size="icon" onClick={() => handleAddComment(post.id)} disabled={!newComment[post.id]?.trim()}><Send className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>No posts yet. Be the first to share your story!</p>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
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

      {/* --- Modals --- */}
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} onPostCreated={fetchPostsAndProfiles} />
      <EditPostModal open={editPostModalOpen} onOpenChange={setEditPostModalOpen} onPostUpdated={fetchPostsAndProfiles} post={editingPost} />

      {/* FIX: "View All Events" Modal */}
      <Dialog open={viewAllEventsOpen} onOpenChange={setViewAllEventsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader><DialogTitle>All Upcoming Events</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1 -mx-1">
            {isModalLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading events...</p>
            ) : allEvents.length > 0 ? (
              allEvents.map((e, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-muted-foreground">{e.date} • {e.location}</p>
                      <p className="text-sm text-amber">{e.participants} joining</p>
                    </div>
                    <Button size="sm">Join</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No upcoming events found.</p>
            )}
          </div>
          {isAdmin && <Button className="mt-4 w-full">+ Create New Event</Button>}
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