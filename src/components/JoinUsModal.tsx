import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface JoinUsModalProps {
  open: boolean;
  onOpencha: (open: boolean) => void;
}

const JoinUsModal = ({ open, onOpenChange }: JoinUsModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    nationality: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Your validation logic is correct
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.gender ||
      !formData.nationality
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    // Step 1: Create or get the Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error && error.message !== 'User already registered') {
        alert(error.message);
        setIsLoading(false);
        return;
    }

    const user = data.user || (await supabase.auth.getUser()).data.user;

    // Step 2: Add or Update profile data to `profiles` table
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            email: formData.email,
            full_name: formData.name,
            gender: formData.gender,
            nationality: formData.nationality,
          },
          {
            onConflict: 'user_id', // Explicitly tell upsert which column to check for conflicts
          }
        );

      if (profileError) {
        alert("Error saving profile: " + profileError.message);
      } else {
        alert("Account created/updated successfully! Please check your email for verification.");
        onOpencha(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          gender: "",
          nationality: "",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-forest">
            Join EcoLakbay
          </DialogTitle>
          <DialogDescription>
            Create your account and start making a positive impact on the
            environment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your form inputs remain the same */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className="w-full border rounded-md p-2" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" type="text" placeholder="Enter your nationality" value={formData.nationality} onChange={(e) => handleChange("nationality", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password (min. 6 characters)" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-3 pt-4">
              <Button type="submit" variant="eco" disabled={isLoading} className="w-full">
                {isLoading ? "Creating Account..." : "Join EcoLakbay"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <span className="text-forest cursor-pointer hover:underline">
                Sign in instead
              </span>
            </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinUsModal;
