import React, { useState, useEffect, useMemo } from 'react';
import { Course, Category, Lesson, Module, getFromStorage, setToStorage, STORAGE_KEYS, generateId } from '@/lib/storage';
import { useAutosave } from '@/hooks/useAutosave';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course, lessons: Lesson[]) => void;
  course?: Course | null;
  existingLessons?: Lesson[];
  categories?: Category[];
}

interface LessonFormData {
  id: string;
  title: string;
  description: string;
  vimeoId: string;
  duration: string;
  order: number;
  resources: { type: 'pdf' | 'link'; name: string; url: string }[];
}

interface ModuleFormData {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonFormData[];
  expanded: boolean;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  course,
  existingLessons = [],
  categories = [],
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    thumbnail: '',
    categoryIds: [] as string[],
    subcategoryId: '',
    level: 'Iniciante' as Course['level'],
    status: 'draft' as Course['status'],
    totalDuration: '',
  });

  const [modules, setModules] = useState<ModuleFormData[]>([]);

  // Sequence config
  const [sequenceConfig, setSequenceConfig] = useState({
    isSequential: false,
    position: 1,
    isPillar: false,
    requiresPrevious: false,
    prerequisiteCourseId: '',
    unlocksAfter: '',
  });

  // Roadmap config
  const [roadmapConfig, setRoadmapConfig] = useState({
    showInRoadmap: false,
    roadmapPositionX: 1,
    roadmapPositionY: 1,
    roadmapIcon: 'Flag',
    roadmapLabel: '',
  });

  // Editing lesson modal
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: LessonFormData | null } | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    id: '',
    title: '',
    description: '',
    vimeoId: '',
    duration: '',
    order: 1,
    resources: [],
  });

  // Editing module modal
  const [editingModule, setEditingModule] = useState<ModuleFormData | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Autosave draft key
  const autosaveKey = course ? `course-draft-${course.id}` : 'course-draft-new';
  
  const autosaveData = useMemo(() => ({
    formData,
    modules: modules.map(m => ({ ...m, expanded: undefined })),
    sequenceConfig,
    roadmapConfig,
    activeTab,
  }), [formData, modules, sequenceConfig, roadmapConfig, activeTab]);

  const { lastSavedAt, loadDraft, clearDraft, hasDraft } = useAutosave(autosaveData, {
    key: autosaveKey,
    enabled: isOpen && formData.title.trim().length > 0,
  });

  // Check for existing draft on open
  useEffect(() => {
    if (isOpen) {
      const draft = loadDraft();
      if (draft) {
        const savedDate = new Date(draft.savedAt);
        const minutesAgo = (Date.now() - savedDate.getTime()) / 1000 / 60;
        // Only show banner if draft is less than 24 hours old
        if (minutesAgo < 1440) {
          setShowDraftBanner(true);
        } else {
          clearDraft();
        }
      } else {
        setShowDraftBanner(false);
      }
    }
  }, [isOpen]);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft?.data) {
      const d = draft.data as any;
      if (d.formData) setFormData(d.formData);
      if (d.modules) setModules(d.modules.map((m: any) => ({ ...m, expanded: true })));
      if (d.sequenceConfig) setSequenceConfig(d.sequenceConfig);
      if (d.roadmapConfig) setRoadmapConfig(d.roadmapConfig);
      if (d.activeTab) setActiveTab(d.activeTab);
      toast({ title: '✅ Rascunho restaurado!' });
    }
    setShowDraftBanner(false);
  };

  const dismissDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  useEffect(() => {
    console.log('[CourseFormModal] useEffect triggered', { 
      course: course?.id, 
      existingLessons: existingLessons.length,
      isOpen 
    });
    
    if (course) {
      console.log('[CourseFormModal] Loading course:', course.id, course.title);
      console.log('[CourseFormModal] Course modules:', course.modules);
      console.log('[CourseFormModal] Existing lessons for this course:', 
        existingLessons.filter(l => l.courseId === course.id).map(l => ({
          id: l.id,
          title: l.title,
          moduleId: l.moduleId,
          courseId: l.courseId
        }))
      );
      
      setFormData({
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        thumbnail: course.thumbnail || '',
        categoryIds: course.categoryIds || [course.category],
        subcategoryId: course.subcategoryId || '',
        level: course.level,
        status: course.status,
        totalDuration: course.totalDuration,
      });

      // Load modules with lessons
      const courseModules: ModuleFormData[] = (course.modules || []).map(mod => {
        console.log('[CourseFormModal] Processing module:', mod.id, mod.title);
        
        const moduleLessons = existingLessons
          .filter(l => {
            const match = l.moduleId === mod.id;
            console.log('[CourseFormModal] Checking lesson:', l.id, l.title, 'moduleId:', l.moduleId, 'vs mod.id:', mod.id, 'match:', match);
            return match;
          })
          .sort((a, b) => a.order - b.order)
          .map(l => ({
            id: l.id,
            title: l.title,
            description: l.description,
            vimeoId: l.vimeoId,
            duration: l.duration,
            order: l.order,
            resources: l.resources || [],
          }));

        console.log('[CourseFormModal] Module lessons found:', moduleLessons.length);
        
        return {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          order: mod.order,
          lessons: moduleLessons,
          expanded: true,
        };
      });
      
      console.log('[CourseFormModal] Final modules with lessons:', courseModules);
      setModules(courseModules);

      if (course.sequenceConfig) {
        setSequenceConfig({
          isSequential: course.sequenceConfig.isSequential,
          position: course.sequenceConfig.position,
          isPillar: course.sequenceConfig.isPillar,
          requiresPrevious: course.sequenceConfig.requiresPrevious,
          prerequisiteCourseId: course.sequenceConfig.prerequisiteCourseId || '',
          unlocksAfter: course.sequenceConfig.unlocksAfter || '',
        });
      }

      if (course.roadmapConfig) {
        setRoadmapConfig({
          showInRoadmap: course.roadmapConfig.showInRoadmap,
          roadmapPositionX: course.roadmapConfig.roadmapPosition?.x || 1,
          roadmapPositionY: course.roadmapConfig.roadmapPosition?.y || 1,
          roadmapIcon: course.roadmapConfig.roadmapIcon,
          roadmapLabel: course.roadmapConfig.roadmapLabel,
        });
      }
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        thumbnail: '',
        categoryIds: [],
        subcategoryId: '',
        level: 'Iniciante',
        status: 'draft',
        totalDuration: '',
      });
      setModules([]);
      setSequenceConfig({
        isSequential: false,
        position: 1,
        isPillar: false,
        requiresPrevious: false,
        prerequisiteCourseId: '',
        unlocksAfter: '',
      });
      setRoadmapConfig({
        showInRoadmap: false,
        roadmapPositionX: 1,
        roadmapPositionY: 1,
        roadmapIcon: 'Flag',
        roadmapLabel: '',
      });
    }
    setActiveTab('basic');
  }, [course, existingLessons, isOpen]);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    if (formData.categoryIds.length === 0) {
      toast({ title: 'Selecione pelo menos uma categoria', variant: 'destructive' });
      return;
    }

    // Build course object
    const courseData: Course = {
      id: course?.id || generateId(),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      thumbnail: formData.thumbnail || undefined,
      instructorId: course?.instructorId || 'admin',
      category: formData.categoryIds[0],
      categoryIds: formData.categoryIds,
      subcategoryId: formData.subcategoryId || undefined,
      level: formData.level,
      status: formData.status,
      locked: false,
      totalDuration: formData.totalDuration || calculateTotalDuration(),
      createdAt: course?.createdAt || new Date().toISOString(),
      modules: modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        lessonIds: m.lessons.map(l => l.id),
      })),
      sequenceConfig: sequenceConfig.isSequential ? {
        isSequential: sequenceConfig.isSequential,
        position: sequenceConfig.position,
        isPillar: sequenceConfig.isPillar,
        requiresPrevious: sequenceConfig.requiresPrevious,
        prerequisiteCourseId: sequenceConfig.prerequisiteCourseId || null,
        unlocksAfter: sequenceConfig.unlocksAfter || null,
      } : undefined,
      roadmapConfig: roadmapConfig.showInRoadmap ? {
        showInRoadmap: roadmapConfig.showInRoadmap,
        roadmapPosition: { x: roadmapConfig.roadmapPositionX, y: roadmapConfig.roadmapPositionY },
        roadmapIcon: roadmapConfig.roadmapIcon,
        roadmapLabel: roadmapConfig.roadmapLabel,
      } : undefined,
    };

    // Build lessons array
    const lessonsData: Lesson[] = modules.flatMap(m =>
      m.lessons.map(l => ({
        id: l.id,
        courseId: courseData.id,
        moduleId: m.id,
        title: l.title,
        description: l.description,
        vimeoId: l.vimeoId,
        duration: l.duration,
        order: l.order,
        locked: false,
        resources: l.resources,
      }))
    );

    clearDraft();
    onSave(courseData, lessonsData);
  };

  const calculateTotalDuration = (): string => {
    let totalMinutes = 0;
    modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.duration) {
          const parts = l.duration.split(':');
          if (parts.length === 2) {
            totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
          } else if (parts.length === 3) {
            totalMinutes += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
          }
        }
      });
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:00`;
  };

  // Module functions
  const addModule = () => {
    const newModule: ModuleFormData = {
      id: generateId(),
      title: `Módulo ${modules.length + 1}`,
      description: '',
      order: modules.length + 1,
      lessons: [],
      expanded: true,
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleId: string, updates: Partial<ModuleFormData>) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, expanded: !m.expanded } : m));
  };

  // Lesson functions
  const openLessonModal = (moduleId: string, lesson?: LessonFormData) => {
    if (lesson) {
      setLessonForm({ ...lesson });
    } else {
      const module = modules.find(m => m.id === moduleId);
      setLessonForm({
        id: generateId(),
        title: '',
        description: '',
        vimeoId: '',
        duration: '',
        order: (module?.lessons.length || 0) + 1,
        resources: [],
      });
    }
    setEditingLesson({ moduleId, lesson: lesson || null });
  };

  const saveLesson = () => {
    if (!editingLesson) return;
    
    if (!lessonForm.title.trim()) {
      toast({ title: 'Título da aula é obrigatório', variant: 'destructive' });
      return;
    }

    setModules(modules.map(m => {
      if (m.id !== editingLesson.moduleId) return m;
      
      if (editingLesson.lesson) {
        // Editing existing lesson
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonForm.id ? lessonForm : l),
        };
      } else {
        // Adding new lesson
        return {
          ...m,
          lessons: [...m.lessons, lessonForm],
        };
      }
    }));

    setEditingLesson(null);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId),
      };
    }));
  };

  const addResource = () => {
    setLessonForm({
      ...lessonForm,
      resources: [...lessonForm.resources, { type: 'link', name: '', url: '' }],
    });
  };

  const updateResource = (index: number, updates: Partial<{ type: 'pdf' | 'link'; name: string; url: string }>) => {
    const newResources = [...lessonForm.resources];
    newResources[index] = { ...newResources[index], ...updates };
    setLessonForm({ ...lessonForm, resources: newResources });
  };

  const removeResource = (index: number) => {
    setLessonForm({
      ...lessonForm,
      resources: lessonForm.resources.filter((_, i) => i !== index),
    });
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const selectedCategory = categories.find(c => formData.categoryIds.includes(c.id));
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-foreground text-xl flex items-center gap-3">
              {course ? 'Editar Curso' : 'Novo Curso'}
              {lastSavedAt && (
                <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Rascunho salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {showDraftBanner && (
            <Alert className="bg-accent/50 border-accent flex-shrink-0">
              <RotateCcw className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between w-full">
                <span className="text-sm">Você tem um rascunho não salvo. Deseja restaurá-lo?</span>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={dismissDraft}>
                    Descartar
                  </Button>
                  <Button size="sm" onClick={restoreDraft}>
                    Restaurar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="bg-secondary border border-border w-full justify-start flex-shrink-0">
              <TabsTrigger value="basic">Informações</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 m-0 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título do Curso *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Marketing Digital Avançado"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Descrição curta"
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição completa do curso..."
                    className="bg-input border-border min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail (URL)</Label>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://..."
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 400x600px (proporção 2:3)</p>
                  {formData.thumbnail && (
                    <img 
                      src={formData.thumbnail} 
                      alt="Preview" 
                      className="w-24 h-36 rounded object-cover mt-2"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Categorias *</Label>
                  <div className="bg-background/50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={formData.categoryIds.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <label htmlFor={`cat-${cat.id}`} className="text-sm text-foreground">
                          {cat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {subcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select
                      value={formData.subcategoryId}
                      onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {subcategories.map(sub => (
                          <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração Total</Label>
                    <Input
                      value={formData.totalDuration}
                      onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                      placeholder="HH:MM:SS"
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 m-0 pr-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">📚 Módulos e Aulas</Label>
                  <Button onClick={addModule} size="sm" variant="outline" className="gap-1">
                    <Plus className="w-4 h-4" /> Adicionar Módulo
                  </Button>
                </div>

                {modules.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">Nenhum módulo criado</p>
                    <Button onClick={addModule} variant="outline" className="gap-1">
                      <Plus className="w-4 h-4" /> Criar Primeiro Módulo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, mIndex) => (
                      <div key={module.id} className="border border-border rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <div className="bg-secondary/50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <button onClick={() => toggleModuleExpanded(module.id)}>
                              {module.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <span className="font-medium text-foreground">📂 {module.title}</span>
                            <span className="text-xs text-muted-foreground">({module.lessons.length} aulas)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setModuleForm({ title: module.title, description: module.description });
                                setEditingModule(module);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteModule(module.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Module Content */}
                        {module.expanded && (
                          <div className="p-4 space-y-2">
                            {module.lessons.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma aula neste módulo
                              </p>
                            ) : (
                              module.lessons.map((lesson, lIndex) => (
                                <div key={lesson.id} className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                    <span className="text-sm">📹 {lesson.title}</span>
                                    <span className="text-xs text-muted-foreground">ID: {lesson.vimeoId}</span>
                                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openLessonModal(module.id, lesson)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => deleteLesson(module.id, lesson.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-1 mt-2"
                              onClick={() => openLessonModal(module.id)}
                            >
                              <Plus className="w-4 h-4" /> Adicionar Aula
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6 m-0 pr-4">
                {/* Sequence Config */}
                <div className="space-y-4 border border-border rounded-lg p-4">
                  <Label className="text-base font-semibold">🔒 Configurações de Sequência</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSequential"
                      checked={sequenceConfig.isSequential}
                      onCheckedChange={(checked) => setSequenceConfig({ ...sequenceConfig, isSequential: !!checked })}
                    />
                    <label htmlFor="isSequential" className="text-sm">
                      Este curso faz parte de uma sequência
                    </label>
                  </div>

                  {sequenceConfig.isSequential && (
                    <div className="space-y-4 pl-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={sequenceConfig.isPillar ? 'pillar' : 'complementary'}
                            onValueChange={(v) => setSequenceConfig({ ...sequenceConfig, isPillar: v === 'pillar' })}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="pillar">Pilar do Método (Obrigatório)</SelectItem>
                              <SelectItem value="complementary">Complementar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Posição na Sequência</Label>
                          <Input
                            type="number"
                            value={sequenceConfig.position}
                            onChange={(e) => setSequenceConfig({ ...sequenceConfig, position: parseInt(e.target.value) || 1 })}
                            className="bg-input border-border"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiresPrevious"
                          checked={sequenceConfig.requiresPrevious}
                          onCheckedChange={(checked) => setSequenceConfig({ ...sequenceConfig, requiresPrevious: !!checked })}
                        />
                        <label htmlFor="requiresPrevious" className="text-sm">
                          Requer curso anterior
                        </label>
                      </div>

                      {sequenceConfig.requiresPrevious && (
                        <div className="space-y-2">
                          <Label>Curso Necessário (ID)</Label>
                          <Input
                            value={sequenceConfig.prerequisiteCourseId}
                            onChange={(e) => setSequenceConfig({ ...sequenceConfig, prerequisiteCourseId: e.target.value })}
                            placeholder="ID do curso pré-requisito"
                            className="bg-input border-border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Roadmap Config */}
                <div className="space-y-4 border border-border rounded-lg p-4">
                  <Label className="text-base font-semibold">🗺️ Configurações do Roadmap</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInRoadmap"
                      checked={roadmapConfig.showInRoadmap}
                      onCheckedChange={(checked) => setRoadmapConfig({ ...roadmapConfig, showInRoadmap: !!checked })}
                    />
                    <label htmlFor="showInRoadmap" className="text-sm">
                      Mostrar no Roadmap de Progresso
                    </label>
                  </div>

                  {roadmapConfig.showInRoadmap && (
                    <div className="space-y-4 pl-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Posição X (Coluna)</Label>
                          <Input
                            type="number"
                            value={roadmapConfig.roadmapPositionX}
                            onChange={(e) => setRoadmapConfig({ ...roadmapConfig, roadmapPositionX: parseInt(e.target.value) || 1 })}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Posição Y (Linha)</Label>
                          <Input
                            type="number"
                            value={roadmapConfig.roadmapPositionY}
                            onChange={(e) => setRoadmapConfig({ ...roadmapConfig, roadmapPositionY: parseInt(e.target.value) || 1 })}
                            className="bg-input border-border"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ícone</Label>
                          <Select
                            value={roadmapConfig.roadmapIcon}
                            onValueChange={(v) => setRoadmapConfig({ ...roadmapConfig, roadmapIcon: v })}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="Flag">🚩 Flag</SelectItem>
                              <SelectItem value="Star">⭐ Star</SelectItem>
                              <SelectItem value="Trophy">🏆 Trophy</SelectItem>
                              <SelectItem value="Target">🎯 Target</SelectItem>
                              <SelectItem value="BookOpen">📚 BookOpen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={roadmapConfig.roadmapLabel}
                            onChange={(e) => setRoadmapConfig({ ...roadmapConfig, roadmapLabel: e.target.value })}
                            placeholder="Ex: Pilar 1, Complementar"
                            className="bg-input border-border"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={() => {
              setFormData({ ...formData, status: 'draft' });
              handleSubmit();
            }}>
              Salvar como Rascunho
            </Button>
            <Button onClick={() => {
              setFormData({ ...formData, status: 'published' });
              handleSubmit();
            }}>
              {course ? 'Salvar Curso' : 'Publicar Curso'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingLesson?.lesson ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="space-y-2">
              <Label>Título da Aula *</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Título da aula"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Descrição da aula"
                className="bg-input border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vimeo ID</Label>
                <Input
                  value={lessonForm.vimeoId}
                  onChange={(e) => setLessonForm({ ...lessonForm, vimeoId: e.target.value })}
                  placeholder="123456789 (opcional)"
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">Apenas o ID numérico</p>
              </div>
              <div className="space-y-2">
                <Label>Duração</Label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="15:30"
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <Label>Recursos</Label>
              {lessonForm.resources.map((res, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Select
                    value={res.type}
                    onValueChange={(v) => updateResource(idx, { type: v as 'pdf' | 'link' })}
                  >
                    <SelectTrigger className="w-24 bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={res.name}
                    onChange={(e) => updateResource(idx, { name: e.target.value })}
                    placeholder="Nome"
                    className="bg-input border-border flex-1"
                  />
                  <Input
                    value={res.url}
                    onChange={(e) => updateResource(idx, { url: e.target.value })}
                    placeholder="URL"
                    className="bg-input border-border flex-1"
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeResource(idx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addResource} className="gap-1">
                <Plus className="w-4 h-4" /> Adicionar Recurso
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setEditingLesson(null)}>
              Cancelar
            </Button>
            <Button onClick={saveLesson}>
              Salvar Aula
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Module Modal */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="bg-card border-border max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="space-y-2">
              <Label>Título do Módulo</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Título do módulo"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Descrição do módulo"
                className="bg-input border-border"
              />
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setEditingModule(null)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (editingModule) {
                updateModule(editingModule.id, moduleForm);
                setEditingModule(null);
              }
            }}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseFormModal;
