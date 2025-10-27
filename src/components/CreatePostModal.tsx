import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { Loader2, AlertTriangle, ImagePlus, X } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const postTypes = [
  { value: 'story', label: 'Travel Story', points: 15 },
  { value: 'tip', label: 'Eco Tip', points: 10 },
  { value: 'question', label: 'Question', points: 5 },
  { value: 'event', label: 'Event', points: 20 },
  { value: 'general', label: 'General', points: 5 }
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  open, 
  onOpenChange, 
  onPostCreated 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasProfanity, checkProfanity, resetFilter } = useProfanityFilter();
    // NEW: State for image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fullText = `${title} ${content}`;
    if (fullText.trim()) {
      checkProfanity(fullText);
    } else {
      resetFilter();
    }
  }, [title, content, checkProfanity, resetFilter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file type", description: "Please select an image.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File is too large", description: "Maximum image size is 5MB.", variant: "destructive" });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // NEW: Function to remove the selected image
  const removeImage = () => {
    setImageFile(null);
    if(imagePreview) {
        URL.revokeObjectURL(imagePreview); // Clean up the object URL
    }
    setImagePreview(null);
  };
   const clearForm = () => {
    setTitle('');
    setContent('');
    setType('');
    removeImage();
    resetFilter();
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }
    if (!title.trim() || !content.trim() || !type) {
      toast({ title: "Missing information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (hasProfanity) {
      toast({ title: "Inappropriate content detected", description: "Please remove inappropriate language.", variant: "destructive" });
      return;
    }

    if (hasProfanity) {
      // ... your existing code
      return;
    }

    // --- ADD THIS LINE RIGHT HERE ---
    console.log('Value being sent to Supabase for "type":', type);

    setLoading(true);
    let imageUrl: string | null = null;
    setLoading(true);
    let imageUrl: string | null = null;

    try {
      // 1. Upload image if one is selected (Your existing logic is perfect)
      if (imageFile) {
        const filePath = `public/${user.id}-${Date.now()}-${imageFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(data.path);
        
        imageUrl = publicUrl;
      }

      // 2. Insert post data into the database. 
      //    The database TRIGGER will automatically handle the points from here.
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          type,
          author_id: user.id,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;
      
      // --- NEW SIMPLIFIED SUCCESS LOGIC ---
      // 3. (Optional but recommended) Calculate points locally just for the success message.
      //    This logic mirrors your database trigger.
      const selectedPostType = postTypes.find(pt => pt.value === type);
      let pointsEarned = selectedPostType ? selectedPostType.points : 5; // Default to 5
      if (content.trim().length > 100) {
        pointsEarned += 5;
      }
      
      toast({ 
        title: "Post created successfully!", 
        description: `You earned ${pointsEarned} points! Your story has been shared.` 
      });

      clearForm();
      onOpenChange(false);
      onPostCreated?.();

    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Post Type</Label>
            <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map((postType) => (
                        <SelectItem key={postType.value} value={postType.value}>
                          {postType.label} (+{postType.points} points)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title" required />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts..." rows={6} required />
            <p className="text-sm text-muted-foreground mt-1">
              {content.length > 100 ? '+5 bonus points for detailed content!' : 
               `${101 - content.length} more characters for bonus points`}
            </p>
          </div>
           <div>
            <Label htmlFor="image-upload">Attach an Image (Optional)</Label>
            {imagePreview ? (
              <div className="mt-2 relative">
                <img src={imagePreview} alt="Selected preview" className="w-full h-auto max-h-60 object-contain rounded-md border" />
                <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={removeImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label htmlFor="image-upload" className="mt-2 flex justify-center items-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
                <Input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" />
              </label>
            )}
          </div>
          {hasProfanity && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Inappropriate language detected. Please keep your content respectful.</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
