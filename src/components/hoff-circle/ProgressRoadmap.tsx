import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Course, 
  Progress, 
  STORAGE_KEYS, 
  getFromStorage,
  getCourseStatus,
  checkCourseAccess 
} from '@/lib/storage';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  Circle,
  Flag,
  Star,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProgressRoadmapProps {
  courses: Course[];
  categoryId: string;
}

type NodeStatus = 'completed' | 'current' | 'available' | 'locked';

const ProgressRoadmap: React.FC<ProgressRoadmapProps> = ({ courses, categoryId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const progressList = getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);

  // Get courses that should show in roadmap
  const roadmapCourses = courses
    .filter(c => c.roadmapConfig?.showInRoadmap)
    .sort((a, b) => (a.sequenceConfig?.position || 0) - (b.sequenceConfig?.position || 0));

  // Separate pillar and complementary courses
  const pillarCourses = roadmapCourses.filter(c => c.sequenceConfig?.isPillar);
  const complementaryCourses = roadmapCourses.filter(c => !c.sequenceConfig?.isPillar);

  // Calculate overall progress
  const totalCourses = courses.length;
  const completedCourses = courses.filter(course => {
    const progress = progressList.find(p => p.userId === user?.id && p.courseId === course.id);
    return progress && progress.progress >= 100;
  }).length;
  const progressPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const getNodeStatus = (course: Course): NodeStatus => {
    if (!user) return 'locked';
    const status = getCourseStatus(course.id, user.id);
    // Map 'in_progress' to 'current' for our UI
    if (status === 'in_progress') return 'current';
    return status as NodeStatus;
  };

  const handleNodeClick = (course: Course) => {
    const status = getNodeStatus(course);
    if (status !== 'locked') {
      navigate(`/course/${course.id}`);
    }
  };

  const renderNode = (course: Course, showConnector: boolean = false, isLast: boolean = false) => {
    const status = getNodeStatus(course);
    const progress = progressList.find(p => p.userId === user?.id && p.courseId === course.id);
    const progressPercent = progress?.progress || 0;

    const nodeClasses = cn(
      "relative flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-2xl transition-all duration-300 cursor-pointer",
      {
        // Completed state - using semantic tokens with green accent
        "bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-emerald-400 shadow-lg": status === 'completed',
        // Current/In Progress state
        "bg-gradient-to-br from-accent to-muted border-[3px] border-foreground shadow-lg": status === 'current',
        // Available state
        "bg-card border-2 border-border hover:border-muted-foreground hover:-translate-y-1": status === 'available',
        // Locked state
        "bg-background border-2 border-muted opacity-50 cursor-not-allowed": status === 'locked',
      }
    );

    const iconClasses = "w-8 h-8";
    const labelPosition = course.sequenceConfig?.position || 0;

    return (
      <div key={course.id} className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={nodeClasses}
              onClick={() => handleNodeClick(course)}
            >
              {/* Badge */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-background border border-border px-2 py-0.5 rounded-full">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {course.sequenceConfig?.isPillar ? `Pilar ${labelPosition}` : 'Complementar'}
                </span>
              </div>

              {/* Icon based on status */}
              {status === 'completed' && (
                <CheckCircle className={cn(iconClasses, "text-white")} />
              )}
              {status === 'current' && (
                <Play className={cn(iconClasses, "text-foreground fill-current")} />
              )}
              {status === 'available' && (
                <Circle className={cn(iconClasses, "text-muted-foreground")} />
              )}
              {status === 'locked' && (
                <Lock className={cn(iconClasses, "text-destructive")} />
              )}

              {/* Course label */}
              <span className={cn(
                "text-sm font-semibold",
                status === 'completed' && "text-white",
                status === 'current' && "text-foreground",
                status === 'available' && "text-muted-foreground",
                status === 'locked' && "text-muted-foreground/50"
              )}>
                T{labelPosition}
              </span>

              {/* Progress indicator for current */}
              {status === 'current' && progressPercent > 0 && progressPercent < 100 && (
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover border-border">
            <div className="space-y-1">
              <p className="font-semibold">{course.title}</p>
              <p className="text-xs text-muted-foreground">
                {status === 'completed' && '✅ Concluído'}
                {status === 'current' && `🎯 Em progresso (${progressPercent}%)`}
                {status === 'available' && '📚 Disponível para começar'}
                {status === 'locked' && `🔒 Complete ${pillarCourses.find(c => c.id === course.sequenceConfig?.prerequisiteCourseId)?.title || 'o curso anterior'} primeiro`}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Connector arrow */}
        {showConnector && !isLast && (
          <div className="flex items-center mx-2">
            <div className={cn(
              "w-8 h-0.5",
              status === 'completed' ? "bg-emerald-500" : "bg-border"
            )} />
            <ArrowRight className={cn(
              "w-4 h-4 -ml-1",
              status === 'completed' ? "text-emerald-500" : "text-border"
            )} />
          </div>
        )}
      </div>
    );
  };

  if (roadmapCourses.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-8 mb-12">
      {/* Header with progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Seu Progresso no HOF CIRCLE</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {progressPercentage}% ({completedCourses}/{totalCourses})
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Pillars section */}
      {pillarCourses.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Pilares do Método (Sequenciais)
          </h4>
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-4">
            {pillarCourses.map((course, index) => 
              renderNode(course, true, index === pillarCourses.length - 1)
            )}
          </div>
        </div>
      )}

      {/* Complementary section */}
      {complementaryCourses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
            <Star className="w-4 h-4" />
            Trilhas Complementares (Liberadas após T3)
          </h4>
          <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-4">
            {complementaryCourses.map((course) => 
              renderNode(course, false, true)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressRoadmap;
