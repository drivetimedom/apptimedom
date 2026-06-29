
-- 1. Tighten onboarding_submissions: drop permissive policies, replace with admin-only
DROP POLICY IF EXISTS authenticated_select_onboarding ON public.onboarding_submissions;
DROP POLICY IF EXISTS authenticated_update_onboarding ON public.onboarding_submissions;

CREATE POLICY "Admins can read onboarding submissions"
  ON public.onboarding_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update onboarding submissions"
  ON public.onboarding_submissions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Lock down generated-contracts bucket: drop public read, allow only admins
DROP POLICY IF EXISTS "Public can read contracts" ON storage.objects;

CREATE POLICY "Admins can read contracts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'generated-contracts' AND public.has_role(auth.uid(), 'admin'));
