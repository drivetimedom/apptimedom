
CREATE TABLE public.swipe_file_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.swipe_file_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own requests"
  ON public.swipe_file_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests"
  ON public.swipe_file_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON public.swipe_file_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
