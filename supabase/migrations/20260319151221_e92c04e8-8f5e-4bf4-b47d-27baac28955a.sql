
-- Tabela de parcerias/sociedades
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL,
  partner_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(primary_user_id, partner_user_id)
);

-- Índices
CREATE INDEX idx_partnerships_primary ON public.partnerships(primary_user_id);
CREATE INDEX idx_partnerships_partner ON public.partnerships(partner_user_id);

-- RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem ver tudo
CREATE POLICY "Admins can view partnerships"
  ON public.partnerships FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins podem inserir
CREATE POLICY "Admins can create partnerships"
  ON public.partnerships FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins podem deletar
CREATE POLICY "Admins can delete partnerships"
  ON public.partnerships FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver suas próprias parcerias
CREATE POLICY "Users can view own partnerships"
  ON public.partnerships FOR SELECT
  TO authenticated
  USING (auth.uid() = primary_user_id OR auth.uid() = partner_user_id);

-- Função helper para pegar todos IDs de uma sociedade
CREATE OR REPLACE FUNCTION public.get_partnership_ids(user_uuid UUID)
RETURNS UUID[] AS $$
DECLARE
  result UUID[];
BEGIN
  result := ARRAY[user_uuid];
  
  result := result || ARRAY(
    SELECT partner_user_id FROM public.partnerships WHERE primary_user_id = user_uuid
  );
  
  result := result || ARRAY(
    SELECT primary_user_id FROM public.partnerships WHERE partner_user_id = user_uuid
  );
  
  result := result || ARRAY(
    SELECT partner_user_id
    FROM public.partnerships
    WHERE primary_user_id IN (
      SELECT primary_user_id FROM public.partnerships WHERE partner_user_id = user_uuid
    )
    AND partner_user_id != user_uuid
  );
  
  result := ARRAY(SELECT DISTINCT unnest(result));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
