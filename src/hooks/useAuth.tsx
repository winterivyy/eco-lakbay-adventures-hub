import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // --- THIS IS THE FINAL, ROBUST VERSION ---
    // We rely ONLY on `onAuthStateChange`. It fires immediately with the
    // current session, so a separate `getSession()` call is not needed and can cause race conditions.
    // This is the recommended Supabase pattern.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle the special case for password recovery
        if (event === 'PASSWORD_RECOVERY') {
          setSession(session);
          setUser(null);
        } 
        else {
          // For all other events, set both session and user normally.
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome Back!",
            description: "You have successfully signed in.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } }
    });
    if (error) {
      toast({ title: "Sign Up Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check Your Email", description: "We've sent a confirmation link to complete your registration." });
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Sign In Error", description: error.message, variant: "destructive" });
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      navigate('/'); 
    }
  };

  const value = { user, session, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
