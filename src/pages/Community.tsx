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
import { Plus, Shield, Users, TrendingUp, Heart, MessageSquare, Share2, Send } from "lucide-react";

const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { isAdmin, role } = useUserRole();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then get profiles for each post author
      if (postsData && postsData.length > 0) {
        const authorIds = postsData.map(post => post.author_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, points')
          .in('user_id', authorIds);

        if (profilesError) throw profilesError;

        // Get user's likes if authenticated
        let userLikes: any[] = [];
        if (user) {
          const { data: likesData, error: likesError } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id);
          
          if (!likesError) {
            userLikes = likesData || [];
          }
        }

        // Combine posts with their author profiles and like status
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
      toast({
        title: "Error loading posts",
        description: "Could not load community posts.",
        variant: "destructive",
      });
    }
  };

  const fetchTopProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, points')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchTopProfiles()]);
      setLoading(false);
    };

    loadData();
  }, [user]); // Re-fetch when user changes to get proper like status

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      });
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
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.userLiked) {
        // Unlike the post
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Update likes count
        await supabase
          .from('posts')
          .update({ likes_count: (post.likes_count || 0) - 1 })
          .eq('id', postId);
      } else {
        // Like the post
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        // Update likes count
        await supabase
          .from('posts')
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq('id', postId);
      }

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          author_id: user.id,
          content: newComment[postId].trim()
        }]);

      if (error) throw error;

      // Update comments count
      const post = posts.find(p => p.id === postId);
      await supabase
        .from('posts')
        .update({ comments_count: (post?.comments_count || 0) + 1 })
        .eq('id', postId);

      // Clear the comment input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Refresh comments and posts
      fetchComments(postId);
      fetchPosts();

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (post: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\nShared from EcoLakbay Community`);
        toast({
          title: "Link copied",
          description: "Post content has been copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

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
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              EcoLakbay Community
            </h1>
            {isAdmin && (
              <Badge variant="destructive" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
            )}
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Connect with fellow eco-travelers, local businesses, and conservation enthusiasts. 
            Share experiences, join events, and build a sustainable tourism community.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="gold" size="lg" onClick={handleCreatePost}>
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
            <Button variant="outline" size="lg" onClick={handleCreatePost}>
              Make a Post
            </Button>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Feed */}
            <div className="lg:col-span-2">
              {isAdmin && (
                <Card className="mb-6 border-amber-200 bg-amber-50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      <CardTitle className="text-amber-800">Admin Panel</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <p className="text-sm font-medium">Total Posts</p>
                        <p className="text-2xl font-bold text-green-600">{posts.length}</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-sm font-medium">Active Users</p>
                        <p className="text-2xl font-bold text-blue-600">{profiles.length}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl mx-auto block mb-2">🌟</span>
                        <p className="text-sm font-medium">Total Points</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {profiles.reduce((sum, p) => sum + (p.points || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading posts...</div>
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <p className="text-muted-foreground">No posts yet. Be the first to share your story!</p>
                      <Button onClick={handleCreatePost} className="mt-4">
                        Create First Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-hover transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-forest text-white">
                                {getInitials(post.profiles?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-forest">
                                {post.profiles?.full_name || "Anonymous User"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(post.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {post.type}
                            </Badge>
                            {post.profiles?.points && (
                              <div className="flex items-center space-x-1 text-amber-600">
                                <span className="text-xs">🌟</span>
                                <span className="text-xs font-medium">{post.profiles.points} pts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-forest mb-2">
                            {post.title}
                          </h3>
                           <p className="text-muted-foreground mb-4 leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
                             {post.content}
                           </p>
                          
                           <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-4">
                               <button 
                                 onClick={() => handleLike(post.id)}
                                 className={`flex items-center space-x-1 transition-colors ${
                                   post.userLiked 
                                     ? 'text-red-500 hover:text-red-600' 
                                     : 'text-muted-foreground hover:text-red-500'
                                 }`}
                               >
                                 <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-current' : ''}`} />
                                 <span className="text-sm">{post.likes_count || 0}</span>
                               </button>
                               <button 
                                 onClick={() => toggleComments(post.id)}
                                 className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors"
                               >
                                 <MessageSquare className="w-4 h-4" />
                                 <span className="text-sm">{post.comments_count || 0}</span>
                               </button>
                               <button 
                                 onClick={() => handleShare(post)}
                                 className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors"
                               >
                                 <Share2 className="w-4 h-4" />
                                 <span className="text-sm">Share</span>
                               </button>
                             </div>
                           </div>
                           
                           {/* Comments Section */}
                           {showComments[post.id] && (
                             <div className="mt-4 pt-4 border-t">
                               {/* Comments List */}
                               <div className="space-y-3 mb-4">
                                 {comments[post.id]?.map((comment) => (
                                   <div key={comment.id} className="flex space-x-3">
                                     <Avatar className="w-8 h-8">
                                       <AvatarImage src={comment.profiles?.avatar_url} />
                                       <AvatarFallback className="text-xs">
                                         {getInitials(comment.profiles?.full_name)}
                                       </AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1">
                                       <div className="bg-muted rounded-lg p-3">
                                         <p className="font-medium text-sm">
                                           {comment.profiles?.full_name || "Anonymous"}
                                         </p>
                                         <p className="text-sm">{comment.content}</p>
                                       </div>
                                       <p className="text-xs text-muted-foreground mt-1">
                                         {formatDate(comment.created_at)}
                                       </p>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                               
                               {/* Add Comment */}
                               {user && (
                                 <div className="flex space-x-2">
                                   <Avatar className="w-8 h-8">
                                     <AvatarImage src={user.user_metadata?.avatar_url} />
                                     <AvatarFallback className="text-xs">
                                       {user.email?.charAt(0).toUpperCase()}
                                     </AvatarFallback>
                                   </Avatar>
                                   <div className="flex-1 flex space-x-2">
                                     <Input
                                       placeholder="Write a comment..."
                                       value={newComment[post.id] || ''}
                                       onChange={(e) => setNewComment(prev => ({ 
                                         ...prev, 
                                         [post.id]: e.target.value 
                                       }))}
                                       onKeyPress={(e) => {
                                         if (e.key === 'Enter') {
                                           e.preventDefault();
                                           handleAddComment(post.id);
                                         }
                                       }}
                                     />
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleAddComment(post.id)}
                                       disabled={!newComment[post.id]?.trim()}
                                     >
                                       <Send className="w-4 h-4" />
                                     </Button>
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
                    {profiles.slice(0, 3).map((profile, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}</span>
                          <span className="text-sm font-medium">
                            {profile.full_name || "Anonymous User"}
                          </span>
                        </div>
                        <span className="text-xs text-amber font-medium">
                          {profile.points || 0} pts
                        </span>
                      </div>
                    ))}
                    {profiles.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No champions yet. Start earning points by posting!
                      </p>
                    )}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleCreatePost}
                    >
                      📝 Share Trip Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleCreatePost}
                    >
                      📅 Create Event
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleCreatePost}
                    >
                      💡 Share Eco Tip
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={handleCreatePost}
                    >
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
      
      <CreatePostModal 
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Community;