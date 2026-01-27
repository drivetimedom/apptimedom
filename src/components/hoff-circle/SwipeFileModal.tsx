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
  X,
  FileText
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface SwipeFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SwipeFileModal: React.FC<SwipeFileModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal states
  const [selectedProcess, setSelectedProcess] = useState<SwipeProcess | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState<SwipeProcess | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => 
    getFromStorage<string[]>('swipefile-favorites', [])
  );

  const [processes, setProcesses] = useState<SwipeProcess[]>(() => 
    getFromStorage<SwipeProcess[]>(STORAGE_KEYS.SWIPEFILE_PROCESSES, [])
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
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [processes, searchQuery, selectedCategory]);

  // Handlers
  const handleView = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsProcessModalOpen(true);
  }, []);

  const handleEdit = useCallback((process: SwipeProcess) => {
    setSelectedProcess(process);
    setIsCreateMode(false);
    setIsProcessModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedProcess(null);
    setIsCreateMode(true);
    setIsProcessModalOpen(true);
  }, []);

  const handleSave = useCallback((updatedProcess: SwipeProcess) => {
    let newProcesses: SwipeProcess[];
    
    if (isCreateMode || !updatedProcess.id) {
      const newProcess = { ...updatedProcess, id: generateId() };
      newProcesses = [...processes, newProcess];
      toast({ title: 'Processo criado!' });
    } else {
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
      
      if (selectedProcess?.id === deleteProcess.id) {
        setIsProcessModalOpen(false);
        setSelectedProcess(null);
      }
    }
  }, [deleteProcess, processes, selectedProcess, toast]);

  const closeProcessModal = useCallback(() => {
    setIsProcessModalOpen(false);
    setSelectedProcess(null);
    setIsCreateMode(false);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Swipe File
              </DialogTitle>
              {isAdmin && (
                <Button onClick={handleCreate} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Processo
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Processos, templates e materiais de referência
            </p>
          </DialogHeader>

          {/* Filters */}
          <div className="p-6 pt-4 pb-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar processos..."
                  className="pl-10 bg-input border-border"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] bg-input border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredProcesses.length} processo{filteredProcesses.length !== 1 ? 's' : ''} encontrado{filteredProcesses.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6 pt-4">
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
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">
                  Nenhum processo encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Tente buscar por outros termos' : 'Aguarde novos conteúdos'}
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Process Modal */}
      <SwipeProcessModal
        process={selectedProcess}
        isOpen={isProcessModalOpen}
        onClose={closeProcessModal}
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
    </>
  );
};

export default SwipeFileModal;
