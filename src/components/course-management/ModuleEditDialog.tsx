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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Module, Course, ModuleType } from '@/hooks/useCourses';
import { Loader2 } from 'lucide-react';

interface ModuleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module;
  course: Course;
  onSaved: () => void;
}

const ModuleEditDialog: React.FC<ModuleEditDialogProps> = ({
  open,
  onOpenChange,
  module,
  course,
  onSaved,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'aulas' as ModuleType });

  useEffect(() => {
    if (open && module) {
      setForm({ title: module.title, description: module.description, type: module.type || 'aulas' });
    }
  }, [open, module]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'O título é obrigatório', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const updatedModules = course.modules.map((m) =>
        m.id === module.id
          ? { ...m, title: form.title.trim(), description: form.description.trim(), type: form.type }
          : m
      );

      const { error } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedModules)) })
        .eq('id', course.id);

      if (error) throw error;

      toast({ title: 'Módulo atualizado com sucesso!' });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar módulo', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">Título</Label>
            <Input
              id="module-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-desc">Descrição</Label>
            <Textarea
              id="module-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo do módulo</Label>
            <RadioGroup value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ModuleType })} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aulas" id="edit-type-aulas" />
                <Label htmlFor="edit-type-aulas" className="font-normal cursor-pointer">Aulas (vídeos)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="material" id="edit-type-material" />
                <Label htmlFor="edit-type-material" className="font-normal cursor-pointer">Material (documento)</Label>
              </div>
            </RadioGroup>
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

export default ModuleEditDialog;
