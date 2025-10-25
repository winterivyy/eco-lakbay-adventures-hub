import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client'; // Import the Supabase client
import { FileText, Download } from 'lucide-react';

// --- MODIFIED ---: The name of your Supabase Storage bucket is now correct.
const PERMITS_BUCKET = 'permits';

// Define the shape of the permit object based on your schema
interface Permit {
  id: string;
  permit_type: string;
  file_name: string;
  file_url: string; // This is the PATH to the file, not a full URL
  verification_status: string;
}

// More specific interface for the destination object
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
    if (!destination) return null;

    // Use a safety check in case destination_permits is null or undefined
    const permits = destination.destination_permits || [];

    // Helper function to generate a public URL from a file path
    const getPermitPublicUrl = (filePath: string) => {
        if (!filePath) {
            console.warn("Permit file path is missing.");
            return '#'; // Return a safe fallback to prevent crashes
        }
        
        // This is the core of the fix:
        const { data } = supabase.storage
            .from(PERMITS_BUCKET) // Uses the correct bucket name
            .getPublicUrl(filePath);
        
        return data.publicUrl;
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
                                <Button asChild variant="outline" size="sm" className="ml-4 flex-shrink-0">
                                    <a href={getPermitPublicUrl(permit.file_url)} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        View
                                    </a>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No permits were found for this destination.</p>
                            <p className="text-xs mt-1">Permits may still be processing or were not provided.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};