import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>; // Modified to be simpler
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate(); // For redirecting after sign out

  useEffect(() => {
    setLoading(true);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // --- THIS IS THE CRUCIAL FIX ---
    // The auth state listener is now smarter.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        
        // This event fires when the user clicks the password reset link in their email.
        // We set the session to get the temporary token, but we MUST keep the user null
        // to prevent protected route logic from redirecting us away from the update page.
        if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery event detected.");
          setSession(session);
          setUser(null); // Keep user null to allow access to the UpdatePassword page
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
    // This function remains the same as your original
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
    // This function remains the same as your original
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Sign In Error", description: error.message, variant: "destructive" });
    }
    return { error };
  };

  const signOut = async () => {
    // Simplified this function slightly for clarity
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      // It's often good practice to redirect to home after sign out
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
