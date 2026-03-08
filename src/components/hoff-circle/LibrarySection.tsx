import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { 
  BookOpen, 
  Library,
  Package,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CalendarSection from '@/components/hoff-circle/CalendarSection';

interface LibrarySectionProps {
  categoryId: string;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ categoryId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'swipefile' | 'calendar'>('courses');
  
  const { data: allCourses = [], isLoading } = useCourses();
  
  const categoryCourses = allCourses.filter(
    course => {
      const matchesCategory = 
        course.categoryIds?.includes(categoryId) || 
        course.category === categoryId ||
        course.category === 'cat-hoff-circle' ||
        course.category === 'cat-hof-circle';
      return matchesCategory && course.status === 'published';
    }
  );

  const sortedCourses = categoryCourses.sort(
    (a, b) => (a.sequenceConfig?.position || 0) - (b.sequenceConfig?.position || 0)
  );

  const handleCourseClick = (course: typeof sortedCourses[0]) => {
    if (course.courseType === 'desafio') {
      const firstModule = course.modules[0];
      if (firstModule && firstModule.lessonIds.length > 0) {
        const firstLessonId = firstModule.lessonIds[0];
        navigate(`/course/${course.id}/lesson/${firstLessonId}`);
        return;
      }
    }
    navigate(`/course/${course.id}`);
  };

  return (
    <section className="mt-12">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Library className="w-5 h-5 text-primary" />
            </div>
            Biblioteca
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs: Cursos + Swipe File + Calendário */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'courses'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Cursos
            </button>
            
            <button
              onClick={() => navigate('/swipe-file')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <Package className="w-4 h-4" />
              Swipe File
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'calendar'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Calendário
            </button>
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <>
              {sortedCourses.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {sortedCourses.map((course) => (
                    <div 
                      key={course.id} 
                      onClick={() => handleCourseClick(course)}
                      className="cursor-pointer"
                    >
                      <VerticalCourseCard 
                        course={course}
                        fixedWidth={false}
                        isLocked={false}
                        badgeType={course.sequenceConfig?.isPillar ? `T${course.sequenceConfig.position}` : undefined}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando cursos...' : 'Nenhum curso disponível ainda.'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && <CalendarSection />}
        </CardContent>
      </Card>
    </section>
  );
};

export default LibrarySection;
