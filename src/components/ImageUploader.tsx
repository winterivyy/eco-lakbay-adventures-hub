import { useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the functions we expose to the parent component
export interface ImageUploaderRef {
  triggerUpload: () => Promise<string[] | null>; // Returns an array of simple file paths, or null on failure
}

interface ImageUploaderProps {
  destinationId: string;
}

const BUCKET_NAME = 'destination-photos'; // Ensure this matches your Supabase bucket

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ destinationId }, ref) => {
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Expose the triggerUpload function to the parent component (e.g., DestinationRegistration)
    useImperativeHandle(ref, () => ({
      async triggerUpload() {
        if (stagedFiles.length === 0) {
          // It's not an error to have no new photos, just return an empty array.
          // The parent can decide if photos are required.
          return [];
        }

        setIsUploading(true);
        try {
          const uploadPromises = stagedFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            
            // --- THIS IS THE DEFINITIVE FIX ---
            // The file path is now simple and relative to the bucket root.
            const filePath = `destinations/${destinationId}/${fileName}`;
            
            const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
            if (error) {
              // Throw the error to be caught by Promise.all
              throw error;
            }
            // Return the simple, relative path to be stored in the database.
            return filePath;
          });
          
          const filePaths = await Promise.all(uploadPromises);
          toast({ title: "Upload Successful!", description: `${filePaths.length} photos were saved.` });
          return filePaths;

        } catch (error: any) {
          console.error("Upload failed:", error);
          toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
          return null; // Return null to indicate that the overall operation failed.
        } finally {
          setIsUploading(false);
        }
      }
    }));

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setStagedFiles(prev => [...prev, ...Array.from(event.target.files!)]);
      }
    };

    const handleRemoveStagedFile = (indexToRemove: number) => {
      setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    return (
      <div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
          {stagedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group aspect-square">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button size="icon" variant="destructive" onClick={() => handleRemoveStagedFile(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Label htmlFor="image-upload-registration" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
            <span className="text-xs mt-2 text-center text-muted-foreground">Add Photos</span>
          </Label>
          <Input id="image-upload-registration" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isUploading}/>
        </div>
      </div>
    );
  }
);
