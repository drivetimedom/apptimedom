import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCourses, Module, Course } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface MoveModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module;
  course: Course;
  onMoved: () => void;
}

const MoveModuleDialog: React.FC<MoveModuleDialogProps> = ({
  open,
  onOpenChange,
  module,
  course,
  onMoved,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allCourses = [] } = useCourses();
  const [targetCourseId, setTargetCourseId] = useState('');
  const [loading, setLoading] = useState(false);

  const otherCourses = allCourses.filter((c) => c.id !== course.id);

  const handleMove = async () => {
    if (!targetCourseId) {
      toast({ title: 'Selecione um curso destino', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const targetCourse = allCourses.find((c) => c.id === targetCourseId);
      if (!targetCourse) throw new Error('Curso destino não encontrado');

      const maxOrder = Math.max(...targetCourse.modules.map((m) => m.order), 0);

      // Add module to target course
      const moduleToMove = { ...module, order: maxOrder + 1 };
      const updatedTargetModules = [...targetCourse.modules, moduleToMove];

      const { error: targetError } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedTargetModules)) })
        .eq('id', targetCourseId);

      if (targetError) throw targetError;

      // Remove module from source course
      const updatedSourceModules = course.modules.filter((m) => m.id !== module.id);

      const { error: sourceError } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedSourceModules)) })
        .eq('id', course.id);

      if (sourceError) throw sourceError;

      // Update lessons course_id
      const { error: lessonsError } = await supabase
        .from('lessons')
        .update({ course_id: targetCourseId })
        .eq('module_id', module.id)
        .eq('course_id', course.id);

      if (lessonsError) throw lessonsError;

      toast({ title: 'Módulo realocado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', course.id] });
      queryClient.invalidateQueries({ queryKey: ['course', targetCourseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onMoved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao realocar módulo', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Realocar módulo</DialogTitle>
          <DialogDescription>
            Mover "{module.title}" e todas as suas aulas para outro curso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Curso destino</Label>
            <Select value={targetCourseId} onValueChange={setTargetCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {otherCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
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
          <Button onClick={handleMove} disabled={loading || !targetCourseId}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Realocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveModuleDialog;
