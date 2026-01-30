import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, STORAGE_KEYS, Course, Lesson, User, Progress } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronRight,
  Clock,
  Users,
  BarChart3,
  Play,
  Lock,
  CheckCircle,
  Circle,
  Instagram,
  CheckCircle2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const allLessons = useMemo(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []), []);
  const users = useMemo(() => getFromStorage<User[]>(STORAGE_KEYS.USERS, []), []);
  const allProgress = useMemo(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []), []);

  const course = courses.find(c => c.id === courseId);
  const courseLessons = allLessons.filter(l => l.courseId === courseId);
  const instructor = users.find(u => u.id === course?.instructorId);
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Curso não encontrado</p>
      </div>
    );
  }

  const learningPoints = [
    'Fundamentos e conceitos essenciais',
    'Estratégias práticas de implementação',
    'Técnicas avançadas de otimização',
    'Casos de estudo reais',
    'Templates e recursos exclusivos',
    'Suporte da comunidade',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to="/" className="hover:text-foreground transition-colors">Frameworks</Link>
            <span>/</span>
            <span className="text-foreground">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="relative border-b border-border gradient-hero">
        <div className="container py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Course Info */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full bg-accent text-sm text-foreground border border-border">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-accent text-sm text-foreground border border-border">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">{course.title}</h1>
                <p className="text-xl text-muted-foreground uppercase tracking-wide">{course.subtitle}</p>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl">{course.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={instructor?.avatar} />
                    <AvatarFallback>{instructor?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{instructor?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.totalDuration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>{totalLessons} aulas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{course.level}</span>
                </div>
              </div>

              {/* Progress */}
              {completedLessons > 0 && (
                <div className="bg-card/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Seu progresso</span>
                    <span className="text-sm font-medium text-foreground">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {completedLessons} de {totalLessons} aulas concluídas
                  </p>
                </div>
              )}

              {/* CTA */}
              <Button 
                size="lg" 
                onClick={handleStartCourse}
                className="text-lg px-8 py-6"
              >
                {completedLessons > 0 ? 'Continuar de onde parou' : 'Começar Curso'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Thumbnail */}
            <div className="lg:w-96 rounded-xl overflow-hidden shadow-elegant border border-border">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* What you'll learn */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">O que você vai aprender</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-4 rounded-lg bg-card border border-border">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Conteúdo do Curso</h2>
                <span className="text-sm text-muted-foreground">
                  {course.modules.length} módulos • {totalLessons} aulas
                </span>
              </div>

              <Accordion type="multiple" className="space-y-4">
                {course.modules.sort((a, b) => a.order - b.order).map((module) => {
                  const moduleLessons = getModuleLessons(module.id);
                  const moduleCompleted = moduleLessons.every(l => isLessonCompleted(l.id));
                  const moduleProgress = moduleLessons.filter(l => isLessonCompleted(l.id)).length;

                  return (
                    <AccordionItem 
                      key={module.id} 
                      value={module.id}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-accent/30 transition-colors [&[data-state=open]]:bg-accent/30">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              moduleCompleted ? 'bg-success/20' : 'bg-accent'
                            }`}>
                              {moduleCompleted ? (
                                <CheckCircle className="w-4 h-4 text-success" />
                              ) : (
                                <span className="text-sm font-medium text-foreground">{module.order}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <h3 className="font-medium text-foreground">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {moduleLessons.length} aulas • {moduleProgress}/{moduleLessons.length} concluídas
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0">
                        <div className="border-t border-border">
                          {moduleLessons.map((lesson, idx) => {
                            const isComplete = isLessonCompleted(lesson.id);
                            return (
                              <Link
                                key={lesson.id}
                                to={`/course/${courseId}/lesson/${lesson.id}`}
                                className="flex items-center space-x-4 px-6 py-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
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
                                  <p className={`font-medium ${isComplete ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {idx + 1}. {lesson.title}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-20 space-y-6">
              {/* Instructor Card */}
              {instructor && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Sobre o Instrutor</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-border">
                      <AvatarImage src={instructor.avatar} />
                      <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{instructor.name}</h4>
                      {instructor.instagram && (
                        <a 
                          href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-info hover:text-info/80"
                        >
                          <Instagram className="w-4 h-4" />
                          <span>{instructor.instagram}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                </div>
              )}

              {/* CTA Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Pronto para começar?</h3>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleStartCourse}
                >
                  {completedLessons > 0 ? 'Continuar' : 'Iniciar Curso'}
                  <Play className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Acesso vitalício a todo o conteúdo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
