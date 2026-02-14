import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Module, Course } from '@/hooks/useCourses';
import ModuleEditDialog from './ModuleEditDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import MoveModuleDialog from './MoveModuleDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ModuleContextMenuProps {
  module: Module;
  course: Course;
  onUpdated: () => void;
}

const ModuleContextMenu: React.FC<ModuleContextMenuProps> = ({
  module,
  course,
  onUpdated,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const maxOrder = Math.max(...course.modules.map((m) => m.order), 0);
      const newModuleId = crypto.randomUUID();

      // Create new module in course modules JSON
      const newModule: Module = {
        id: newModuleId,
        title: `${module.title} (cópia)`,
        description: module.description,
        order: maxOrder + 1,
        lessonIds: [],
      };

      const updatedModules = [...course.modules, newModule];

      const { error: courseError } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedModules)) })
        .eq('id', course.id);

      if (courseError) throw courseError;

      // Duplicate all lessons from the original module
      const { data: originalLessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .eq('course_id', course.id);

      if (originalLessons && originalLessons.length > 0) {
        const newLessons = originalLessons.map((l) => ({
          course_id: course.id,
          module_id: newModuleId,
          title: l.title,
          description: l.description,
          vimeo_id: l.vimeo_id,
          duration: l.duration,
          order: l.order,
          locked: l.locked,
          resources: l.resources,
        }));

        const { error: lessonsError } = await supabase.from('lessons').insert(newLessons);
        if (lessonsError) throw lessonsError;
      }

      toast({ title: 'Módulo duplicado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', course.id] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onUpdated();
    } catch (err: any) {
      toast({ title: 'Erro ao duplicar módulo', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete all lessons in the module
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('module_id', module.id)
        .eq('course_id', course.id);

      if (lessonsError) throw lessonsError;

      // Remove module from course modules JSON
      const updatedModules = course.modules.filter((m) => m.id !== module.id);

      const { error: courseError } = await supabase
        .from('courses')
        .update({ modules: JSON.parse(JSON.stringify(updatedModules)) })
        .eq('id', course.id);

      if (courseError) throw courseError;

      toast({ title: 'Módulo excluído com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', course.id] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onUpdated();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir módulo', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar módulo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={loading}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar módulo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setMoveOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Realocar para outro curso
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir módulo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        module={module}
        course={course}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['courses'] });
          queryClient.invalidateQueries({ queryKey: ['course', course.id] });
          onUpdated();
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir módulo?"
        description={`O módulo "${module.title}" e todas as suas aulas serão permanentemente removidos. Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={loading}
      />

      <MoveModuleDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        module={module}
        course={course}
        onMoved={() => {
          queryClient.invalidateQueries({ queryKey: ['courses'] });
          queryClient.invalidateQueries({ queryKey: ['course', course.id] });
          onUpdated();
        }}
      />
    </>
  );
};

export default ModuleContextMenu;
