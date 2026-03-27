import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourse } from '@/hooks/useCourses';
import { useLessons } from '@/hooks/useLessons';
import { useCourseProgress, useUpdateProgress } from '@/hooks/useUserProgress';
import { useLessonComments, useAddComment } from '@/hooks/useLessonComments';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useCanAccessCourse } from '@/hooks/useStudentAccess';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  Play,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
  FileText,
  ExternalLink,
  Send,
  Instagram,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVimeoTracking } from '@/hooks/useVimeoTracking';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: canAccess, isLoading: accessLoading } = useCanAccessCourse(courseId);

  // Redirect if student doesn't have access
  useEffect(() => {
    if (!accessLoading && canAccess === false) {
      navigate('/');
    }
  }, [canAccess, accessLoading, navigate]);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  
  const [newComment, setNewComment] = useState('');
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null);

  // Backend data
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: lessonsFromDb = [], isLoading: lessonsLoading, error: lessonsError } = useLessons(courseId);
  
  // Progress from Supabase
  const { data: userProgress } = useCourseProgress(courseId);
  const updateProgress = useUpdateProgress();

  // Comments from Supabase
  const { data: lessonComments = [] } = useLessonComments(lessonId);
  const addCommentMutation = useAddComment();

  // Fetch commenter profiles from public_profiles view
  const commenterIds = useMemo(() => [...new Set(lessonComments.map(c => c.userId))], [lessonComments]);
  const { data: commenterProfiles = [] } = useQuery({
    queryKey: ['commenter-profiles', commenterIds],
    queryFn: async () => {
      if (commenterIds.length === 0) return [];
      const { data, error } = await supabase
        .from('public_profiles')
        .select('user_id, name, avatar')
        .in('user_id', commenterIds);
      if (error) throw error;
      return data || [];
    },
    enabled: commenterIds.length > 0,
  });
  const profilesMap = useMemo(() => {
    const map: Record<string, { name: string; avatar: string | null }> = {};
    commenterProfiles.forEach(p => { if (p.user_id) map[p.user_id] = { name: p.name || 'Usuário', avatar: p.avatar }; });
    return map;
  }, [commenterProfiles]);

  const courseLessons = useMemo(() => {
    if (!course) return [...lessonsFromDb].sort((a, b) => a.order - b.order);
    // Build a map of module id -> module order for correct cross-module sorting
    const moduleOrderMap: Record<string, number> = {};
    (course.modules || []).forEach((m) => {
      moduleOrderMap[m.id] = m.order;
    });
    return [...lessonsFromDb].sort((a, b) => {
      const moduleOrderA = moduleOrderMap[a.moduleId] ?? 0;
      const moduleOrderB = moduleOrderMap[b.moduleId] ?? 0;
      if (moduleOrderA !== moduleOrderB) return moduleOrderA - moduleOrderB;
      return a.order - b.order;
    });
  }, [lessonsFromDb, course]);
  const currentLesson = courseLessons.find(l => l.id === lessonId);

  // Error toasts
  useEffect(() => {
    if (courseError) {
      toast({ title: 'Erro ao carregar curso', description: (courseError as any)?.message ?? 'Tente novamente.', variant: 'destructive' });
    }
  }, [courseError, toast]);

  useEffect(() => {
    if (lessonsError) {
      toast({ title: 'Erro ao carregar aulas', description: (lessonsError as any)?.message ?? 'Tente novamente.', variant: 'destructive' });
    }
  }, [lessonsError, toast]);

  // Log lesson view activity
  useEffect(() => {
    if (currentLesson && course) {
      logActivity('lesson_watched', { lessonId, lessonTitle: currentLesson.title, courseId, courseTitle: course.title });
    }
  }, [lessonId, currentLesson?.id]);

  // Derived progress state
  const completedLessons = userProgress?.completedLessons || [];
  const liked = userProgress?.liked || [];
  const disliked = userProgress?.disliked || [];
  const favorites = userProgress?.favorites || [];

  const isCompleted = completedLessons.includes(lessonId!);
  const isLiked = liked.includes(lessonId!);
  const isDisliked = disliked.includes(lessonId!);
  const isFavorite = favorites.includes(lessonId!);

  // Vimeo tracking — exposes loading/buffering/error state + retry
  const { isLoading: videoLoading, isBuffering: videoBuffering, hasError: videoError, retry: retryVideo } = useVimeoTracking({
    vimeoId: currentLesson?.vimeoId,
    lessonId: lessonId!,
    userId: user?.id,
    iframeRef: vimeoIframeRef,
    onCompleted: () => {
      if (!isCompleted) {
        handleMarkComplete();
      }
    },
  });

  // Debounce lesson navigation to prevent rapid remounts of the Vimeo player
  const navDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateLesson = useCallback((id: string) => {
    if (navDebounceRef.current) clearTimeout(navDebounceRef.current);
    navDebounceRef.current = setTimeout(() => {
      navigate(`/course/${courseId}/lesson/${id}`);
    }, 150);
  }, [courseId, navigate]);

  if (courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  // Helper to persist progress update
  const doUpdateProgress = (updates: Partial<{
    completedLessons: string[];
    liked: string[];
    disliked: string[];
    favorites: string[];
  }>) => {
    const totalLessons = courseLessons.length;
    const newCompleted = updates.completedLessons ?? completedLessons;
    const progressPercent = totalLessons > 0 ? Math.round((newCompleted.length / totalLessons) * 100) : 0;

    updateProgress.mutate({
      courseId: courseId!,
      completedLessons: newCompleted,
      currentLesson: lessonId!,
      progress: progressPercent,
      liked: updates.liked ?? liked,
      disliked: updates.disliked ?? disliked,
      favorites: updates.favorites ?? favorites,
    });
  };

  // Actions
  const handleMarkComplete = () => {
    const newCompleted = isCompleted
      ? completedLessons.filter(id => id !== lessonId)
      : [...completedLessons, lessonId!];

    doUpdateProgress({ completedLessons: newCompleted });

    if (!isCompleted) {
      logActivity('lesson_completed', { lessonId, lessonTitle: currentLesson?.title, courseId, courseTitle: course?.title });
    }

    toast({
      title: isCompleted ? 'Aula desmarcada' : 'Aula concluída! 🎉',
      description: isCompleted ? 'A aula foi desmarcada como concluída' : 'Continue assim, você está arrasando!',
    });
  };

  const handleLike = () => {
    doUpdateProgress({
      liked: isLiked ? liked.filter(id => id !== lessonId) : [...liked, lessonId!],
      disliked: disliked.filter(id => id !== lessonId),
    });
  };

  const handleDislike = () => {
    doUpdateProgress({
      disliked: isDisliked ? disliked.filter(id => id !== lessonId) : [...disliked, lessonId!],
      liked: liked.filter(id => id !== lessonId),
    });
  };

  const handleFavorite = () => {
    doUpdateProgress({
      favorites: isFavorite ? favorites.filter(id => id !== lessonId) : [...favorites, lessonId!],
    });
    toast({ title: isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos' });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(
      { lessonId: lessonId!, text: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment('');
          logActivity('comment_added', { lessonId, lessonTitle: currentLesson?.title, courseId });
          toast({ title: 'Comentário enviado!' });
        },
      }
    );
  };

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Aula não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container px-6 md:px-8 py-4 md:py-5">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
            <Link to="/" className="hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0">Início</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Link to={`/course/${courseId}`} className="hover:text-foreground transition-colors truncate max-w-[120px] md:max-w-none" title={course.title}>{course.title}</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[150px] md:max-w-md" title={currentLesson.title}>{currentLesson.title}</span>
          </nav>
        </div>
      </div>

      <div className="container px-6 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6 md:space-y-8">
            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black shadow-elegant mb-2 md:mb-0">
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                {/* Initial loading overlay (before player ready) */}
                {videoLoading && !videoError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 pointer-events-none">
                    <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Mid-play buffering overlay */}
                {!videoLoading && videoBuffering && !videoError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
                    <Loader2 className="w-8 h-8 animate-spin text-white/70" />
                  </div>
                )}

                {/* Error fallback with retry */}
                {videoError && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                    <p className="text-sm text-muted-foreground">
                      Não foi possível carregar o vídeo. Verifique sua conexão e tente novamente.
                    </p>
                    <Button size="sm" variant="outline" onClick={retryVideo}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar novamente
                    </Button>
                  </div>
                )}

                <iframe
                  key={`vimeo-${lessonId}`}
                  ref={vimeoIframeRef}
                  src={`https://player.vimeo.com/video/${currentLesson.vimeoId}?byline=0&portrait=0&title=0`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Navigation arrows — hidden on mobile */}
              {prevLesson && (
                <button
                  onClick={() => navigateLesson(prevLesson.id)}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-background transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() => navigateLesson(nextLesson.id)}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-background transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Lesson Info */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{currentLesson.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentLesson.duration}</span>
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-base">{currentLesson.description}</p>

              {/* Actions — Desktop */}
              <div className="hidden md:flex flex-wrap items-center gap-4 pt-6 border-t border-border">
                <Button variant={isLiked ? 'default' : 'outline'} size="sm" onClick={handleLike} className={isLiked ? 'bg-success hover:bg-success/90' : ''}>
                  <ThumbsUp className="w-4 h-4 mr-2" /> Like
                </Button>
                <Button variant={isDisliked ? 'default' : 'outline'} size="sm" onClick={handleDislike} className={isDisliked ? 'bg-destructive hover:bg-destructive/90' : ''}>
                  <ThumbsDown className="w-4 h-4 mr-2" /> Dislike
                </Button>
                <Button variant={isCompleted ? 'default' : 'outline'} size="sm" onClick={handleMarkComplete} className={isCompleted ? 'bg-success hover:bg-success/90' : ''}>
                  <CheckCircle className="w-4 h-4 mr-2" /> {isCompleted ? 'Concluída' : 'Marcar como concluída'}
                </Button>
                <Button variant={isFavorite ? 'default' : 'outline'} size="sm" onClick={handleFavorite}>
                  {isFavorite ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                </Button>
              </div>

              {/* Actions — Mobile: 2-col grid with larger touch targets */}
              <div className="grid grid-cols-2 gap-4 md:hidden pt-6 border-t border-border">
                <Button variant={isLiked ? 'default' : 'outline'} onClick={handleLike} className={`w-full h-12 ${isLiked ? 'bg-success hover:bg-success/90' : ''}`}>
                  <ThumbsUp className="w-4 h-4 mr-2" /> Like
                </Button>
                <Button variant={isDisliked ? 'default' : 'outline'} onClick={handleDislike} className={`w-full h-12 ${isDisliked ? 'bg-destructive hover:bg-destructive/90' : ''}`}>
                  <ThumbsDown className="w-4 h-4 mr-2" /> Dislike
                </Button>
                <Button variant={isCompleted ? 'default' : 'outline'} onClick={handleMarkComplete} className={`w-full col-span-2 h-12 ${isCompleted ? 'bg-success hover:bg-success/90' : ''}`}>
                  <CheckCircle className="w-4 h-4 mr-2" /> {isCompleted ? 'Concluída' : 'Marcar como concluída'}
                </Button>
                <Button variant={isFavorite ? 'default' : 'outline'} onClick={handleFavorite} className="w-full h-12">
                  {isFavorite ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button variant="outline" className="w-full h-12">
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                </Button>
              </div>
            </div>

            {/* Resources */}
            {currentLesson.resources && currentLesson.resources.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5 md:p-8">
                <h3 className="font-semibold text-foreground text-lg mb-4 md:mb-6">Recursos da Aula</h3>
                <div className="space-y-3 md:space-y-4">
                  {currentLesson.resources.map((resource: any, idx: number) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 md:p-5 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <FileText className="w-6 h-6 text-info flex-shrink-0" />
                      <span className="text-foreground flex-1 font-medium">{resource.name}</span>
                      <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-card rounded-xl border border-border p-5 md:p-8">
              <h3 className="font-semibold text-foreground text-lg mb-6">Dúvidas ({lessonComments.length})</h3>
              
              {/* New Comment */}
              <div className="flex items-start space-x-3 mb-6">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback>{profile?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Escreva sua dúvida ou comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-input border-border resize-none"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {lessonComments.map(comment => {
                  const commenter = profilesMap[comment.userId];
                  const commenterName = commenter?.name || 'Usuário';
                  return (
                    <div key={comment.id} className="flex items-start space-x-3 p-4 rounded-lg bg-accent/30">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={commenter?.avatar || undefined} />
                        <AvatarFallback>{commenterName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-foreground">{commenterName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
                
                {lessonComments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma dúvida ainda. Seja o primeiro a comentar!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-96">
            <div className="sticky top-20 bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedLessons.length} de {courseLessons.length} aulas
                </p>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${userProgress?.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {courseLessons.map((lesson, idx) => {
                  const isCurrentLesson = lesson.id === lessonId;
                  const isLessonCompleted = completedLessons.includes(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      to={`/course/${courseId}/lesson/${lesson.id}`}
                      className={`flex items-center space-x-3 p-4 border-b border-border transition-colors ${
                        isCurrentLesson 
                          ? 'bg-accent border-l-4 border-l-primary' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isLessonCompleted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : isCurrentLesson ? (
                          <Play className="w-5 h-5 text-foreground" />
                        ) : lesson.locked ? (
                          <Lock className="w-5 h-5 text-destructive" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isCurrentLesson ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border space-y-3">
                {nextLesson && (
                  <Button className="w-full" onClick={() => navigateLesson(nextLesson.id)}>
                    Próxima aula
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button variant={isFavorite ? 'default' : 'outline'} className="w-full" onClick={handleFavorite}>
                  {isFavorite ? (
                    <><BookmarkCheck className="w-4 h-4 mr-2" /> Salvo</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-2" /> Salvar curso</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
