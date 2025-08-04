import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

// --- FIX #1: Standardize the prop name ---
interface PhotoUploadProps {
  onPhotosChange: (urls: string[]) => void;
  bucketName: string;
}

// --- FIX #2: Use the correct prop name here ---
export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosChange, bucketName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newPhotos: PhotoFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    const photoToRemove = photos.find(p => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl); // Clean up memory
    }
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    // Notify parent of the change immediately if a successfully uploaded photo is removed
    const successfulUrls = updatedPhotos.filter(p => p.status === 'success').map(p => p.url!);
    onPhotosChange(successfulUrls);
  };

  const handleUpload = async () => {
    if (!user) {
      toast({ title: "You must be logged in to upload photos.", variant: "destructive" });
      return;
    }
    setIsUploading(true);

    const photosToUpload = photos.filter(p => p.status === 'pending' || p.status === 'error');
    const existingUrls = photos.filter(p => p.status === 'success').map(p => p.url!);

    const uploadPromises = photosToUpload.map(async photo => {
      try {
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'uploading' } : p));
        
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, photo.file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'success', url: publicUrl } : p));
        return publicUrl;
      } catch (error) {
        console.error("Upload error:", error);
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'error' } : p));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const newSuccessfulUrls = results.filter((url): url is string => url !== null);
    
    setIsUploading(false);
    // --- FIX #3: Call the correct prop name with all successful URLs ---
    onPhotosChange([...existingUrls, ...newSuccessfulUrls]);
    
    if (newSuccessfulUrls.length > 0) {
      toast({ title: `Uploaded ${newSuccessfulUrls.length} new photo(s) successfully.` });
    }
  };

  const pendingPhotos = photos.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-medium">Upload Destination Photos</h4>
        <p className="text-muted-foreground mb-4">Drag and drop, or click to choose files.</p>
        <Input id="photo-upload" type="file" multiple accept="image/png, image/jpeg" onChange={handleFileSelect} className="hidden" />
        <Label htmlFor="photo-upload"><Button variant="outline" asChild><span>Choose Files</span></Button></Label>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square group">
              <img src={photo.previewUrl} alt="Preview" className="object-cover w-full h-full rounded-lg" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.status === 'pending' && <Button variant="destructive" size="icon" onClick={() => removePhoto(photo.id)}><Trash2 className="h-4 w-4" /></Button>}
                {photo.status === 'uploading' && <Loader2 className="h-6 w-6 text-white animate-spin" />}
                {photo.status === 'success' && <CheckCircle className="h-8 w-8 text-green-500 bg-white/70 rounded-full p-1" />}
                {photo.status === 'error' && <AlertTriangle className="h-8 w-8 text-red-500 bg-white/70 rounded-full p-1" />}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {pendingPhotos.length > 0 && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload {pendingPhotos.length} new photo(s)
        </Button>
      )}
    </div>
  );
};
