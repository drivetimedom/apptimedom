import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, STORAGE_KEYS, Course, User, Progress } from '@/lib/storage';
import CourseCard from '@/components/courses/CourseCard';
import { Gift, BookOpen, TrendingUp, Sparkles } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const users = useMemo(() => getFromStorage<User[]>(STORAGE_KEYS.USERS, []), []);
  const allProgress = useMemo(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []), []);

  const userProgress = useMemo(() => 
    allProgress.filter(p => p.userId === user?.id), 
    [allProgress, user?.id]
  );

  const publishedCourses = useMemo(() => 
    courses.filter(c => c.status === 'published'), 
    [courses]
  );

  const inProgressCourses = useMemo(() => 
    publishedCourses.filter(c => 
      userProgress.some(p => p.courseId === c.id && p.completedLessons.length > 0)
    ),
    [publishedCourses, userProgress]
  );

  const getInstructor = (instructorId: string) => 
    users.find(u => u.id === instructorId);

  const getProgress = (courseId: string) => 
    userProgress.find(p => p.courseId === courseId);

  const isCourseUnlocked = (course: Course) => {
    if (user?.type === 'admin' || user?.type === 'instructor') return true;
    if (!course.locked) return true;
    return user?.unlockedCourses?.includes(course.id) || false;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 gradient-hero border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/50 border border-border mb-6">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span className="text-sm text-foreground">Bem-vindo de volta, {user?.name?.split(' ')[0]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Frameworks & Estratégias
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Desbloqueie todo o potencial que um HUB de membros pode te oferecer. 
              Acesse frameworks exclusivos e transforme sua jornada.
            </p>
            <a 
              href="#courses" 
              className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 shadow-elegant"
            >
              <span>Comece agora</span>
              <TrendingUp className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section className="py-16 px-4">
          <div className="container">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Seus Cursos em Andamento</h2>
                <p className="text-sm text-muted-foreground">Continue de onde parou</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.slice(0, 3).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  instructor={getInstructor(course.instructorId)}
                  progress={getProgress(course.id)}
                  isLocked={!isCourseUnlocked(course)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section id="courses" className="py-16 px-4 border-t border-border">
        <div className="container">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Ação, comece aqui</h2>
              <p className="text-sm text-muted-foreground">Frameworks disponíveis para você</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publishedCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                instructor={getInstructor(course.instructorId)}
                progress={getProgress(course.id)}
                isLocked={!isCourseUnlocked(course)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-t border-border bg-card/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{publishedCourses.length}</div>
              <p className="text-sm text-muted-foreground">Frameworks Disponíveis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {courses.reduce((acc, c) => acc + c.modules.reduce((m, mod) => m + mod.lessonIds.length, 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Aulas em Vídeo</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <p className="text-sm text-muted-foreground">Horas de Conteúdo</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">∞</div>
              <p className="text-sm text-muted-foreground">Acesso Vitalício</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
