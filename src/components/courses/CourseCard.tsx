import React from 'react';
import { Link } from 'react-router-dom';
import { Course, User, Progress } from '@/lib/storage';
import { Lock, LockOpen, Play, Clock, User as UserIcon } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  instructor?: User;
  progress?: Progress;
  isLocked?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, instructor, progress, isLocked }) => {
  const completedLessons = progress?.completedLessons.length || 0;
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessonIds.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasStarted = completedLessons > 0;

  return (
    <Link
      to={isLocked ? '#' : course.id === '4439eb25-dec9-4432-b638-0c3f7168a6c5' ? '/hof-box' : `/course/${course.id}`}
      className={`group block ${isLocked ? 'cursor-not-allowed' : ''}`}
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-elegant hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Lock Badge */}
          <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center ${
            isLocked ? 'bg-destructive/20 border border-destructive/30' : 'bg-success/20 border border-success/30'
          }`}>
            {isLocked ? (
              <Lock className="w-5 h-5 text-destructive" />
            ) : (
              <LockOpen className="w-5 h-5 text-success" />
            )}
          </div>


          {/* Title on Image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-foreground mb-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{course.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {/* Progress Bar */}
          {hasStarted && !isLocked && (
            <div className="space-y-2">
              <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedLessons}/{totalLessons} aulas concluídas
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            disabled={isLocked}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
              isLocked
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloqueado</span>
              </>
            ) : hasStarted ? (
              <>
                <Play className="w-4 h-4" />
                <span>Continuar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Começar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
