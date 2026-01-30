import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, STORAGE_KEYS, Course, User, Progress } from '@/lib/storage';
import CourseCard from '@/components/courses/CourseCard';
import { BookOpen, Clock, Trophy, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyCoursesPage: React.FC = () => {
  const { user, profile, isAdmin, isInstructor } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

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

  const isCourseUnlocked = (course: Course) => {
    if (isAdmin || isInstructor) return true;
    if (!course.locked) return true;
    return profile?.unlocked_courses?.includes(course.id) || false;
  };

  const unlockedCourses = publishedCourses.filter(c => isCourseUnlocked(c));

  const inProgressCourses = unlockedCourses.filter(c => {
    const progress = userProgress.find(p => p.courseId === c.id);
    if (!progress) return false;
    const totalLessons = c.modules.reduce((acc, m) => acc + m.lessonIds.length, 0);
    return progress.completedLessons.length > 0 && progress.completedLessons.length < totalLessons;
  });

  const completedCourses = unlockedCourses.filter(c => {
    const progress = userProgress.find(p => p.courseId === c.id);
    if (!progress) return false;
    const totalLessons = c.modules.reduce((acc, m) => acc + m.lessonIds.length, 0);
    return progress.completedLessons.length === totalLessons && totalLessons > 0;
  });

  const favoriteCourses = unlockedCourses.filter(c => {
    const progress = userProgress.find(p => p.courseId === c.id);
    return progress?.favorites && progress.favorites.length > 0;
  });

  const getInstructor = (instructorId: string) => 
    users.find(u => u.id === instructorId);

  const getProgress = (courseId: string) => 
    userProgress.find(p => p.courseId === courseId);

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
    const [h, m] = c.totalDuration.split(':').map(Number);
    return acc + h + m / 60;
  }, 0);

  const totalLessonsCompleted = userProgress.reduce((acc, p) => acc + p.completedLessons.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Cursos</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e continue aprendendo</p>
        </div>
      </div>

      {/* Stats */}
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
                    course={course}
                    instructor={getInstructor(course.instructorId)}
                    progress={getProgress(course.id)}
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
