import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Category, 
  Course, 
  STORAGE_KEYS, 
  getFromStorage 
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  ChevronRight, 
  Home,
  ArrowDown
} from 'lucide-react';
import ProgressRoadmap from '@/components/hoff-circle/ProgressRoadmap';
import SubcategorySection from '@/components/hoff-circle/SubcategorySection';

const HoffCirclePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const allCourses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);

  // Find Hoff Circle category
  const hoffCircle = categories.find(c => c.slug === 'hoff-circle');

  if (!hoffCircle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Hoff Circle</h1>
          <p className="text-muted-foreground mb-4">Categoria não encontrada.</p>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  // Get courses for this category
  const categoryCourses = allCourses.filter(
    course => course.categoryIds?.includes(hoffCircle.id) && course.status === 'published'
  );

  // Group courses by subcategory
  const subcategories = hoffCircle.subcategories || [];
  const coursesBySubcategory = subcategories.map(sub => ({
    subcategory: sub,
    courses: categoryCourses
      .filter(c => c.subcategoryId === sub.id)
      .sort((a, b) => (a.sequenceConfig?.position || 0) - (b.sequenceConfig?.position || 0))
  }));

  // Find the subcategory that shows roadmap (trilhas)
  const roadmapSubcategory = subcategories.find(s => s.showRoadmap);
  const roadmapCourses = roadmapSubcategory 
    ? categoryCourses.filter(c => c.subcategoryId === roadmapSubcategory.id)
    : [];

  const pageConfig = hoffCircle.pageConfig;

  const scrollToContent = () => {
    document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section 
        className="relative h-[400px] md:h-[500px] w-full bg-cover bg-center"
        style={{
          backgroundImage: pageConfig?.bannerImageUrl 
            ? `url(${pageConfig.bannerImageUrl})`
            : 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        
        {/* Content */}
        <div className="relative z-10 container h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{hoffCircle.name}</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {pageConfig?.bannerTitle || hoffCircle.name}
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          {pageConfig?.bannerSubtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mb-8">
              {pageConfig.bannerSubtitle}
            </p>
          )}

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              onClick={scrollToContent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {pageConfig?.bannerCtaText || 'Começar Jornada'}
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {categoryCourses.length} cursos disponíveis
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12" id="roadmap-section">
        {/* Roadmap Section */}
        {roadmapSubcategory && roadmapCourses.length > 0 && (
          <ProgressRoadmap 
            courses={roadmapCourses} 
            categoryId={hoffCircle.id} 
          />
        )}

        {/* Subcategory Sections */}
        {coursesBySubcategory.map(({ subcategory, courses }) => (
          <SubcategorySection
            key={subcategory.id}
            subcategory={subcategory}
            courses={courses}
            showRoadmap={subcategory.showRoadmap}
          />
        ))}

        {/* About Section */}
        {pageConfig?.aboutText && (
          <section className="mt-16 bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Sobre o Programa</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {pageConfig.aboutText}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default HoffCirclePage;
