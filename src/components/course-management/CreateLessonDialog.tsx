import React, { useState } from 'react';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Module } from '@/hooks/useCourses';

interface Resource {
  type: 'pdf' | 'link';
  name: string;
  url: string;
}

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  modules: Module[];
  defaultModuleId?: string;
  onCreated: () => void;
}

const CreateLessonDialog: React.FC<CreateLessonDialogProps> = ({
  open,
  onOpenChange,
  courseId,
  modules,
  defaultModuleId,
  onCreated,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    vimeoId: '',
    duration: '',
    moduleId: defaultModuleId || '',
  });
  const [resources, setResources] = useState<Resource[]>([]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      vimeoId: '',
      duration: '',
      moduleId: defaultModuleId || modules[0]?.id || '',
    });
    setResources([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const addResource = () => {
    setResources([...resources, { type: 'link', name: '', url: '' }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: keyof Resource, value: string) => {
    setResources(resources.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'O título é obrigatório', variant: 'destructive' });
      return;
    }
    if (!form.moduleId) {
      toast({ title: 'Selecione um módulo', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Get current max order in module
      const { data: siblings } = await supabase
        .from('lessons')
        .select('order')
        .eq('module_id', form.moduleId)
        .eq('course_id', courseId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = siblings?.[0]?.order ?? -1;

      const validResources = resources.filter((r) => r.name.trim() && r.url.trim());

      const insertData = {
        course_id: courseId,
        module_id: form.moduleId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        vimeo_id: form.vimeoId.trim() || null,
        duration: form.duration.trim() || null,
        order: maxOrder + 1,
        locked: false,
        resources: validResources as unknown as import('@/integrations/supabase/types').Json,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('lessons').insert(insertData as any);

      if (error) throw error;

      toast({ title: 'Aula criada com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      onCreated();
      handleClose();
    } catch (err: any) {
      toast({ title: 'Erro ao criar aula', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Aula</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Module selector */}
          <div className="space-y-2">
            <Label htmlFor="lesson-module">Módulo</Label>
            <Select
              value={form.moduleId}
              onValueChange={(v) => setForm({ ...form, moduleId: v })}
            >
              <SelectTrigger id="lesson-module">
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent>
                {sortedModules.map((mod) => (
                  <SelectItem key={mod.id} value={mod.id}>
                    {mod.order}. {mod.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Título *</Label>
            <Input
              id="lesson-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nome da aula"
            />
          </div>

          {/* Vimeo ID + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-vimeo">ID do Vídeo (Vimeo)</Label>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="lesson-desc">Descrição / Conteúdo extra</Label>
            <Textarea
              id="lesson-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Descreva o conteúdo da aula, materiais, observações..."
            />
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
                      <SelectItem value="link">🔗 Link</SelectItem>
                      <SelectItem value="pdf">📄 PDF</SelectItem>
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
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar aula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonDialog;
