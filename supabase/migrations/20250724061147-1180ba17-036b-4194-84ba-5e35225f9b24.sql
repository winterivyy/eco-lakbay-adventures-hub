-- Create ratings table for destination reviews
CREATE TABLE public.destination_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating_data JSONB NOT NULL, -- Stores all rating criteria and scores
  overall_score NUMERIC(3,2) NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(destination_id, user_id) -- One rating per user per destination
);

-- Enable RLS
ALTER TABLE public.destination_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all ratings" 
ON public.destination_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.destination_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.destination_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.destination_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_destination_ratings_updated_at
BEFORE UPDATE ON public.destination_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update destinations table with average rating calculation
CREATE OR REPLACE FUNCTION public.update_destination_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the destination's rating and review count
  UPDATE public.destinations
  SET 
    rating = (
      SELECT COALESCE(AVG(overall_score), 0)
      FROM public.destination_ratings
      WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.destination_ratings
      WHERE destination_id = COALESCE(NEW.destination_id, OLD.destination_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.destination_id, OLD.destination_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update destination ratings
CREATE TRIGGER update_destination_rating_on_insert
AFTER INSERT ON public.destination_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_destination_rating();

CREATE TRIGGER update_destination_rating_on_update
AFTER UPDATE ON public.destination_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_destination_rating();

CREATE TRIGGER update_destination_rating_on_delete
AFTER DELETE ON public.destination_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_destination_rating();