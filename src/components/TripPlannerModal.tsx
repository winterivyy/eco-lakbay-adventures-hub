import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react"; // Import Loader2 for the loading state

interface TripPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TripPlannerModal = ({ open, onOpenChange }: TripPlannerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<string>("");
  const [showPlan, setShowPlan] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // --- ADDED `startingPoint` ---
    startingPoint: "", 
    // --- `duration` is now a string for text input ---
    duration: "",      
    budget: "",
    groupSize: 1,
    travelStyle: "",
    interests: [] as string[],
  });

  const interestOptions = [
    "Nature & Wildlife", "Cultural Heritage", "Food & Cuisine", "Adventure Activities",
    "Photography", "Local Communities", "Historical Sites", "Sustainable Farming",
    "Arts & Crafts", "Relaxation"
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked ? [...prev.interests, interest] : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleGeneratePlan = async () => {
    // Add `startingPoint` to the validation check
    if (!formData.startingPoint || !formData.duration || !formData.budget || !formData.travelStyle || formData.interests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your trip plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // The formData now includes the startingPoint
      const { data, error } = await supabase.functions.invoke('generate-trip-plan', {
        body: formData
      });
      if (error) throw error;
      setTripPlan(data.tripPlan);
      setShowPlan(true);
    } catch (error: any) {
      console.error('Error generating trip plan:', error);
      toast({ title: "Error", description: `Failed to generate plan: ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setShowPlan(false);
    setTripPlan("");
    setFormData({
      startingPoint: "", duration: "", budget: "", groupSize: 1, travelStyle: "", interests: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // When opening the modal, we still reset, but don't close.
  const handleOpen = (isOpen: boolean) => {
      if (!isOpen) {
          handleClose();
      } else {
          onOpenChange(true);
      }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-forest">
            {showPlan ? "Your AI-Generated Trip Plan" : "Plan Your Eco-Adventure"}
          </DialogTitle>
        </DialogHeader>

        {showPlan ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-6 prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {tripPlan}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => { setShowPlan(false); setTripPlan(""); }} variant="outline" className="flex-1">
                Modify Plan
              </Button>
              <Button onClick={handleClose} variant="eco" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* --- 1. NEW `startingPoint` Input --- */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="startingPoint">Where is your starting point or accommodation? *</Label>
                <Input
                  id="startingPoint"
                  placeholder="e.g., My hotel in Angeles City"
                  value={formData.startingPoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, startingPoint: e.target.value }))}
                />
              </div>
              
              {/* --- 2. MODIFIED `duration` Input --- */}
              <div className="space-y-2">
                <Label htmlFor="duration">Trip Duration (e.g., "3 days", "a weekend") *</Label>
                <Input
                  id="duration"
                  type="text"
                  placeholder="e.g., 3 days and 2 nights"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range (PHP) *</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under 5,000">Under ₱5,000</SelectItem>
                    <SelectItem value="5,000 - 10,000">₱5,000 - ₱10,000</SelectItem>
                    <SelectItem value="10,000 - 20,000">₱10,000 - ₱20,000</SelectItem>
                    <SelectItem value="Over 20,000">Over ₱20,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size *</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min="1" max="50"
                  value={formData.groupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelStyle">Travel Style *</Label>
                <Select value={formData.travelStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select travel style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget Backpacker">Budget Backpacker</SelectItem>
                    <SelectItem value="Comfort Traveler">Comfort Traveler</SelectItem>
                    <SelectItem value="Luxury Explorer">Luxury Explorer</SelectItem>
                    <SelectItem value="Family with Kids">Family with Kids</SelectItem>
                    <SelectItem value="Adventure Seeker">Adventure Seeker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Interests (Select at least one) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox id={interest} checked={formData.interests.includes(interest)} onCheckedChange={(checked) => handleInterestChange(interest, !!checked)} />
                    <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button onClick={handleClose} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleGeneratePlan} disabled={isLoading} variant="eco" className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Generating Your Plan..." : "Generate Trip Plan"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripPlannerModal;