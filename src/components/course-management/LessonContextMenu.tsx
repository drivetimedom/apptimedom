import React, { useState } from 'react';
import { MoreVertical, Edit, Copy, Move, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lesson } from '@/hooks/useLessons';
import LessonEditDialog from './LessonEditDialog';
import MoveLessonDialog from './MoveLessonDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Module } from '@/hooks/useCourses';

interface LessonContextMenuProps {
  lesson: Lesson;
  modules: Module[];
  courseId: string;
  onUpdated: () => void;
}

const LessonContextMenu: React.FC<LessonContextMenuProps> = ({
  lesson,
  modules,
  courseId,
  onUpdated,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      // Get max order in same module
      const { data: siblings } = await supabase
        .from('lessons')
        .select('order')
        .eq('module_id', lesson.moduleId)
        .eq('course_id', courseId)
        .order('order', { ascending: false })
        .limit(1);

      const maxOrder = siblings?.[0]?.order ?? 0;

      const { error } = await supabase.from('lessons').insert({
        course_id: courseId,
        module_id: lesson.moduleId,
        title: `${lesson.title} (cópia)`,
        description: lesson.description,
        vimeo_id: lesson.vimeoId,
        duration: lesson.duration,
        order: maxOrder + 1,
        locked: lesson.locked,
        resources: JSON.parse(JSON.stringify(lesson.resources)),
      });

      if (error) throw error;

      toast({ title: 'Aula duplicada com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onUpdated();
    } catch (err: any) {
      toast({ title: 'Erro ao duplicar aula', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
      if (error) throw error;

      toast({ title: 'Aula excluída com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onUpdated();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir aula', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar aula
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={loading}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar aula
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMoveOpen(true)}>
            <Move className="h-4 w-4 mr-2" />
            Mover para outro módulo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir aula
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LessonEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        lesson={lesson}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['lessons'] });
          onUpdated();
        }}
      />

      <MoveLessonDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        lesson={lesson}
        modules={modules}
        courseId={courseId}
        onMoved={() => {
          queryClient.invalidateQueries({ queryKey: ['lessons'] });
          onUpdated();
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir aula?"
        description={`A aula "${lesson.title}" será permanentemente removida. Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
};

export default LessonContextMenu;
