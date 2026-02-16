import React, { useEffect } from 'react';
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

// Components
import IndividualPanel from '@/components/hoff-circle/IndividualPanel';
import ActionPlan from '@/components/hoff-circle/ActionPlan';
import ActivationPlan from '@/components/hoff-circle/ActivationPlan';
import CommercialTrackingTable from '@/components/hoff-circle/CommercialTrackingTable';
import TrafficTrackingTable from '@/components/hoff-circle/TrafficTrackingTable';
import MonthlyMetrics from '@/components/hoff-circle/MonthlyMetrics';
import LibrarySection from '@/components/hoff-circle/LibrarySection';

const HoffCirclePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  // Refresh profile on mount to get latest prescription data
  useEffect(() => {
    refreshProfile();
  }, []);

  const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const allCourses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);

  // Find Hoff Circle category
  const hoffCircle = categories.find(c => c.slug === 'hof-circle' || c.slug === 'hoff-circle');

  if (!hoffCircle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">HOF CIRCLE</h1>
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

  const pageConfig = hoffCircle.pageConfig;

  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section 
        className="relative h-[350px] md:h-[400px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(/images/banner-secoes.png)`
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {pageConfig?.bannerTitle || hoffCircle.name}
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          {pageConfig?.bannerSubtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
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

      {/* Main Content - Two Column Layout */}
      <div className="container py-8" id="main-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT SIDE - Individual Panel, Action Plan, Activation Plan */}
          <div className="space-y-6">
            {/* Individual Panel */}
            <IndividualPanel />

            {/* Action Plan (MAPA 10K) */}
            <ActionPlan />

            {/* Activation Plan (Checklist) */}
            <ActivationPlan />
          </div>

          {/* RIGHT SIDE - Commercial Tracking, Traffic Tracking & Metrics */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* Commercial Tracking Table */}
            <CommercialTrackingTable />

            {/* Traffic Tracking Table */}
            <TrafficTrackingTable />

            {/* Monthly Metrics */}
            <MonthlyMetrics />
          </div>
        </div>

        {/* LIBRARY SECTION - Full Width */}
        <LibrarySection categoryId={hoffCircle.id} />

        {/* About Section */}
        {pageConfig?.aboutText && (
          <section className="mt-8 bg-card border border-border rounded-xl p-8">
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
