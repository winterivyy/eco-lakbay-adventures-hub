import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2 } from 'lucide-react';

// The name of your Supabase Storage bucket for permits.
const PERMITS_BUCKET = 'permits';
// Interfaces
interface Permit { id: string; permit_type: string; file_name: string; file_url: string; verification_status: string; }
interface DestinationWithPermits { business_name: string; destination_permits: Permit[]; }
interface ViewPermitsModalProps { isOpen: boolean; onClose: () => void; destination: DestinationWithPermits | null; }

export const ViewPermitsModal: React.FC<ViewPermitsModalProps> = ({ isOpen, onClose, destination }) => {
    const [loadingPermitId, setLoadingPermitId] = useState<string | null>(null);
    const { toast } = useToast();

    if (!destination) return null;
    const permits = destination.destination_permits || [];

    const handleViewPermit = async (permit: Permit) => {
      if (!permit.file_url) {
        toast({ title: "File path is missing.", variant: "destructive" });
        return;
      }
      setLoadingPermitId(permit.id);
      
      try {
        let filePath = permit.file_url;
        
        // --- THIS IS THE CRITICAL FIX ---
        // This code defensively checks if a full URL was stored in the database.
        // If it was, it extracts just the path needed for createSignedUrl.
        if (filePath.includes(PERMITS_BUCKET + '/')) {
            // Split the URL string by the bucket name and take the second part.
            // Example: "https://.../permit/folder/file.jpg" -> "folder/file.jpg"
            filePath = filePath.split(PERMITS_BUCKET + '/')[1];
        }

        const { data, error } = await supabase.storage
          .from(PERMITS_BUCKET)
          .createSignedUrl(filePath, 300); // 300 seconds = 5 minutes expiration

        if (error) {
          // If the error persists, it means the filePath is still wrong.
          throw error;
        }

        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } catch (error: any) {
        console.error("Error generating signed URL. Raw file_url was:", permit.file_url, "Processed path was:", permit.file_url.split(PERMITS_BUCKET + '/')[1]);
        toast({
          title: "Could not open file.",
          description: error.message, // Will now show "Object not found" if path is still wrong
          variant: "destructive",
        });
      } finally {
        setLoadingPermitId(null);
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
                                
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-4 flex-shrink-0"
                                    onClick={() => handleViewPermit(permit)}
                                    disabled={loadingPermitId === permit.id}
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