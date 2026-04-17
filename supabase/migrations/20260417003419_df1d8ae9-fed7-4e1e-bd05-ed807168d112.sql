-- Create ai_tools table
CREATE TABLE public.ai_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  tag TEXT,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tools"
  ON public.ai_tools FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tools"
  ON public.ai_tools FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tools"
  ON public.ai_tools FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tools"
  ON public.ai_tools FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON public.ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial tool
INSERT INTO public.ai_tools (name, description, link, tag, icon, order_index)
VALUES (
  'Planejadora de Campanha',
  'Monte sua campanha de paciente modelo com orientação passo a passo',
  'https://planejador.timedom.com.br',
  'Campanha Paciente Modelo',
  'Megaphone',
  0
);