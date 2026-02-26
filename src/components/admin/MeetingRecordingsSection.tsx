import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Pencil, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MeetingRecordingsSectionProps {
  userId: string;
}

const MeetingRecordingsSection: React.FC<MeetingRecordingsSectionProps> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecording, setEditingRecording] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ['meeting-recordings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_recordings')
        .select('*')
        .eq('user_id', userId)
        .order('meeting_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meeting_recordings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-recordings', userId] });
      toast({ title: 'Gravação excluída' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">🎥 Reuniões Individuais</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { setEditingRecording(null); setShowModal(true); }}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Nova Gravação
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Gravações de reuniões individuais com o aluno
      </p>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : recordings.length > 0 ? (
          recordings.map((recording: any) => (
            <div key={recording.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{recording.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(recording.meeting_date).toLocaleDateString('pt-BR')}
                  {recording.duration_minutes && ` • ${recording.duration_minutes} min`}
                  {` • Vimeo: ${recording.vimeo_id}`}
                </p>
                {recording.description && (
                  <p className="text-xs text-muted-foreground truncate">{recording.description}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditingRecording(recording); setShowModal(true); }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Excluir esta gravação?')) {
                      deleteMutation.mutate(recording.id);
                    }
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg text-center">
            Nenhuma gravação adicionada ainda
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RecordingFormModal
          userId={userId}
          recording={editingRecording}
          onClose={() => { setShowModal(false); setEditingRecording(null); }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['meeting-recordings', userId] });
            setShowModal(false);
            setEditingRecording(null);
          }}
        />
      )}
    </div>
  );
};

const RecordingFormModal: React.FC<{
  userId: string;
  recording: any;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ userId, recording, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: recording?.title || '',
    meeting_date: recording?.meeting_date || '',
    vimeo_id: recording?.vimeo_id || '',
    description: recording?.description || '',
    duration_minutes: recording?.duration_minutes?.toString() || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.meeting_date || !formData.vimeo_id) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dataToSave = {
        user_id: userId,
        title: formData.title,
        meeting_date: formData.meeting_date,
        vimeo_id: formData.vimeo_id,
        description: formData.description || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        created_by: user.id,
      };

      if (recording) {
        const { error } = await supabase
          .from('meeting_recordings')
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq('id', recording.id);
        if (error) throw error;
        toast({ title: 'Gravação atualizada!' });
      } else {
        const { error } = await supabase.from('meeting_recordings').insert(dataToSave);
        if (error) throw error;
        toast({ title: 'Gravação adicionada!' });
      }
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar gravação', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{recording ? 'Editar Gravação' : 'Nova Gravação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reunião de Plano de Ação"
              className="bg-input border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Data da Reunião *</Label>
            <Input
              type="date"
              value={formData.meeting_date}
              onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              className="bg-input border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Vimeo ID *</Label>
            <Input
              value={formData.vimeo_id}
              onChange={(e) => setFormData({ ...formData, vimeo_id: e.target.value })}
              placeholder="Ex: 123456789"
              className="bg-input border-border"
              required
            />
            <p className="text-xs text-muted-foreground">ID do vídeo no Vimeo (apenas números)</p>
          </div>
          <div className="space-y-2">
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              placeholder="Ex: 45"
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Discutimos estratégia de captação..."
              className="w-full min-h-20 px-3 py-2 border border-border rounded-lg bg-input text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : recording ? 'Salvar Alterações' : 'Adicionar Gravação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingRecordingsSection;
