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
// import { CreateEventModal } from "@/components/CreateEventModal"; // <-- 1. Comment out event modal import
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart, MessageSquare, Share2, Send, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";

// --- INTERFACES (Unchanged) ---
interface Post { /* ... */ }
interface Profile { /* ... */ }
interface Comment { /* ... */ }
// interface Event { /* ... */ } // <-- 2. Comment out Event interface (optional but clean)

// --- MAIN COMPONENT ---
const Community = () => {
  // --- STATE MANAGEMENT (Unchanged parts) ---
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
  
  // --- 3. COMMENT OUT EVENT-RELATED STATE ---
  /*
  const [viewAllEventsOpen, setViewAllEventsOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allEventsParticipants, setAllEventsParticipants] = useState<{ [key: string]: number }>({});
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  */

  // Modal-specific state (Unchanged parts)
  const [viewLeaderboardOpen, setViewLeaderboardOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState<Profile[]>([]);
  
  // --- HOOKS (Unchanged) ---
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  // Data fetching logic for posts and profiles (Unchanged)
  const fetchPostsAndProfiles = async () => { /* ... */ };
  const fetchFullLeaderboard = async () => { /* ... */ };

  // --- 4. COMMENT OUT EVENT-RELATED DATA FETCHING ---
  /*
  const fetchAllEvents = async () => {
    // ... function content ...
  };

  const fetchJoinedEvents = async () => {
    // ... function content ...
  };
  */

  // --- useEffect HOOKS (Unchanged parts) ---
  useEffect(() => {
    fetchPostsAndProfiles();
  }, [user]);

  // --- 5. COMMENT OUT EVENT-RELATED useEffect HOOKS ---
  /*
  useEffect(() => {
    if (viewAllEventsOpen) {
      fetchAllEvents();
      fetchJoinedEvents();
    }
  }, [viewAllEventsOpen, user]);
  */
  
  useEffect(() => {
    if (viewLeaderboardOpen) {
      fetchFullLeaderboard();
    }
  }, [viewLeaderboardOpen]);


  // --- EVENT HANDLERS (Unchanged parts) ---
  const handleLike = async (postId: string) => { /* ... */ };
  const handleAddComment = async (postId: string) => { /* ... */ };
  const handleShare = async (post: Post) => { /* ... */ };
  const fetchComments = async (postId: string) => { /* ... */ };
  const toggleComments = (postId: string) => { /* ... */ };

  // --- 6. COMMENT OUT EVENT-RELATED HANDLERS ---
  /*
  const handleJoinEvent = async (eventId: string) => {
    // ... function content ...
  };
  */
  
  const handleOpenEditModal = (postToEdit: Post) => { /* ... */ };
  const handleDeletePost = async (postId: string) => { /* ... */ };

  // --- HELPER FUNCTIONS (Unchanged) ---
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { /* ... */ });
  // const formatEventDate = (d: string) => new Date(d).toLocaleString('en-US', { /* ... */ }); // <-- Can be commented out
  const getInitials = (n?: string) => n?.split(" ").map((i) => i[0]).join("").toUpperCase() || "U";
  const getRankIndicator = (i: number) => ["🏆", "🥈", "🥉"][i] || `${i + 1}.`;

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header (Unchanged) */}
      <div className="bg-gradient-hero py-20 text-center text-white">
        {/* ... */}
      </div>

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-6">
          {/* Posts Feed (Unchanged) */}
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              // ... Post Card JSX ...
            ))
          ) : (
            <p>No posts yet.</p>
          )}
        </main>
        
        <aside className="space-y-6">
          {/* --- 7. COMMENT OUT THE "Upcoming Events" CARD --- */}
          {/*
          <Card>
            <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
            <CardContent>
              // This is now using static data since we commented out the dynamic fetching
              {[
                { title: "Mangrove Planting Day", date: "Dec 15, 2024", location: "Candaba Wetlands", participants: 45 },
                { title: "Sustainable Tourism Workshop", date: "Dec 20, 2024", location: "Clark Green City", participants: 32 },
                { title: "Cultural Heritage Walk", date: "Dec 22, 2024", location: "San Fernando", participants: 28 },
              ].map((e, i) => (
                <div key={i} className="border-l-2 border-forest pl-3 mb-3 last:mb-0">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date} • {e.location}</p>
                  <p className="text-xs text-amber">{e.participants} joining</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setViewAllEventsOpen(true)}>
                View All Events
              </Button>
            </CardContent>
          </Card>
          */}

          <Card>
            <CardHeader><CardTitle>Green Champions</CardTitle></CardHeader>
            <CardContent>
              {topProfiles.map((p, i) => (
                <div key={p.user_id} className="flex justify-between items-center mb-2 last:mb-0">
                  {/* ... */}
                </div>
              ))}
              <Button variant="eco" className="w-full mt-4" onClick={() => setViewLeaderboardOpen(true)}>
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Footer />
      
      {/* --- MODALS (Unchanged parts) --- */}
      <CreatePostModal open={createPostModalOpen} onOpenChange={setCreatePostModalOpen} onPostCreated={fetchPostsAndProfiles} />
      <EditPostModal open={editPostModalOpen} onOpenChange={setEditPostModalOpen} onPostUpdated={fetchPostsAndProfiles} post={editingPost} />

      {/* --- 8. COMMENT OUT EVENT-RELATED MODALS --- */}
      {/*
      <CreateEventModal open={createEventModalOpen} onOpenChange={setCreateEventModalOpen} onEventCreated={() => { fetchAllEvents(); fetchJoinedEvents(); }} />
      <Dialog open={viewAllEventsOpen} onOpenChange={setViewAllEventsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          // ... All Events Dialog Content ...
        </DialogContent>
      </Dialog>
      */}
      
      {/* Leaderboard Dialog (Unchanged) */}
      <Dialog open={viewLeaderboardOpen} onOpenChange={setViewLeaderboardOpen}>
        {/* ... Leaderboard Dialog Content ... */}
      </Dialog>
    </div>
  );
};
export default Community;
