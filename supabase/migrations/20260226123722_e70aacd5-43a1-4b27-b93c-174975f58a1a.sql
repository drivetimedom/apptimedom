
-- Tabela de aulas extras prescritas
CREATE TABLE public.lesson_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  prescribed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_prescriptions_user ON public.lesson_prescriptions(user_id);
CREATE INDEX idx_prescriptions_lesson ON public.lesson_prescriptions(lesson_id);

-- Enable RLS
ALTER TABLE public.lesson_prescriptions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all prescriptions
CREATE POLICY "Admins can insert prescriptions"
ON public.lesson_prescriptions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete prescriptions"
ON public.lesson_prescriptions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all prescriptions"
ON public.lesson_prescriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own prescriptions
CREATE POLICY "Users can view own prescriptions"
ON public.lesson_prescriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Tabela de gravações de reuniões
CREATE TABLE public.meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  vimeo_id TEXT NOT NULL,
  duration_minutes INTEGER,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_recordings_user ON public.meeting_recordings(user_id);
CREATE INDEX idx_recordings_date ON public.meeting_recordings(meeting_date DESC);

-- Enable RLS
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all recordings
CREATE POLICY "Admins can insert recordings"
ON public.meeting_recordings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update recordings"
ON public.meeting_recordings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recordings"
ON public.meeting_recordings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all recordings"
ON public.meeting_recordings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own recordings
CREATE POLICY "Users can view own recordings"
ON public.meeting_recordings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
