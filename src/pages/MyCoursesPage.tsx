import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import MyCoursesCard from '@/components/courses/MyCoursesCard';
import { BookOpen, Clock, Trophy, Home, ChevronRight, GraduationCap, ArrowDown, Loader2, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isInstructor } = useAuth();

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

  const getCourseProgress = (course: any) => {
    const progress = userProgressList.find(p => p.courseId === course.id);
    const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessonIds.length, 0);
    const completedLessons = progress?.completedLessons.length || 0;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { progress, totalLessons, completedLessons, percent };
  };

  const inProgressCourses = unlockedCourses.filter(c => {
    const { completedLessons, totalLessons } = getCourseProgress(c);
    return completedLessons > 0 && completedLessons < totalLessons;
  });

  const completedCourses = unlockedCourses.filter(c => {
    const { completedLessons, totalLessons } = getCourseProgress(c);
    return completedLessons === totalLessons && totalLessons > 0;
  });

  const notStartedCourses = unlockedCourses.filter(c => {
    const { completedLessons } = getCourseProgress(c);
    return completedLessons === 0;
  });

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

  const CourseGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {children}
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/30">
      <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section
        className="relative h-[300px] md:h-[380px] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(/images/banner-secoes.png)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        <div className="relative z-10 container h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Meus Cursos</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Meus Cursos</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Acompanhe seu progresso e continue aprendendo
          </p>

          <div className="flex items-center gap-4">
            <Button size="lg" onClick={scrollToContent} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
                <p className="text-sm text-muted-foreground">Disponíveis</p>
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
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalLessonsCompleted}</div>
                <p className="text-sm text-muted-foreground">Aulas Concluídas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container py-8 space-y-12">
        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-warning/10">
                <Play className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Em Andamento</h2>
                <p className="text-sm text-muted-foreground">Continue de onde parou</p>
              </div>
            </div>
            <CourseGrid>
              {inProgressCourses.map(course => {
                const { percent, completedLessons, totalLessons, progress } = getCourseProgress(course);
                return (
                  <MyCoursesCard
                    key={course.id}
                    course={course}
                    progress={progress}
                    isLocked={false}
                    progressPercent={percent}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                  />
                );
              })}
            </CourseGrid>
          </section>
        )}

        {/* Completed */}
        {completedCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/10">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Concluídos</h2>
                <p className="text-sm text-muted-foreground">Parabéns pelo progresso!</p>
              </div>
            </div>
            <CourseGrid>
              {completedCourses.map(course => {
                const { percent, completedLessons, totalLessons, progress } = getCourseProgress(course);
                return (
                  <div key={course.id} className="relative">
                    <MyCoursesCard
                      course={course}
                      progress={progress}
                      isLocked={false}
                      progressPercent={percent}
                      completedLessons={completedLessons}
                      totalLessons={totalLessons}
                    />
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                    </div>
                  </div>
                );
              })}
            </CourseGrid>
          </section>
        )}

        {/* Not Started */}
        {notStartedCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-info/10">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Não Iniciados</h2>
                <p className="text-sm text-muted-foreground">Explore novos conteúdos</p>
              </div>
            </div>
            <CourseGrid>
              {notStartedCourses.map(course => {
                const { percent, completedLessons, totalLessons, progress } = getCourseProgress(course);
                return (
                  <MyCoursesCard
                    key={course.id}
                    course={course}
                    progress={progress}
                    isLocked={false}
                    progressPercent={percent}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                  />
                );
              })}
            </CourseGrid>
          </section>
        )}

        {unlockedCourses.length === 0 && (
          <EmptyState message="Você ainda não tem cursos desbloqueados." />
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
