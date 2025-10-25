import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Destination {
  id: string;
  images: string[] | null; // This should be an array of SIMPLE PATHS, not full URLs
  [key: string]: any;
}

interface EditDestinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onDelete: () => void; // New prop to notify parent of deletion
    destination: Destination | null;
}

const BUCKET_NAME = 'destination-photos';

export const EditDestinationModal: React.FC<EditDestinationModalProps> = ({ isOpen, onClose, onSave, onDelete, destination }) => {
    const [formData, setFormData] = useState<Destination | null>(destination);
    // State management for the "staging" workflow
    const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [pathsToDelete, setPathsToDelete] = useState<string[]>([]);
    
     // --- NEW ---: Add a separate loading state for deletion
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const { toast } = useToast();

  const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);

useEffect(() => {
        const initializeModal = async () => {
            if (!destination) return;

            setFormData(destination);
            const imageIdentifiers = destination.images || [];
            setExistingImagePaths(imageIdentifiers);
            setStagedFiles([]);
            setPathsToDelete([]);

            if (imageIdentifiers.length > 0) {
                setIsLoadingUrls(true);
                try {
                    const signedUrlPromises = imageIdentifiers.map(pathOrUrl => {
                        // --- THIS IS THE BULLETPROOF SANITIZATION LOGIC ---
                        const sanitizePath = (p: string): string | null => {
                            if (!p) return null;
                            try {
                                // If it's a full URL, parse it to extract the path.
                                if (p.startsWith('http')) {
                                    const url = new URL(p);
                                    const pathSegments = url.pathname.split(`/${BUCKET_NAME}/`);
                                    if (pathSegments.length > 1) {
                                        return decodeURIComponent(pathSegments[1]);
                                    }
                                }
                                // If it's already a simple path, just return it.
                                return p;
                            } catch (e) {
                                console.error("Could not parse or sanitize path:", p, e);
                                return null;
                            }
                        };

                        const cleanPath = sanitizePath(pathOrUrl);

                        if (!cleanPath) {
                            return Promise.resolve({ error: new Error("Invalid path format"), data: null });
                        }
                        
                        // Always generate a fresh signed URL from the clean path.
                        return supabase.storage.from(BUCKET_NAME).createSignedUrl(cleanPath, 3600);
                    });

                    const settledPromises = await Promise.all(signedUrlPromises);
                    
                    const urls: Record<string, string> = {};
                    settledPromises.forEach((result, index) => {
                        const originalIdentifier = imageIdentifiers[index];
                        if (result.error) {
                            console.error(`Error for identifier "${originalIdentifier}":`, result.error.message);
                            urls[originalIdentifier] = 'error'; 
                        } else if (result.data) {
                            urls[originalIdentifier] = result.data.signedUrl;
                        }
                    });
                    setSignedImageUrls(urls);

                } catch (error) {
                    toast({ title: "Could not load images", variant: "destructive" });
                } finally {
                    setIsLoadingUrls(false);
                }
            } else {
                setSignedImageUrls({});
            }
        };

        if (isOpen && destination) {
            initializeModal();
        }
    }, [isOpen, destination, toast]);
    useEffect(() => {
        // Reset state every time a new destination is passed in
        setFormData(destination);
        // -- FIX: Use the correct field name `images` ---
        setExistingImagePaths(destination?.images || []);
        setStagedFiles([]);
        setPathsToDelete([]);
    }, [destination]);

    if (!destination) return null;
    if (!formData) return null; // Guard against null formData

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData(prev => prev ? ({ ...prev, [e.target.id]: e.target.value }) : null); };
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files) { setStagedFiles(prev => [...prev, ...Array.from(event.target.files!)]); }};
    const handleRemoveStagedFile = (indexToRemove: number) => { setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove)); };

    // Mark an existing image for deletion
    const handleRemoveExistingImage = (path: string) => {
        setExistingImagePaths(prev => prev.filter(p => p !== path));
        setPathsToDelete(prev => [...prev, path]);
    };

     const handleSaveChanges = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            // Step 1: Upload new files and get their simple relative paths
            const newImagePaths = await Promise.all(
                stagedFiles.map(async file => {
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `destinations/${destination.id}/${fileName}`;
                    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
                    if (error) throw error;
                    return filePath;
                })
            );

            // Step 2: Delete marked files from Storage
            if (pathsToDelete.length > 0) {
                await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
            }
            
            // Step 3: Construct the final list of image paths for the database
            const finalImagePaths = [...existingImagePaths, ...newImagePaths];
            
            // Step 4: Construct the payload using the cleaned form data AND the final image paths
            const { id, created_at, owner_id, status, rating, review_count, destination_permits, images, ...otherFormData } = formData;
            const updatePayload = {
                ...otherFormData,
                images: finalImagePaths, // USE THE CORRECT, FINAL LIST OF IMAGES
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
    
    
     const handleDeleteDestination = async () => {
        if (!destination) return;
        setIsDeleting(true);

        try {
            // Step 1: Delete all associated images from Supabase Storage
            if (destination.images && destination.images.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove(destination.images);
                
                // Log storage error but proceed to delete the DB record anyway
                if (storageError) {
                    console.error("Failed to delete some images from storage:", storageError);
                }
            }

            // Step 2: Delete the destination record from the database
            const { error: dbError } = await supabase
                .from('destinations')
                .delete()
                .eq('id', destination.id);

            if (dbError) throw dbError;

            // Step 3: Show success toast and call the parent component's callback
            toast({ title: "Success!", description: "Destination has been permanently deleted." });
            onDelete(); // This will close the modal and refresh the data list

        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Update Destination: {destination.business_name}</DialogTitle></DialogHeader>
                <div className="grid gap-6 py-4">
                    <div>
                        <Label className="text-lg font-semibold">Destination Photos</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
                             {/* --- THIS JSX IS NOW MORE ROBUST --- */}
                            {existingImagePaths.map(path => (
                                <div key={path} className="relative group aspect-square">
                                    {(isLoadingUrls) ? (
                                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (signedImageUrls[path] && signedImageUrls[path] !== 'error') ? (
                                        <img 
                                            src={signedImageUrls[path]} 
                                            alt="Existing destination" 
                                            className="w-full h-full object-cover rounded-md" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-destructive/10 text-destructive rounded-md flex items-center justify-center text-center text-xs p-1">
                                            Image not found
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button size="icon" variant="destructive" onClick={() => handleRemoveExistingImage(path)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            
                            {stagedFiles.map((file, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                        <Button size="icon" variant="destructive" onClick={() => handleRemoveStagedFile(index)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            
                            <Label htmlFor="image-upload-edit" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs mt-2 text-center">Add Photos</span>
                            </Label>
                            <Input id="image-upload-edit" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </div>
                    </div>
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
               {/* --- MODIFIED ---: The DialogFooter now includes the delete button and confirmation dialog */}
                <DialogFooter className="justify-between items-center pt-4 border-t">
                    {/* Delete Button and Confirmation Dialog */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isSaving || isDeleting}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Destination
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the <strong>{destination.business_name}</strong> destination, including all of its photos and associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteDestination} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Yes, delete it
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Cancel and Save Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>Cancel</Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving || isDeleting}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save All Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
