import React, { useState } from 'react';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement, Announcement } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Megaphone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminAnnouncementsManager: React.FC = () => {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', image_url: '', expires_at: '' });

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', content: '', image_url: '', expires_at: '' });
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      title: a.title,
      content: a.content || '',
      image_url: a.image_url || '',
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload: any = {
      title: form.title,
      content: form.content || null,
      image_url: form.image_url || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const toggleActive = (a: Announcement) => {
    updateMutation.mutate({ id: a.id, active: !a.active });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Avisos Pop-up
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crie avisos que aparecerão como pop-up para os alunos ao acessar a plataforma.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Aviso
        </Button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum aviso criado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-card rounded-xl border border-border p-4 flex gap-4">
              {a.image_url && (
                <img src={a.image_url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    {a.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(a)} title={a.active ? 'Desativar' : 'Ativar'}>
                      {a.active ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Criado em {format(new Date(a.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  {a.expires_at && <span>Expira em {format(new Date(a.expires_at), 'dd/MM/yyyy HH:mm')}</span>}
                  <span className={a.active ? 'text-success' : 'text-muted-foreground'}>{a.active ? '● Ativo' : '○ Inativo'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do aviso" className="mt-1 bg-input border-border" />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Texto do aviso..." className="mt-1 bg-input border-border min-h-[100px]" />
            </div>
            <div>
              <Label>URL da Imagem (opcional)</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="mt-1 bg-input border-border" />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 rounded-lg max-h-40 object-contain" />
              )}
            </div>
            <div>
              <Label>Data de Expiração (opcional)</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="mt-1 bg-input border-border" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Salvar' : 'Criar Aviso'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aviso?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAnnouncementsManager;
