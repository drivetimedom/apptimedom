import React from 'react';
import { Link } from 'react-router-dom';
import { Course, User, Progress } from '@/lib/storage';
import { Lock, Clock, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerticalCourseCardProps {
  course: Course;
  instructor?: User;
  progress?: Progress;
  isLocked?: boolean;
}

const VerticalCourseCard: React.FC<VerticalCourseCardProps> = ({ 
  course, 
  instructor, 
  progress, 
  isLocked 
}) => {
  const completedLessons = progress?.completedLessons.length || 0;
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessonIds.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasStarted = completedLessons > 0;

  return (
    <Link
      to={isLocked ? '#' : `/course/${course.id}`}
      className={cn(
        "group block flex-shrink-0",
        isLocked && "cursor-not-allowed"
      )}
    >
      <div className="relative w-[200px] md:w-[220px] lg:w-[240px] overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-border-hover hover:-translate-y-2 hover:shadow-elegant">
        {/* Thumbnail Area - 2:3 Aspect Ratio (90% of card) */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay (appears on hover) */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Lock Icon (if locked) */}
          {isLocked && (
            <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center z-10">
              <Lock className="w-4 h-4 text-destructive" />
            </div>
          )}
          
          {/* New Badge */}
          {course.isNew && !isLocked && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-success text-background text-[11px] font-semibold uppercase z-10">
              Novo
            </div>
          )}
          
          {/* Hover Info Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{totalLessons} aulas</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{course.totalDuration}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar (at bottom of image) */}
          {hasStarted && !isLocked && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted z-20">
              <div 
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
        
        {/* Title Area (10% of card) */}
        <div className="p-3 border-t border-border bg-card">
          <h3 className="text-sm font-semibold text-foreground text-center line-clamp-2 leading-tight">
            {course.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default VerticalCourseCard;
