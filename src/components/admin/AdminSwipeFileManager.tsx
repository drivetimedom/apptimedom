import React, { useState, useMemo } from 'react';
import { 
  getFromStorage, 
  setToStorage, 
  STORAGE_KEYS, 
  generateId,
  SwipeFileType,
  SwipeFileCategory 
} from '@/lib/storage';
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
import { Plus, MoreHorizontal, Edit, Trash2, FileText, FolderOpen, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Default types
const defaultTypes: SwipeFileType[] = [
  { id: 'type-processo', name: 'Processo', icon: '📄', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'type-criativo', name: 'Criativo', icon: '🎨', color: '#ec4899', createdAt: new Date().toISOString() },
  { id: 'type-script', name: 'Script', icon: '📝', color: '#8b5cf6', createdAt: new Date().toISOString() },
  { id: 'type-checklist', name: 'Checklist', icon: '✅', color: '#10b981', createdAt: new Date().toISOString() },
];

// Default categories
const defaultCategories: SwipeFileCategory[] = [
  { id: 'cat-demanda', name: 'Demanda', icon: '🎯', color: '#ef4444', createdAt: new Date().toISOString() },
  { id: 'cat-oferta', name: 'Oferta', icon: '💎', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'cat-vendas', name: 'Vendas', icon: '💰', color: '#facc15', createdAt: new Date().toISOString() },
  { id: 'cat-operacoes', name: 'Operações', icon: '⚙️', color: '#6b7280', createdAt: new Date().toISOString() },
];

// Common emojis for picker
const commonEmojis = ['📄', '📝', '✅', '🎨', '💡', '🎯', '💎', '💰', '⚙️', '📊', '📈', '🔥', '⭐', '🚀', '💼', '📋', '🗂️', '📁', '🏷️', '✨'];

const AdminSwipeFileManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('types');
  
  // Types state
  const [types, setTypes] = useState<SwipeFileType[]>(() => 
    getFromStorage<SwipeFileType[]>(STORAGE_KEYS.SWIPEFILE_TYPES, defaultTypes)
  );
  
  // Categories state
  const [categories, setCategories] = useState<SwipeFileCategory[]>(() => 
    getFromStorage<SwipeFileCategory[]>(STORAGE_KEYS.SWIPEFILE_CATEGORIES, defaultCategories)
  );
  
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

  const saveType = () => {
    if (!typeForm.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    let updatedTypes: SwipeFileType[];
    if (editingType) {
      updatedTypes = types.map(t => 
        t.id === editingType.id 
          ? { ...t, name: typeForm.name, icon: typeForm.icon, color: typeForm.color }
          : t
      );
      toast({ title: 'Tipo atualizado!' });
    } else {
      const newType: SwipeFileType = {
        id: `type-${generateId()}`,
        name: typeForm.name,
        icon: typeForm.icon,
        color: typeForm.color,
        createdAt: new Date().toISOString(),
      };
      updatedTypes = [...types, newType];
      toast({ title: 'Tipo criado!' });
    }

    setTypes(updatedTypes);
    setToStorage(STORAGE_KEYS.SWIPEFILE_TYPES, updatedTypes);
    setTypeModalOpen(false);
  };

  const deleteType = (type: SwipeFileType) => {
    const updatedTypes = types.filter(t => t.id !== type.id);
    setTypes(updatedTypes);
    setToStorage(STORAGE_KEYS.SWIPEFILE_TYPES, updatedTypes);
    toast({ title: 'Tipo excluído' });
    setDeleteConfirm(null);
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

  const saveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    let updatedCategories: SwipeFileCategory[];
    if (editingCategory) {
      updatedCategories = categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: categoryForm.name, icon: categoryForm.icon, color: categoryForm.color }
          : c
      );
      toast({ title: 'Categoria atualizada!' });
    } else {
      const newCategory: SwipeFileCategory = {
        id: `cat-${generateId()}`,
        name: categoryForm.name,
        icon: categoryForm.icon,
        color: categoryForm.color,
        createdAt: new Date().toISOString(),
      };
      updatedCategories = [...categories, newCategory];
      toast({ title: 'Categoria criada!' });
    }

    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.SWIPEFILE_CATEGORIES, updatedCategories);
    setCategoryModalOpen(false);
  };

  const deleteCategory = (category: SwipeFileCategory) => {
    const updatedCategories = categories.filter(c => c.id !== category.id);
    setCategories(updatedCategories);
    setToStorage(STORAGE_KEYS.SWIPEFILE_CATEGORIES, updatedCategories);
    toast({ title: 'Categoria excluída' });
    setDeleteConfirm(null);
  };

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

      {/* Type Modal */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? 'Editar Tipo' : 'Criar Tipo de Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setTypeModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveType}>
              {editingType ? 'Salvar Alterações' : 'Salvar Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Criar Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCategory}>
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
              Tem certeza que deseja excluir {deleteConfirm?.type === 'type' ? 'o tipo' : 'a categoria'}{' '}
              <strong>"{deleteConfirm?.item.name}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'type') {
                  deleteType(deleteConfirm.item as SwipeFileType);
                } else if (deleteConfirm?.type === 'category') {
                  deleteCategory(deleteConfirm.item as SwipeFileCategory);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
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
