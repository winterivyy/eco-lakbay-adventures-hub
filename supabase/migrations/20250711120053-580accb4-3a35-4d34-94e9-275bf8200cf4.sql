-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Add points column to profiles table
ALTER TABLE public.profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Create function to award points for posts
CREATE OR REPLACE FUNCTION public.award_post_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  -- Award points based on post type
  CASE NEW.type
    WHEN 'story' THEN points_to_award := 15;
    WHEN 'tip' THEN points_to_award := 10;
    WHEN 'question' THEN points_to_award := 5;
    WHEN 'event' THEN points_to_award := 20;
    ELSE points_to_award := 5;
  END CASE;

  -- Bonus points for longer content (more than 100 characters)
  IF LENGTH(NEW.content) > 100 THEN
    points_to_award := points_to_award + 5;
  END IF;

  -- Update user points
  UPDATE public.profiles
  SET points = points + points_to_award
  WHERE user_id = NEW.author_id;

  RETURN NEW;
END;
$$;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to award points when posts are created
CREATE TRIGGER award_points_on_post_creation
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.award_post_points();

-- Insert default admin role for the first user (you can modify the email)
-- This will be for the user with email 'johnleomedina@gmail.com' based on the auth logs
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'johnleomedina@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;