import React, { useState } from 'react';
import { useAiTools, useUpsertAiTool, useDeleteAiTool, AiTool } from '@/hooks/useAiTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ExternalLink, Wrench } from 'lucide-react';
import { IconPicker } from './IconPicker';

const emptyForm = {
  name: '',
  description: '',
  link: '',
  tag: '',
  icon: 'Sparkles',
  active: true,
  order_index: 0,
};

const AdminAiToolsManager: React.FC = () => {
  const { data: tools = [], isLoading } = useAiTools(true);
  const upsert = useUpsertAiTool();
  const remove = useDeleteAiTool();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AiTool | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, order_index: tools.length });
    setIsOpen(true);
  };

  const openEdit = (tool: AiTool) => {
    setEditing(tool);
    setForm({
      name: tool.name,
      description: tool.description,
      link: tool.link,
      tag: tool.tag || '',
      icon: tool.icon,
      active: tool.active,
      order_index: tool.order_index,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.link) return;
    await upsert.mutateAsync({
      ...(editing ? { id: editing.id } : {}),
      ...form,
      tag: form.tag || null,
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-6 h-6" /> Ferramentas IA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as ferramentas exibidas em /ferramentas e no menu superior
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" /> Nova ferramenta
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : tools.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Wrench className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma ferramenta cadastrada</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  {!tool.active && <Badge variant="secondary">Inativa</Badge>}
                  {tool.tag && <Badge variant="outline">{tool.tag}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {tool.link} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(tool)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(tool.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar ferramenta' : 'Nova ferramenta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Planejadora de Campanha"
              />
            </div>
            <div>
              <Label>Descrição *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Monte sua campanha com orientação passo a passo"
                rows={2}
              />
            </div>
            <div>
              <Label>Link *</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tag</Label>
                <Input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="Campanha"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <IconPicker
                  value={form.icon}
                  onChange={(icon) => setForm({ ...form, icon })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                <Label>Ativa</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ferramenta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) await remove.mutateAsync(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAiToolsManager;
