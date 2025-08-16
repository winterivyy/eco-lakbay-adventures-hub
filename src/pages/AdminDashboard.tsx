import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Users, TrendingUp, MapPin, Search, MoreHorizontal, Archive, FileText, Download, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

// INLINE MODAL COMPONENT #1: View Permits
const ViewPermitsModal = ({ isOpen, onClose, destination }: { isOpen: boolean, onClose: () => void, destination: any }) => {
    if (!destination) return null;
    const permits = destination.destination_permits || [];
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Permits for: {destination.business_name}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">{permits.length > 0 ? (permits.map((permit: any) => (<div key={permit.id} className="flex items-center justify-between p-3 border rounded-lg"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium capitalize">{permit.permit_type.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{permit.file_name}</p></div></div><Button asChild variant="outline" size="sm"><a href={permit.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-2" /> View</a></Button></div>))) : <p className="text-center text-muted-foreground py-8">No permits were uploaded.</p>}</div>
            </DialogContent>
        </Dialog>
    );
};

// INLINE MODAL COMPONENT #2: Edit Destination
const EditDestinationModal = ({ isOpen, onClose, onSave, destination }: { isOpen: boolean, onClose: () => void, onSave: () => void, destination: any }) => {
    const [formData, setFormData] = useState(destination);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => { setFormData(destination); }, [destination]);
    if (!destination) return null;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData((prev: any) => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleSaveChanges = async () => { setIsSaving(true); const { id, created_at, owner_id, status, destination_permits, ...updateData } = formData; updateData.updated_at = new Date().toISOString(); const { error } = await supabase.from('destinations').update(updateData).eq('id', id); setIsSaving(false); if (!error) onSave(); };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Update Destination: {destination.business_name}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">{Object.keys(formData).filter(key => !['id', 'created_at', 'updated_at', 'owner_id', 'status', 'rating', 'review_count', 'destination_permits', 'images'].includes(key)).map(key => (<div className="grid grid-cols-4 items-center gap-4" key={key}><Label htmlFor={key} className="text-right capitalize">{key.replace(/_/g, ' ')}</Label>{key === 'description' || key === 'sustainability_practices' ? (<Textarea id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />) : (<Input id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />)}</div>))}</div>
                <DialogFooter><Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button><Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  pending: 'secondary', approved: 'default', rejected: 'destructive', archived: 'outline',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loadingData, setLoadingData] = useState(true);
  const [editingDestination, setEditingDestination] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingDestinationPermits, setViewingDestinationPermits] = useState<any>(null);
  const [isPermitsModalOpen, setIsPermitsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      setProfile(profileData);

      const { data: destData, error: destError } = await supabase.from('destinations').select('*, destination_permits(*)').order('created_at', { ascending: false });
      if (destError) throw destError;
      setAllDestinations(destData || []);
        
      const { data: usersData, error: usersError } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (usersError) throw usersError;
      setAllUsers(usersData || []);

      const { data: ratingsData, error: ratingsError } = await supabase.from('destination_ratings').select(`*, destinations!inner(business_name), profiles!inner(full_name)`).order('created_at', { ascending: false });
      if (ratingsError) throw ratingsError;
      setAllRatings(ratingsData || []);
        
      const { data: postsData } = await supabase.from('posts').select('id');
      const { data: calculatorData } = await supabase.from('calculator_entries').select('carbon_footprint');
      setStats({
          totalPosts: postsData?.length || 0,
          totalCalculations: calculatorData?.length || 0,
          totalCarbonSaved: Math.round(calculatorData?.reduce((sum, entry) => sum + (entry.carbon_footprint || 0), 0) || 0 * 100) / 100
      });

    } catch (error: any) {
        toast({ title: "Data Loading Error", description: `Failed to load admin data: ${error.message}.`, variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusUpdate = async (destinationId: string, status: 'approved' | 'rejected' | 'archived') => { /* ... Unchanged ... */ };
  const handleUpdateUser = async (userId: string, updates: any) => { /* ... Unchanged ... */ };
  const handleOpenEditModal = (dest: any) => { setEditingDestination(dest); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleSaveEditModal = () => { handleCloseEditModal(); toast({ title: "Success", description: "Destination details updated." }); loadAdminData(); };
  const handleOpenPermitsModal = (dest: any) => { setViewingDestinationPermits(dest); setIsPermitsModalOpen(true); };
  const handleClosePermitsModal = () => setIsPermitsModalOpen(false);

  if (loadingData) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div></div>
            <Footer />
        </div>
    );
  }
  
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const totalDestinations = allDestinations.length;
  const totalUsers = allUsers.length;

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="bg-gradient-to-r from-red-600 to-red-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20"><AvatarFallback className="bg-white text-red-600 text-2xl font-bold">{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
              <div>
                <div className="flex items-center gap-3 mb-2"><h1 className="text-4xl font-bold">Admin Dashboard</h1><Badge variant="destructive">ADMIN</Badge></div>
                <p className="text-xl text-white/90">Managing EcoLakbay Platform</p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card className="shadow-eco"><CardContent className="p-6 text-center"><Users className="w-8 h-8 text-blue-600 mx-auto mb-2" /><div className="text-3xl font-bold text-blue-600 mb-2">{totalUsers}</div><div className="text-sm text-muted-foreground">Total Users</div></CardContent></Card>
                <Card className="shadow-eco"><CardContent className="p-6 text-center"><MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" /><div className="text-3xl font-bold text-green-600 mb-2">{totalDestinations}</div><div className="text-sm text-muted-foreground">Destinations</div></CardContent></Card>
                <Card className="shadow-eco"><CardContent className="p-6 text-center"><TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" /><div className="text-3xl font-bold text-amber-600 mb-2">{stats.totalPosts || 0}</div><div className="text-sm text-muted-foreground">Community Posts</div></CardContent></Card>
                <Card className="shadow-eco"><CardContent className="p-6 text-center"><div className="text-2xl mb-2">📊</div><div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalCalculations || 0}</div><div className="text-sm text-muted-foreground">Calculations Made</div></CardContent></Card>
                <Card className="shadow-eco"><CardContent className="p-6 text-center"><div className="text-2xl mb-2">🌱</div><div className="text-3xl font-bold text-nature mb-2">{stats.totalCarbonSaved || 0}kg</div><div className="text-sm text-muted-foreground">CO₂ Calculated</div></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="shadow-eco xl:col-span-3">
                  <CardHeader><CardTitle className="text-xl text-forest">Manage All Destinations</CardTitle></CardHeader>
                  <CardContent><div className="space-y-4 max-h-[600px] overflow-y-auto">{allDestinations.map((dest) => (<div key={dest.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg"><div><p className="font-semibold">{dest.business_name}</p><p className="text-sm text-muted-foreground">{dest.city}, {dest.province}</p></div><div className="flex items-center gap-2"><Badge variant={statusColors[dest.status] || 'default'} className="capitalize w-24 justify-center">{dest.status}</Badge><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleOpenPermitsModal(dest)}><FileText className="mr-2 h-4 w-4" /> View Permits</DropdownMenuItem><DropdownMenuItem onClick={() => handleOpenEditModal(dest)}><Edit2 className="mr-2 h-4 w-4" /> Update Details</DropdownMenuItem><DropdownMenuItem onClick={() => handleStatusUpdate(dest.id, 'approved')} disabled={dest.status === 'approved'}>Approve</DropdownMenuItem><DropdownMenuItem onClick={() => handleStatusUpdate(dest.id, 'rejected')} disabled={dest.status === 'rejected'}>Reject</DropdownMenuItem><DropdownMenuItem onClick={() => handleStatusUpdate(dest.id, 'archived')} className="text-destructive" disabled={dest.status === 'archived'}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>))}</div></CardContent>
                </Card>
                <Card className="shadow-eco">
                  <CardHeader><CardTitle className="text-xl text-forest">Recent Ratings</CardTitle></CardHeader>
                  <CardContent><div className="space-y-4 max-h-96 overflow-y-auto">{allRatings.slice(0, 10).map((rating) => (<div key={rating.id} className="p-4 bg-gradient-card rounded-lg"><div className="flex items-start justify-between mb-2"><div><h4 className="font-semibold text-forest">{rating.destinations?.business_name}</h4><p className="text-sm text-muted-foreground">by {rating.profiles?.full_name}</p></div><div className="flex items-center gap-1"><span className="text-sm font-medium">{rating.overall_score}/5</span></div></div><p className="text-xs text-muted-foreground">{new Date(rating.created_at).toLocaleDateString()}</p>{rating.comments && <p className="text-sm mt-2 italic line-clamp-2">{rating.comments}</p>}</div>))}{allRatings.length === 0 && <p className="text-center text-muted-foreground py-8">No ratings yet</p>}</div></CardContent>
                </Card>
                <Card className="shadow-eco xl:col-span-2">
                  <CardHeader><CardTitle className="text-xl text-forest flex items-center gap-2"><Users className="h-5 w-5" />All Users</CardTitle><div className="flex items-center space-x-2"><Search className="h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" /></div></CardHeader>
                  <CardContent><div className="space-y-4 max-h-96 overflow-y-auto">{allUsers.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (<div key={user.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">{user.full_name?.charAt(0) || user.email?.charAt(0)}</div><div><h4 className="font-semibold text-forest">{user.full_name || "Anonymous"}</h4><p className="text-sm text-muted-foreground">{user.email}</p><p className="text-xs text-muted-foreground">Joined: {new Date(user.joined_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-4"><div className="text-right"><div className="font-bold text-amber-600">{user.points || 0} pts</div></div><Dialog onOpenChange={(open) => !open && setEditingUser(null)}><DialogTrigger asChild><Button size="sm" variant="outline" onClick={() => setEditingUser(user)}><Edit2 className="w-4 h-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit User: {editingUser?.full_name || editingUser?.email}</DialogTitle></DialogHeader>{editingUser && <div className="space-y-4"><div><Label>Full Name</Label><Input defaultValue={editingUser.full_name || ""} onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})} /></div><div><Label>Points</Label><Input type="number" defaultValue={editingUser.points || 0} onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})} /></div><div><Label>Bio</Label><Input defaultValue={editingUser.bio || ""} onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})} /></div><div><Label>Location</Label><Input defaultValue={editingUser.location || ""} onChange={(e) => setEditingUser({...editingUser, location: e.target.value})} /></div><Button onClick={() => handleUpdateUser(editingUser.user_id, editingUser)} className="w-full">Update User</Button></div>}</DialogContent></Dialog></div></div>))}</div></CardContent>
                </Card>
              </div>
            </div>
        </div>
        <Footer />
      </div>
      <ViewPermitsModal isOpen={isPermitsModalOpen} onClose={handleClosePermitsModal} destination={viewingDestinationPermits} />
      <EditDestinationModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveEditModal} destination={editingDestination} />
    </>
  );
};

export default AdminDashboard;
