-- Fix posts table constraint to include 'event' type
ALTER TABLE public.posts DROP CONSTRAINT valid_type;
ALTER TABLE public.posts ADD CONSTRAINT valid_type CHECK (type = ANY (ARRAY['general'::text, 'tip'::text, 'story'::text, 'question'::text, 'event'::text]));

-- Fix the relationship issue between profiles and user_roles by adding a proper foreign key
-- Note: We need to ensure the user_id in user_roles references the same user_id as in profiles
-- Since both reference auth.users, we can create a view or adjust the query in the application code
-- For now, let's ensure the user_roles table has the right structure