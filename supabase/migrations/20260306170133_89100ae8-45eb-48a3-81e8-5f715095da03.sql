
-- Add 'student' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- Create student_course_access table
CREATE TABLE public.student_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID NOT NULL,
  purchase_info JSONB DEFAULT '{}'::jsonb,
  removed_at TIMESTAMP WITH TIME ZONE,
  removed_by UUID,
  UNIQUE(student_id, course_id)
);

-- Create indexes
CREATE INDEX idx_student_course_student ON public.student_course_access(student_id);
CREATE INDEX idx_student_course_active ON public.student_course_access(student_id, course_id) WHERE removed_at IS NULL;

-- Enable RLS
ALTER TABLE public.student_course_access ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can do everything with student_course_access"
ON public.student_course_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own course access"
ON public.student_course_access
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);
