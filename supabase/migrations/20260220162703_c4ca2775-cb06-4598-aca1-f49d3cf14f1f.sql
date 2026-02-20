
-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to branding assets
CREATE POLICY "Public read branding assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding-assets');

-- Allow admin users to upload branding assets
CREATE POLICY "Admins can upload branding assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'branding-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to update branding assets
CREATE POLICY "Admins can update branding assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'branding-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to delete branding assets
CREATE POLICY "Admins can delete branding assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'branding-assets'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
