import React, { useState, useEffect } from 'react';
import {
  getFromStorage,
  setToStorage,
  STORAGE_KEYS,
  ActivationPlanTemplate,
  TemplateCategory,
  generateId,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Edit,
  Copy,
  Search,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';

const categoryOptions: { value: TemplateCategory; label: string }[] = [
  { value: 'setup', label: 'Setup' },
  { value: 'trafego', label: 'Tráfego' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'geral', label: 'Geral' },
];

// Default templates to seed
const defaultTemplates: ActivationPlanTemplate[] = [
  {
    id: 'template-mapa-10k',
    name: 'MAPA 10K - Setup Completo',
    description: 'Checklist inicial para alunos começando no Hof Circle e indo para os primeiros R$ 10 mil/mês',
    category: 'setup',
    tasks: [
      'Criar conta Business Manager',
      'Conectar Instagram',
      'Conectar WhatsApp Business',
      'Rodar 1ª campanha',
      'Investir R$ 500 em tráfego',
      'Gerar 30 leads',
      'Fazer 5 vendas',
      'Atingir R$ 2.000 de faturamento',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-mapa-30k',
    name: 'MAPA 30K - Aceleração',
    description: 'Para alunos que já faturam R$ 10k e querem chegar a R$ 30k',
    category: 'vendas',
    tasks: [
      'Estruturar Kanban de vendas',
      'Criar 3 criativos de anúncios',
      'Definir avatar detalhado',
      'Implementar follow-up estruturado',
      'Aumentar ticket médio em 30%',
      'Contratar assistente comercial',
      'Gerar 100 leads/mês',
      'Atingir 20% de conversão',
      'Faturar R$ 30.000 no mês',
      'Criar processo documentado',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ActivationPlanTemplates: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ActivationPlanTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivationPlanTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ActivationPlanTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'geral' as TemplateCategory,
    tasks: [''],
  });

  // Load templates on mount
  useEffect(() => {
    let stored = getFromStorage<ActivationPlanTemplate[]>(STORAGE_KEYS.ACTIVATION_TEMPLATES, []);
    
    // Seed defaults if empty
    if (stored.length === 0) {
      stored = defaultTemplates;
      setToStorage(STORAGE_KEYS.ACTIVATION_TEMPLATES, stored);
    }
    
    setTemplates(stored);
  }, []);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (template?: ActivationPlanTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category || 'geral',
        tasks: template.tasks.length > 0 ? [...template.tasks] : [''],
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        category: 'geral',
        tasks: [''],
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, ''],
    }));
  };

  const updateTask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((t, i) => (i === index ? value : t)),
    }));
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const saveTemplate = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    const validTasks = formData.tasks.filter(t => t.trim() !== '');
    if (validTasks.length === 0) {
      toast({ title: 'Adicione pelo menos uma tarefa', variant: 'destructive' });
      return;
    }

    const now = new Date().toISOString();
    let updatedTemplates: ActivationPlanTemplate[];

    if (editingTemplate) {
      // Update
      updatedTemplates = templates.map(t =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              category: formData.category,
              tasks: validTasks,
              updatedAt: now,
            }
          : t
      );
      toast({ title: 'Template atualizado!' });
    } else {
      // Create
      const newTemplate: ActivationPlanTemplate = {
        id: generateId(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        tasks: validTasks,
        createdAt: now,
        updatedAt: now,
      };
      updatedTemplates = [...templates, newTemplate];
      toast({ title: 'Template criado!' });
    }

    setTemplates(updatedTemplates);
    setToStorage(STORAGE_KEYS.ACTIVATION_TEMPLATES, updatedTemplates);
    closeModal();
  };

  const duplicateTemplate = (template: ActivationPlanTemplate) => {
    const now = new Date().toISOString();
    const duplicate: ActivationPlanTemplate = {
      ...template,
      id: generateId(),
      name: `${template.name} (Cópia)`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTemplates = [...templates, duplicate];
    setTemplates(updatedTemplates);
    setToStorage(STORAGE_KEYS.ACTIVATION_TEMPLATES, updatedTemplates);
    toast({ title: 'Template duplicado!' });
  };

  const deleteTemplate = () => {
    if (!deleteConfirm) return;

    const updatedTemplates = templates.filter(t => t.id !== deleteConfirm.id);
    setTemplates(updatedTemplates);
    setToStorage(STORAGE_KEYS.ACTIVATION_TEMPLATES, updatedTemplates);
    toast({ title: 'Template excluído' });
    setDeleteConfirm(null);
  };

  const getCategoryLabel = (cat?: TemplateCategory) => {
    if (!cat) return 'Geral';
    return categoryOptions.find(c => c.value === cat)?.label || 'Geral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Templates de Planos de Ativação
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Crie e gerencie templates reutilizáveis para planos de ativação
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar template..."
          className="pl-9 bg-input border-border"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Nenhum template encontrado' : 'Nenhum template criado ainda'}
          </p>
          {!searchQuery && (
            <Button onClick={() => openModal()} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-accent" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                        {getCategoryLabel(template.category)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {template.tasks.length} tarefas
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => openModal(template)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(template)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {template.tasks.slice(0, 5).map((task, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {task}
                    </li>
                  ))}
                  {template.tasks.length > 5 && (
                    <li className="text-sm text-muted-foreground italic">
                      +{template.tasks.length - 5} mais tarefas...
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingTemplate ? 'Editar Template' : 'Criar Template de Plano de Ativação'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Nome do Template *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: MAPA 10K - Setup Completo"
                  className="bg-input border-border"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Checklist inicial para alunos começando no Hof Circle"
                  className="bg-input border-border"
                  rows={2}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({ ...formData, category: value as TemplateCategory })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <Label>Tarefas do Template *</Label>
                <div className="space-y-2">
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        value={task}
                        onChange={e => updateTask(index, e.target.value)}
                        placeholder="Digite a tarefa..."
                        className="flex-1 bg-input border-border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                        disabled={formData.tasks.length <= 1}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addTask} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Tarefa
                </Button>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={saveTemplate}>
              {editingTemplate ? 'Salvar Alterações' : 'Salvar Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirm?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivationPlanTemplates;
