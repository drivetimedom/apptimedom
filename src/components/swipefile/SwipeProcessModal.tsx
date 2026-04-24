import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Edit2, MoreVertical, ExternalLink, Copy, Calendar, User, Tag, FolderOpen, Link as LinkIcon, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSwipeFileTypes, useSwipeFileCategories, useSwipeFileMaterials } from '@/hooks/useSwipeFile';
import StarMultiSelect from './StarMultiSelect';
import { Badge } from '@/components/ui/badge';

export interface SwipeProcess {
  id: string;
  title: string;
  description: string;
  code?: string;
  category: string;
  type: string;
  tags: string[];
  content: string;
  links: { label: string; url: string }[];
  pdfs: { label: string; url: string }[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  typeId?: string | null;
  categoryId?: string | null;
  parentFolderIds?: string[];
  featuredFolderIds?: string[];
  relatedProcessIds?: string[];
  featuredProcessIds?: string[];
}

interface SwipeProcessModalProps {
  process: SwipeProcess | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (process: SwipeProcess) => void;
  isAdmin: boolean;
  categories: string[];
  isCreateMode?: boolean;
  defaultType?: string;
  onOpenProcess?: (process: SwipeProcess) => void;
}

// Fallback types if none are configured
const fallbackTypes = [
  'Processo',
  'Script',
  'Coleção',
  'Checklist',
  'Guia',
  'Template',
  'Referência'
];
// Sub-component to display featured relationships in view mode
const FeaturedRelationships: React.FC<{
  featuredFolderIds: string[];
  featuredProcessIds: string[];
  allMaterials: any[];
  onOpenProcess?: (processId: string) => void;
}> = ({ featuredFolderIds, featuredProcessIds, allMaterials, onOpenProcess }) => {
  const featuredFolders = useMemo(
    () => allMaterials.filter(m => featuredFolderIds.includes(m.id)),
    [allMaterials, featuredFolderIds]
  );
  const featuredProcesses = useMemo(
    () => allMaterials.filter(m => featuredProcessIds.includes(m.id)),
    [allMaterials, featuredProcessIds]
  );

  if (featuredFolders.length === 0 && featuredProcesses.length === 0) return null;

  return (
    <div className="border-t border-border pt-5 space-y-4">
      {/* Metodologias — badges discretos */}
      {featuredFolders.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Metodologias</p>
          <div className="flex flex-wrap gap-2">
            {featuredFolders.map(folder => (
              <Badge
                key={folder.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors text-xs"
                onClick={() => onOpenProcess?.(folder.id)}
              >
                {folder.title}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {/* Processos Relacionados — lista simples */}
      {featuredProcesses.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Ver também</p>
          <div className="space-y-1">
            {featuredProcesses.map(related => (
              <button
                key={related.id}
                onClick={() => onOpenProcess?.(related.id)}
                className="flex items-center gap-2 w-full text-left text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors py-0.5"
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {related.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SwipeProcessModal: React.FC<SwipeProcessModalProps> = ({
  process,
  isOpen,
  onClose,
  onSave,
  isAdmin,
  categories,
  isCreateMode = false,
  defaultType,
  onOpenProcess,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(isCreateMode);
  
  // Load dynamic types and categories from Supabase
  const { data: typesData = [] } = useSwipeFileTypes();
  const { data: categoriesData = [] } = useSwipeFileCategories();
  const { data: allMaterials = [] } = useSwipeFileMaterials();

  // Relationship state
  const [parentFolderIds, setParentFolderIds] = useState<string[]>([]);
  const [featuredFolderIds, setFeaturedFolderIds] = useState<string[]>([]);
  const [relatedProcessIds, setRelatedProcessIds] = useState<string[]>([]);
  const [featuredProcessIds, setFeaturedProcessIds] = useState<string[]>([]);
  // Find the "Pasta" type ID for creating new folders
  const pastaTypeId = useMemo(() => {
    return typesData.find(t => t.name === 'Pasta')?.id || null;
  }, [typesData]);

  // Available folders (type = Pasta, excluding current)
  const availableFolders = useMemo(() => {
    return allMaterials
      .filter(m => {
        const typeName = m.type?.name || '';
        return typeName === 'Pasta' && m.id !== process?.id;
      })
      .map(m => ({ id: m.id, name: m.title, icon: '📂' }));
  }, [allMaterials, process?.id]);

  // Available processes (type != Pasta, excluding current)
  const availableProcesses = useMemo(() => {
    return allMaterials
      .filter(m => {
        const typeName = m.type?.name || '';
        return typeName !== 'Pasta' && m.id !== process?.id;
      })
      .map(m => ({ id: m.id, name: m.title, icon: m.type?.icon || '📄' }));
  }, [allMaterials, process?.id]);

  // Get available types (from database or fallback)
  const availableTypes = typesData.length > 0 
    ? typesData.map(t => t.name) 
    : fallbackTypes;

  // Get available categories (from database or prop fallback)
  const availableCategories = categoriesData.length > 0
    ? categoriesData.map(c => c.name)
    : categories;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    category: '',
    type: availableTypes[0] || 'Processo',
    tags: '',
    content: '',
    links: '',
    pdfs: '',
  });

  // Determine if current type is "Pasta"
  const isFolderType = formData.type === 'Pasta';

  useEffect(() => {
    if (process && !isCreateMode) {
      setFormData({
        title: process.title,
        description: process.description,
        code: process.code || '',
        category: process.category,
        type: process.type || 'Processo',
        tags: process.tags.join(', '),
        content: process.content,
        links: process.links.map(l => `${l.label}|${l.url}`).join('\n'),
        pdfs: process.pdfs?.map(p => `${p.label}|${p.url}`).join('\n') || '',
      });
      setParentFolderIds(process.parentFolderIds || []);
      setFeaturedFolderIds(process.featuredFolderIds || []);
      setRelatedProcessIds(process.relatedProcessIds || []);
      setFeaturedProcessIds(process.featuredProcessIds || []);
      setIsEditing(false);
    } else if (isCreateMode) {
      setFormData({
        title: '',
        description: '',
        code: '',
        category: '',
        type: defaultType || 'Processo',
        tags: '',
        content: '',
        links: '',
        pdfs: '',
      });
      setParentFolderIds([]);
      setFeaturedFolderIds([]);
      setRelatedProcessIds([]);
      setFeaturedProcessIds([]);
      setIsEditing(true);
    }
  }, [process, isCreateMode, defaultType]);

  // Compute sorted non-folder processes by code for navigation
  const sortedProcesses = useMemo(() => {
    return allMaterials
      .filter(m => {
        const typeName = m.type?.name || '';
        return typeName !== 'Pasta' && m.code;
      })
      .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  }, [allMaterials]);

  const currentIndex = useMemo(() => {
    if (!process?.code) return -1;
    return sortedProcesses.findIndex(p => p.id === process.id);
  }, [sortedProcesses, process]);

  const previousProcess = currentIndex > 0 ? sortedProcesses[currentIndex - 1] : null;
  const nextProcess = currentIndex >= 0 && currentIndex < sortedProcesses.length - 1 ? sortedProcesses[currentIndex + 1] : null;

  const navigateTo = useCallback((material: any) => {
    if (onOpenProcess) {
      // Build a SwipeProcess-compatible object
      const proc: SwipeProcess = {
        id: material.id,
        title: material.title,
        description: material.description || '',
        code: material.code || undefined,
        category: material.category?.name || 'Sem categoria',
        type: material.type?.name || 'Processo',
        tags: material.tags || [],
        content: material.content || '',
        links: Array.isArray(material.links) ? material.links : [],
        pdfs: Array.isArray(material.pdfs) ? material.pdfs : [],
        createdAt: material.created_at,
        updatedAt: material.updated_at,
        typeId: material.type_id,
        categoryId: material.category_id,
        parentFolderIds: material.parent_folder_ids || [],
        featuredFolderIds: material.featured_folder_ids || [],
        relatedProcessIds: material.related_process_ids || [],
        featuredProcessIds: material.featured_process_ids || [],
      };
      onOpenProcess(proc);
    }
  }, [onOpenProcess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (isEditing) return; // Don't navigate while editing
      if (e.key === 'ArrowLeft' && previousProcess) {
        e.preventDefault();
        navigateTo(previousProcess);
      } else if (e.key === 'ArrowRight' && nextProcess) {
        e.preventDefault();
        navigateTo(nextProcess);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isEditing, previousProcess, nextProcess, navigateTo]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.title || !formData.category) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const parseLinks = (str: string) =>
      str.split('\n').filter(l => l.includes('|')).map(l => {
        const [label, url] = l.split('|');
        return { label: label.trim(), url: url.trim() };
      });

    const updatedProcess: SwipeProcess = {
      id: process?.id || '',
      title: formData.title,
      description: formData.description,
      code: formData.code.trim().toUpperCase() || undefined,
      category: formData.category,
      type: formData.type,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      content: formData.content,
      links: parseLinks(formData.links),
      pdfs: parseLinks(formData.pdfs),
      createdAt: process?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: process?.createdBy,
      parentFolderIds: isFolderType ? [] : parentFolderIds,
      featuredFolderIds: isFolderType ? [] : featuredFolderIds,
      relatedProcessIds: isFolderType ? [] : relatedProcessIds,
      featuredProcessIds: isFolderType ? [] : featuredProcessIds,
    };

    onSave?.(updatedProcess);
    setIsEditing(false);
    if (isCreateMode) {
      onClose();
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-foreground mt-3 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="text-foreground ml-4 list-disc">
              {line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('<strong>').map((part, j) => {
                if (part.includes('</strong>')) {
                  const [bold, rest] = part.split('</strong>');
                  return <React.Fragment key={j}><strong className="font-semibold">{bold}</strong>{rest}</React.Fragment>;
                }
                return part;
              })}
            </li>
          );
        }
        if (line.match(/^\d+\. /)) {
          return (
            <li key={i} className="text-foreground ml-4 list-decimal">
              {line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('<strong>').map((part, j) => {
                if (part.includes('</strong>')) {
                  const [bold, rest] = part.split('</strong>');
                  return <React.Fragment key={j}><strong className="font-semibold">{bold}</strong>{rest}</React.Fragment>;
                }
                return part;
              })}
            </li>
          );
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-foreground">{line}</p>;
      });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-[95vw] max-h-[90vh] bg-background border border-border rounded-2xl shadow-lg z-[9999] overflow-hidden animate-scale-in flex flex-col">
        {/* Navigation Bar */}
        {!isEditing && !isCreateMode && process?.code && sortedProcesses.length > 1 && (
          <div className="bg-muted/30 border-b border-border px-6 py-2.5 flex items-center justify-between flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => previousProcess && navigateTo(previousProcess)}
              disabled={!previousProcess}
              className="gap-1.5 h-8 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              {previousProcess?.code || 'Início'}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">{process.code}</span>
              {currentIndex >= 0 && (
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {sortedProcesses.length}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => nextProcess && navigateTo(nextProcess)}
              disabled={!nextProcess}
              className="gap-1.5 h-8 text-xs"
            >
              {nextProcess?.code || 'Fim'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5 flex items-start justify-between flex-shrink-0">
          {isEditing ? (
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do processo *"
              className="text-xl font-bold bg-card border-2 border-border focus:border-muted-foreground h-12 flex-1 mr-4"
            />
          ) : (
            <h2 className="text-2xl font-bold text-foreground flex-1 break-words leading-tight">
              {process?.title || 'Novo Processo'}
            </h2>
          )}
          
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && !isCreateMode && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            )}
            
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isCreateMode) {
                      onClose();
                    } else {
                      setIsEditing(false);
                      if (process) {
                        setFormData({
                          title: process.title,
                          description: process.description,
                          code: process.code || '',
                          category: process.category,
                          type: process.type || 'Processo',
                          tags: process.tags.join(', '),
                          content: process.content,
                          links: process.links.map(l => `${l.label}|${l.url}`).join('\n'),
                          pdfs: process.pdfs?.map(p => `${p.label}|${p.url}`).join('\n') || '',
                        });
                      }
                    }
                  }}
                  className="h-9 px-4"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-9 px-4"
                >
                  {isCreateMode ? 'Criar Processo' : 'Salvar'}
                </Button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Code field */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SC001, PR015, CK003"
                  maxLength={20}
                  className="bg-card border-border h-11 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Código único para identificação rápida (opcional)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="bg-card border-border h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[10000]">
                      {availableCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="bg-card border-border h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[10000]">
                      {availableTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do processo"
                  className="bg-card border-border h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags (separadas por vírgula)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="bg-card border-border h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conteúdo (Markdown)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descreva o processo..."
                  className="bg-card border-border min-h-[200px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links (formato: Nome|URL, um por linha)</Label>
                <Textarea
                  value={formData.links}
                  onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                  placeholder="Template|https://exemplo.com/template"
                  className="bg-card border-border"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">PDFs (formato: Nome|URL, um por linha)</Label>
                <Textarea
                  value={formData.pdfs}
                  onChange={(e) => setFormData({ ...formData, pdfs: e.target.value })}
                  placeholder="Documento|https://exemplo.com/doc.pdf"
                  className="bg-card border-border"
                  rows={3}
                />
              </div>

              {/* Relationship Fields (only for non-Pasta types) */}
              {!isFolderType && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Metodologias (Pastas Pai) — ⭐ = Aparece publicamente
                    </Label>
                    <StarMultiSelect
                      items={availableFolders}
                      selectedIds={parentFolderIds}
                      featuredIds={featuredFolderIds}
                      onSelectionChange={setParentFolderIds}
                      onFeaturedChange={setFeaturedFolderIds}
                      emptyMessage="Nenhuma pasta disponível"
                      allowCreate
                      createLabel="Pasta"
                      createTypeId={pastaTypeId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Processos Relacionados — ⭐ = Aparece publicamente
                    </Label>
                    <StarMultiSelect
                      items={availableProcesses}
                      selectedIds={relatedProcessIds}
                      featuredIds={featuredProcessIds}
                      onSelectionChange={setRelatedProcessIds}
                      onFeaturedChange={setFeaturedProcessIds}
                      emptyMessage="Nenhum processo disponível"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {process?.code && (
                  <span className="inline-flex items-center text-xs font-mono font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded">
                    {process.code}
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  {process?.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4" />
                  {process?.type || 'Processo'}
                </span>
                {process?.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Criado em {formatDate(process.createdAt)}
                  </span>
                )}
                {process?.createdBy && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {process.createdBy}
                  </span>
                )}
              </div>

              {/* Description */}
              {process?.description && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Descrição</Label>
                  <div className="bg-card/50 p-4 rounded-lg border-l-[3px] border-border">
                    <p className="text-foreground whitespace-pre-wrap">{process.description}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {process?.tags && process.tags.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {process.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links & PDFs — seção principal em destaque */}
              {((process?.links && process.links.length > 0) || (process?.pdfs && process.pdfs.length > 0)) && (
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-5 space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    Links e Recursos
                  </h3>
                  {process?.links && process.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="bg-background rounded-lg p-4 border border-border"
                    >
                      <p className="font-medium text-foreground mb-3">{link.label}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(link.url, '_blank')}
                          className="flex-1 gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir Link
                        </Button>
                        <button
                          onClick={() => handleCopyLink(link.url)}
                          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border border-border"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {process?.pdfs && process.pdfs.map((pdf, idx) => (
                    <div
                      key={idx}
                      className="bg-background rounded-lg p-4 border border-border"
                    >
                      <p className="font-medium text-foreground mb-3">{pdf.label}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(pdf.url, '_blank')}
                          className="flex-1 gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver Documento
                        </Button>
                        <button
                          onClick={() => handleCopyLink(pdf.url)}
                          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border border-border"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              {process?.content && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Conteúdo</Label>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {renderMarkdown(process.content)}
                  </div>
                </div>
              )}

              {/* Processes inside this folder */}
              {process && isFolderType && (() => {
                const folderProcesses = allMaterials.filter(m => 
                  (m.parent_folder_ids || []).includes(process.id) && m.id !== process.id
                );
                return (
                  <div className="border-t border-border pt-6">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Processos desta Metodologia
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      {folderProcesses.length} processo{folderProcesses.length !== 1 ? 's' : ''} nesta metodologia
                    </p>
                    {folderProcesses.length > 0 ? (
                      <div className="space-y-2">
                        {folderProcesses.map((mat, index) => (
                          <button
                            key={mat.id}
                            onClick={() => {
                              if (onOpenProcess) {
                                const proc: SwipeProcess = {
                                  id: mat.id,
                                  title: mat.title,
                                  description: mat.description || '',
                                  category: mat.category?.name || 'Sem categoria',
                                  type: mat.type?.name || 'Processo',
                                  tags: mat.tags || [],
                                  content: mat.content || '',
                                  links: Array.isArray(mat.links) ? mat.links : [],
                                  pdfs: Array.isArray(mat.pdfs) ? mat.pdfs : [],
                                  createdAt: mat.created_at,
                                  updatedAt: mat.updated_at,
                                  typeId: mat.type_id,
                                  categoryId: mat.category_id,
                                  parentFolderIds: mat.parent_folder_ids || [],
                                  featuredFolderIds: mat.featured_folder_ids || [],
                                  relatedProcessIds: mat.related_process_ids || [],
                                  featuredProcessIds: mat.featured_process_ids || [],
                                };
                                onOpenProcess(proc);
                              }
                            }}
                            className="flex items-center gap-3 w-full p-4 border border-border rounded-lg hover:bg-accent hover:border-primary transition-all cursor-pointer group text-left"
                          >
                            <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{mat.type?.name || 'Processo'}</Badge>
                                <span className="text-sm font-medium text-foreground truncate">{mat.title}</span>
                              </div>
                              {mat.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{mat.description}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum processo nesta metodologia ainda</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Featured Relationships */}
              {process && !isFolderType && (
                <FeaturedRelationships
                  featuredFolderIds={process.featuredFolderIds || []}
                  featuredProcessIds={process.featuredProcessIds || []}
                  allMaterials={allMaterials}
                  onOpenProcess={onOpenProcess ? (id) => {
                    const mat = allMaterials.find(m => m.id === id);
                    if (mat) {
                      const proc: SwipeProcess = {
                        id: mat.id,
                        title: mat.title,
                        description: mat.description || '',
                        category: mat.category?.name || 'Sem categoria',
                        type: mat.type?.name || 'Processo',
                        tags: mat.tags || [],
                        content: mat.content || '',
                        links: Array.isArray(mat.links) ? mat.links : [],
                        pdfs: Array.isArray(mat.pdfs) ? mat.pdfs : [],
                        createdAt: mat.created_at,
                        updatedAt: mat.updated_at,
                        typeId: mat.type_id,
                        categoryId: mat.category_id,
                        parentFolderIds: mat.parent_folder_ids || [],
                        featuredFolderIds: mat.featured_folder_ids || [],
                        relatedProcessIds: mat.related_process_ids || [],
                        featuredProcessIds: mat.featured_process_ids || [],
                      };
                      onOpenProcess(proc);
                    }
                  } : undefined}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SwipeProcessModal;
