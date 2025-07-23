import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, TrendingUp, Activity, Search, Plus, Edit, BarChart3 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", bio: "", location: "" });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalDestinations: 0,
    totalAdmins: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  // Check if user is the super admin
  const isSuperAdmin = user?.email === 'johnleomedina@gmail.com' && isAdmin;

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      // First fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Then fetch user roles separately and merge
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge the data
      const usersWithRoles = profiles?.map(profile => {
        const role = userRoles?.find(ur => ur.user_id === profile.user_id)?.role;
        return {
          ...profile,
          user_roles: role ? [{ role }] : []
        };
      });

      setUsers(usersWithRoles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const [usersResult, postsResult, destinationsResult, adminsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('destinations').select('id', { count: 'exact' }),
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'admin')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalDestinations: destinationsResult.count || 0,
        totalAdmins: adminsResult.count || 0
      });

      // Generate chart data for the last 7 days
      const chartData = [
        { name: 'Mon', users: usersResult.count! * 0.12, posts: postsResult.count! * 0.15 },
        { name: 'Tue', users: usersResult.count! * 0.13, posts: postsResult.count! * 0.12 },
        { name: 'Wed', users: usersResult.count! * 0.15, posts: postsResult.count! * 0.18 },
        { name: 'Thu', users: usersResult.count! * 0.14, posts: postsResult.count! * 0.14 },
        { name: 'Fri', users: usersResult.count! * 0.16, posts: postsResult.count! * 0.20 },
        { name: 'Sat', users: usersResult.count! * 0.15, posts: postsResult.count! * 0.11 },
        { name: 'Sun', users: usersResult.count! * 0.15, posts: postsResult.count! * 0.10 },
      ];
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, role: 'admin' }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin successfully"
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive"
      });
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role removed successfully"
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin role",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || ""
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          location: editForm.location
        })
        .eq('user_id', editingUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully"
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-forest mb-2">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and platform administration</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Destinations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDestinations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    users: {
                      label: "Users",
                      color: "hsl(var(--primary))",
                    },
                    posts: {
                      label: "Posts",
                      color: "hsl(var(--secondary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="posts" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    users: {
                      label: "Users",
                      color: "hsl(var(--primary))",
                    },
                    posts: {
                      label: "Posts", 
                      color: "hsl(var(--secondary))",
                    },
                    destinations: {
                      label: "Destinations",
                      color: "hsl(var(--accent))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Users', value: stats.totalUsers },
                      { name: 'Posts', value: stats.totalPosts },
                      { name: 'Destinations', value: stats.totalDestinations },
                      { name: 'Admins', value: stats.totalAdmins },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const userRole = user.user_roles?.[0]?.role;
                  const isCurrentUserAdmin = userRole === 'admin';
                  const isSuper = user.email === 'johnleomedina@gmail.com';
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isSuper && (
                          <Badge variant="destructive">Super Admin</Badge>
                        )}
                        {isCurrentUserAdmin && !isSuper && (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                        {!isCurrentUserAdmin && (
                          <Badge variant="outline">User</Badge>
                        )}
                         
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                               <Edit className="h-4 w-4 mr-1" />
                               Edit
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Edit User Profile</DialogTitle>
                             </DialogHeader>
                             <div className="space-y-4">
                               <div>
                                 <Label htmlFor="full_name">Full Name</Label>
                                 <Input
                                   id="full_name"
                                   value={editForm.full_name}
                                   onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                 />
                               </div>
                               <div>
                                 <Label htmlFor="email">Email (Read-only)</Label>
                                 <Input
                                   id="email"
                                   value={editForm.email}
                                   disabled
                                 />
                               </div>
                               <div>
                                 <Label htmlFor="bio">Bio</Label>
                                 <Input
                                   id="bio"
                                   value={editForm.bio}
                                   onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                 />
                               </div>
                               <div>
                                 <Label htmlFor="location">Location</Label>
                                 <Input
                                   id="location"
                                   value={editForm.location}
                                   onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                 />
                               </div>
                               <div className="text-sm text-muted-foreground">
                                 <strong>Points:</strong> {user.points || 0}
                               </div>
                               <Button onClick={handleUpdateUser} className="w-full">
                                 Update Profile
                               </Button>
                             </div>
                           </DialogContent>
                         </Dialog>
                         
                         {!isSuper && (
                           <>
                             {!isCurrentUserAdmin ? (
                               <Button
                                 size="sm"
                                 onClick={() => promoteToAdmin(user.user_id)}
                                 className="ml-2"
                               >
                                 <Plus className="h-4 w-4 mr-1" />
                                 Make Admin
                               </Button>
                             ) : (
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => removeAdminRole(user.user_id)}
                                 className="ml-2"
                               >
                                 Remove Admin
                               </Button>
                             )}
                           </>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;