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
  Shield,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [viewAllEventsOpen, setViewAllEventsOpen] = useState(false);
  const [viewLeaderboardOpen, setViewLeaderboardOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { toast } = useToast();

  const upcomingEvents = [
    { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 },
    { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 },
    { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 },
  ];

  // --- Fetch Posts and Profiles ---
  const fetchPostsAndProfiles = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (postsError) throw postsError;

      const { data: topProfilesData, error: topProfilesError } = await supabase
        .from("profiles")
        .select("full_name, points")
        .order("points", { ascending: false, nullsLast: true })
        .limit(5);
      if (topProfilesError) throw topProfilesError;
      setProfiles(topProfilesData || []);

      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map((post) => post.author_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, points")
          .in("user_id", authorIds);

        let userLikes: string[] = [];
        if (user) {
          const { data: likesData } = await supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_id", user.id);
          userLikes = likesData?.map((l) => l.post_id) || [];
          const { data: currentUserProfile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", user.id)
            .single();
          setProfile(currentUserProfile);
        }

        const postsWithProfiles = postsData.map((post) => ({
          ...post,
          profiles: profilesData?.find((p) => p.user_id === post.author_id),
          userLiked: userLikes.includes(post.id),
        }));
        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error loading community feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    const updatedPosts = posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            userLiked: !p.userLiked,
            likes_count: p.userLiked
              ? p.likes_count - 1
              : (p.likes_count || 0) + 1,
          }
        : p
    );
    setPosts(updatedPosts);

    try {
      const likedPost = posts.find((p) => p.id === postId);
      if (likedPost?.userLiked) {
        await supabase.from("post_likes").delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`*, profiles(full_name, avatar_url)`)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!error) setComments((prev) => ({ ...prev, [postId]: data || [] }));
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;
    const content = newComment[postId].trim();
    setNewComment((prev) => ({ ...prev, [postId]: "" }));

    const tempComment = {
      id: Math.random(),
      content,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: profile?.full_name || "You",
        avatar_url: profile?.avatar_url,
      },
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment],
    }));

    try {
      await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        content,
      });
      fetchComments(postId);
      fetchPostsAndProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (post: any) => {
    const shareData = {
      title: post.title,
      text: post.content.substring(0, 100),
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  const toggleComments = (postId: string) => {
    const willOpen = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: willOpen }));
    if (willOpen && !comments[postId]) fetchComments(postId);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getInitials = (n: string) => n?.split(" ").map((i) => i[0]).join("") || "U";

  const canEdit = (p: any) => isAdmin || isModerator || (user && p.author_id === user.id);
  const canDelete = (p: any) => isAdmin || (user && p.author_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-gradient-hero py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">EcoLakbay Community</h1>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">
          Connect with eco-travelers, share your stories, and inspire sustainable adventures.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="gold" size="lg" onClick={() => setCreatePostModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Share Your Story
          </Button>
        </div>
      </div>

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* POSTS */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Loading posts...</p>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex justify-between items-center">
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
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-red-500">
                      <Heart className={`w-4 h-4 ${post.userLiked ? "fill-current text-red-500" : ""}`} />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 hover:text-forest">
                      <MessageSquare className="w-4 h-4" /> <span>{post.comments_count || 0}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="flex items-center gap-1 hover:text-forest">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>

                  {showComments[post.id] && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {comments[post.id]?.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={c.profiles?.avatar_url} />
                            <AvatarFallback>{getInitials(c.profiles?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{c.profiles?.full_name}</p>
                            <p className="text-sm">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      {user && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newComment[post.id] || ""}
                            onChange={(e) =>
                              setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.map((e, i) => (
                <div key={i} className="border-l-2 border-forest pl-3 mb-3">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date} • {e.location}</p>
                  <p className="text-xs text-amber">{e.participants} joining</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" onClick={() => setViewAllEventsOpen(true)}>
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Green Champions</CardTitle>
            </CardHeader>
            <CardContent>
              {profiles.map((p, i) => (
                <div key={i} className="flex justify-between mb-2">
                  <span>{i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"} {p.full_name}</span>
                  <span className="text-amber font-medium">{p.points || 0} pts</span>
                </div>
              ))}
              <Button variant="eco" className="w-full mt-2" onClick={() => setViewLeaderboardOpen(true)}>
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      {/* --- Modals --- */}
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} onPostCreated={fetchPostsAndProfiles} />
      <EditPostModal open={editPostModalOpen} onOpenChange={setEditPostModalOpen} onPostUpdated={fetchPostsAndProfiles} post={editingPost} />

      <Dialog open={viewAllEventsOpen} onOpenChange={setViewAllEventsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>All Events</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {upcomingEvents.map((e, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.date} • {e.location}</p>
                  <p className="text-sm text-amber">{e.participants} joining</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {isAdmin && <Button className="mt-4 w-full">+ Create New Event</Button>}
          <DialogFooter><Button variant="outline" onClick={() => setViewAllEventsOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewLeaderboardOpen} onOpenChange={setViewLeaderboardOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Leaderboard</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {profiles.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{i + 1}. {p.full_name}</span>
                <span className="text-amber font-semibold">{p.points} pts</span>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setViewLeaderboardOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
