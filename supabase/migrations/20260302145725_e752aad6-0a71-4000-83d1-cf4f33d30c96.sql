
-- =====================================================
-- HOF BOX: Conteúdo de módulos tipo "material"
-- =====================================================

-- Tabela de conteúdo TipTap por módulo
CREATE TABLE IF NOT EXISTS public.module_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  content JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, module_id)
);

-- Tabela de progresso interativo por usuário
CREATE TABLE IF NOT EXISTS public.module_material_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  progress_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, module_id)
);

-- RLS: module_materials
ALTER TABLE public.module_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with module_materials"
ON public.module_materials FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can read module_materials"
ON public.module_materials FOR SELECT
TO authenticated
USING (true);

-- RLS: module_material_progress
ALTER TABLE public.module_material_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
ON public.module_material_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all progress"
ON public.module_material_progress FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_module_materials_updated_at
BEFORE UPDATE ON public.module_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_material_progress_updated_at
BEFORE UPDATE ON public.module_material_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_module_materials_course_module 
  ON public.module_materials(course_id, module_id);

CREATE INDEX IF NOT EXISTS idx_module_material_progress_user 
  ON public.module_material_progress(user_id, course_id);
