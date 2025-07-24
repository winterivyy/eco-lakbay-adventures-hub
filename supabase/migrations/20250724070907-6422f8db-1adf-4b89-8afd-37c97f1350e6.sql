-- Update RLS policy for posts to allow admins to delete any post
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Users can delete own posts or admins can delete any post" 
ON public.posts 
FOR DELETE 
USING (
  auth.uid() = author_id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create function to subtract points when a post is deleted
CREATE OR REPLACE FUNCTION public.subtract_post_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_subtract INTEGER;
BEGIN
  -- Calculate points to subtract based on post type
  CASE OLD.type
    WHEN 'story' THEN points_to_subtract := 15;
    WHEN 'tip' THEN points_to_subtract := 10;
    WHEN 'question' THEN points_to_subtract := 5;
    WHEN 'event' THEN points_to_subtract := 20;
    ELSE points_to_subtract := 5;
  END CASE;

  -- Bonus points for longer content (more than 100 characters)
  IF LENGTH(OLD.content) > 100 THEN
    points_to_subtract := points_to_subtract + 5;
  END IF;

  -- Update user points (subtract)
  UPDATE public.profiles
  SET points = GREATEST(0, points - points_to_subtract)
  WHERE user_id = OLD.author_id;

  RETURN OLD;
END;
$$;

-- Create trigger to subtract points when posts are deleted
CREATE TRIGGER subtract_points_on_post_deletion
  BEFORE DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.subtract_post_points();

-- Create table for destination permits/verification documents
CREATE TABLE public.destination_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID,
  user_id UUID NOT NULL,
  permit_type TEXT NOT NULL CHECK (permit_type IN ('business_permit', 'tourism_permit', 'environmental_clearance', 'fire_safety', 'health_permit', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  notes TEXT
);

-- Enable RLS on destination_permits
ALTER TABLE public.destination_permits ENABLE ROW LEVEL SECURITY;

-- Create policies for destination_permits
CREATE POLICY "Users can view their own permits" 
ON public.destination_permits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own permits" 
ON public.destination_permits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own permits" 
ON public.destination_permits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own permits" 
ON public.destination_permits 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permits" 
ON public.destination_permits 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for permits if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('permits', 'permits', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for permits
CREATE POLICY "Users can upload their own permits" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'permits' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own permits" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permits' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own permits" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'permits' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own permits" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'permits' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin policies for permit storage
CREATE POLICY "Admins can view all permits" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permits' AND 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create index for performance
CREATE INDEX idx_destination_permits_user_id ON public.destination_permits(user_id);
CREATE INDEX idx_destination_permits_destination_id ON public.destination_permits(destination_id);
CREATE INDEX idx_destination_permits_status ON public.destination_permits(verification_status);