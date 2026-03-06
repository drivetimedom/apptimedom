import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { useCategories } from '@/hooks/useCategories';
import { useActiveBanners } from '@/hooks/useBanners';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { useStudentCourseAccess } from '@/hooks/useStudentAccess';
import HeroBannerCarousel from '@/components/home/HeroBannerCarousel';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import LockedCourseModal from '@/components/student/LockedCourseModal';
import BlockRenderer from '@/components/home-builder/BlockRenderer';
import { Gift, BookOpen, Loader2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, profile, isAdmin, isInstructor, isStudent } = useAuth();
  const [lockedCourse, setLockedCourse] = useState<any>(null);

  // Fetch data from database
  const { data: banners = [], isLoading: bannersLoading } = useActiveBanners();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: userProgressList = [] } = useUserProgress();
  const { data: homeBlocks = [], isLoading: blocksLoading } = useHomeBlocks();
  const { data: studentCourseIds = [] } = useStudentCourseAccess();

  const isLoading = bannersLoading || categoriesLoading || coursesLoading || blocksLoading;

  // Check if we have custom home blocks
  const hasCustomHome = homeBlocks.length > 0;

  const activeCategories = useMemo(() => 
    categories.filter(c => c.active).sort((a, b) => a.order - b.order), 
    [categories]
  );

  const publishedCourses = useMemo(() => 
    courses.filter(c => c.status === 'published'), 
    [courses]
  );

  const inProgressCourses = useMemo(() => 
    publishedCourses.filter(c => 
      userProgressList.some(p => p.courseId === c.id && p.completedLessons.length > 0)
    ),
    [publishedCourses, userProgressList]
  );

  const getCoursesByCategory = (categoryId: string) => {
    return publishedCourses.filter(c => c.categoryIds?.includes(categoryId));
  };

  const getProgress = (courseId: string) => 
    userProgressList.find(p => p.courseId === courseId);

  const isCourseUnlocked = (course: any) => {
    if (isAdmin || isInstructor) return true;
    // Student: check student_course_access
    if (isStudent) {
      return studentCourseIds.includes(course.id);
    }
    if (!course.locked) return true;
    return profile?.unlocked_courses?.includes(course.id) || false;
  };

  // Transform banners for HeroBannerCarousel compatibility
  const transformedBanners = useMemo(() => 
    banners.map(b => ({
      ...b,
      imageUrl: b.imageUrl || '',
    })),
    [banners]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If we have custom home blocks, render them instead of the default layout
  if (hasCustomHome) {
    return (
      <div className="min-h-screen bg-background">
        {homeBlocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  }

  // Default layout (fallback when no custom blocks exist)
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Carousel */}
      <HeroBannerCarousel banners={transformedBanners} />

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section className="py-10 md:py-16 border-b border-border">
          <div className="container px-6 md:px-8 mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Seus Cursos em Andamento</h2>
                <p className="text-sm text-muted-foreground">Continue de onde parou</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-5 overflow-x-auto scrollbar-hide px-6 md:px-8 lg:px-12 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {inProgressCourses.map(course => (
              <VerticalCourseCard
                key={course.id}
                course={course as any}
                progress={getProgress(course.id) as any}
                isLocked={!isCourseUnlocked(course)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories with Carousels */}
      <div id="courses" className="py-8 md:py-12 space-y-6 md:space-y-10">
        {activeCategories.map(category => {
          const categoryCourses = getCoursesByCategory(category.id);
          if (categoryCourses.length === 0) return null;
          
          return (
            <CategoryCarousel
              key={category.id}
              category={category as any}
              courses={categoryCourses as any[]}
              users={[]}
              userProgress={userProgressList as any[]}
              isCourseUnlocked={isCourseUnlocked}
            />
          );
        })}
      </div>

      {/* All Courses Section (if no categories have courses) */}
      {activeCategories.every(cat => getCoursesByCategory(cat.id).length === 0) && (
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
                  course={course as any}
                  progress={getProgress(course.id) as any}
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

      {/* Locked Course Modal for Students */}
      {lockedCourse && (
        <LockedCourseModal
          open={!!lockedCourse}
          onClose={() => setLockedCourse(null)}
          courseTitle={lockedCourse.title}
          courseDescription={lockedCourse.description}
        />
      )}
    </div>
  );
};

export default HomePage;
