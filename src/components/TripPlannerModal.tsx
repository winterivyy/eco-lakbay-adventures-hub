import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TripPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TripPlannerModal = ({ open, onOpenChange }: TripPlannerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<string>("");
  const [showPlan, setShowPlan] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // --- FIX #1: REMOVED budget and travelStyle from the form state ---
  const initialFormData = {
    startingPoint: "", 
    duration: "",      
    groupSize: 1,
    interests: [] as string[],
  };
  const [formData, setFormData] = useState(initialFormData);

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
    // --- FIX #2: SIMPLIFIED validation check ---
    if (!formData.startingPoint || !formData.duration || formData.interests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (*) to generate your trip plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // The body of the request now perfectly matches the backend function
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
    setFormData(initialFormData);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleOpen = (isOpen: boolean) => {
      if (!isOpen) {
          handleClose();
      } else {
          onOpenChange(true);
      }
  };

  // --- PDF download function remains the same, it's already excellent ---
  const handleDownloadPdf = () => {
    // ... no changes needed here ...
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
          // --- The "Show Plan" view remains the same ---
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-6 prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {tripPlan}
            </div>
            <Alert variant="default" className="border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {/* ... disclaimer alert content ... */}
            </Alert>      
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { setShowPlan(false); setTripPlan(""); }} variant="outline" className="flex-grow">Modify Plan</Button>
              <Button onClick={handleDownloadPdf} disabled={isDownloading} className="flex-grow">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isDownloading ? "Generating..." : "Download as PDF"}
              </Button>
              <Button onClick={handleClose} variant="eco" className="flex-grow">Close</Button>
            </div>
          </div>
        ) : (
          // --- FIX #3: REMOVED Budget and Travel Style from the form's JSX ---
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="startingPoint">Where is your starting point or accommodation? *</Label>
                <Input
                  id="startingPoint"
                  placeholder="e.g., Quest Plus Conference Center, Clark"
                  value={formData.startingPoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, startingPoint: e.target.value }))}
                />
              </div>
              
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
                <Label htmlFor="groupSize">Group Size *</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min="1" max="50"
                  value={formData.groupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                />
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
