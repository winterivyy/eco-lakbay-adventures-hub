import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the object that the parent can interact with
export interface ImageUploaderRef {
  triggerUpload: () => Promise<string[] | null>;
}

interface ImageUploaderProps {
  destinationId: string;
}

// forwardRef allows the parent to call a function inside this component
export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ destinationId }, ref) => {
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    // Expose the triggerUpload function to the parent component
    useImperativeHandle(ref, () => ({
      async triggerUpload() {
        if (stagedFiles.length === 0) {
          toast({ title: "No Photos Selected", description: "Please add at least one photo to continue.", variant: "destructive" });
          return null;
        }
        setIsUploading(true);
        try {
          const uploadPromises = stagedFiles.map(async file => {
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = `public/destinations/${destinationId}/${fileName}`;
            const { error } = await supabase.storage.from('destination-photos').upload(filePath, file);
            if (error) throw error;
            const { data } = supabase.storage.from('destination-photos').getPublicUrl(filePath);
            return data.publicUrl;
          });
          const publicUrls = await Promise.all(uploadPromises);
          toast({ title: "Upload Successful!", description: `${publicUrls.length} photos were saved.` });
          return publicUrls;
        } catch (error: any) {
          toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
          return null;
        } finally {
          setIsUploading(false);
        }
      }
    }));

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) setStagedFiles(prev => [...prev, ...Array.from(files)]);
    };

    const handleRemoveStagedFile = (indexToRemove: number) => {
      setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    return (
      <div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
          {stagedFiles.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" onUnload={() => URL.revokeObjectURL(URL.createObjectURL(file))}/>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <Button size="icon" variant="destructive" onClick={() => handleRemoveStagedFile(index)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          <Label htmlFor="image-upload-registration" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
            <span className="text-xs mt-2 text-center">Add Photos</span>
          </Label>
          <Input id="image-upload-registration" type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isUploading}/>
        </div>
      </div>
    );
  }
);
