import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Loader2, AlertTriangle } from 'lucide-react';

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

// --- THIS IS THE FIX ---
// We are using "export const" to create a named export that matches your import statement.
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
  const { hasProfanity, checkProfanity } = useProfanityFilter();

  useEffect(() => {
    checkProfanity(`${title} ${content}`);
  }, [title, content, checkProfanity]);

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

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          type,
          author_id: user.id
        });

      if (error) throw error;
      
      toast({ title: "Post created successfully!", description: `Your story has been shared with the community.` });

      setTitle('');
      setContent('');
      setType('');
      onOpenChange(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Error creating post", description: "Something went wrong. Please try again.", variant: "destructive" });
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

// Ensure there is NO "export default CreatePostModal;" at the end of the file.
