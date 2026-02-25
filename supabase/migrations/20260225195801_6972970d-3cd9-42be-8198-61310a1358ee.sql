
ALTER TABLE public.swipe_file_materials
ADD COLUMN code VARCHAR(20) UNIQUE;

CREATE INDEX idx_swipe_file_materials_code ON public.swipe_file_materials(code);
