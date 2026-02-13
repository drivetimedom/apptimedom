import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/hooks/useLessons';
import { Loader2 } from 'lucide-react';

interface LessonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  onSaved: () => void;
}

const LessonEditDialog: React.FC<LessonEditDialogProps> = ({
  open,
  onOpenChange,
  lesson,
  onSaved,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    vimeoId: '',
    duration: '',
  });

  useEffect(() => {
    if (open && lesson) {
      setForm({
        title: lesson.title,
        description: lesson.description,
        vimeoId: lesson.vimeoId,
        duration: lesson.duration,
      });
    }
  }, [open, lesson]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'O título é obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          vimeo_id: form.vimeoId.trim(),
          duration: form.duration.trim(),
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast({ title: 'Aula atualizada com sucesso!' });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar aula', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Aula</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Título</Label>
            <Input
              id="lesson-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-desc">Descrição</Label>
            <Textarea
              id="lesson-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-vimeo">Vimeo ID</Label>
              <Input
                id="lesson-vimeo"
                value={form.vimeoId}
                onChange={(e) => setForm({ ...form, vimeoId: e.target.value })}
                placeholder="Ex: 123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duração</Label>
              <Input
                id="lesson-duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Ex: 15:30"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonEditDialog;
