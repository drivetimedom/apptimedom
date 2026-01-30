import React, { useState, useEffect } from 'react';
import { X, Edit2, MoreVertical, ExternalLink, Copy, Calendar, User, Tag, FolderOpen } from 'lucide-react';
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
import { useSwipeFileTypes, useSwipeFileCategories } from '@/hooks/useSwipeFile';

export interface SwipeProcess {
  id: string;
  title: string;
  description: string;
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
}

interface SwipeProcessModalProps {
  process: SwipeProcess | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (process: SwipeProcess) => void;
  isAdmin: boolean;
  categories: string[];
  isCreateMode?: boolean;
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

const SwipeProcessModal: React.FC<SwipeProcessModalProps> = ({
  process,
  isOpen,
  onClose,
  onSave,
  isAdmin,
  categories,
  isCreateMode = false,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(isCreateMode);
  
  // Load dynamic types and categories from Supabase
  const { data: typesData = [] } = useSwipeFileTypes();
  const { data: categoriesData = [] } = useSwipeFileCategories();

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
    category: '',
    type: availableTypes[0] || 'Processo',
    tags: '',
    content: '',
    links: '',
    pdfs: '',
  });

  useEffect(() => {
    if (process && !isCreateMode) {
      setFormData({
        title: process.title,
        description: process.description,
        category: process.category,
        type: process.type || 'Processo',
        tags: process.tags.join(', '),
        content: process.content,
        links: process.links.map(l => `${l.label}|${l.url}`).join('\n'),
        pdfs: process.pdfs?.map(p => `${p.label}|${p.url}`).join('\n') || '',
      });
      setIsEditing(false);
    } else if (isCreateMode) {
      setFormData({
        title: '',
        description: '',
        category: '',
        type: 'Processo',
        tags: '',
        content: '',
        links: '',
        pdfs: '',
      });
      setIsEditing(true);
    }
  }, [process, isCreateMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
      category: formData.category,
      type: formData.type,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      content: formData.content,
      links: parseLinks(formData.links),
      pdfs: parseLinks(formData.pdfs),
      createdAt: process?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: process?.createdBy,
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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-[95vw] max-h-[90vh] bg-background border border-border rounded-2xl shadow-lg z-[9999] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          {isEditing ? (
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do processo *"
              className="text-xl font-bold bg-card border-2 border-border focus:border-muted-foreground h-12 flex-1 mr-4"
            />
          ) : (
            <h2 className="text-2xl font-bold text-foreground flex-1 truncate">
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
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)] space-y-8">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
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
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

              {/* Links */}
              {process?.links && process.links.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Links e Recursos</Label>
                  <div className="space-y-3">
                    {process.links.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-card/50 p-3 rounded-lg hover:bg-card transition-colors"
                      >
                        <span className="flex items-center gap-2 text-foreground text-sm">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          {link.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="h-8 px-3 text-xs"
                          >
                            Abrir
                          </Button>
                          <button
                            onClick={() => handleCopyLink(link.url)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDFs */}
              {process?.pdfs && process.pdfs.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Documentos PDF</Label>
                  <div className="space-y-3">
                    {process.pdfs.map((pdf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-card/50 p-3 rounded-lg hover:bg-card transition-colors"
                      >
                        <span className="flex items-center gap-2 text-foreground text-sm">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          {pdf.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(pdf.url, '_blank')}
                            className="h-8 px-3 text-xs"
                          >
                            Ver
                          </Button>
                          <button
                            onClick={() => handleCopyLink(pdf.url)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SwipeProcessModal;
