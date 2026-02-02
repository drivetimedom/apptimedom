-- Create courses table
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail TEXT,
    instructor_id TEXT,
    category TEXT,
    category_ids TEXT[] DEFAULT '{}',
    subcategory_id TEXT,
    level TEXT NOT NULL DEFAULT 'Iniciante',
    status TEXT NOT NULL DEFAULT 'draft',
    locked BOOLEAN NOT NULL DEFAULT false,
    total_duration TEXT,
    modules JSONB NOT NULL DEFAULT '[]',
    is_new BOOLEAN DEFAULT false,
    sequence_config JSONB,
    roadmap_config JSONB,
    course_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📚',
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    has_dedicated_page BOOLEAN DEFAULT false,
    show_in_main_menu BOOLEAN DEFAULT true,
    page_config JSONB,
    subcategories JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    vimeo_id TEXT,
    duration TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    locked BOOLEAN NOT NULL DEFAULT false,
    resources JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banners table
CREATE TABLE public.banners (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    link_type TEXT NOT NULL DEFAULT 'course',
    link_to TEXT,
    cta_text TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress table
CREATE TABLE public.user_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_lessons TEXT[] DEFAULT '{}',
    current_lesson TEXT,
    progress INTEGER NOT NULL DEFAULT 0,
    liked TEXT[] DEFAULT '{}',
    disliked TEXT[] DEFAULT '{}',
    favorites TEXT[] DEFAULT '{}',
    category_progress JSONB,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_access_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    text TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Admins can insert courses" ON public.courses
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update courses" ON public.courses
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete courses" ON public.courses
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Lessons policies
CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert lessons" ON public.lessons
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lessons" ON public.lessons
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lessons" ON public.lessons
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Banners policies
CREATE POLICY "Anyone can view active banners" ON public.banners
    FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert banners" ON public.banners
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banners" ON public.banners
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners" ON public.banners
    FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- User progress policies
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or admins" ON public.comments
    FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_comments_lesson_id ON public.comments(lesson_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_banners_order ON public.banners("order");

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();