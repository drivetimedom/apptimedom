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
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Module } from '@/hooks/useCourses';

interface CreateModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  existingModules: Module[];
  onCreated: () => void;
}

const CreateModuleDialog: React.FC<CreateModuleDialogProps> = ({
  open,
  onOpenChange,
  courseId,
  existingModules,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const maxOrder = Math.max(...existingModules.map((m) => m.order), 0);
      const newModule: Module = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        order: maxOrder + 1,
        lessonIds: [],
      };

      const updatedModules = [...existingModules, newModule];

      const { error } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedModules)) })
        .eq('id', courseId);

      if (error) throw error;

      toast({ title: 'Módulo criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      onCreated();
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao criar módulo', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Módulo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">Título</Label>
            <Input
              id="module-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do módulo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-description">Descrição (opcional)</Label>
            <Textarea
              id="module-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do módulo"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || loading}>
            {loading ? 'Criando...' : 'Criar módulo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleDialog;
