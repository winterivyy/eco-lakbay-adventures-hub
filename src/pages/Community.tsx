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

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        const authorIds = postsData.map(post => post.author_id);
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('user_id, full_name, avatar_url, points').in('user_id', authorIds);
        if (profilesError) throw profilesError;

        let userLikes: any[] = [];
        if (user) {
          const { data: likesData } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
          userLikes = likesData || [];
        }

        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesData?.find(profile => profile.user_id === post.author_id),
          userLiked: userLikes.some(like => like.post_id === post.id)
        }));
        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Error loading posts", variant: "destructive" });
    }
  };

  const fetchTopProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_name, points').order('points', { ascending: false }).limit(5);
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching top profiles:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchTopProfiles()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleCreatePost = () => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to create a post.", variant: "destructive" });
      return;
    }
    setCreatePostModalOpen(true);
  };

  const handlePostCreated = () => {
    fetchPosts();
    fetchTopProfiles();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "today";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to like posts.", variant: "destructive" });
      return;
    }

    const originalPosts = [...posts];
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const newLikesCount = p.userLiked ? (p.likes_count || 1) - 1 : (p.likes_count || 0) + 1;
        return { ...p, userLiked: !p.userLiked, likes_count: newLikesCount };
      }
      return p;
    });
    setPosts(updatedPosts);

    try {
      const post = originalPosts.find(p => p.id === postId);
      if (!post) return;

      if (post.userLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
      // Note: We are no longer directly updating the likes_count here. We rely on the fetch.
      // A more advanced version would use RPC calls to keep counts in sync.
      fetchPosts(); // Quick refresh to get the real count from DB
      fetchTopProfiles(); // Refresh leaderboard points
    } catch (error) {
      console.error('Error liking post:', error);
      setPosts(originalPosts); // Revert UI on error
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase.from('comments').select(`*, profiles(full_name, avatar_url)`).eq('post_id', postId).order('created_at', { ascending: true });
      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const content = newComment[postId].trim();
      setNewComment(prev => ({ ...prev, [postId]: '' }));

      const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: user.id, content });
      if (error) throw error;
      
      fetchComments(postId);
      fetchPosts();
      fetchTopProfiles();

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleShare = async (post: any) => {
    // This function is unchanged
  };

  const toggleComments = (postId: string) => {
    const willBeOpen = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: willBeOpen }));
    if (willBeOpen && !comments[postId]) {
      fetchComments(postId);
    }
  };

  const handleEditPost = (post: any) => { setEditingPost(post); setEditPostModalOpen(true); };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('comments').delete().eq('post_id', postId);
      await supabase.from('post_likes').delete().eq('post_id', postId);
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      toast({ title: "Post deleted" });
      handlePostCreated(); // Refresh everything
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const canEditPost = (post: any) => isAdmin || isModerator || (user && post.author_id === user.id);
  const canDeletePost = (post: any) => isAdmin || (user && post.author_id === user.id);

  const upcomingEvents = [ { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 }, { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 }, { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 } ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="bg-gradient-hero py-20">
        {/* Header Section JSX */}
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
                {loading ? (
                  <div className="text-center py-8"><p>Loading posts...</p></div>
                ) : posts.length === 0 ? (
                  <Card className="text-center py-8"><CardContent><p>No posts yet. Be the first to share your story!</p><Button onClick={handleCreatePost} className="mt-4">Create First Post</Button></CardContent></Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-hover transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar><AvatarFallback className="bg-forest text-white">{getInitials(post.profiles?.full_name)}</AvatarFallback></Avatar>
                            <div><p className="font-semibold text-forest">{post.profiles?.full_name || "Anonymous User"}</p><p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p></div>
                          </div>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                             {post.profiles?.points != null && (<div className="flex items-center space-x-1 text-amber-600"><span className="text-xs">🌟</span><span className="text-xs font-medium">{post.profiles.points} pts</span></div>)}
                             {(canEditPost(post) || canDeletePost(post)) && (
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   {canEditPost(post) && (<DropdownMenuItem onClick={() => handleEditPost(post)}><Edit className="h-4 w-4 mr-2" />Edit Post</DropdownMenuItem>)}
                                   {canDeletePost(post) && (
                                     <AlertDialog>
                                       <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete Post</DropdownMenuItem></AlertDialogTrigger>
                                       <AlertDialogContent>
                                         <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the post and all its comments.</AlertDialogDescription></AlertDialogHeader>
                                         <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                       </AlertDialogContent>
                                     </AlertDialog>
                                   )}
                                 </DropdownMenuContent>
                               </DropdownMenu>
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
                                   <Avatar className="w-8 h-8"><AvatarImage src={user.user_metadata?.avatar_url} /><AvatarFallback className="text-xs">{user.email?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
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
