import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Course, 
  User, 
  Progress, 
  Lesson,
  STORAGE_KEYS, 
  getFromStorage,
  getCourseStatus,
  checkCourseAccess 
} from '@/lib/storage';
import { Lock, Clock, PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerticalCourseCardProps {
  course: Course;
  instructor?: User;
  progress?: Progress;
  isLocked?: boolean;
  badgeType?: string;
}

const VerticalCourseCard: React.FC<VerticalCourseCardProps> = ({ 
  course, 
  instructor, 
  progress,
  isLocked: isLockedProp,
  badgeType 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use prop if provided, otherwise check access
  const hasAccess = user ? checkCourseAccess(course.id, user.id) : false;
  const courseStatus = user ? getCourseStatus(course.id, user.id) : 'locked';
  const isLocked = isLockedProp !== undefined ? isLockedProp : courseStatus === 'locked';
  const isCompleted = courseStatus === 'completed';
  
  // Get progress from prop or storage
  const progressList = getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);
  const userProgress = progress || progressList.find(p => p.userId === user?.id && p.courseId === course.id);
  
  const completedLessons = userProgress?.completedLessons.length || 0;
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessonIds.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasStarted = completedLessons > 0;

  // Get badge styling based on type
  const getBadgeStyles = () => {
    if (!badgeType) return '';
    
    if (badgeType.includes('Pilar')) {
      return 'bg-amber-500/90 text-amber-950';
    }
    if (badgeType === 'Desafio') {
      return 'bg-emerald-500/90 text-emerald-950';
    }
    if (badgeType === 'Opcional') {
      return 'bg-blue-500/90 text-blue-950';
    }
    return 'bg-muted text-muted-foreground';
  };

  const cardContent = (
    <div className={cn(
      "relative w-[200px] md:w-[220px] lg:w-[240px] overflow-hidden rounded-xl border border-border bg-card transition-all duration-300",
      !isLocked && "hover:border-border-hover hover:-translate-y-2 hover:shadow-elegant",
      isLocked && "opacity-75"
    )}>
      {/* Thumbnail Area - 2:3 Aspect Ratio (90% of card) */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card to-muted flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient Overlay (appears on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Lock Icon (if locked) */}
        {isLocked && (
          <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center z-10">
            <Lock className="w-4 h-4 text-destructive" />
          </div>
        )}
        
        {/* Completed Badge */}
        {isCompleted && !isLocked && (
          <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center z-10">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* New Badge */}
        {course.isNew && !isLocked && !isCompleted && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-success text-background text-[11px] font-semibold uppercase z-10">
            Novo
          </div>
        )}
        
        {/* Type Badge (Pilar/Complementar/Desafio) */}
        {badgeType && (
          <div className={cn(
            "absolute right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm z-10",
            getBadgeStyles(),
            course.isNew && !isLocked && !isCompleted ? "top-10" : "top-3"
          )}>
            {badgeType}
          </div>
        )}
        
        {/* Hover Info Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {!isLocked && (
            <>
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
            </>
          )}
        </div>
        
        {/* Dark overlay for locked */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/50 z-5" />
        )}
        
        {/* Progress Bar (at bottom of image) */}
        {hasStarted && !isLocked && progressPercent < 100 && (
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
        <h3 className={cn(
          "text-sm font-semibold text-center line-clamp-2 leading-tight",
          isLocked ? "text-muted-foreground/70" : "text-foreground"
        )}>
          {course.title}
        </h3>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group block flex-shrink-0 cursor-not-allowed">
            {cardContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border-border">
          <p className="text-sm">🔒 Complete o curso anterior para desbloquear</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Handle click - challenges go directly to first lesson
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (course.courseType === 'desafio') {
      const lessons = getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []);
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
    <div
      onClick={handleClick}
      className="group block flex-shrink-0 cursor-pointer"
    >
      {cardContent}
    </div>
  );
};

export default VerticalCourseCard;
