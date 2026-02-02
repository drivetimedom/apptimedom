import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, STORAGE_KEYS, Course, Lesson, Progress } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Clock,
  Play,
  Lock,
  CheckCircle,
  Circle,
  ArrowLeft,
  Search,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const allLessons = useMemo(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []), []);
  const allProgress = useMemo(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []), []);

  const course = courses.find(c => c.id === courseId);
  const courseLessons = allLessons.filter(l => l.courseId === courseId);
  const userProgress = allProgress.find(p => p.userId === user?.id && p.courseId === courseId);

  const totalLessons = courseLessons.length;
  const completedLessons = userProgress?.completedLessons.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const getModuleLessons = (moduleId: string) => 
    courseLessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);

  const isLessonCompleted = (lessonId: string) => 
    userProgress?.completedLessons.includes(lessonId) || false;

  const getFirstLesson = () => {
    if (userProgress?.currentLesson) return userProgress.currentLesson;
    const firstModule = course?.modules.sort((a, b) => a.order - b.order)[0];
    if (firstModule && firstModule.lessonIds.length > 0) {
      return firstModule.lessonIds[0];
    }
    return courseLessons[0]?.id;
  };

  const handleStartCourse = () => {
    const firstLessonId = getFirstLesson();
    if (firstLessonId) {
      navigate(`/course/${courseId}/lesson/${firstLessonId}`);
    }
  };

  // Filter lessons by search term
  const filterLessons = (lessons: Lesson[]) => {
    if (!searchTerm.trim()) return lessons;
    return lessons.filter(l => 
      l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Curso não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div 
        className="relative min-h-[400px] md:min-h-[500px] bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.85)), url(${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=600&fit=crop'})`
        }}
      >
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Voltar</span>
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {course.title}
            </h1>
            
            {course.subtitle && (
              <p className="text-lg md:text-xl text-white/70 uppercase tracking-wide mb-4">
                {course.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl line-clamp-3">
              {course.description}
            </p>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white text-sm">
                {completedLessons}/{totalLessons} conteúdos — {progressPercent}%
              </span>
              <div className="flex-1 max-w-md h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              onClick={handleStartCourse}
              className="text-base md:text-lg px-8 py-6 bg-white text-background hover:bg-white/90"
            >
              {completedLessons > 0 ? 'Continuar assistindo' : 'Começar agora'}
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="content" className="w-full">
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <TabsList className="h-auto bg-transparent gap-6">
              <TabsTrigger 
                value="content" 
                className="py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                Conteúdos
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                Sobre
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Todos os conteúdos
              </h2>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar conteúdo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            {/* Modules Accordion */}
            <Accordion type="multiple" defaultValue={course.modules.map(m => m.id)} className="space-y-4">
              {course.modules.sort((a, b) => a.order - b.order).map((module) => {
                const moduleLessons = filterLessons(getModuleLessons(module.id));
                const allModuleLessons = getModuleLessons(module.id);
                const moduleCompleted = allModuleLessons.every(l => isLessonCompleted(l.id));
                const moduleProgress = allModuleLessons.filter(l => isLessonCompleted(l.id)).length;

                return (
                  <AccordionItem 
                    key={module.id} 
                    value={module.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 md:px-6 py-4 hover:bg-accent/30 transition-colors [&[data-state=open]]:bg-accent/30">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            moduleCompleted ? 'bg-success/20' : 'bg-accent'
                          }`}>
                            {moduleCompleted ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <span className="text-sm font-medium text-foreground">{module.order}</span>
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-foreground text-sm md:text-base">{module.title}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {allModuleLessons.length} aulas • {moduleProgress}/{allModuleLessons.length} concluídas
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      <div className="border-t border-border">
                        {moduleLessons.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground text-sm">
                            {searchTerm ? 'Nenhuma aula encontrada' : 'Nenhuma aula neste módulo'}
                          </p>
                        ) : (
                          moduleLessons.map((lesson, idx) => {
                            const isComplete = isLessonCompleted(lesson.id);
                            return (
                              <Link
                                key={lesson.id}
                                to={`/course/${courseId}/lesson/${lesson.id}`}
                                className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                              >
                                <div className="flex-shrink-0">
                                  {isComplete ? (
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  ) : lesson.locked ? (
                                    <Lock className="w-5 h-5 text-destructive" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm md:text-base truncate ${isComplete ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {idx + 1}. {lesson.title}
                                  </p>
                                </div>
                                {lesson.duration && (
                                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                                    <Clock className="w-4 h-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                )}
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Sobre o Curso</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {course.description || 'Nenhuma descrição disponível para este curso.'}
              </p>
              
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Informações</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Módulos</p>
                    <p className="text-xl font-bold text-foreground">{course.modules.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Aulas</p>
                    <p className="text-xl font-bold text-foreground">{totalLessons}</p>
                  </div>
                  {course.totalDuration && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Duração Total</p>
                      <p className="text-xl font-bold text-foreground">{course.totalDuration}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursePage;
