import React, { useState, useMemo } from 'react';
import { Star, Plus, Loader2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SelectableItem {
  id: string;
  name: string;
  icon?: string;
}

interface StarMultiSelectProps {
  items: SelectableItem[];
  selectedIds: string[];
  featuredIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onFeaturedChange: (ids: string[]) => void;
  emptyMessage?: string;
  allowCreate?: boolean;
  createLabel?: string;
  /** When allowCreate is true, provide the category_id and type_id for the new folder */
  createCategoryId?: string | null;
  createTypeId?: string | null;
}

const StarMultiSelect: React.FC<StarMultiSelectProps> = ({
  items,
  selectedIds,
  featuredIds,
  onSelectionChange,
  onFeaturedChange,
  emptyMessage = 'Nenhum item disponível',
  allowCreate = false,
  createLabel = 'Pasta',
  createCategoryId = null,
  createTypeId = null,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const selectedNotInFiltered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return items.filter(
      (item) => selectedIds.includes(item.id) && !filteredItems.some((f) => f.id === item.id)
    );
  }, [items, selectedIds, filteredItems, searchQuery]);

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      toast({ title: 'Digite um nome', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data: newItem, error } = await supabase
        .from('swipe_file_materials')
        .insert({
          title: newItemName.trim(),
          type_id: createTypeId,
          category_id: createCategoryId,
          description: null,
          tags: [],
          content: null,
          links: [],
          pdfs: [],
          parent_folder_ids: [],
          featured_folder_ids: [],
          related_process_ids: [],
          featured_process_ids: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-select and feature the new item
      onSelectionChange([...selectedIds, newItem.id]);
      onFeaturedChange([...featuredIds, newItem.id]);

      // Refresh materials list
      queryClient.invalidateQueries({ queryKey: ['swipe-file-materials'] });

      setShowCreateDialog(false);
      setNewItemName('');
      toast({ title: `${createLabel} criada e adicionada com sucesso!` });
    } catch (error: any) {
      toast({ title: `Erro ao criar ${createLabel.toLowerCase()}`, description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Create button */}
      {allowCreate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          Criar Nova {createLabel}
        </Button>
      )}

      {/* Items list */}
      {items.length === 0 && !allowCreate ? (
        <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isFeatured = featuredIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      onFeaturedChange(featuredIds.filter((id) => id !== item.id));
                      onSelectionChange(selectedIds.filter((id) => id !== item.id));
                    } else {
                      onSelectionChange([...selectedIds, item.id]);
                    }
                  }}
                />
                {item.icon && <span className="text-sm">{item.icon}</span>}
                <span className="flex-1 text-sm text-foreground truncate">{item.name}</span>
                {isSelected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      onFeaturedChange(
                        isFeatured
                          ? featuredIds.filter((id) => id !== item.id)
                          : [...featuredIds, item.id]
                      );
                    }}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFeatured
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova {createLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da {createLabel}</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creating) handleCreate();
                }}
                placeholder={`Nome da nova ${createLabel.toLowerCase()}`}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewItemName('');
              }}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar e Adicionar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StarMultiSelect;
