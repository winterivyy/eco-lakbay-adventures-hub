import { useState } from 'react'; // --- NEW ---
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast"; // --- NEW ---
import { FileText, Download, Loader2 } from 'lucide-react'; // --- NEW ---

// --- MODIFIED ---: The name of your Supabase Storage bucket.
const PERMITS_BUCKET = 'permits';

// Interfaces remain the same...
interface Permit {
  id: string;
  permit_type: string;
  file_name: string;
  file_url: string; // This is the file PATH
  verification_status: string;
}
interface DestinationWithPermits {
  business_name: string;
  destination_permits: Permit[];
}
interface ViewPermitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: DestinationWithPermits | null;
}

export const ViewPermitsModal: React.FC<ViewPermitsModalProps> = ({ isOpen, onClose, destination }) => {
    // --- NEW ---: State to handle loading for individual buttons
    const [loadingPermitId, setLoadingPermitId] = useState<string | null>(null);
    const { toast } = useToast();

    if (!destination) return null;
    const permits = destination.destination_permits || [];

    // --- MODIFIED ---: This function now generates a Signed URL on click
    const handleViewPermit = async (permit: Permit) => {
        if (!permit.file_url) {
            toast({ title: "File path is missing.", variant: "destructive" });
            return;
        }
        
        setLoadingPermitId(permit.id); // Show loader on the clicked button
        
        try {
            // Generate a signed URL that expires in 5 minutes (300 seconds)
            const { data, error } = await supabase.storage
                .from(PERMITS_BUCKET)
                .createSignedUrl(permit.file_url, 300);

            if (error) throw error;
            
            // Open the secure, temporary URL in a new tab
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');

        } catch (error: any) {
            console.error("Error generating signed URL:", error);
            toast({
                title: "Could not generate file link.",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoadingPermitId(null); // Hide loader
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Permits for: {destination.business_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {permits.length > 0 ? (
                        permits.map((permit) => (
                            <div key={permit.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium capitalize truncate">{permit.permit_type.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground truncate">{permit.file_name}</p>
                                    </div>
                                </div>
                                
                                {/* --- MODIFIED ---: The Button now uses an onClick handler */}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-4 flex-shrink-0"
                                    onClick={() => handleViewPermit(permit)}
                                    disabled={loadingPermitId === permit.id} // Disable while loading this specific permit
                                >
                                    {loadingPermitId === permit.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4 mr-2" />
                                    )}
                                    View
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No permits were found for this destination.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};