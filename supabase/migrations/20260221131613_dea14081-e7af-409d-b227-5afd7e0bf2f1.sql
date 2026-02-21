
CREATE TABLE public.map_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  map_id UUID NOT NULL REFERENCES public.hof_maps(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  watched_videos TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, map_id)
);

ALTER TABLE public.map_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own map progress" ON public.map_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own map progress" ON public.map_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own map progress" ON public.map_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all map progress" ON public.map_progress FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_map_progress_updated_at BEFORE UPDATE ON public.map_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
