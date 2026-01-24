import React, { useMemo, useState, useCallback } from 'react';
import { 
  getFromStorage, 
  setToStorage,
  STORAGE_KEYS, 
  generateId 
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import SwipeTable from '@/components/swipefile/SwipeTable';
import SwipeProcessModal, { SwipeProcess } from '@/components/swipefile/SwipeProcessModal';
import SwipeDeleteConfirmation from '@/components/swipefile/SwipeDeleteConfirmation';

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
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Modal states
  const [selectedProcess, setSelectedProcess] = useState<SwipeProcess | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState<SwipeProcess | null>(null);

  // Favorites (user-specific, stored locally)
  const [favorites, setFavorites] = useState<string[]>(() => 
    getFromStorage<string[]>('swipefile-favorites', [])
  );

  const [processes, setProcesses] = useState<SwipeProcess[]>(() => 
    getFromStorage<SwipeProcess[]>(STORAGE_KEYS.SWIPEFILE_PROCESSES, [
      {
        id: '1',
        title: 'Framework de Lançamento',
        description: 'Processo completo para lançamentos de produtos digitais',
        category: 'Marketing',
        type: 'Processo',
        tags: ['lançamento', 'infoproduto', 'marketing digital'],
        content: '## Etapas do Lançamento\n\n1. **Pré-lançamento** - Construção de audiência\n2. **Aquecimento** - Geração de expectativa\n3. **Lançamento** - Abertura de carrinho\n4. **Pós-lançamento** - Nutrição e upsell',
        links: [
          { label: 'Template de Timeline', url: 'https://exemplo.com/template' },
          { label: 'Checklist de Lançamento', url: 'https://exemplo.com/checklist' }
        ],
        pdfs: [],
        createdAt: '2026-01-15',
        updatedAt: '2026-01-20',
      },
      {
        id: '2',
        title: 'Script de Vendas High-Ticket',
        description: 'Roteiro para chamadas de vendas de alto valor',
        category: 'Vendas',
        type: 'Script',
        tags: ['vendas', 'high-ticket', 'script'],
        content: '## Estrutura da Chamada\n\n1. **Rapport** (5min)\n2. **Diagnóstico** (15min)\n3. **Apresentação** (10min)\n4. **Fechamento** (10min)',
        links: [],
        pdfs: [],
        createdAt: '2026-01-10',
        updatedAt: '2026-01-18',
      },
      {
        id: '3',
        title: 'Headline Swipe File',
        description: 'Coleção de headlines de alta conversão',
        category: 'Copywriting',
        type: 'Coleção',
        tags: ['copy', 'headlines', 'conversão'],
        content: '## Headlines que Convertem\n\n- "Como [resultado] sem [objeção]"\n- "[Número] maneiras de [benefício]"\n- "O segredo para [desejo] que [autoridade] não quer que você saiba"',
        links: [],
        pdfs: [],
        createdAt: '2026-01-08',
        updatedAt: '2026-01-08',
      },
      {
        id: '4',
        title: 'Checklist de Qualificação B2B',
        description: 'Critérios para qualificar leads B2B',
        category: 'Vendas',
        type: 'Checklist',
        tags: ['b2b', 'qualificação', 'leads'],
        content: '## Critérios de Qualificação\n\n1. **Budget** - Orçamento disponível\n2. **Authority** - Poder de decisão\n3. **Need** - Necessidade real\n4. **Timeline** - Prazo definido',
        links: [],
        pdfs: [],
        createdAt: '2026-01-05',
        updatedAt: '2026-01-12',
      },
      {
        id: '5',
        title: 'Estratégia de Conteúdo',
        description: 'Guia completo para planejamento de conteúdo',
        category: 'Marketing',
        type: 'Guia',
        tags: ['conteúdo', 'estratégia', 'planejamento'],
        content: '## Pilares do Conteúdo\n\n- Educativo\n- Inspiracional\n- Promocional\n- Entretenimento',
        links: [
          { label: 'Planilha de Calendário', url: 'https://exemplo.com/calendario' }
        ],
        pdfs: [],
        createdAt: '2026-01-02',
        updatedAt: '2026-01-15',
      },
    ])
  );

  const categories = useMemo(() => {
    const processCategories = [...new Set(processes.map(p => p.category))];
    return [...new Set([...defaultCategories, ...processCategories])];
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.type || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [processes, searchQuery, selectedCategory]);

  // Handlers
  const handleView = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedProcess(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback((updatedProcess: SwipeProcess) => {
    let newProcesses: SwipeProcess[];
    
    if (isCreateMode || !updatedProcess.id) {
      // Create new
      const newProcess = { ...updatedProcess, id: generateId() };
      newProcesses = [...processes, newProcess];
      toast({ title: 'Processo criado!' });
    } else {
      // Update existing
      newProcesses = processes.map(p => 
        p.id === updatedProcess.id ? updatedProcess : p
      );
      toast({ title: 'Alterações salvas!' });
    }
    
    setProcesses(newProcesses);
    setToStorage(STORAGE_KEYS.SWIPEFILE_PROCESSES, newProcesses);
    setSelectedProcess(updatedProcess.id ? updatedProcess : null);
  }, [processes, isCreateMode, toast]);

  const handleDuplicate = useCallback((process: SwipeProcess) => {
    const duplicate: SwipeProcess = {
      ...process,
      id: generateId(),
      title: `${process.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newProcesses = [...processes, duplicate];
    setProcesses(newProcesses);
    setToStorage(STORAGE_KEYS.SWIPEFILE_PROCESSES, newProcesses);
    toast({ title: 'Processo duplicado!' });
  }, [processes, toast]);

  const handleCopyLink = useCallback((process: SwipeProcess) => {
    const url = `${window.location.origin}/swipefile/${process.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  }, [toast]);

  const handleToggleFavorite = useCallback((processId: string) => {
    const newFavorites = favorites.includes(processId)
      ? favorites.filter(id => id !== processId)
      : [...favorites, processId];
    
    setFavorites(newFavorites);
    setToStorage('swipefile-favorites', newFavorites);
    toast({ 
      title: favorites.includes(processId) 
        ? 'Removido dos favoritos' 
        : 'Adicionado aos favoritos' 
    });
  }, [favorites, toast]);

  const handleDelete = useCallback((process: SwipeProcess) => {
    setDeleteProcess(process);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteProcess) {
      const newProcesses = processes.filter(p => p.id !== deleteProcess.id);
      setProcesses(newProcesses);
      setToStorage(STORAGE_KEYS.SWIPEFILE_PROCESSES, newProcesses);
      toast({ title: 'Processo excluído' });
      setDeleteProcess(null);
      
      // Close modal if viewing deleted process
      if (selectedProcess?.id === deleteProcess.id) {
        setIsModalOpen(false);
        setSelectedProcess(null);
      }
    }
  }, [deleteProcess, processes, selectedProcess, toast]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProcess(null);
    setIsCreateMode(false);
  }, []);

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
            {isAdmin && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Processo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar processos..."
                className="pl-12 h-12 bg-card border-border text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] h-12 bg-card border-border">
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
              <div className="flex items-center rounded-lg border border-border overflow-hidden h-12">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-12 h-full flex items-center justify-center transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-secondary text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
                  }`}
                >
                  <Grid3X3 className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-12 h-full flex items-center justify-center transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-secondary text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
                  }`}
                >
                  <List className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results counter */}
          <p className="text-[13px] text-muted-foreground mt-3">
            {filteredProcesses.length} processo{filteredProcesses.length !== 1 ? 's' : ''} encontrado{filteredProcesses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {filteredProcesses.length > 0 ? (
          <SwipeTable
            processes={filteredProcesses}
            isAdmin={isAdmin}
            favorites={favorites}
            onView={handleView}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onCopyLink={handleCopyLink}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum processo encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Tente buscar por outros termos' 
                : isAdmin 
                  ? 'Comece adicionando seu primeiro processo' 
                  : 'Aguarde novos conteúdos'}
            </p>
            {isAdmin && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Processo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Process Modal */}
      <SwipeProcessModal
        process={selectedProcess}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={isAdmin ? handleSave : undefined}
        isAdmin={isAdmin}
        categories={categories}
        isCreateMode={isCreateMode}
      />

      {/* Delete Confirmation */}
      <SwipeDeleteConfirmation
        isOpen={!!deleteProcess}
        onClose={() => setDeleteProcess(null)}
        onConfirm={confirmDelete}
        processTitle={deleteProcess?.title}
      />
    </div>
  );
};

export default SwipeFilePage;
