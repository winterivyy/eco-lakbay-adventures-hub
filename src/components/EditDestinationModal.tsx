import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Destination {
  id: string;
  images: string[] | null;
  [key: string]: any;
}

interface EditDestinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    destination: Destination | null;
}

export const EditDestinationModal: React.FC<EditDestinationModalProps> = ({ isOpen, onClose, onSave, destination }) => {
    const [formData, setFormData] = useState<Destination | null>(destination);
    // --- NEW State Management for Staging ---
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Reset state every time a new destination is passed in
        setFormData(destination);
        setExistingImageUrls(destination?.photos || []);
        setStagedFiles([]);
        setUrlsToDelete([]);
    }, [destination]);

    if (!destination) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => prev ? ({ ...prev, [e.target.id]: e.target.value }) : null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setStagedFiles(prev => [...prev, ...Array.from(files)]);
        }
    };
    
    const handleRemoveExistingImage = (imageUrl: string) => {
        setExistingImageUrls(prev => prev.filter(url => url !== imageUrl));
        setUrlsToDelete(prev => [...prev, imageUrl]);
    };

    const handleRemoveStagedFile = (indexToRemove: number) => {
        setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveChanges = async () => {
        if (!formData) return;
        setIsSaving(true);
        
        try {
            // --- Stage 1: Upload new files ---
            const newPublicUrls = await Promise.all(
                stagedFiles.map(async file => {
                    const fileName = `${Date.now()}-${file.name}`;
                    const filePath = `public/destinations/${destination.id}/${fileName}`;
                    const { error } = await supabase.storage.from('destination-photos').upload(filePath, file);
                    if (error) throw error;
                    const { data } = supabase.storage.from('destination-photos').getPublicUrl(filePath);
                    return data.publicUrl;
                })
            );

            // --- Stage 2: Delete marked files from Storage ---
            if (urlsToDelete.length > 0) {
                const filePathsToDelete = urlsToDelete.map(url => {
                    const urlParts = new URL(url);
                    return `public/destinations${urlParts.pathname.split('/public/destinations')[1]}`;
                });
                await supabase.storage.from('destination-photos').remove(filePathsToDelete);
            }
            
            // --- Stage 3: Update the database with all changes ---
            const finalImageUrls = [...existingImageUrls, ...newPublicUrls];
            const { id, created_at, owner_id, ...otherFormData } = formData;
            const updatePayload = {
                ...otherFormData,
                images: finalImageUrls,
                updated_at: new Date().toISOString(),
            };
            
            const { error: dbError } = await supabase.from('destinations').update(updatePayload).eq('id', id);
            if (dbError) throw dbError;

            toast({ title: "Success!", description: "Destination updated successfully." });
            onSave();
        } catch (error: any) {
            toast({ title: "An Error Occurred", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
       // --- NEW Geocoding Function with the fix ---
    const handleGeocodeAddress = async () => {
        // --- THIS IS THE FIX ---
        // If formData doesn't exist for some reason, stop the function immediately.
        if (!formData) {
            toast({ title: "Cannot find destination data.", variant: "destructive" });
            return;
        }
        // -----------------------

        const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, Philippines`;
        if (fullAddress.length < 15) {
            toast({ title: "Address is too short.", variant: "destructive" });
            return;
        }

        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => prev ? ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }) : null);
                toast({ title: "Location Found!", description: `Coordinates have been updated.` });
            } else {
                toast({ title: "Location Not Found", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Geocoding Error", variant: "destructive" });
        } finally {
            setIsGeocoding(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Update Destination: {destination.business_name}</DialogTitle></DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* --- REVISED Image Management Section --- */}
                    <div>
                        <Label className="text-lg font-semibold">Destination Photos</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
                            {/* Display Existing Images */}
                            {existingImageUrls.map(url => (
                                <div key={url} className="relative group aspect-square">
                                    <img src={url} alt="Destination" className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="icon" variant="destructive" onClick={() => handleRemoveExistingImage(url)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            {/* Display Staged File Previews */}
                            {stagedFiles.map((file, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="icon" variant="destructive" onClick={() => handleRemoveStagedFile(index)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            {/* Upload Button */}
                            <Label htmlFor="image-upload-edit" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs mt-2 text-center">Add Photos</span>
                            </Label>
                            <Input id="image-upload-edit" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </div>
                    </div>

                    {/* --- 2. Existing Form Section --- */}
                    <div>
                        <Label className="text-lg font-semibold">Business Details</Label>
                        <div className="grid gap-4 py-4 border-t mt-2">
                            {/* --- We will now manually define fields for better control --- */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">Address</Label>
                                <Input id="address" value={formData.address || ''} onChange={handleChange} className="col-span-2" />
                                <Button type="button" size="sm" onClick={handleGeocodeAddress} disabled={isGeocoding} className="col-span-1">
                                    {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />} Find
                                </Button>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Coordinates</Label>
                                <div className="col-span-3 grid grid-cols-2 gap-2">
                                    <div><Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label><Input id="latitude" type="number" step="any" value={formData.latitude || ''} onChange={handleChange} /></div>
                                    <div><Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label><Input id="longitude" type="number" step="any" value={formData.longitude || ''} onChange={handleChange} /></div>
                                </div>
                            </div>

                             {Object.keys(formData).filter(key => 
                                !['id', 'created_at', 'updated_at', 'owner_id', 'status', 'rating', 'review_count', 'images', 'destination_permits', 'address', 'latitude', 'longitude'].includes(key)
                             ).map(key => (
                                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                                    <Label htmlFor={key} className="text-right capitalize">{key.replace(/_/g, ' ')}</Label>
                                    {key === 'description' || key === 'sustainability_practices' ? (
                                        <Textarea id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />
                                    ) : (
                                        <Input id={key} value={formData[key] || ''} onChange={handleChange} className="col-span-3" />
                                    )}
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                 <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save All Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
