-- Create swipe file types table
CREATE TABLE public.swipe_file_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📄',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swipe file categories table
CREATE TABLE public.swipe_file_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📁',
    color TEXT NOT NULL DEFAULT '#6b7280',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swipe file materials (processes) table
CREATE TABLE public.swipe_file_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type_id UUID REFERENCES public.swipe_file_types(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.swipe_file_categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    content TEXT,
    links JSONB DEFAULT '[]',
    pdfs JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user favorites table for swipe file
CREATE TABLE public.swipe_file_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.swipe_file_materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, material_id)
);

-- Enable RLS on all tables
ALTER TABLE public.swipe_file_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_file_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_file_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_file_favorites ENABLE ROW LEVEL SECURITY;

-- RLS for swipe_file_types: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view types" ON public.swipe_file_types
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert types" ON public.swipe_file_types
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update types" ON public.swipe_file_types
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete types" ON public.swipe_file_types
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for swipe_file_categories: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view categories" ON public.swipe_file_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.swipe_file_categories
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" ON public.swipe_file_categories
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" ON public.swipe_file_categories
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for swipe_file_materials: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view materials" ON public.swipe_file_materials
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert materials" ON public.swipe_file_materials
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update materials" ON public.swipe_file_materials
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete materials" ON public.swipe_file_materials
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for swipe_file_favorites: Users manage their own favorites
CREATE POLICY "Users can view their favorites" ON public.swipe_file_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.swipe_file_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON public.swipe_file_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_swipe_file_materials_updated_at
    BEFORE UPDATE ON public.swipe_file_materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default types
INSERT INTO public.swipe_file_types (name, icon, color) VALUES
    ('Processo', '📄', '#3b82f6'),
    ('Criativo', '🎨', '#ec4899'),
    ('Script', '📝', '#8b5cf6'),
    ('Checklist', '✅', '#10b981');

-- Insert default categories
INSERT INTO public.swipe_file_categories (name, icon, color) VALUES
    ('Demanda', '🎯', '#ef4444'),
    ('Oferta', '💎', '#3b82f6'),
    ('Vendas', '💰', '#facc15'),
    ('Operações', '⚙️', '#6b7280');