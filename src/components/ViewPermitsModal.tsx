import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';

// Define the shape of the permit object based on your schema
interface Permit {
  id: string;
  permit_type: string;
  file_name: string;
  file_url: string;
  verification_status: string;
}

// The destination object will contain the permits
interface Destination {
  business_name: string;
  destination_permits: Permit[];
}

interface ViewPermitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: Destination | null;
}

export const ViewPermitsModal: React.FC<ViewPermitsModalProps> = ({ isOpen, onClose, destination }) => {
    if (!destination) return null;

    const permits = destination.destination_permits || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Permits for: {destination.business_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {permits.length > 0 ? (
                        permits.map((permit) => (
                            <div key={permit.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium capitalize">{permit.permit_type.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground">{permit.file_name}</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <a href={permit.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        View
                                    </a>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No permits were uploaded for this destination.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
