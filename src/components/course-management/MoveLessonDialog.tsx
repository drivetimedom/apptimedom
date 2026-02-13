import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/hooks/useLessons';
import { Module } from '@/hooks/useCourses';
import { Loader2 } from 'lucide-react';

interface MoveLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  modules: Module[];
  courseId: string;
  onMoved: () => void;
}

const MoveLessonDialog: React.FC<MoveLessonDialogProps> = ({
  open,
  onOpenChange,
  lesson,
  modules,
  courseId,
  onMoved,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState('');

  const availableModules = modules.filter((m) => m.id !== lesson.moduleId);

  const handleMove = async () => {
    if (!targetModuleId) {
      toast({ title: 'Selecione um módulo destino', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Get max order in target module
      const { data: siblings } = await supabase
        .from('lessons')
        .select('order')
        .eq('module_id', targetModuleId)
        .eq('course_id', courseId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = siblings?.[0]?.order ?? 0;

      const { error } = await supabase
        .from('lessons')
        .update({ module_id: targetModuleId, order: maxOrder + 1 })
        .eq('id', lesson.id);

      if (error) throw error;

      toast({ title: 'Aula movida com sucesso!' });
      onMoved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao mover aula', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Mover Aula</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Mover "<span className="font-medium text-foreground">{lesson.title}</span>" para:
          </p>
          <div className="space-y-2">
            <Label>Módulo destino</Label>
            <Select value={targetModuleId} onValueChange={setTargetModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent>
                {availableModules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleMove} disabled={loading || !targetModuleId}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveLessonDialog;
