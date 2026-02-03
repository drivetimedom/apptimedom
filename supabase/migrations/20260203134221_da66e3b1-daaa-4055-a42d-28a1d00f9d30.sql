-- Create home_blocks table for the Home Builder
CREATE TABLE public.home_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'banner', 'courses', 'text', 'button', 'video', 'divider'
  order_index INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for ordering
CREATE INDEX idx_home_blocks_order ON public.home_blocks(order_index);

-- Enable RLS
ALTER TABLE public.home_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view blocks (public home page)
CREATE POLICY "Anyone can view home blocks"
ON public.home_blocks
FOR SELECT
USING (true);

-- Only admins can insert blocks
CREATE POLICY "Admins can insert home blocks"
ON public.home_blocks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update blocks
CREATE POLICY "Admins can update home blocks"
ON public.home_blocks
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete blocks
CREATE POLICY "Admins can delete home blocks"
ON public.home_blocks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_home_blocks_updated_at
  BEFORE UPDATE ON public.home_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();