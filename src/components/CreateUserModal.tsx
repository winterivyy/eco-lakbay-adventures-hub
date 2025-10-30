import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        // ... Validation logic ...
        
        setIsLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true, // Auto-confirm the email for admin-created users
            });

            if (authError) throw authError;
            if (!user) throw new Error("Failed to create user.");

            // Create profile
            await supabase.from("profiles").insert({
                user_id: user.id,
                email: formData.email,
                full_name: formData.name,
            });

            // If admin role is selected, add to user_roles
            if (formData.role === 'admin') {
                await supabase.from('user_roles').insert({ user_id: user.id, role: 'admin' });
            }

            toast({ title: "User Created Successfully!" });
            onUserCreated(); // This will close the modal and refresh data in the parent
        } catch (error: any) {
            toast({ title: "Error Creating User", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Manually create a new user account for the platform.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}/></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}/></div>
                    <div className="space-y-2"><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData(p => ({...p, password: e.target.value}))}/></div>
                    <div className="space-y-2"><Label>Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData(p => ({...p, role: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Create User
                </Button>
            </DialogContent>
        </Dialog>
    );
};