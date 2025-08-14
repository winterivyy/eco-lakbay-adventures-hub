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

export const ImageUploader: React.FC<ImageUploaderProps> = ({ destinationId, onUploadComplete }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const uploadPromises = Array.from(files).map(async file => {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `public/destinations/${destinationId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
    });

    try {
      const newImageUrls = await Promise.all(uploadPromises);
      const allImages = [...images, ...newImageUrls];
      setImages(allImages);
      onUploadComplete(allImages); // Pass all images to the parent
      toast({ title: "Success!", description: "Images uploaded. Proceed to the next step." });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    // For a new registration, we only need to remove from state. The URL is not saved in DB yet.
    const newImages = images.filter(img => img !== imageUrl);
    setImages(newImages);
    onUploadComplete(newImages);
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-2 p-4 border rounded-lg">
        {images.map(url => (
          <div key={url} className="relative group aspect-square">
            <img src={url} alt="Destination photo" className="w-full h-full object-cover rounded-md" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" variant="destructive" onClick={() => handleImageDelete(url)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Label htmlFor="image-upload-registration" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
          <span className="text-xs mt-2 text-center text-muted-foreground">Add Photos</span>
        </Label>
        <Input id="image-upload-registration" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
      </div>
      <p className="text-sm text-muted-foreground mt-2">Upload at least one photo to represent your destination.</p>
    </div>
  );
};
