import React, { useState, useEffect } from 'react';
import { Category, Subcategory, PageConfig, generateId } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category?: Category | null;
  existingSlugs: string[];
}

const iconOptions = [
  { value: 'FolderOpen', label: '📁 Pasta', emoji: '📁' },
  { value: 'Megaphone', label: '📢 Marketing', emoji: '📢' },
  { value: 'TrendingUp', label: '📈 Vendas', emoji: '📈' },
  { value: 'Target', label: '🎯 Estratégias', emoji: '🎯' },
  { value: 'Briefcase', label: '💼 Gestão', emoji: '💼' },
  { value: 'BookOpen', label: '📚 Educação', emoji: '📚' },
  { value: 'GraduationCap', label: '🎓 Formação', emoji: '🎓' },
  { value: 'Lightbulb', label: '💡 Ideias', emoji: '💡' },
  { value: 'Users', label: '👥 Comunidade', emoji: '👥' },
  { value: 'Zap', label: '⚡ Performance', emoji: '⚡' },
];

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  existingSlugs,
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'FolderOpen',
    description: '',
    order: 1,
    active: true,
  });

  const [dedicatedPage, setDedicatedPage] = useState({
    enabled: false,
    showInMainMenu: false,
    bannerTitle: '',
    bannerSubtitle: '',
    bannerImageUrl: '',
    bannerCtaText: '',
    aboutText: '',
  });

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    showRoadmap: false,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        description: category.description || '',
        order: category.order,
        active: category.active,
      });

      setDedicatedPage({
        enabled: category.hasDedicatedPage || false,
        showInMainMenu: category.showInMainMenu || false,
        bannerTitle: category.pageConfig?.bannerTitle || '',
        bannerSubtitle: category.pageConfig?.bannerSubtitle || '',
        bannerImageUrl: category.pageConfig?.bannerImageUrl || '',
        bannerCtaText: category.pageConfig?.bannerCtaText || '',
        aboutText: category.pageConfig?.aboutText || '',
      });

      setSubcategories(category.subcategories || []);
    } else {
      setFormData({
        name: '',
        icon: 'FolderOpen',
        description: '',
        order: 1,
        active: true,
      });
      setDedicatedPage({
        enabled: false,
        showInMainMenu: false,
        bannerTitle: '',
        bannerSubtitle: '',
        bannerImageUrl: '',
        bannerCtaText: '',
        aboutText: '',
      });
      setSubcategories([]);
    }
  }, [category, isOpen]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    const slug = generateSlug(formData.name);
    
    // Check unique slug (only for new categories or if name changed)
    if (!category || generateSlug(category.name) !== slug) {
      if (existingSlugs.includes(slug)) {
        toast({ title: 'Já existe uma categoria com esse nome', variant: 'destructive' });
        return;
      }
    }

    const categoryData: Category = {
      id: category?.id || generateId(),
      name: formData.name.trim(),
      icon: formData.icon,
      description: formData.description.trim(),
      slug,
      order: formData.order,
      active: formData.active,
      hasDedicatedPage: dedicatedPage.enabled,
      showInMainMenu: dedicatedPage.showInMainMenu,
      pageConfig: dedicatedPage.enabled ? {
        bannerTitle: dedicatedPage.bannerTitle || formData.name,
        bannerSubtitle: dedicatedPage.bannerSubtitle,
        bannerImageUrl: dedicatedPage.bannerImageUrl,
        bannerCtaText: dedicatedPage.bannerCtaText,
        aboutText: dedicatedPage.aboutText,
      } : undefined,
      subcategories: subcategories,
    };

    onSave(categoryData);
  };

  // Subcategory functions
  const openSubcategoryModal = (subcategory?: Subcategory) => {
    if (subcategory) {
      setSubcategoryForm({
        name: subcategory.name,
        description: subcategory.description || '',
        showRoadmap: subcategory.showRoadmap,
      });
      setEditingSubcategory(subcategory);
    } else {
      setSubcategoryForm({ name: '', description: '', showRoadmap: false });
      setEditingSubcategory({ id: '', name: '', slug: '', order: subcategories.length + 1, showRoadmap: false });
    }
  };

  const saveSubcategory = () => {
    if (!subcategoryForm.name.trim()) {
      toast({ title: 'Nome da subcategoria é obrigatório', variant: 'destructive' });
      return;
    }

    const slug = generateSlug(subcategoryForm.name);
    
    if (editingSubcategory) {
      if (editingSubcategory.id) {
        // Update existing
        setSubcategories(subcategories.map(s => 
          s.id === editingSubcategory.id 
            ? { ...s, name: subcategoryForm.name, slug, description: subcategoryForm.description, showRoadmap: subcategoryForm.showRoadmap }
            : s
        ));
      } else {
        // Add new
        const newSubcategory: Subcategory = {
          id: generateId(),
          name: subcategoryForm.name.trim(),
          slug,
          description: subcategoryForm.description.trim(),
          order: subcategories.length + 1,
          showRoadmap: subcategoryForm.showRoadmap,
        };
        setSubcategories([...subcategories, newSubcategory]);
      }
    }

    setEditingSubcategory(null);
  };

  const deleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(s => s.id !== id));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {category ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Categoria *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Marketing Digital"
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Slug: {formData.name ? generateSlug(formData.name) : '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {iconOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da categoria..."
                  className="bg-input border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                    />
                    <label htmlFor="active" className="text-sm text-foreground">
                      Categoria ativa
                    </label>
                  </div>
                </div>
              </div>

              {/* Dedicated Page Section */}
              <div className="border-t border-border pt-6 space-y-4">
                <Label className="text-base font-semibold">📄 Página Dedicada</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dedicatedPage"
                      checked={dedicatedPage.enabled}
                      onCheckedChange={(checked) => setDedicatedPage({ ...dedicatedPage, enabled: !!checked })}
                    />
                    <label htmlFor="dedicatedPage" className="text-sm">
                      Criar página dedicada para esta categoria
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInMenu"
                      checked={dedicatedPage.showInMainMenu}
                      onCheckedChange={(checked) => setDedicatedPage({ ...dedicatedPage, showInMainMenu: !!checked })}
                    />
                    <label htmlFor="showInMenu" className="text-sm">
                      Mostrar no menu principal
                    </label>
                  </div>
                </div>

                {dedicatedPage.enabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-border ml-2">
                    <p className="text-sm text-muted-foreground font-medium">Banner Hero</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título do Banner</Label>
                        <Input
                          value={dedicatedPage.bannerTitle}
                          onChange={(e) => setDedicatedPage({ ...dedicatedPage, bannerTitle: e.target.value })}
                          placeholder="Título principal"
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={dedicatedPage.bannerSubtitle}
                          onChange={(e) => setDedicatedPage({ ...dedicatedPage, bannerSubtitle: e.target.value })}
                          placeholder="Subtítulo"
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>URL da Imagem</Label>
                        <Input
                          value={dedicatedPage.bannerImageUrl}
                          onChange={(e) => setDedicatedPage({ ...dedicatedPage, bannerImageUrl: e.target.value })}
                          placeholder="https://..."
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Texto do Botão CTA</Label>
                        <Input
                          value={dedicatedPage.bannerCtaText}
                          onChange={(e) => setDedicatedPage({ ...dedicatedPage, bannerCtaText: e.target.value })}
                          placeholder="Começar Agora"
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Sobre o Programa</Label>
                      <Textarea
                        value={dedicatedPage.aboutText}
                        onChange={(e) => setDedicatedPage({ ...dedicatedPage, aboutText: e.target.value })}
                        placeholder="Descrição completa do programa..."
                        className="bg-input border-border min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategories Section */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">📂 Subcategorias</Label>
                  <Button size="sm" variant="outline" onClick={() => openSubcategoryModal()} className="gap-1">
                    <Plus className="w-4 h-4" /> Adicionar
                  </Button>
                </div>

                {subcategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                    Nenhuma subcategoria
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subcategories.sort((a, b) => a.order - b.order).map(sub => (
                      <div key={sub.id} className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <div>
                            <span className="text-sm font-medium">{sub.name}</span>
                            {sub.showRoadmap && (
                              <span className="ml-2 text-xs text-success">Roadmap ✓</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openSubcategoryModal(sub)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteSubcategory(sub.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {category ? 'Salvar Alterações' : 'Criar Categoria'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subcategory Modal */}
      <Dialog open={!!editingSubcategory} onOpenChange={() => setEditingSubcategory(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory?.id ? 'Editar Subcategoria' : 'Nova Subcategoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                placeholder="Nome da subcategoria"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                placeholder="Descrição opcional"
                className="bg-input border-border"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showRoadmap"
                checked={subcategoryForm.showRoadmap}
                onCheckedChange={(checked) => setSubcategoryForm({ ...subcategoryForm, showRoadmap: !!checked })}
              />
              <label htmlFor="showRoadmap" className="text-sm">
                Mostrar roadmap nesta subcategoria
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditingSubcategory(null)}>
                Cancelar
              </Button>
              <Button onClick={saveSubcategory}>
                {editingSubcategory?.id ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryFormModal;
