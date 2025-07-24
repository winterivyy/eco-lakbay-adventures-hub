import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { Loader2, AlertTriangle } from 'lucide-react';

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
  post: any;
}

const postTypes = [
  { value: 'story', label: 'Travel Story', points: 15 },
  { value: 'tip', label: 'Eco Tip', points: 10 },
  { value: 'question', label: 'Question', points: 5 },
  { value: 'event', label: 'Event', points: 20 },
  { value: 'general', label: 'General', points: 5 }
];

export const EditPostModal: React.FC<EditPostModalProps> = ({ 
  open, 
  onOpenChange, 
  onPostUpdated,
  post 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { checkProfanity, hasProfanity, resetFilter } = useProfanityFilter();

  // Initialize form with post data
  useEffect(() => {
    if (post && open) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setType(post.type || '');
    }
  }, [post, open]);

  // Check for profanity whenever content or title changes
  useEffect(() => {
    const fullText = `${title} ${content}`;
    if (fullText.trim()) {
      checkProfanity(fullText);
    } else {
      resetFilter();
    }
  }, [title, content, checkProfanity, resetFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !type) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (hasProfanity) {
      toast({
        title: "Inappropriate content detected",
        description: "Please remove inappropriate language from your post.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim(),
          type,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Post updated successfully!",
        description: "Your changes have been saved.",
      });

      onOpenChange(false);
      onPostUpdated?.();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error updating post",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setType('');
    resetFilter();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
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
                    {postType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              required
            />
          </div>
          
          {hasProfanity && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Inappropriate language detected. Please keep your content respectful and family-friendly.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || hasProfanity} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};