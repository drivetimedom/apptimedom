import React, { useMemo, useState, useCallback, useEffect } from 'react';
import MariaWidget from '@/components/swipefile/MariaWidget';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomization } from '@/lib/customization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  FileText,
  Loader2,
  Home,
  ChevronRight,
  FolderOpen,
  ArrowDown,
  List,
  Folder,
  Folder as FolderIcon,
  ExternalLink,
  Upload
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const customization = getCustomization();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
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
      code: m.code || undefined,
      category: m.category?.name || 'Sem categoria',
      type: m.type?.name || 'Processo',
      tags: m.tags || [],
      content: m.content || '',
      links: m.links || [],
      pdfs: m.pdfs || [],
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      typeId: m.type_id,
      categoryId: m.category_id,
      parentFolderIds: m.parent_folder_ids || [],
      featuredFolderIds: m.featured_folder_ids || [],
      relatedProcessIds: m.related_process_ids || [],
      featuredProcessIds: m.featured_process_ids || [],
    }));
  }, [materials]);

  // Read URL params on load and when processes or searchParams change
  useEffect(() => {
    const processoId = searchParams.get('processo');
    if (processoId && processes.length > 0) {
      const found = processes.find(p => p.id === processoId);
      if (found) {
        setSelectedProcess(found);
        setIsCreateMode(false);
        setIsModalOpen(true);
      }
    }
  }, [processes, searchParams]);

  const scrollToContent = () => {
    document.getElementById('swipefile-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get category names for dropdown
  const categories = useMemo(() => {
    return categoriesData.map(c => c.name);
  }, [categoriesData]);

  // Count materials per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: materials.length };
    categoriesData.forEach(cat => {
      counts[cat.id] = materials.filter(m => m.category_id === cat.id).length;
    });
    return counts;
  }, [materials, categoriesData]);

  // Count materials per type (filtered by selected category)
  const typeCounts = useMemo(() => {
    const materialsInCategory = selectedCategory === 'all' 
      ? materials 
      : materials.filter(m => m.category_id === selectedCategory);
    
    const counts: Record<string, number> = { all: materialsInCategory.length };
    typesData.forEach(type => {
      counts[type.id] = materialsInCategory.filter(m => m.type_id === type.id).length;
    });
    return counts;
  }, [materials, typesData, selectedCategory]);

  // Get types that have materials in the selected category
  const typesInCategory = useMemo(() => {
    if (selectedCategory === 'all') return typesData;
    
    const typeIdsInCategory = new Set(
      materials
        .filter(m => m.category_id === selectedCategory && m.type_id)
        .map(m => m.type_id)
    );
    
    return typesData.filter(t => typeIdsInCategory.has(t.id));
  }, [materials, typesData, selectedCategory]);

  // Get selected category data
  const selectedCategoryData = useMemo(() => {
    return categoriesData.find(c => c.id === selectedCategory);
  }, [categoriesData, selectedCategory]);

  // Get selected type data
  const selectedTypeData = useMemo(() => {
    return typesData.find(t => t.id === selectedType);
  }, [typesData, selectedType]);

  // Separate folders and non-folder processes
  const folderProcesses = useMemo(() => {
    return processes.filter(p => p.type === 'Pasta');
  }, [processes]);

  const nonFolderProcesses = useMemo(() => {
    return processes.filter(p => p.type !== 'Pasta');
  }, [processes]);

  // Count processes per folder
  const folderProcessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folderProcesses.forEach(folder => {
      counts[folder.id] = nonFolderProcesses.filter(p => 
        (p.parentFolderIds || []).includes(folder.id)
      ).length;
    });
    return counts;
  }, [folderProcesses, nonFolderProcesses]);

  const filteredProcesses = useMemo(() => {
    return nonFolderProcesses.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.content || '').toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query) ||
        (p.code || '').toLowerCase().includes(query) ||
        (p.type || '').toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesType = selectedType === 'all' || p.typeId === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [nonFolderProcesses, searchQuery, selectedCategory, selectedType]);

  const filteredFolders = useMemo(() => {
    return folderProcesses.filter(f => {
      const matchesSearch = !searchQuery || 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || f.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [folderProcesses, searchQuery, selectedCategory]);

  // Handle category change - reset type when changing category
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedType('all');
  }, []);

  // Handlers
  const handleView = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsModalOpen(true);
    setSearchParams({ processo: process.id });
  }, [setSearchParams]);

  const handleEdit = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsModalOpen(true);
    setSearchParams({ processo: process.id });
  }, [setSearchParams]);

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
      code: updatedProcess.code || null,
      type_id: typeId,
      category_id: categoryId,
      tags: updatedProcess.tags,
      content: updatedProcess.content || null,
      links: updatedProcess.links,
      pdfs: updatedProcess.pdfs,
      parent_folder_ids: updatedProcess.parentFolderIds || [],
      featured_folder_ids: updatedProcess.featuredFolderIds || [],
      related_process_ids: updatedProcess.relatedProcessIds || [],
      featured_process_ids: updatedProcess.featuredProcessIds || [],
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
    const url = `${window.location.origin}/swipe-file?processo=${process.id}`;
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
    setSearchParams({});
  }, [setSearchParams]);

  const isLoading = materialsLoading;

  // Get search placeholder text
  const searchPlaceholder = useMemo(() => {
    if (selectedType !== 'all' && selectedTypeData) {
      return `Buscar em ${selectedTypeData.name}...`;
    }
    if (selectedCategory !== 'all' && selectedCategoryData) {
      return `Buscar em ${selectedCategoryData.name}...`;
    }
    return 'Buscar por código, título, descrição, tags ou conteúdo...';
  }, [selectedCategory, selectedType, selectedCategoryData, selectedTypeData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section 
        className="relative h-[350px] md:h-[400px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(/images/banner-secoes.png)`
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        
        {/* Content */}
        <div className="relative z-10 container h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Swipe File</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Swipe File
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Processos, templates e materiais de referência
          </p>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              onClick={scrollToContent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Explorar Materiais
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            {isAdmin && (
              <>
                <Button onClick={handleCreate} variant="outline" size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Processo
                </Button>
                <Button onClick={() => navigate('/admin/import-processes')} variant="outline" size="lg" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Importar em Massa
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-4 md:py-6 px-4 md:px-6">
          <p className="text-sm text-muted-foreground mb-3">Categoria:</p>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex items-center gap-2 md:gap-3 pb-2 min-w-max">
              {/* Tab: Todos */}
              <button
                onClick={() => handleCategoryChange('all')}
                className={`
                  flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm md:text-base
                  ${selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
                  }
                `}
              >
                <Folder className="w-4 h-4 md:w-5 md:h-5" />
                <span>Todos</span>
                <span className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all' 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-muted'
                }`}>
                  {categoryCounts.all}
                </span>
              </button>
              
              {/* Category Tabs */}
              {categoriesData.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`
                    flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm md:text-base
                    ${selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
                    }
                  `}
                >
                  <span className="text-base md:text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-primary-foreground/20' 
                      : 'bg-muted'
                  }`}>
                    {categoryCounts[category.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Type Subfolder (only shows when category is selected) */}
      {selectedCategory !== 'all' && typesInCategory.length > 0 && (
        <div className="border-b border-border">
          <div className="container py-4 md:py-5 px-4 md:px-6">
            <div className="bg-card border border-border rounded-xl p-4 md:p-5">
              {/* Subfolder Header */}
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">{selectedCategoryData?.icon}</span>
                <h2 className="text-base md:text-lg font-bold text-foreground">
                  {selectedCategoryData?.name}
                </h2>
              </div>
              
              {/* Type Pills */}
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 md:gap-3 min-w-max">
                  {/* All Types */}
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`
                      flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-sm
                      ${selectedType === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                      }
                    `}
                  >
                    <span>Todos</span>
                    <span className={`text-xs ${selectedType === 'all' ? 'opacity-70' : ''}`}>
                      {typeCounts.all}
                    </span>
                  </button>
                  
                  {/* Type Pills */}
                  {typesInCategory.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`
                        flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-sm
                        ${selectedType === type.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                        }
                      `}
                    >
                      <span className="text-sm md:text-base">{type.icon}</span>
                      <span>{type.name}</span>
                      <span className={`text-xs ${selectedType === type.id ? 'opacity-70' : ''}`}>
                        {typeCounts[type.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="border-b border-border bg-card/30">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10 md:pl-12 h-10 md:h-12 bg-card border-border text-sm w-full"
              />
            </div>
            
            {/* View Mode and Counter Row */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProcesses.length} {filteredProcesses.length === 1 ? 'material encontrado' : 'materiais encontrados'}
              </p>
              
              {/* View Mode - Only List (as requested) */}
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Visualização:</span>
                <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-secondary text-foreground">
                  <List className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Lista</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="swipefile-content"></div>
      <div className="container py-6 md:py-8 px-4 md:px-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FolderIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Metodologias</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFolders.map(folder => (
                    <div
                      key={folder.id}
                      className="p-5 border border-border rounded-xl hover:bg-accent hover:border-primary transition-all cursor-pointer group text-left"
                      onClick={() => handleView(folder)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{folder.title}</h3>
                          {folder.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{folder.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {folderProcessCounts[folder.id] || 0} processos
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/swipe-file?processo=${folder.id}`, '_blank');
                            }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Abrir em nova aba"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {filteredFolders.length > 0 && filteredProcesses.length > 0 && (
              <Separator />
            )}

            {/* Processes Section */}
            {filteredProcesses.length > 0 ? (
              <div>
                {filteredFolders.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Processos</h2>
                    <span className="text-sm text-muted-foreground">
                      {filteredProcesses.length} materiais
                    </span>
                  </div>
                )}
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
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Nenhum material encontrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `Nenhum resultado para "${searchQuery}"` 
                    : isAdmin 
                      ? 'Comece adicionando seu primeiro material' 
                      : 'Aguarde novos conteúdos'}
                </p>
                {isAdmin && !searchQuery && (
                  <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Material
                  </Button>
                )}
              </div>
            ) : null}
          </>
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
        onOpenProcess={(proc) => {
          setSelectedProcess(proc);
          setIsCreateMode(false);
          setSearchParams({ processo: proc.id });
        }}
      />

      {/* Delete Confirmation */}
      <SwipeDeleteConfirmation
        isOpen={!!deleteProcess}
        onClose={() => setDeleteProcess(null)}
        onConfirm={confirmDelete}
        processTitle={deleteProcess?.title}
      />

      {/* Maria Assistant Widget */}
      <MariaWidget />
    </div>
  );
};

export default SwipeFilePage;
