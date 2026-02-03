-- =====================================================
-- 1. HOF MAPS (Playlists de vídeos - MAPA 10K, 30K, etc)
-- =====================================================
CREATE TABLE public.hof_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT '🗺️',
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hof_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view maps" ON public.hof_maps
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert maps" ON public.hof_maps
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update maps" ON public.hof_maps
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete maps" ON public.hof_maps
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hof_maps_updated_at
    BEFORE UPDATE ON public.hof_maps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. HOF CHALLENGES (Playlists curtas de desafios)
-- =====================================================
CREATE TABLE public.hof_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT '🎯',
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hof_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON public.hof_challenges
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert challenges" ON public.hof_challenges
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update challenges" ON public.hof_challenges
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete challenges" ON public.hof_challenges
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hof_challenges_updated_at
    BEFORE UPDATE ON public.hof_challenges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 3. ACTIVATION PLAN TEMPLATES (Templates de planos)
-- =====================================================
CREATE TABLE public.activation_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activation_plan_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" ON public.activation_plan_templates
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert templates" ON public.activation_plan_templates
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update templates" ON public.activation_plan_templates
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete templates" ON public.activation_plan_templates
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_activation_plan_templates_updated_at
    BEFORE UPDATE ON public.activation_plan_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. CUSTOMIZATION SETTINGS (Personalização - singleton)
-- =====================================================
CREATE TABLE public.customization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.customization_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert settings" ON public.customization_settings
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings" ON public.customization_settings
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_customization_settings_updated_at
    BEFORE UPDATE ON public.customization_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default empty settings row
INSERT INTO public.customization_settings (settings) VALUES ('{}');