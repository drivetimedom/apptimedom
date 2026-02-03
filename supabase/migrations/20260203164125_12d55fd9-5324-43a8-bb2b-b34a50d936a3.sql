-- =============================================
-- 1. COMMERCIAL TRACKING TABLE
-- Stores weekly sales/performance data per user
-- =============================================
CREATE TABLE public.commercial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  leads INTEGER NOT NULL DEFAULT 0,
  appointments INTEGER NOT NULL DEFAULT 0,
  attendance INTEGER NOT NULL DEFAULT 0,
  deals INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.commercial_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own tracking data
CREATE POLICY "Users can view their own tracking"
ON public.commercial_tracking FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own tracking data
CREATE POLICY "Users can insert their own tracking"
ON public.commercial_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracking data
CREATE POLICY "Users can update their own tracking"
ON public.commercial_tracking FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tracking data
CREATE POLICY "Users can delete their own tracking"
ON public.commercial_tracking FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all tracking data (for dashboard)
CREATE POLICY "Admins can view all tracking"
ON public.commercial_tracking FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_commercial_tracking_updated_at
BEFORE UPDATE ON public.commercial_tracking
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. FINANCIAL DATA TABLE
-- Stores calculator data per user (JSONB for flexibility)
-- =============================================
CREATE TABLE public.financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own financial data
CREATE POLICY "Users can view their own financial data"
ON public.financial_data FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own financial data
CREATE POLICY "Users can insert their own financial data"
ON public.financial_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own financial data
CREATE POLICY "Users can update their own financial data"
ON public.financial_data FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_financial_data_updated_at
BEFORE UPDATE ON public.financial_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();