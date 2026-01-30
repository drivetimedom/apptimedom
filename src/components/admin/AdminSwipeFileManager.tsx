import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, FileText, FolderOpen, Tag, Loader2 } from 'lucide-react';
import {
  useSwipeFileTypes,
  useCreateSwipeFileType,
  useUpdateSwipeFileType,
  useDeleteSwipeFileType,
  useSwipeFileCategories,
  useCreateSwipeFileCategory,
  useUpdateSwipeFileCategory,
  useDeleteSwipeFileCategory,
  SwipeFileType,
  SwipeFileCategory,
} from '@/hooks/useSwipeFile';

// Common emojis for picker
const commonEmojis = ['📄', '📝', '✅', '🎨', '💡', '🎯', '💎', '💰', '⚙️', '📊', '📈', '🔥', '⭐', '🚀', '💼', '📋', '🗂️', '📁', '🏷️', '✨'];

const AdminSwipeFileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('types');
  
  // Fetch data from Supabase
  const { data: types = [], isLoading: typesLoading } = useSwipeFileTypes();
  const { data: categories = [], isLoading: categoriesLoading } = useSwipeFileCategories();
  
  // Mutations
  const createType = useCreateSwipeFileType();
  const updateType = useUpdateSwipeFileType();
  const deleteTypeMutation = useDeleteSwipeFileType();
  
  const createCategory = useCreateSwipeFileCategory();
  const updateCategory = useUpdateSwipeFileCategory();
  const deleteCategoryMutation = useDeleteSwipeFileCategory();
  
  // Modal states
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SwipeFileType | null>(null);
  const [typeForm, setTypeForm] = useState({ name: '', icon: '📄', color: '#3b82f6' });
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SwipeFileCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🎯', color: '#ef4444' });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'type' | 'category'; item: SwipeFileType | SwipeFileCategory } | null>(null);

  // ======================
  // TYPE FUNCTIONS
  // ======================
  const openTypeModal = (type?: SwipeFileType) => {
    if (type) {
      setEditingType(type);
      setTypeForm({ name: type.name, icon: type.icon, color: type.color });
    } else {
      setEditingType(null);
      setTypeForm({ name: '', icon: '📄', color: '#3b82f6' });
    }
    setTypeModalOpen(true);
  };

  const saveType = async () => {
    if (!typeForm.name.trim()) return;

    if (editingType) {
      await updateType.mutateAsync({
        id: editingType.id,
        name: typeForm.name,
        icon: typeForm.icon,
        color: typeForm.color,
      });
    } else {
      await createType.mutateAsync({
        name: typeForm.name,
        icon: typeForm.icon,
        color: typeForm.color,
      });
    }
    setTypeModalOpen(false);
  };

  const handleDeleteType = async () => {
    if (deleteConfirm?.type === 'type') {
      await deleteTypeMutation.mutateAsync(deleteConfirm.item.id);
      setDeleteConfirm(null);
    }
  };

  // ======================
  // CATEGORY FUNCTIONS
  // ======================
  const openCategoryModal = (category?: SwipeFileCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, icon: category.icon, color: category.color });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '🎯', color: '#ef4444' });
    }
    setCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: categoryForm.name,
        icon: categoryForm.icon,
        color: categoryForm.color,
      });
    } else {
      await createCategory.mutateAsync({
        name: categoryForm.name,
        icon: categoryForm.icon,
        color: categoryForm.color,
      });
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (deleteConfirm?.type === 'category') {
      await deleteCategoryMutation.mutateAsync(deleteConfirm.item.id);
      setDeleteConfirm(null);
    }
  };

  const isLoading = typesLoading || categoriesLoading;
  const isSaving = createType.isPending || updateType.isPending || createCategory.isPending || updateCategory.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            💾 Gestão do Swipe File
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie tipos e categorias dos materiais
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="types" className="data-[state=active]:bg-accent gap-2">
              <Tag className="w-4 h-4" />
              Tipos
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-accent gap-2">
              <FolderOpen className="w-4 h-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* Types Tab */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">📋 Tipos de Material</h3>
              <Button onClick={() => openTypeModal()} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Tipo
              </Button>
            </div>

            <div className="grid gap-3">
              {types.map(type => (
                <div
                  key={type.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Ícone: {type.icon}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          Cor: 
                          <span 
                            className="inline-block w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.color}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => openTypeModal(type)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteConfirm({ type: 'type', item: type })}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {types.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum tipo cadastrado
                </p>
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">🏷️ Categorias</h3>
              <Button onClick={() => openCategoryModal()} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Categoria
              </Button>
            </div>

            <div className="grid gap-3">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Ícone: {category.icon}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          Cor: 
                          <span 
                            className="inline-block w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.color}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => openCategoryModal(category)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteConfirm({ type: 'category', item: category })}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma categoria cadastrada
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Type Modal */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingType ? 'Editar Tipo' : 'Criar Tipo de Material'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label>Nome *</Label>
              <Input
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="Ex: Processo"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ícone *</Label>
              <div className="mt-2">
                <Input
                  value={typeForm.icon}
                  onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                  placeholder="Emoji"
                  className="mb-2"
                  maxLength={4}
                />
                <div className="flex flex-wrap gap-2">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setTypeForm({ ...typeForm, icon: emoji })}
                      className={`w-9 h-9 rounded-lg text-xl hover:bg-accent transition-colors ${
                        typeForm.icon === emoji ? 'bg-accent ring-2 ring-primary' : 'bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>Cor *</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={typeForm.color}
                  onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={typeForm.color}
                  onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Preview</Label>
              <div
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: `${typeForm.color}20`, color: typeForm.color }}
              >
                <span className="text-lg">{typeForm.icon}</span>
                <span>{typeForm.name || 'Nome do Tipo'}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setTypeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveType} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingType ? 'Salvar Alterações' : 'Salvar Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Criar Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label>Nome *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Demanda"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ícone *</Label>
              <div className="mt-2">
                <Input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="Emoji"
                  className="mb-2"
                  maxLength={4}
                />
                <div className="flex flex-wrap gap-2">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: emoji })}
                      className={`w-9 h-9 rounded-lg text-xl hover:bg-accent transition-colors ${
                        categoryForm.icon === emoji ? 'bg-accent ring-2 ring-primary' : 'bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>Cor *</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  placeholder="#ef4444"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Preview</Label>
              <div
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: `${categoryForm.color}20`, color: categoryForm.color }}
              >
                <span className="text-lg">{categoryForm.icon}</span>
                <span>{categoryForm.name || 'Nome da Categoria'}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? 'Salvar Alterações' : 'Salvar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{' '}
              <strong>{deleteConfirm?.item.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteConfirm?.type === 'type' ? handleDeleteType : handleDeleteCategory}
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

export default AdminSwipeFileManager;
