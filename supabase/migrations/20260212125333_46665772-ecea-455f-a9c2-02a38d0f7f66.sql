
-- 1. Fix profiles: restrict SELECT to own profile or admin
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Create public_profiles view for public data (name, avatar only)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT user_id, name, avatar
FROM public.profiles;

-- 3. Fix comments: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments"
ON public.comments FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
