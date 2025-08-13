import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Determine password strength
  const getPasswordStrength = (pw: string) => {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /\d/.test(pw) && /[\W_]/.test(pw)) return 'Strong';
    if (pw.length >= 8) return 'Medium';
    if (pw.length > 0) return 'Weak';
    return '';
  };

  // Get user role safely using Supabase client
  const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error.message);
      return null;
    }
    return data?.role || null;
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        return;
      }

      if (session?.user?.recoveryToken) {
        setRecoverySession(true);
        const role = await getUserRole(session.user.id);
        setUserRole(role);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoverySession(true);
      else if (session && !session.user?.recoveryToken) navigate('/dashboard');
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password should be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: 'Password Updated Successfully!',
        description: 'Please log in with your new password.',
      });

      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({ title: 'Error Updating Password', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!recoverySession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid or expired password recovery link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex items-center justify-center pt-20 pb-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set Your New Password</CardTitle>
            <CardDescription>Please enter and confirm your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2 relative">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-9 text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {password && (
                  <p className={`text-sm mt-1 ${
                    getPasswordStrength(password) === 'Strong'
                      ? 'text-green-600'
                      : getPasswordStrength(password) === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    Strength: {getPasswordStrength(password)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
            {userRole && (
              <p className="mt-4 text-sm text-gray-600">Your role: {userRole}</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UpdatePassword;
