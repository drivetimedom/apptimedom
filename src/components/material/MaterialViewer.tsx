import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useModuleMaterial } from '@/hooks/useModuleMaterial';
import { useMaterialProgress, useSaveMaterialProgress } from '@/hooks/useMaterialProgress';
import { Loader2, FileText } from 'lucide-react';

interface MaterialViewerProps {
  courseId: string;
  moduleId: string;
}

const MaterialViewer: React.FC<MaterialViewerProps> = ({ courseId, moduleId }) => {
  const { data: material, isLoading: materialLoading } = useModuleMaterial(courseId, moduleId);
  const { data: progress, isLoading: progressLoading } = useMaterialProgress(courseId, moduleId);
  const { save: saveProgress } = useSaveMaterialProgress();
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [initialized, setInitialized] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (progress?.progress_data && !initialized) {
      setProgressData(progress.progress_data as Record<string, any>);
      setInitialized(true);
    } else if (!progress && !progressLoading && !initialized) {
      setInitialized(true);
    }
  }, [progress, progressLoading, initialized]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'material-viewer-content focus:outline-none',
      },
    },
  });

  // Set content
  useEffect(() => {
    if (editor && material?.content) {
      editor.commands.setContent(material.content as any);
    }
  }, [editor, material]);

  // Handle checkbox changes in task lists
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Extract task list states from the editor JSON
      const json = editor.getJSON();
      const tasks: Record<string, boolean> = {};
      
      const extractTasks = (node: any, path: string = '') => {
        if (node.type === 'taskItem') {
          const id = `task_${path}`;
          tasks[id] = node.attrs?.checked || false;
        }
        if (node.content) {
          node.content.forEach((child: any, i: number) => {
            extractTasks(child, `${path}_${i}`);
          });
        }
      };
      
      extractTasks(json);
      
      if (Object.keys(tasks).length > 0) {
        const newProgress = { ...progressData, ...tasks };
        setProgressData(newProgress);
        saveProgress({ courseId, moduleId, progressData: newProgress });
      }
    };

    editor.on('update', handleUpdate);
    return () => { editor.off('update', handleUpdate); };
  }, [editor, courseId, moduleId, progressData, saveProgress]);

  // Make task items editable (checkable) even in read-only mode
  useEffect(() => {
    if (editor) {
      // Enable task item checking in view mode
      editor.setOptions({ editable: false });
    }
  }, [editor]);

  if (materialLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!material?.content) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Conteúdo em breve</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Este material está sendo preparado.</p>
      </div>
    );
  }

  return (
    <div className="material-viewer max-w-[720px] mx-auto px-4 md:px-0 py-8">
      <EditorContent editor={editor} />
    </div>
  );
};

export default MaterialViewer;
