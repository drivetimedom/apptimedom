import React, { useMemo, useState } from 'react';
import { 
  getFromStorage, 
  setToStorage,
  STORAGE_KEYS, 
  generateId 
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  FileText,
  Tag,
  ExternalLink,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SwipeProcess {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  links: { label: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

const defaultCategories = [
  'Marketing',
  'Vendas',
  'Copywriting',
  'Design',
  'Automação',
  'Estratégia',
  'Outros'
];

const SwipeFilePage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<SwipeProcess | null>(null);

  const [processes, setProcesses] = useState<SwipeProcess[]>(() => 
    getFromStorage<SwipeProcess[]>(STORAGE_KEYS.SWIPEFILE_PROCESSES, [
      {
        id: '1',
        title: 'Framework de Lançamento',
        description: 'Processo completo para lançamentos de produtos digitais',
        category: 'Marketing',
        tags: ['lançamento', 'infoproduto', 'marketing digital'],
        content: '## Etapas do Lançamento\n\n1. **Pré-lançamento** - Construção de audiência\n2. **Aquecimento** - Geração de expectativa\n3. **Lançamento** - Abertura de carrinho\n4. **Pós-lançamento** - Nutrição e upsell',
        links: [
          { label: 'Template de Timeline', url: '#' },
          { label: 'Checklist de Lançamento', url: '#' }
        ],
        createdAt: '2026-01-15',
        updatedAt: '2026-01-20',
      },
      {
        id: '2',
        title: 'Script de Vendas High-Ticket',
        description: 'Roteiro para chamadas de vendas de alto valor',
        category: 'Vendas',
        tags: ['vendas', 'high-ticket', 'script'],
        content: '## Estrutura da Chamada\n\n1. **Rapport** (5min)\n2. **Diagnóstico** (15min)\n3. **Apresentação** (10min)\n4. **Fechamento** (10min)',
        links: [],
        createdAt: '2026-01-10',
        updatedAt: '2026-01-18',
      },
      {
        id: '3',
        title: 'Headline Swipe File',
        description: 'Coleção de headlines de alta conversão',
        category: 'Copywriting',
        tags: ['copy', 'headlines', 'conversão'],
        content: '## Headlines que Convertem\n\n- "Como [resultado] sem [objeção]"\n- "[Número] maneiras de [benefício]"\n- "O segredo para [desejo] que [autoridade] não quer que você saiba"',
        links: [],
        createdAt: '2026-01-08',
        updatedAt: '2026-01-08',
      },
    ])
  );

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    content: '',
    links: '',
  });

  const categories = useMemo(() => {
    const processCategories = [...new Set(processes.map(p => p.category))];
    return [...new Set([...defaultCategories, ...processCategories])];
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [processes, searchQuery, selectedCategory]);

  const handleOpenDialog = (process?: SwipeProcess) => {
    if (process) {
      setEditingProcess(process);
      setFormData({
        title: process.title,
        description: process.description,
        category: process.category,
        tags: process.tags.join(', '),
        content: process.content,
        links: process.links.map(l => `${l.label}|${l.url}`).join('\n'),
      });
    } else {
      setEditingProcess(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        content: '',
        links: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.category) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const links = formData.links
      .split('\n')
      .filter(l => l.includes('|'))
      .map(l => {
        const [label, url] = l.split('|');
        return { label: label.trim(), url: url.trim() };
      });

    const processData: SwipeProcess = {
      id: editingProcess?.id || generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      content: formData.content,
      links,
      createdAt: editingProcess?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedProcesses: SwipeProcess[];
    if (editingProcess) {
      updatedProcesses = processes.map(p => p.id === editingProcess.id ? processData : p);
    } else {
      updatedProcesses = [...processes, processData];
    }

    setProcesses(updatedProcesses);
    setToStorage(STORAGE_KEYS.SWIPEFILE_PROCESSES, updatedProcesses);
    setIsDialogOpen(false);
    toast({ title: editingProcess ? 'Processo atualizado!' : 'Processo criado!' });
  };

  const handleDelete = (id: string) => {
    const updatedProcesses = processes.filter(p => p.id !== id);
    setProcesses(updatedProcesses);
    setToStorage(STORAGE_KEYS.SWIPEFILE_PROCESSES, updatedProcesses);
    toast({ title: 'Processo excluído' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Swipe File</h1>
              <p className="text-muted-foreground">Processos, templates e materiais de referência</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Processo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingProcess ? 'Editar Processo' : 'Novo Processo'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Nome do processo"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Breve descrição"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (separadas por vírgula)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo (Markdown)</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Descreva o processo..."
                      className="bg-input border-border min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Links (formato: Nome|URL, um por linha)</Label>
                    <Textarea
                      value={formData.links}
                      onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                      placeholder="Template|https://exemplo.com/template"
                      className="bg-input border-border"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      {editingProcess ? 'Salvar Alterações' : 'Criar Processo'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar processos..."
                className="pl-9 bg-input border-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-input border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {filteredProcesses.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProcesses.map(process => (
              <div
                key={process.id}
                className={`bg-card rounded-xl border border-border p-6 hover:border-border-hover transition-all ${
                  viewMode === 'list' ? 'flex items-start gap-6' : ''
                }`}
              >
                <div className={`flex-1 ${viewMode === 'list' ? 'flex items-start gap-4' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 ${viewMode === 'grid' ? 'mb-4' : ''}`}>
                    <FileText className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{process.title}</h3>
                      <span className="px-2 py-1 rounded-full bg-accent text-xs text-muted-foreground flex-shrink-0">
                        {process.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{process.description}</p>
                    
                    {/* Tags */}
                    {process.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {process.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center text-xs text-muted-foreground">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {process.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {process.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-info hover:text-info/80"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(process)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(process.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum processo encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Tente buscar por outros termos' : 'Comece adicionando seu primeiro processo'}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Processo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeFilePage;
