import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';

interface MyCoursesCardProps {
  course: any;
  progress?: any;
  isLocked?: boolean;
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
}

const MyCoursesCard: React.FC<MyCoursesCardProps> = ({
  course,
  progress,
  isLocked,
  progressPercent = 0,
  completedLessons = 0,
  totalLessons = 0,
}) => {
  const hasStarted = completedLessons > 0;

  return (
    <Link
      to={isLocked ? '#' : course.id === '4439eb25-dec9-4432-b638-0c3f7168a6c5' ? '/hof-box' : `/course/${course.id}`}
      className={`group block ${isLocked ? 'cursor-not-allowed' : ''}`}
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-border-hover hover:shadow-elegant hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail 2:3 */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=900&fit=crop'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Lock Badge */}
          {isLocked && (
            <div className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center bg-destructive/20 border border-destructive/30">
              <Lock className="w-4 h-4 text-destructive" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-base text-foreground mb-1 line-clamp-2">
            {course.title}
          </h3>

          {course.subtitle && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {course.subtitle}
            </p>
          )}

          {course.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {course.description}
            </p>
          )}

          <div className="mt-auto space-y-3">
            {/* Progress Bar */}
            {hasStarted && !isLocked && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {completedLessons}/{totalLessons} aulas
                  </span>
                  <span className="font-medium text-foreground">{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              disabled={isLocked}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
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
      </div>
    </Link>
  );
};

export default MyCoursesCard;
