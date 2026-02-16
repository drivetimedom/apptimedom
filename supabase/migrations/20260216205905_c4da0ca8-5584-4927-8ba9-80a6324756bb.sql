
-- Add support material fields to hof_maps and hof_challenges
ALTER TABLE public.hof_maps ADD COLUMN support_material_url TEXT DEFAULT NULL;
ALTER TABLE public.hof_maps ADD COLUMN support_material_title TEXT DEFAULT NULL;

ALTER TABLE public.hof_challenges ADD COLUMN support_material_url TEXT DEFAULT NULL;
ALTER TABLE public.hof_challenges ADD COLUMN support_material_title TEXT DEFAULT NULL;
