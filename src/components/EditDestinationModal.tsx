import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Destination {
  id: string;
  [key: string]: any;
}

interface EditDestinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    destination: Destination | null; // Allow destination to be null
}

export const EditDestinationModal: React.FC<EditDestinationModalProps> = ({ isOpen, onClose, onSave, destination }) => {
    const [formData, setFormData] = useState<Destination | null>(destination);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // This hook keeps the form data in sync with the selected destination
    useEffect(() => {
        setFormData(destination);
    }, [destination]);

    // --- THIS IS THE FIX ---
    // If there is no destination, don't render anything. This prevents
    // the crash when the modal is closing.
    if (!destination || !formData) {
        return null;
    }
    // -----------------------

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [id]: value }) : null);
    };

    const handleSaveChanges = async () => {
        if (!formData) return;
        setIsSaving(true);
        setError(null);

        // Exclude fields that shouldn't be updated directly
        const { id, created_at, owner_id, status, rating, review_count, ...updateData } = formData;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('destinations')
            .update(updateData)
            .eq('id', id);

        setIsSaving(false);
        if (error) {
            console.error("Error updating destination:", error);
            setError(`Failed to save: ${error.message}`);
        } else {
            onSave();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Destination: {destination.business_name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Filter out keys we don't want to show in the form */}
                    {Object.keys(formData).filter(key => 
                        ![
                            'id', 'created_at', 'updated_at', 'owner_id', 'status', 
                            'rating', 'review_count', 'images' // also hiding images for now
                        ].includes(key) && typeof formData[key] !== 'object'
                    ).map(key => (
                         <div className="grid grid-cols-4 items-center gap-4" key={key}>
                            <Label htmlFor={key} className="text-right capitalize">
                                {key.replace(/_/g, ' ')}
                            </Label>
                             {key === 'description' || key === 'sustainability_practices' ? (
                                 <Textarea id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />
                             ) : (
                                <Input id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />
                             )}
                        </div>
                    ))}
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
