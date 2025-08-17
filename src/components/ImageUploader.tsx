import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  destinationId: string;
  onUploadComplete: (imageUrls: string[]) => void;
}

// --- DEFINE YOUR ACTUAL BUCKET NAME HERE ---
const BUCKET_NAME = 'destination-photos'; // IMPORTANT: Change this if your bucket has a different name!

export const ImageUploader: React.FC<ImageUploaderProps> = ({ destinationId, onUploadComplete }) => {
  const [stagedLocalUrls, setStagedLocalUrls] = useState<string[]>([]); // URLs for previewing
  const [stagedFiles, setStagedFiles] = useState<File[]>([]); // The actual files to be uploaded
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setStagedFiles(prev => [...prev, ...newFiles]);

      const newLocalUrls = newFiles.map(file => URL.createObjectURL(file));
      setStagedLocalUrls(prev => [...prev, ...newLocalUrls]);
    }
  };

  const handleRemoveStagedFile = (indexToRemove: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(stagedLocalUrls[indexToRemove]);
    
    setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setStagedLocalUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleUploadAndProceed = async () => {
    if (stagedFiles.length === 0) {
      toast({ title: "No Photos Selected", description: "Please select at least one photo to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = stagedFiles.map(async file => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = `public/${destinationId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);
      
      onUploadComplete(publicUrls); // Signal parent component with the final Supabase URLs

    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
        {/* Map over the LOCAL preview URLs */}
        {stagedLocalUrls.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img src={url} alt={`Staged photo ${index + 1}`} className="w-full h-full object-cover rounded-md" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" variant="destructive" onClick={() => handleRemoveStagedFile(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Label htmlFor="image-upload-registration" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs mt-2 text-center">Add Photos</span>
        </Label>
        <Input id="image-upload-registration" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
      
      {/* This component no longer needs its own "Submit" button, as the parent page controls the flow. */}
      {/* The onUploadComplete callback is used by the parent's "Next" button. */}
      
      <p className="text-sm text-muted-foreground mt-2">
        You've selected {stagedFiles.length} photo(s). Click "Save & Continue" on the main page when ready.
      </p>
    </div>
  );
};
