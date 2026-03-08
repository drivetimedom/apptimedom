
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  location TEXT,
  meeting_link TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_type TEXT, -- 'weekly', 'biweekly', 'monthly'
  recurrence_day INTEGER, -- 0-6 for day of week
  recurrence_end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active events"
  ON public.calendar_events FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update events"
  ON public.calendar_events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.calendar_events FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
