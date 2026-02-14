
-- Add relationship columns to swipe_file_materials
ALTER TABLE public.swipe_file_materials ADD COLUMN parent_folder_ids UUID[] DEFAULT '{}';
ALTER TABLE public.swipe_file_materials ADD COLUMN featured_folder_ids UUID[] DEFAULT '{}';
ALTER TABLE public.swipe_file_materials ADD COLUMN related_process_ids UUID[] DEFAULT '{}';
ALTER TABLE public.swipe_file_materials ADD COLUMN featured_process_ids UUID[] DEFAULT '{}';

-- Indexes for performance
CREATE INDEX idx_swipe_materials_parent_folders ON public.swipe_file_materials USING GIN(parent_folder_ids);
CREATE INDEX idx_swipe_materials_featured_folders ON public.swipe_file_materials USING GIN(featured_folder_ids);
CREATE INDEX idx_swipe_materials_related ON public.swipe_file_materials USING GIN(related_process_ids);
CREATE INDEX idx_swipe_materials_featured ON public.swipe_file_materials USING GIN(featured_process_ids);
