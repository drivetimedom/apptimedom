import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MoreHorizontal, Edit, Copy, Trash2, Map, Search, GripVertical, Video, Loader2, FileText } from 'lucide-react';
import { 
  useHofMaps, 
  useCreateHofMap, 
  useUpdateHofMap, 
  useDeleteHofMap,
  MapVideo,
  HofMap,
  VideoResource,
} from '@/hooks/useHofMaps';

const iconOptions = ['🗺️', '🎯', '🚀', '🏆', '⚡', '💎', '🔥', '📈', '🛡️', '⭐'];

const AdminMapsManager: React.FC = () => {
  const { data: maps = [], isLoading } = useHofMaps();
  const createMap = useCreateHofMap();
  const updateMap = useUpdateHofMap();
  const deleteMap = useDeleteHofMap();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<HofMap | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🗺️',
    videos: [] as MapVideo[],
    support_material_url: '',
    support_material_title: '',
  });

  const filteredMaps = maps.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (map?: HofMap) => {
    if (map) {
      setEditingMap(map);
      setFormData({
        name: map.name,
        description: map.description || '',
        icon: map.icon,
        videos: [...map.videos],
        support_material_url: map.support_material_url || '',
        support_material_title: map.support_material_title || '',
      });
    } else {
      setEditingMap(null);
      setFormData({
        name: '',
        description: '',
        icon: '🗺️',
        videos: [],
        support_material_url: '',
        support_material_title: '',
      });
    }
    setIsModalOpen(true);
  };

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const addVideo = () => {
    const newVideo: MapVideo = {
      id: generateId(),
      title: '',
      vimeoId: '',
      duration: 0,
      order: formData.videos.length,
      resources: [],
    };
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));
  };

  const addResourceToVideo = (videoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((v, i) => 
        i === videoIndex 
          ? { ...v, resources: [...(v.resources || []), { title: '', url: '' }] }
          : v
      ),
    }));
  };

  const updateVideoResource = (videoIndex: number, resIndex: number, field: keyof VideoResource, value: string) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((v, i) => 
        i === videoIndex 
          ? { ...v, resources: (v.resources || []).map((r, ri) => ri === resIndex ? { ...r, [field]: value } : r) }
          : v
      ),
    }));
  };

  const removeVideoResource = (videoIndex: number, resIndex: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((v, i) => 
        i === videoIndex 
          ? { ...v, resources: (v.resources || []).filter((_, ri) => ri !== resIndex) }
          : v
      ),
    }));
  };

  const updateVideo = (index: number, field: keyof MapVideo, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index).map((v, i) => ({ ...v, order: i })),
    }));
  };

  const calculateTotalDuration = (videos: MapVideo[]): number => {
    return videos.reduce((acc, v) => acc + (v.duration || 0), 0);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const saveMap = async () => {
    if (!formData.name.trim()) return;
    if (formData.videos.length === 0) return;

    // Validate videos
    for (const video of formData.videos) {
      if (!video.title.trim() || !video.vimeoId.trim()) return;
    }

    const totalDuration = calculateTotalDuration(formData.videos);

    if (editingMap) {
      await updateMap.mutateAsync({
        id: editingMap.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        videos: formData.videos,
        total_duration: totalDuration,
        support_material_url: formData.support_material_url.trim(),
        support_material_title: formData.support_material_title.trim(),
      });
    } else {
      await createMap.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        videos: formData.videos,
        total_duration: totalDuration,
        support_material_url: formData.support_material_url.trim(),
        support_material_title: formData.support_material_title.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const duplicateMap = async (map: HofMap) => {
    await createMap.mutateAsync({
      name: `${map.name} (Cópia)`,
      description: map.description || '',
      icon: map.icon,
      videos: map.videos.map(v => ({ ...v, id: generateId() })),
      total_duration: map.total_duration,
      support_material_url: map.support_material_url || '',
      support_material_title: map.support_material_title || '',
    });
  };

  const handleDelete = async (mapId: string) => {
    await deleteMap.mutateAsync(mapId);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" />
            Mapas (Playlists de Vídeos)
          </h2>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie playlists de vídeos para prescrever aos alunos
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Mapa
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar mapa..."
          className="pl-9 bg-input border-border"
        />
      </div>

      {/* Maps List */}
      {filteredMaps.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery ? 'Nenhum mapa encontrado' : 'Nenhum mapa cadastrado'}
            </p>
            <Button onClick={() => openModal()} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro mapa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMaps.map(map => (
            <Card key={map.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{map.icon}</span>
                  {map.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => openModal(map)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateMap(map)} className="cursor-pointer">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeleteConfirm(map.id)} 
                      className="cursor-pointer text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {map.videos.length} vídeos • {formatDuration(map.total_duration)}
                </p>
                <div className="space-y-1">
                  {map.videos.slice(0, 4).map((video, index) => (
                    <p key={video.id} className="text-sm text-foreground/80 flex items-center gap-2">
                      <Video className="w-3 h-3 text-primary" />
                      {index + 1}. {video.title} ({video.duration}min)
                    </p>
                  ))}
                  {map.videos.length > 4 && (
                    <p className="text-sm text-muted-foreground">
                      ... e mais {map.videos.length - 4} vídeo(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingMap ? 'Editar Mapa' : 'Criar Mapa'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label>Nome do Mapa *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="MAPA 10K - Jornada Completa"
                  className="bg-input border-border"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o objetivo do mapa..."
                  className="bg-input border-border"
                />
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                        formData.icon === icon 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support Material */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  📎 Material de Apoio (opcional)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Título do material</Label>
                    <Input
                      value={formData.support_material_title}
                      onChange={(e) => setFormData({ ...formData, support_material_title: e.target.value })}
                      placeholder="Ex: PDF de Exercícios"
                      className="bg-input border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Link (URL)</Label>
                    <Input
                      value={formData.support_material_url}
                      onChange={(e) => setFormData({ ...formData, support_material_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>📹 Vídeos do Mapa (Playlist)</Label>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatDuration(calculateTotalDuration(formData.videos))}
                  </p>
                </div>

                {formData.videos.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg text-center">
                    Nenhum vídeo adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.videos.map((video, index) => (
                      <div key={video.id} className="bg-muted/20 p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{index + 1}.</span>
                          <Input
                            value={video.title}
                            onChange={(e) => updateVideo(index, 'title', e.target.value)}
                            placeholder="Título do vídeo"
                            className="flex-1 bg-input border-border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVideo(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 ml-6">
                          <div>
                            <Label className="text-xs text-muted-foreground">Vimeo ID</Label>
                            <Input
                              value={video.vimeoId}
                              onChange={(e) => updateVideo(index, 'vimeoId', e.target.value)}
                              placeholder="123456789"
                              className="bg-input border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Duração (min)</Label>
                            <Input
                              type="number"
                              value={video.duration || ''}
                              onChange={(e) => updateVideo(index, 'duration', parseInt(e.target.value) || 0)}
                              placeholder="15"
                              className="bg-input border-border"
                            />
                          </div>
                        </div>
                        {/* Per-video resources */}
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Materiais de Apoio
                            </Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => addResourceToVideo(index)} className="h-6 text-xs gap-1">
                              <Plus className="w-3 h-3" /> Material
                            </Button>
                          </div>
                          {(video.resources || []).map((res, ri) => (
                            <div key={ri} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                              <Input
                                value={res.title}
                                onChange={(e) => updateVideoResource(index, ri, 'title', e.target.value)}
                                placeholder="Título"
                                className="bg-input border-border h-8 text-xs"
                              />
                              <Input
                                value={res.url}
                                onChange={(e) => updateVideoResource(index, ri, 'url', e.target.value)}
                                placeholder="https://..."
                                className="bg-input border-border h-8 text-xs"
                              />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeVideoResource(index, ri)} className="h-6 w-6 text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button type="button" variant="outline" onClick={addVideo} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Vídeo
                </Button>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={saveMap} 
              disabled={createMap.isPending || updateMap.isPending}
            >
              {(createMap.isPending || updateMap.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingMap ? 'Salvar Alterações' : 'Criar Mapa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mapa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O mapa será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMapsManager;
