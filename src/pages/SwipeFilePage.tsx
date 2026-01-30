import React, { useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  FileText,
  Loader2
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
import {
  useSwipeFileMaterials,
  useSwipeFileCategories,
  useSwipeFileTypes,
  useSwipeFileFavorites,
  useCreateSwipeFileMaterial,
  useUpdateSwipeFileMaterial,
  useDeleteSwipeFileMaterial,
  useToggleSwipeFileFavorite,
  SwipeFileMaterial,
} from '@/hooks/useSwipeFile';

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

  // Fetch data from Supabase
  const { data: materials = [], isLoading: materialsLoading } = useSwipeFileMaterials();
  const { data: categoriesData = [] } = useSwipeFileCategories();
  const { data: typesData = [] } = useSwipeFileTypes();
  const { data: favorites = [] } = useSwipeFileFavorites();

  // Mutations
  const createMaterial = useCreateSwipeFileMaterial();
  const updateMaterial = useUpdateSwipeFileMaterial();
  const deleteMaterial = useDeleteSwipeFileMaterial();
  const toggleFavorite = useToggleSwipeFileFavorite();

  // Transform materials to SwipeProcess format for compatibility
  const processes: SwipeProcess[] = useMemo(() => {
    return materials.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description || '',
      category: m.category?.name || 'Sem categoria',
      type: m.type?.name || 'Processo',
      tags: m.tags || [],
      content: m.content || '',
      links: m.links || [],
      pdfs: m.pdfs || [],
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      // Store IDs for updates
      typeId: m.type_id,
      categoryId: m.category_id,
    }));
  }, [materials]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return categoriesData.map(c => c.name);
  }, [categoriesData]);

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

  const handleSave = useCallback(async (updatedProcess: SwipeProcess) => {
    // Find type and category IDs by name
    const typeId = typesData.find(t => t.name === updatedProcess.type)?.id || null;
    const categoryId = categoriesData.find(c => c.name === updatedProcess.category)?.id || null;

    const materialData = {
      title: updatedProcess.title,
      description: updatedProcess.description || null,
      type_id: typeId,
      category_id: categoryId,
      tags: updatedProcess.tags,
      content: updatedProcess.content || null,
      links: updatedProcess.links,
      pdfs: updatedProcess.pdfs,
    };

    try {
      if (isCreateMode || !updatedProcess.id) {
        await createMaterial.mutateAsync(materialData as any);
        setIsModalOpen(false);
      } else {
        await updateMaterial.mutateAsync({
          id: updatedProcess.id,
          ...materialData,
        } as any);
      }
    } catch (error) {
      // Error is handled by the hook
    }
  }, [isCreateMode, typesData, categoriesData, createMaterial, updateMaterial]);

  const handleDuplicate = useCallback(async (process: SwipeProcess) => {
    const typeId = typesData.find(t => t.name === process.type)?.id || null;
    const categoryId = categoriesData.find(c => c.name === process.category)?.id || null;

    await createMaterial.mutateAsync({
      title: `${process.title} (Cópia)`,
      description: process.description || null,
      type_id: typeId,
      category_id: categoryId,
      tags: process.tags,
      content: process.content || null,
      links: process.links,
      pdfs: process.pdfs,
    } as any);
  }, [typesData, categoriesData, createMaterial]);

  const handleCopyLink = useCallback((process: SwipeProcess) => {
    const url = `${window.location.origin}/swipefile/${process.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  }, [toast]);

  const handleToggleFavorite = useCallback((processId: string) => {
    const isFavorite = favorites.includes(processId);
    toggleFavorite.mutate({ materialId: processId, isFavorite });
  }, [favorites, toggleFavorite]);

  const handleDelete = useCallback((process: SwipeProcess) => {
    setDeleteProcess(process);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteProcess) {
      await deleteMaterial.mutateAsync(deleteProcess.id);
      setDeleteProcess(null);
      
      // Close modal if viewing deleted process
      if (selectedProcess?.id === deleteProcess.id) {
        setIsModalOpen(false);
        setSelectedProcess(null);
      }
    }
  }, [deleteProcess, selectedProcess, deleteMaterial]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProcess(null);
    setIsCreateMode(false);
  }, []);

  const isLoading = materialsLoading;

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProcesses.length > 0 ? (
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
