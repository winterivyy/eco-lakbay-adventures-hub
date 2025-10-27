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
import { useToast } from "@/hooks/use-toast"; // You were using toasts, so I've kept this

interface JoinUsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Your validation and submission logic remains the same...
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.gender ||
      !formData.nationality
    ) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error && error.message !== 'User already registered') {
        toast({ title: "Sign-Up Error", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const user = data.user || (await supabase.auth.getUser()).data.user;

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
            { onConflict: 'user_id' }
        );

      if (profileError) {
        toast({ title: "Profile Error", description: "Error saving profile: " + profileError.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "Please check your email to verify your account." });
        onOpenChange(false);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", gender: "", nationality: "" });
      }
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* --- FIX IS HERE: Add classes to DialogContent --- */}
      <DialogContent 
        className="sm:max-w-md grid grid-rows-[auto_1fr] max-h-[90vh]"
      >
        <DialogHeader className="row-start-1">
          <DialogTitle className="text-2xl font-bold text-forest">
            Join EcoLakbay
          </DialogTitle>
          <DialogDescription>
            Create your account and start making a positive impact on the
            environment.
          </DialogDescription>
        </DialogHeader>

        {/* --- FIX IS HERE: Add a scrolling class to the form --- */}
        <form onSubmit={handleSubmit} className="space-y-4 row-start-2 overflow-y-auto pr-4 -mr-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full border rounded-md p-2 bg-background"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              type="text"
              placeholder="Enter your nationality"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 pt-4 sticky bottom-0 bg-background py-4">
            <Button
              type="submit"
              variant="eco"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating Account..." : "Join EcoLakbay"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
