import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { getCustomization } from '@/lib/customization';
import CourseCard from '@/components/courses/CourseCard';
import { BookOpen, Clock, Trophy, Filter, Home, ChevronRight, GraduationCap, ArrowDown, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isInstructor } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const customization = getCustomization();

  // Fetch data from database
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: userProgressList = [], isLoading: progressLoading } = useUserProgress();

  const isLoading = coursesLoading || progressLoading;

  const publishedCourses = useMemo(() => 
    courses.filter(c => c.status === 'published'), 
    [courses]
  );

  const isCourseUnlocked = (course: any) => {
    if (isAdmin || isInstructor) return true;
    if (!course.locked) return true;
    return profile?.unlocked_courses?.includes(course.id) || false;
  };

  const unlockedCourses = publishedCourses.filter(c => isCourseUnlocked(c));

  const inProgressCourses = unlockedCourses.filter(c => {
    const progress = userProgressList.find(p => p.courseId === c.id);
    if (!progress) return false;
    const totalLessons = c.modules.reduce((acc, m) => acc + m.lessonIds.length, 0);
    return progress.completedLessons.length > 0 && progress.completedLessons.length < totalLessons;
  });

  const completedCourses = unlockedCourses.filter(c => {
    const progress = userProgressList.find(p => p.courseId === c.id);
    if (!progress) return false;
    const totalLessons = c.modules.reduce((acc, m) => acc + m.lessonIds.length, 0);
    return progress.completedLessons.length === totalLessons && totalLessons > 0;
  });

  const favoriteCourses = unlockedCourses.filter(c => {
    const progress = userProgressList.find(p => p.courseId === c.id);
    return progress?.favorites && progress.favorites.length > 0;
  });

  const getProgress = (courseId: string) => 
    userProgressList.find(p => p.courseId === courseId);

  const getFilteredCourses = () => {
    switch (activeTab) {
      case 'in-progress':
        return inProgressCourses;
      case 'completed':
        return completedCourses;
      case 'favorites':
        return favoriteCourses;
      default:
        return unlockedCourses;
    }
  };

  const filteredCourses = getFilteredCourses();

  // Stats
  const totalHours = unlockedCourses.reduce((acc, c) => {
    const duration = c.totalDuration || '0:0';
    const [h, m] = duration.split(':').map(Number);
    return acc + (h || 0) + (m || 0) / 60;
  }, 0);

  const totalLessonsCompleted = userProgressList.reduce((acc, p) => acc + p.completedLessons.length, 0);

  const scrollToContent = () => {
    document.getElementById('courses-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <span className="text-foreground">Meus Cursos</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Meus Cursos
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Acompanhe seu progresso e continue aprendendo
          </p>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              onClick={scrollToContent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Ver Cursos
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {unlockedCourses.length} cursos disponíveis
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div id="courses-content"></div>
      <div className="border-b border-border bg-card/30">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{unlockedCourses.length}</div>
                <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{inProgressCourses.length}</div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{completedCourses.length}</div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalLessonsCompleted}</div>
                <p className="text-sm text-muted-foreground">Aulas Concluídas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-accent">
              Todos ({unlockedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-accent">
              Em Andamento ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-accent">
              Concluídos ({completedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-accent">
              Favoritos ({favoriteCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course as any}
                    progress={getProgress(course.id) as any}
                    isLocked={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'in-progress' && 'Comece um curso para ver seu progresso aqui.'}
                  {activeTab === 'completed' && 'Complete um curso para vê-lo aqui.'}
                  {activeTab === 'favorites' && 'Adicione cursos aos favoritos para vê-los aqui.'}
                  {activeTab === 'all' && 'Você ainda não tem cursos desbloqueados.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyCoursesPage;
