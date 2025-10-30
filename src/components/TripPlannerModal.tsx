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
import { Loader2, Download, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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

  
     const handleDownloadPdf = async () => {
      const contentToCapture = tripPlanRef.current;
      if (!tripPlan) {
      toast({ title: "Error", description: "No trip plan content to download.", variant: "destructive" });
      return;
    }
    
      setIsDownloading(true);

    try {
        // --- Create a temporary clone for accurate capturing ---
        const clone = contentToCapture.cloneNode(true) as HTMLElement;

        // Create the disclaimer element
        const disclaimer = document.createElement('div');
        disclaimer.innerHTML = `
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #f59e0b; background-color: #fffbeb; color: #b45309; border-radius: 8px; font-size: 10px;">
                <h4 style="font-weight: 600; margin-bottom: 5px;">AI-Generated Content Disclaimer</h4>
                <p>This itinerary is based on the generative knowledge of the AI and was not fed with real-time data from EcoLakbay's partners. Please verify details with establishments before your trip.</p>
            </div>
        `;
        clone.appendChild(disclaimer);

        // Style the clone to be off-screen but rendered at full height
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0px';
        clone.style.width = `${contentToCapture.offsetWidth}px`; // Use the original width
        
        document.body.appendChild(clone);
        
        // --- Capture the full-height clone ---
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            // Allow the canvas to expand to the full height of the content
            windowHeight: clone.scrollHeight, 
            scrollY: -window.scrollY,
        });

        // --- Clean up the cloned element immediately ---
        document.body.removeChild(clone);

        // --- PDF Generation Logic (The slicing part is now correct) ---
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgHeight / imgWidth;
        const pdfImageHeight = (pdfWidth * ratio); // Calculate height based on PDF width

        let position = 0;
        let heightLeft = pdfImageHeight;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = position - pdf.internal.pageSize.getHeight();
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(`ecolakbay-trip-plan.pdf`);

    } catch (error) {
        console.error("Error creating PDF:", error);
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