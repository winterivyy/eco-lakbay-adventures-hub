-- Fix security issues by adding proper search_path to the new function
CREATE OR REPLACE FUNCTION public.subtract_post_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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