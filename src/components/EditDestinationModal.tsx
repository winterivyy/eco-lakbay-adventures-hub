import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Needed to get user ID for file path

interface Destination {
  id: string;
  images: string[] | null; // Expect 'images' to be an array of URLs
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
    const [images, setImages] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth(); // Get user to build file path

    useEffect(() => {
        setFormData(destination);
        setImages(destination?.images || []);
    }, [destination]);

    if (!destination || !formData) return null;

     // --- NEW Geocoding Function using a free API ---
    const handleGeocodeAddress = async () => {
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, Philippines`;
        if (!fullAddress.trim() || fullAddress.length < 15) {
            toast({ title: "Address too short", description: "Please provide a more complete address to find it on the map.", variant: "destructive" });
            return;
        }

        setIsGeocoding(true);
        try {
            // Using the free OpenStreetMap Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => prev ? ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }) : null);
                toast({ title: "Location Found!", description: `Coordinates updated: Lat: ${lat}, Lon: ${lon}` });
            } else {
                toast({ title: "Location Not Found", description: "Could not find coordinates for this address. Please try making it more specific.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Geocoding Error", description: "Could not connect to the map service.", variant: "destructive" });
        } finally {
            setIsGeocoding(false);
        }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [id]: value }) : null);
    };

    const handleSaveChanges = async () => {
        if (!formData) return;
        setIsSaving(true);
        // Important: Update the formData with the current state of the images array
        const finalUpdateData = { ...formData, images: images };
        const { id, created_at, owner_id, status, rating, review_count, destination_permits, ...updateData } = finalUpdateData;
        updateData.updated_at = new Date().toISOString();
        const { error } = await supabase.from('destinations').update(updateData).eq('id', id);
        setIsSaving(false);
        if (error) { toast({ title: "Error", description: `Failed to save changes: ${error.message}`, variant: "destructive" });
        } else { toast({ title: "Success!", description: "Destination details saved." }); onSave(); }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !user) return;

        setIsUploading(true);
        const uploadPromises = Array.from(files).map(async file => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `public/destinations/${destination.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('destination-photos').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('destination-photos').getPublicUrl(filePath);
            return publicUrl;
        });

        try {
            const newImageUrls = await Promise.all(uploadPromises);
            setImages(prev => [...prev, ...newImageUrls]);
            toast({ title: "Success!", description: "Images uploaded successfully." });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleImageDelete = async (imageUrl: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this image? This action cannot be undone.");
        if (!confirmed) return;

        try {
            // Extract the file path from the full URL to delete from storage
            const urlParts = new URL(imageUrl);
            const filePath = `public/destinations${urlParts.pathname.split('/public/destinations')[1]}`;
            
            const { error: storageError } = await supabase.storage.from('images').remove([filePath]);
            if (storageError) throw storageError;

            // Remove the URL from the local state
            const newImages = images.filter(img => img !== imageUrl);
            setImages(newImages);

            toast({ title: "Image Deleted", description: "Remember to save changes to make this permanent." });
        } catch (error: any) {
            toast({ title: "Error Deleting Image", description: error.message, variant: "destructive" });
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Destination: {destination.business_name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* --- 1. NEW Image Management Section --- */}
                    <div>
                        <Label className="text-lg font-semibold">Destination Photos</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
                            {images.map(url => (
                                <div key={url} className="relative group aspect-square">
                                    <img src={url} alt="Destination photo" className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="icon" variant="destructive" onClick={() => handleImageDelete(url)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            <Label htmlFor="image-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                                <span className="text-xs mt-2 text-center text-muted-foreground">Add Photos</span>
                            </Label>
                            <Input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
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
                    <Button onClick={handleSaveChanges} disabled={isSaving || isUploading}>
                        {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save All Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
