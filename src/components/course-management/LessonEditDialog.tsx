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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lesson, LessonResource } from '@/hooks/useLessons';
import { Loader2, Plus, Trash2 } from 'lucide-react';

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
  const [resources, setResources] = useState<LessonResource[]>([]);

  useEffect(() => {
    if (open && lesson) {
      setForm({
        title: lesson.title,
        description: lesson.description,
        vimeoId: lesson.vimeoId,
        duration: lesson.duration,
      });
      setResources(lesson.resources ? [...lesson.resources] : []);
    }
  }, [open, lesson]);

  const addResource = () => {
    setResources([...resources, { type: 'link', name: '', url: '' }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof LessonResource, value: string) => {
    setResources(resources.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'O título é obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const validResources = resources.filter((r) => r.name.trim() && r.url.trim());

      const { error } = await supabase
        .from('lessons')
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          vimeo_id: form.vimeoId.trim(),
          duration: form.duration.trim(),
          resources: JSON.parse(JSON.stringify(validResources)),
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
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Aula</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
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

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Recursos / Links extras</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResource}>
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>

            {resources.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum recurso adicionado.</p>
            )}

            {resources.map((resource, index) => (
              <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Select
                    value={resource.type}
                    onValueChange={(v) => updateResource(index, 'type', v as 'pdf' | 'link')}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeResource(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Nome do recurso"
                  value={resource.name}
                  onChange={(e) => updateResource(index, 'name', e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="URL"
                  value={resource.url}
                  onChange={(e) => updateResource(index, 'url', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="pt-2 border-t border-border">
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
