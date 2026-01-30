import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFromStorage, 
  setToStorage,
  STORAGE_KEYS, 
  Course, 
  Lesson, 
  User, 
  Progress,
  Comment,
  generateId
} from '@/lib/storage';
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
  Pause,
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newComment, setNewComment] = useState('');

  // Get data
  const courses = useMemo(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []), []);
  const allLessons = useMemo(() => getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, []), []);
  const users = useMemo(() => getFromStorage<User[]>(STORAGE_KEYS.USERS, []), []);
  const [allProgress, setAllProgress] = useState(() => getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []));
  const [comments, setComments] = useState(() => getFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []));

  const course = courses.find(c => c.id === courseId);
  const courseLessons = allLessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const currentLesson = courseLessons.find(l => l.id === lessonId);
  const instructor = users.find(u => u.id === course?.instructorId);
  
  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  // User progress
  const userProgress = allProgress.find(p => p.userId === user?.id && p.courseId === courseId);
  const isCompleted = userProgress?.completedLessons.includes(lessonId!) || false;
  const isLiked = userProgress?.liked?.includes(lessonId!) || false;
  const isDisliked = userProgress?.disliked?.includes(lessonId!) || false;
  const isFavorite = userProgress?.favorites?.includes(lessonId!) || false;

  // Lesson comments
  const lessonComments = comments.filter(c => c.lessonId === lessonId);

  // Update progress helper
  const updateProgress = (updater: (prev: Progress) => Progress) => {
    const existingProgress = allProgress.find(p => p.userId === user?.id && p.courseId === courseId);
    
    let newProgress: Progress;
    if (existingProgress) {
      newProgress = updater(existingProgress);
    } else {
      const defaultProgress: Progress = {
        userId: user!.id,
        courseId: courseId!,
        completedLessons: [],
        currentLesson: lessonId!,
        startedAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString(),
        progress: 0,
        liked: [],
        disliked: [],
        favorites: [],
      };
      newProgress = updater(defaultProgress);
    }

    // Calculate progress percentage
    const totalLessons = courseLessons.length;
    newProgress.progress = Math.round((newProgress.completedLessons.length / totalLessons) * 100);
    newProgress.lastAccessAt = new Date().toISOString();

    const updatedAllProgress = existingProgress
      ? allProgress.map(p => p.userId === user?.id && p.courseId === courseId ? newProgress : p)
      : [...allProgress, newProgress];

    setAllProgress(updatedAllProgress);
    setToStorage(STORAGE_KEYS.PROGRESS, updatedAllProgress);
  };

  // Actions
  const handleMarkComplete = () => {
    updateProgress(prev => ({
      ...prev,
      completedLessons: isCompleted 
        ? prev.completedLessons.filter(id => id !== lessonId)
        : [...prev.completedLessons, lessonId!],
    }));
    
    toast({
      title: isCompleted ? 'Aula desmarcada' : 'Aula concluída! 🎉',
      description: isCompleted ? 'A aula foi desmarcada como concluída' : 'Continue assim, você está arrasando!',
    });
  };

  const handleLike = () => {
    updateProgress(prev => ({
      ...prev,
      liked: isLiked ? prev.liked.filter(id => id !== lessonId) : [...prev.liked, lessonId!],
      disliked: prev.disliked.filter(id => id !== lessonId),
    }));
  };

  const handleDislike = () => {
    updateProgress(prev => ({
      ...prev,
      disliked: isDisliked ? prev.disliked.filter(id => id !== lessonId) : [...prev.disliked, lessonId!],
      liked: prev.liked.filter(id => id !== lessonId),
    }));
  };

  const handleFavorite = () => {
    updateProgress(prev => ({
      ...prev,
      favorites: isFavorite ? prev.favorites.filter(id => id !== lessonId) : [...prev.favorites, lessonId!],
    }));
    
    toast({
      title: isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: generateId(),
      lessonId: lessonId!,
      userId: user!.id,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setToStorage(STORAGE_KEYS.COMMENTS, updatedComments);
    setNewComment('');

    toast({ title: 'Comentário enviado!' });
  };

  const getCommentUser = (userId: string) => users.find(u => u.id === userId);

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
        <div className="container py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link to={`/course/${courseId}`} className="hover:text-foreground transition-colors">{course.title}</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{currentLesson.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black shadow-elegant">
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://player.vimeo.com/video/${currentLesson.vimeoId}?byline=0&portrait=0&title=0`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Navigation Arrows */}
              {prevLesson && (
                <button
                  onClick={() => navigate(`/course/${courseId}/lesson/${prevLesson.id}`)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() => navigate(`/course/${courseId}/lesson/${nextLesson.id}`)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Lesson Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentLesson.duration}</span>
                    </span>
                    <span>Módulo {currentLesson.order}</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">{currentLesson.description}</p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'bg-success hover:bg-success/90' : ''}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button
                  variant={isDisliked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleDislike}
                  className={isDisliked ? 'bg-destructive hover:bg-destructive/90' : ''}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Dislike
                </Button>
                <Button
                  variant={isCompleted ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleMarkComplete}
                  className={isCompleted ? 'bg-success hover:bg-success/90' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isCompleted ? 'Concluída' : 'Marcar como concluída'}
                </Button>
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleFavorite}
                >
                  {isFavorite ? (
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <Bookmark className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Resources */}
            {currentLesson.resources.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Recursos da Aula</h3>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <FileText className="w-5 h-5 text-info" />
                      <span className="text-foreground flex-1">{resource.name}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Card */}
            {instructor && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-border">
                    <AvatarImage src={instructor.avatar} />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{instructor.bio}</p>
                    {instructor.instagram && (
                      <a 
                        href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-info hover:text-info/80 mt-2"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>{instructor.instagram}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-6">Dúvidas ({lessonComments.length})</h3>
              
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
                    disabled={!newComment.trim()}
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
                  const commentUser = getCommentUser(comment.userId);
                  return (
                    <div key={comment.id} className="flex items-start space-x-3 p-4 rounded-lg bg-accent/30">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={commentUser?.avatar} />
                        <AvatarFallback>{commentUser?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">{commentUser?.name}</span>
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
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {userProgress?.completedLessons.length || 0} de {courseLessons.length} aulas
                </p>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${userProgress?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {courseLessons.map((lesson, idx) => {
                  const isCurrentLesson = lesson.id === lessonId;
                  const isLessonCompleted = userProgress?.completedLessons.includes(lesson.id);

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

              {/* Footer */}
              <div className="p-4 border-t border-border space-y-3">
                {nextLesson && (
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/course/${courseId}/lesson/${nextLesson.id}`)}
                  >
                    Próxima aula
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  className="w-full"
                  onClick={handleFavorite}
                >
                  {isFavorite ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-2" />
                      Salvo
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" />
                      Salvar curso
                    </>
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
