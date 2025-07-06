import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    duration: "",
    budget: "",
    groupSize: 2,
    travelStyle: "",
    interests: [] as string[],
  });

  const interestOptions = [
    "Nature & Wildlife",
    "Cultural Heritage",
    "Food & Cuisine",
    "Adventure Activities",
    "Photography",
    "Local Communities",
    "Historical Sites",
    "Sustainable Farming",
    "Arts & Crafts",
    "Religious Sites"
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }));
    }
  };

  const handleGeneratePlan = async () => {
    if (!formData.duration || !formData.budget || !formData.travelStyle || formData.interests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your trip plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip-plan', {
        body: formData
      });

      if (error) throw error;

      setTripPlan(data.tripPlan);
      setShowPlan(true);
      
      toast({
        title: "Trip Plan Generated!",
        description: "Your personalized eco-friendly trip plan is ready.",
      });
    } catch (error) {
      console.error('Error generating trip plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowPlan(false);
    setTripPlan("");
    setFormData({
      duration: "",
      budget: "",
      groupSize: 2,
      travelStyle: "",
      interests: [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-forest">
            {showPlan ? "Your AI-Generated Trip Plan" : "Plan Your Eco-Adventure"}
          </DialogTitle>
        </DialogHeader>

        {showPlan ? (
          <div className="space-y-4">
            <div className="bg-gradient-card rounded-lg p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {tripPlan}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowPlan(false)} 
                variant="outline"
                className="flex-1"
              >
                Modify Plan
              </Button>
              <Button 
                onClick={handleClose}
                variant="eco"
                className="flex-1"
              >
                Start Planning
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Trip Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 days">1-2 days</SelectItem>
                    <SelectItem value="3-4 days">3-4 days</SelectItem>
                    <SelectItem value="5-7 days">5-7 days</SelectItem>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range (PHP)</Label>
                <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under 5,000">Under ₱5,000</SelectItem>
                    <SelectItem value="5,000 - 10,000">₱5,000 - ₱10,000</SelectItem>
                    <SelectItem value="10,000 - 20,000">₱10,000 - ₱20,000</SelectItem>
                    <SelectItem value="20,000 - 50,000">₱20,000 - ₱50,000</SelectItem>
                    <SelectItem value="Above 50,000">Above ₱50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Group Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.groupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelStyle">Travel Style</Label>
                <Select value={formData.travelStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget Backpacker">Budget Backpacker</SelectItem>
                    <SelectItem value="Comfort Traveler">Comfort Traveler</SelectItem>
                    <SelectItem value="Luxury Explorer">Luxury Explorer</SelectItem>
                    <SelectItem value="Family-Friendly">Family-Friendly</SelectItem>
                    <SelectItem value="Adventure Seeker">Adventure Seeker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Interests (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                    />
                    <Label htmlFor={interest} className="text-sm">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleClose} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGeneratePlan}
                disabled={isLoading}
                variant="eco"
                className="flex-1"
              >
                {isLoading ? "Generating..." : "Generate Trip Plan"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripPlannerModal;