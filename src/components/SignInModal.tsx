import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onOpenChange }) => {
    // --- THIS IS THE KEY CHANGE ---
    // We use state to manage which view is shown: 'sign-in' or 'reset-password'
    const [view, setView] = useState<'sign-in' | 'reset-password'>('sign-in');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Reset view when modal is closed/opened
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setView('sign-in'); // Reset to sign-in view every time it opens
        }
        onOpenChange(isOpen);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Signed in successfully!" });
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    // --- The Correctly Defined `async` Password Reset Function ---
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Please enter your email address.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // This correctly points to your new page
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;
            
            toast({
                title: "Password Reset Email Sent",
                description: "Please check your inbox for a link to reset your password.",
            });
            setView('sign-in'); // Switch back to the login view after success
            
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                {/* --- Conditionally render the correct view --- */}
                {view === 'sign-in' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Sign In</DialogTitle>
                            <DialogDescription>Access your account to continue your sustainable journey.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                            </Button>
                            <div className="text-center">
                                {/* This button ONLY changes the view. It does not send an email. */}
                                <Button type="button" variant="link" onClick={() => setView('reset-password')}>
                                    Forgot Password?
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'reset-password' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>Enter your email and we'll send you a link to reset your password.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-reset">Email</Label>
                                <Input id="email-reset" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus/>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                            </Button>
                            <div className="text-center">
                                {/* This button switches back to the sign-in view. */}
                                <Button type="button" variant="link" onClick={() => setView('sign-in')}>
                                    Back to Sign In
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SignInModal;
