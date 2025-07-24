import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, Users, TrendingUp, Heart, MessageSquare, Share2, Send, Edit, Trash2, MoreVertical } from "lucide-react";
import { EditPostModal } from "@/components/EditPostModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null); // For current user's avatar in comments
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { toast } = useToast();

  const fetchPostsAndProfiles = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (postsError) throw postsError;

      // Fetch top profiles for leaderboard
      const { data: topProfilesData, error: topProfilesError } = await supabase.from('profiles').select('full_name, points').order('points', { ascending: false, nullsLast: true }).limit(5);
      if (topProfilesError) throw topProfilesError;
      setProfiles(topProfilesData || []);

      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map(post => post.author_id))];
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('user_id, full_name, avatar_url, points').in('user_id', authorIds);
        if (profilesError) throw profilesError;

        let userLikes: string[] = [];
        if (user) {
          const { data: likesData } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
          userLikes = likesData?.map(l => l.post_id) || [];
          // Also fetch current user's profile for comment avatar
          const { data: currentUserProfile } = await supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).single();
          setProfile(currentUserProfile);
        }

        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.user_id === post.author_id),
          userLiked: userLikes.includes(post.id)
        }));
        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error loading data", description: "Could not load community feed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  const handleCreatePost = () => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to create a post.", variant: "destructive" });
      return;
    }
    setCreatePostModalOpen(true);
  };

  const handlePostCreated = () => {
    fetchPostsAndProfiles(); // Refresh everything
  };

  // --- REVISED `handleLike` with Optimistic Update ---
  const handleLike = async (postId: string) => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }
    const originalPosts = [...posts];
    setPosts(posts.map(p => p.id === postId ? { ...p, userLiked: !p.userLiked, likes_count: p.userLiked ? p.likes_count - 1 : p.likes_count + 1 } : p));

    try {
      const post = originalPosts.find(p => p.id === postId);
      if (post?.userLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
      // We don't need to call fetch again here, as triggers handle points/counts
    } catch (error) {
      console.error('Error liking post:', error);
      toast({ title: "Error", description: "Your like could not be saved.", variant: "destructive" });
      setPosts(originalPosts); // Revert on failure
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase.from('comments').select(`*, profiles(full_name, avatar_url)`).eq('post_id', postId).order('created_at', { ascending: true });
      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) { console.error('Error fetching comments:', error); }
  };

  // --- REVISED `handleAddComment` with Optimistic Update ---
  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    const content = newComment[postId].trim();
    setNewComment(prev => ({ ...prev, [postId]: '' }));

    const tempComment = {
      id: Math.random(),
      content,
      created_at: new Date().toISOString(),
      profiles: { full_name: profile?.full_name || 'You', avatar_url: profile?.avatar_url },
    };
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), tempComment] }));
    setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));

    try {
      const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: user.id, content });
      if (error) throw error;
      fetchComments(postId); // Refresh comments with real data from DB
      fetchTopProfiles(); // Refresh leaderboard points
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
      fetchComments(postId); // Revert on failure
      fetchPostsAndProfiles();
    }
  };

  const handleShare = async (post: any) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.content, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\nShared from EcoLakbay Community`);
        toast({ title: "Link copied", description: "Post content has been copied to clipboard" });
      }
    } catch (error) { console.error('Error sharing post:', error); }
  };

  const toggleComments = (postId: string) => {
    const willBeOpen = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: willBeOpen }));
    if (willBeOpen && !comments[postId]) {
      fetchComments(postId);
    }
  };
  
  const formatDate = (dateString: string) => { /* Your original function */ return new Date(dateString).toLocaleDateString(); };
  const getInitials = (name: string | null) => { if (!name) return "U"; return name.split(' ').map(n => n[0]).join('').toUpperCase(); };
  const handleEditPost = (post: any) => { setEditingPost(post); setEditPostModalOpen(true); };
  const handleDeletePost = async (postId: string) => { /* Your original function */ };
  const canEditPost = (post: any) => isAdmin || isModerator || (user && post.author_id === user.id);
  const canDeletePost = (post: any) => isAdmin || (user && post.author_id === user.id);
  const upcomingEvents = [ { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 }, { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 }, { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 } ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4"><h1 className="text-4xl md:text-5xl font-bold text-white">EcoLakbay Community</h1>{isAdmin && (<Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />ADMIN</Badge>)}</div>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">Connect with fellow eco-travelers, local businesses, and conservation enthusiasts. Share experiences, join events, and build a sustainable tourism community.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="gold" size="lg" onClick={handleCreatePost}><Plus className="w-4 h-4 mr-2" />Share Your Story</Button>
            <Button variant="outline" size="lg" onClick={handleCreatePost}>Make a Post</Button>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isAdmin && (
                <Card className="mb-6 border-amber-200 bg-amber-50">
                  <CardHeader><div className="flex items-center gap-2"><Shield className="w-5 h-5 text-amber-600" /><CardTitle className="text-amber-800">Admin Panel</CardTitle></div></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center"><TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" /><p className="text-sm font-medium">Total Posts</p><p className="text-2xl font-bold text-green-600">{posts.length}</p></div>
                      <div className="text-center"><Users className="w-8 h-8 mx-auto text-blue-600 mb-2" /><p className="text-sm font-medium">Active Users</p><p className="text-2xl font-bold text-blue-600">{profiles.length}</p></div>
                      <div className="text-center"><span className="text-2xl mx-auto block mb-2">🌟</span><p className="text-sm font-medium">Total Points</p><p className="text-2xl font-bold text-amber-600">{profiles.reduce((sum, p) => sum + (p.points || 0), 0)}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-6">
                {loading ? (<p className="text-center py-8">Loading posts...</p>) : posts.length === 0 ? (
                  <Card className="text-center py-8"><CardContent><p className="text-muted-foreground">No posts yet. Be the first to share your story!</p><Button onClick={handleCreatePost} className="mt-4">Create First Post</Button></CardContent></Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-hover transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar><AvatarImage src={post.profiles?.avatar_url} /><AvatarFallback className="bg-forest text-white">{getInitials(post.profiles?.full_name)}</AvatarFallback></Avatar>
                            <div><p className="font-semibold text-forest">{post.profiles?.full_name || "Anonymous User"}</p><p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p></div>
                          </div>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                             {post.profiles?.points != null && (<div className="flex items-center space-x-1 text-amber-600"><span className="text-xs">🌟</span><span className="text-xs font-medium">{post.profiles.points} pts</span></div>)}
                             {(canEditPost(post) || canDeletePost(post)) && (
                               <DropdownMenu>{/* ... Your Dropdown Menu JSX ... */}</DropdownMenu>
                             )}
                           </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div>
                           <h3 className="font-semibold text-lg text-forest mb-2">{post.title}</h3>
                           <p className="text-muted-foreground mb-4 leading-relaxed break-words whitespace-pre-wrap">{post.content}</p>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-4">
                               <button onClick={() => handleLike(post.id)} className={`flex items-center space-x-1 transition-colors ${post.userLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}><Heart className={`w-4 h-4 ${post.userLiked ? 'fill-current' : ''}`} /><span className="text-sm">{post.likes_count || 0}</span></button>
                               <button onClick={() => toggleComments(post.id)} className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors"><MessageSquare className="w-4 h-4" /><span className="text-sm">{post.comments_count || 0}</span></button>
                               <button onClick={() => handleShare(post)} className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors"><Share2 className="w-4 h-4" /><span className="text-sm">Share</span></button>
                             </div>
                           </div>
                           {showComments[post.id] && (
                             <div className="mt-4 pt-4 border-t">
                               <div className="space-y-3 mb-4">
                                 {comments[post.id]?.map((comment) => (
                                   <div key={comment.id} className="flex space-x-3">
                                     <Avatar className="w-8 h-8"><AvatarImage src={comment.profiles?.avatar_url} /><AvatarFallback className="text-xs">{getInitials(comment.profiles?.full_name)}</AvatarFallback></Avatar>
                                     <div className="flex-1"><div className="bg-muted rounded-lg p-3"><p className="font-medium text-sm">{comment.profiles?.full_name || "Anonymous"}</p><p className="text-sm">{comment.content}</p></div><p className="text-xs text-muted-foreground mt-1">{formatDate(comment.created_at)}</p></div>
                                   </div>
                                 ))}
                               </div>
                               {user && (
                                 <div className="flex space-x-2">
                                   <Avatar className="w-8 h-8"><AvatarImage src={profile?.avatar_url} /><AvatarFallback className="text-xs">{getInitials(profile?.full_name)}</AvatarFallback></Avatar>
                                   <div className="flex-1 flex space-x-2">
                                     <Input placeholder="Write a comment..." value={newComment[post.id] || ''} onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); } }}/>
                                     <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!newComment[post.id]?.trim()}><Send className="w-4 h-4" /></Button>
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-forest">Upcoming Events</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (<div key={index} className="border-l-2 border-forest pl-4"><h4 className="font-semibold text-sm">{event.title}</h4><p className="text-xs text-muted-foreground">{event.date}</p><p className="text-xs text-muted-foreground">{event.location}</p><p className="text-xs text-amber font-medium">{event.participants} joining</p></div>))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">View All Events</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-forest">Green Champions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profiles.map((profile, index) => (<div key={index} className="flex items-center justify-between"><div className="flex items-center space-x-2"><span className="text-lg">{index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}</span><span className="text-sm font-medium">{profile.full_name || "Anonymous User"}</span></div><span className="text-xs text-amber font-medium">{profile.points || 0} pts</span></div>))}
                    {profiles.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">No champions yet. Start posting!</p>)}
                  </div>
                  <Button variant="eco" size="sm" className="w-full mt-4">View Leaderboard</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-forest">Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleCreatePost}>📝 Share Trip Report</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleCreatePost}>📅 Create Event</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleCreatePost}>💡 Share Eco Tip</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleCreatePost}>🤝 Find Travel Buddy</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} onPostCreated={handlePostCreated} />
      <EditPostModal open={editPostModalOpen} onOpenChange={setEditPostModalOpen} onPostUpdated={handlePostCreated} post={editingPost} />
    </div>
  );
};

export default Community;
