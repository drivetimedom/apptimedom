import React, { useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, STORAGE_KEYS, Course, User, Progress, Banner, Category } from '@/lib/storage';
import HeroBannerCarousel from '@/components/home/HeroBannerCarousel';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { Gift, BookOpen } from 'lucide-react';
import { seedData } from '@/lib/seedData';

const HomePage: React.FC = () => {
  const { user, profile, isAdmin, isInstructor } = useAuth();

  // Ensure seed data exists
  useEffect(() => {
    seedData();
  }, []);

  const banners = useMemo(() => getFromStorage<Banner[]>(STORAGE_KEYS.BANNERS, []), []);
  const categories = useMemo(() => getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []).filter(c => c.active).sort((a, b) => a.order - b.order), []);
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

  const getCoursesByCategory = (categoryId: string) => {
    return publishedCourses.filter(c => c.categoryIds?.includes(categoryId));
  };

  const getInstructor = (instructorId: string) => 
    users.find(u => u.id === instructorId);

  const getProgress = (courseId: string) => 
    userProgress.find(p => p.courseId === courseId);

  const isCourseUnlocked = (course: Course) => {
    if (isAdmin || isInstructor) return true;
    if (!course.locked) return true;
    return profile?.unlocked_courses?.includes(course.id) || false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Carousel */}
      <HeroBannerCarousel banners={banners} />

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section className="py-10 border-b border-border">
          <div className="container mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Seus Cursos em Andamento</h2>
                <p className="text-sm text-muted-foreground">Continue de onde parou</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {inProgressCourses.map(course => (
              <VerticalCourseCard
                key={course.id}
                course={course}
                instructor={getInstructor(course.instructorId)}
                progress={getProgress(course.id)}
                isLocked={!isCourseUnlocked(course)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories with Carousels */}
      <div id="courses" className="py-8 space-y-8">
        {categories.map(category => {
          const categoryCourses = getCoursesByCategory(category.id);
          if (categoryCourses.length === 0) return null;
          
          return (
            <CategoryCarousel
              key={category.id}
              category={category}
              courses={categoryCourses}
              users={users}
              userProgress={userProgress}
              isCourseUnlocked={isCourseUnlocked}
            />
          );
        })}
      </div>

      {/* All Courses Section (if no categories have courses) */}
      {categories.every(cat => getCoursesByCategory(cat.id).length === 0) && (
        <section className="py-16 px-4">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Todos os Cursos</h2>
                <p className="text-sm text-muted-foreground">Frameworks disponíveis para você</p>
              </div>
            </div>
            
            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {publishedCourses.map(course => (
                <VerticalCourseCard
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
