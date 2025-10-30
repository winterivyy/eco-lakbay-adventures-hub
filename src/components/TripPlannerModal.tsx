import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react"; // Import Loader2 for the loading state
// --- NEW ---: Import the PDF libraries
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
  const { toast } = useToast();
    // --- NEW ---: A ref to target the HTML element we want to convert to PDF
  const tripPlanRef = useRef<HTMLDivElement>(null);
  
  // --- NEW ---: State to handle the PDF download process
  const [isDownloading, setIsDownloading] = useState(false);


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

  
     const handleDownloadPdf = () => {
    if (!tripPlan) {
      toast({ title: "Error", description: "No trip plan content to download.", variant: "destructive" });
      return;
    }
    
    setIsDownloading(true);

     try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      const margin = 15;
      const maxWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      let cursorY = 20; // Start the cursor lower to leave room for the title

      // Add Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("Your EcoLakbay Trip Plan", margin, cursorY);
      cursorY += 15; // Move cursor down

      // Add Trip Plan Body
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      // The text function automatically handles page breaks
      pdf.text(tripPlan, margin, cursorY, { maxWidth: maxWidth, align: 'left' });
      
      // --- THIS IS THE FIX ---
      // Get the y-position of the last line of text to place the disclaimer after it.
      // `getLastPageInfo` is a bit of a hack but necessary in jspdf.
      const lastPage = pdf.internal.pages.length - 1;
      const lastY = (pdf as any).lastAutoTable.finalY || pdf.getPageHeight() - 50; // Use a fallback if auto-table isn't used

      // Add space before the disclaimer
      let disclaimerY = lastY + 10;
      
      // If disclaimer position is too low, add a new page for it
      if (disclaimerY > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        disclaimerY = 20;
      }

      // Add Disclaimer
      const disclaimerText = "Disclaimer: This itinerary is generated by AI based on general knowledge and was not fed with real-time data from EcoLakbay's partners. Availability, operating hours, and conditions of suggested destinations may vary. Please verify details directly with the establishments before your trip.";
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(150); // Gray color
      pdf.text(disclaimerText, margin, disclaimerY, { maxWidth: maxWidth, align: 'left' });


      pdf.save(`ecolakbay-trip-plan.pdf`);

    } catch (error) {
        console.error("Error creating text-based PDF:", error);
        toast({ title: "PDF Creation Failed", variant: "destructive"});
    } finally {
        setIsDownloading(false);
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
            {/* --- MODIFIED ---: We add the ref to this div */}
            {/* The ref here is crucial for html2canvas to know what to capture */}
            <div className="bg-muted rounded-lg p-6 prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {tripPlan}
            </div>
            <Alert variant="default" className="border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 !text-amber-600" />
              <AlertTitle className="font-semibold !text-amber-800 dark:!text-amber-200">AI-Generated Content</AlertTitle>
              <AlertDescription className="!text-amber-700 dark:!text-amber-300">
                This itinerary is based on the generative knowledge of the AI and was not fed with real-time data from EcoLakbay's partners. Please verify details with establishments before your trip.
              </AlertDescription>
            </Alert>      
            {/* --- MODIFIED ---: The button layout is updated */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { setShowPlan(false); setTripPlan(""); }} variant="outline" className="flex-grow">
                Modify Plan
              </Button>
              <Button onClick={handleDownloadPdf} disabled={isDownloading} className="flex-grow">
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? "Generating..." : "Download as PDF"}
              </Button>
              <Button onClick={handleClose} variant="eco" className="flex-grow">
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