
-- Tabela de submissões de onboarding
CREATE TABLE public.onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- DADOS PESSOAIS
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  rg VARCHAR(20) NOT NULL,
  birth_date DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- ENDEREÇO PESSOAL
  address_street VARCHAR(255) NOT NULL,
  address_number VARCHAR(10) NOT NULL,
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
  address_zip VARCHAR(9) NOT NULL,
  
  -- DADOS CLÍNICA
  clinic_name VARCHAR(255) NOT NULL,
  clinic_legal_name VARCHAR(255) NOT NULL,
  clinic_cnpj VARCHAR(18) NOT NULL,
  clinic_address_street VARCHAR(255) NOT NULL,
  clinic_address_number VARCHAR(10) NOT NULL,
  clinic_address_complement VARCHAR(100),
  clinic_address_neighborhood VARCHAR(100) NOT NULL,
  clinic_address_city VARCHAR(100) NOT NULL,
  clinic_address_state VARCHAR(2) NOT NULL,
  clinic_address_zip VARCHAR(9) NOT NULL,
  technical_responsible VARCHAR(255) NOT NULL,
  
  -- DIAGNÓSTICO
  revenue_avg_3months DECIMAL(10,2) NOT NULL,
  avg_ticket DECIMAL(10,2) NOT NULL,
  peak_revenue DECIMAL(10,2) NOT NULL,
  team_size VARCHAR(50) NOT NULL,
  has_positioning VARCHAR(50) NOT NULL,
  patient_source VARCHAR(100) NOT NULL,
  main_difficulty VARCHAR(100) NOT NULL,
  commercial_mastery VARCHAR(50) NOT NULL,
  target_revenue_6months DECIMAL(10,2) NOT NULL,
  general_notes TEXT,
  
  -- TERMOS
  accepted_terms BOOLEAN DEFAULT false NOT NULL,
  accepted_data_usage BOOLEAN DEFAULT false NOT NULL,
  declared_truthfulness BOOLEAN DEFAULT false NOT NULL,
  
  -- STATUS E CONTROLE
  status VARCHAR(30) DEFAULT 'pending' NOT NULL,
  
  -- CONTRATO
  contract_duration VARCHAR(20),
  payment_method TEXT,
  contract_docx_url TEXT,
  contract_generated_at TIMESTAMPTZ,
  contract_generated_by UUID,
  
  -- ACESSO
  access_created_at TIMESTAMPTZ,
  access_created_by UUID,
  user_id UUID,
  
  -- TIMESTAMPS
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_onboarding_email ON public.onboarding_submissions(email);
CREATE INDEX idx_onboarding_status ON public.onboarding_submissions(status);
CREATE INDEX idx_onboarding_submitted ON public.onboarding_submissions(submitted_at DESC);

-- RLS
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all submissions"
  ON public.onboarding_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
  ON public.onboarding_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit onboarding"
  ON public.onboarding_submissions FOR INSERT
  WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER onboarding_submissions_updated_at
  BEFORE UPDATE ON public.onboarding_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de links de onboarding
CREATE TABLE public.onboarding_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  submission_id UUID REFERENCES public.onboarding_submissions(id)
);

CREATE INDEX idx_onboarding_links_code ON public.onboarding_links(code);

ALTER TABLE public.onboarding_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage links"
  ON public.onboarding_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active links"
  ON public.onboarding_links FOR SELECT
  USING (is_active = true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-templates', 'contract-templates', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-contracts', 'generated-contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-templates'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can read templates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-templates'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-contracts'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public can read contracts"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-contracts');
