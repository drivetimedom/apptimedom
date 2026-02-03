import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  GripVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Image,
  BookOpen,
  Type,
  Link2,
  Video,
  Minus,
  ArrowLeft,
  Loader2,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useHomeBlocks,
  useCreateHomeBlock,
  useUpdateHomeBlock,
  useUpdateBlocksOrder,
  useDuplicateHomeBlock,
  useDeleteHomeBlock,
  HomeBlock,
  BlockType,
  BlockData
} from '@/hooks/useHomeBlocks';
import BlockPreview from '@/components/home-builder/BlockPreview';
import EditBlockModal from '@/components/home-builder/EditBlockModal';
import BlockRenderer from '@/components/home-builder/BlockRenderer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const blockTypes: { type: BlockType; icon: React.ElementType; name: string; desc: string }[] = [
  { type: 'hero_carousel', icon: Layers, name: '🎠 Carrossel Hero', desc: 'Carrossel com banners do sistema' },
  { type: 'banner', icon: Image, name: '📸 Banner com Link', desc: 'Imagem clicável com redirecionamento' },
  { type: 'courses', icon: BookOpen, name: '🎓 Seção de Cursos', desc: 'Grid de cursos filtrados' },
  { type: 'text', icon: Type, name: '📝 Texto/Título', desc: 'Título e subtítulo customizados' },
  { type: 'button', icon: Link2, name: '🔗 Botão', desc: 'Botão com link externo/interno' },
  { type: 'video', icon: Video, name: '📺 Vídeo', desc: 'Player embed (Vimeo/YouTube)' },
  { type: 'divider', icon: Minus, name: '━━ Divisor', desc: 'Espaçamento entre blocos' }
];

const getBlockIcon = (type: BlockType) => {
  switch (type) {
    case 'hero_carousel': return <Layers className="w-4 h-4" />;
    case 'banner': return <Image className="w-4 h-4" />;
    case 'courses': return <BookOpen className="w-4 h-4" />;
    case 'text': return <Type className="w-4 h-4" />;
    case 'button': return <Link2 className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'divider': return <Minus className="w-4 h-4" />;
    default: return null;
  }
};

const getBlockName = (type: BlockType): string => {
  switch (type) {
    case 'hero_carousel': return 'Carrossel Hero';
    case 'banner': return 'Banner com Link';
    case 'courses': return 'Seção de Cursos';
    case 'text': return 'Texto/Título';
    case 'button': return 'Botão';
    case 'video': return 'Vídeo';
    case 'divider': return 'Divisor';
    default: return type;
  }
};

const HomeBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HomeBlock | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  const { data: blocks = [], isLoading } = useHomeBlocks();
  const createBlock = useCreateHomeBlock();
  const updateBlock = useUpdateHomeBlock();
  const updateOrder = useUpdateBlocksOrder();
  const duplicateBlock = useDuplicateHomeBlock();
  const deleteBlock = useDeleteHomeBlock();

  // Redirect non-admins
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateOrder.mutate(items);
  };

  const handleAddBlock = (type: BlockType) => {
    createBlock.mutate({ type, orderIndex: blocks.length });
    setShowAddMenu(false);
  };

  const handleSaveBlock = (data: BlockData) => {
    if (editingBlock) {
      updateBlock.mutate({ id: editingBlock.id, data });
      setEditingBlock(null);
    }
  };

  const handleDeleteBlock = () => {
    if (blockToDelete) {
      deleteBlock.mutate(blockToDelete);
      setBlockToDelete(null);
    }
  };

  // Preview Mode
  if (previewMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Editor
          </Button>
          <span className="text-sm text-muted-foreground">Modo Preview</span>
        </div>
        <div>
          {blocks.map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))}
          {blocks.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Nenhum bloco adicionado</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              🏗️ Construtor da Home
            </h1>
            <p className="text-sm text-muted-foreground">
              Arraste blocos para montar a página inicial
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Add Block Button */}
      <div className="mb-6 relative">
        <Button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>

        {showAddMenu && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <div className="bg-card border border-border rounded-xl shadow-xl p-2 w-80">
              {blockTypes.map(({ type, icon: Icon, name, desc }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Blocks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Nenhum bloco adicionado
          </h3>
          <p className="text-sm text-muted-foreground">
            Comece adicionando seu primeiro bloco
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-card border border-border rounded-xl overflow-hidden transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
                        }`}
                      >
                        {/* Block Header */}
                        <div className="flex items-center gap-3 p-4 bg-muted/50 border-b border-border">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
                          >
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {/* Icon and Name */}
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              {getBlockIcon(block.type)}
                            </div>
                            <span className="font-medium text-foreground">
                              {getBlockName(block.type)}
                            </span>
                            {(block.data as any).title && (
                              <span className="text-muted-foreground">
                                — {(block.data as any).title}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingBlock(block)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateBlock.mutate(block)}
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setBlockToDelete(block.id)}
                              className="text-destructive hover:text-destructive"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Block Preview */}
                        <div className="p-4">
                          <BlockPreview block={block} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Edit Modal */}
      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onCancel={() => setEditingBlock(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!blockToDelete} onOpenChange={() => setBlockToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O bloco será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlock} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HomeBuilderPage;
