
-- Tabela de diagnósticos HOF Circle
CREATE TABLE public.diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
  resultado_ia JSONB,
  resultado_final JSONB,
  mapa_prescrito_final TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_diagnosticos_user ON public.diagnosticos(user_id);
CREATE INDEX idx_diagnosticos_status ON public.diagnosticos(status);

-- Enable RLS
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own diagnostics"
  ON public.diagnosticos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostics"
  ON public.diagnosticos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all diagnostics"
  ON public.diagnosticos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update diagnostics"
  ON public.diagnosticos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_diagnosticos_updated_at
  BEFORE UPDATE ON public.diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
