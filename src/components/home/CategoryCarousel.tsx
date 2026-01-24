import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FolderOpen, Megaphone, TrendingUp, Target, Briefcase, BookOpen } from 'lucide-react';
import { Category, Course, User, Progress } from '@/lib/storage';
import VerticalCourseCard from '@/components/courses/VerticalCourseCard';
import { cn } from '@/lib/utils';

interface CategoryCarouselProps {
  category: Category;
  courses: Course[];
  users: User[];
  userProgress: Progress[];
  isCourseUnlocked: (course: Course) => boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone,
  TrendingUp,
  Target,
  Briefcase,
  BookOpen,
  FolderOpen,
};

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  category,
  courses,
  users,
  userProgress,
  isCourseUnlocked,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const IconComponent = iconMap[category.icon] || FolderOpen;

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [courses]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 260; // card width + gap
      const scrollAmount = cardWidth * 3; // scroll 3 cards at a time
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const getInstructor = (instructorId: string) => users.find(u => u.id === instructorId);
  const getProgress = (courseId: string) => userProgress.find(p => p.courseId === courseId);

  if (courses.length === 0) return null;

  return (
    <section 
      className="relative py-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Category Header */}
      <div className="container mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              {category.name}
            </h2>
          </div>
          <Link 
            to={`/category/${category.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todos →
          </Link>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className={cn(
              "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/90 hover:bg-card border border-border flex items-center justify-center transition-all duration-200",
              isHovering ? "opacity-100" : "opacity-0 md:opacity-100"
            )}
            aria-label="Scroll para esquerda"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className={cn(
              "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/90 hover:bg-card border border-border flex items-center justify-center transition-all duration-200",
              isHovering ? "opacity-100" : "opacity-0 md:opacity-100"
            )}
            aria-label="Scroll para direita"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 pb-4 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {courses.map(course => (
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
  );
};

export default CategoryCarousel;
