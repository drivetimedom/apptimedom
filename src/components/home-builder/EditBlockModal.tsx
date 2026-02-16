import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  HomeBlock,
  BlockData,
  BannerBlockData,
  CoursesBlockData,
  TextBlockData,
  ButtonBlockData,
  VideoBlockData,
  DividerBlockData,
  HeroCarouselBlockData,
  ContinueWatchingBlockData,
  BlockType
} from '@/hooks/useHomeBlocks';
import { Image, BookOpen, Type, Link2, Video, Minus, Layers, PlayCircle } from 'lucide-react';

interface EditBlockModalProps {
  block: HomeBlock;
  onSave: (data: BlockData) => void;
  onCancel: () => void;
}

const getBlockName = (type: BlockType): string => {
  switch (type) {
    case 'hero_carousel': return 'Carrossel Hero';
    case 'banner': return 'Banner com Link';
    case 'courses': return 'Seção de Cursos';
    case 'continue_watching': return 'Continuar Assistindo';
    case 'text': return 'Texto/Título';
    case 'button': return 'Botão';
    case 'video': return 'Vídeo';
    case 'divider': return 'Divisor';
    default: return type;
  }
};

const getBlockIcon = (type: BlockType) => {
  switch (type) {
    case 'hero_carousel': return <Layers className="w-5 h-5" />;
    case 'banner': return <Image className="w-5 h-5" />;
    case 'courses': return <BookOpen className="w-5 h-5" />;
    case 'continue_watching': return <PlayCircle className="w-5 h-5" />;
    case 'text': return <Type className="w-5 h-5" />;
    case 'button': return <Link2 className="w-5 h-5" />;
    case 'video': return <Video className="w-5 h-5" />;
    case 'divider': return <Minus className="w-5 h-5" />;
    default: return null;
  }
};

const EditBlockModal: React.FC<EditBlockModalProps> = ({ block, onSave, onCancel }) => {
  const [formData, setFormData] = useState<BlockData>({ ...block.data });
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (block.type === 'courses') {
      loadCategoriesAndCourses();
    }
  }, [block.type]);

  const loadCategoriesAndCourses = async () => {
    const [categoriesRes, coursesRes] = await Promise.all([
      supabase.from('categories').select('*').eq('active', true).order('name'),
      supabase.from('courses').select('id, title').eq('status', 'published').order('title')
    ]);

    setCategories(categoriesRes.data || []);
    setCourses(coursesRes.data || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderBannerForm = () => {
    const data = formData as BannerBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>URL da Imagem *</Label>
          <Input
            value={data.imageUrl}
            onChange={(e) => setFormData({ ...data, imageUrl: e.target.value })}
            placeholder="https://cdn.exemplo.com/banner.jpg"
          />
          {data.imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Preview:</p>
              <img
                src={data.imageUrl}
                alt="Preview"
                className="w-full max-h-40 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Link (ao clicar) *</Label>
          <Input
            value={data.link}
            onChange={(e) => setFormData({ ...data, link: e.target.value })}
            placeholder="https://hotmart.com/... ou /curso/xyz"
          />
        </div>

        <div className="space-y-2">
          <Label>Altura do Banner</Label>
          <Select
            value={data.height}
            onValueChange={(value) => setFormData({ ...data, height: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300px">300px (Pequeno)</SelectItem>
              <SelectItem value="400px">400px (Médio)</SelectItem>
              <SelectItem value="500px">500px (Grande)</SelectItem>
              <SelectItem value="600px">600px (Extra Grande)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="openInNewTab"
            checked={data.openInNewTab}
            onCheckedChange={(checked) => setFormData({ ...data, openInNewTab: !!checked })}
          />
          <Label htmlFor="openInNewTab">Abrir em nova aba</Label>
        </div>
      </div>
    );
  };

  const renderCoursesForm = () => {
    const data = formData as CoursesBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título da Seção *</Label>
          <Input
            value={data.title}
            onChange={(e) => setFormData({ ...data, title: e.target.value })}
            placeholder="Ex: Hof Circle"
          />
        </div>

        <div className="space-y-2">
          <Label>Filtrar por *</Label>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="filter-all"
                name="filterType"
                checked={data.filterType === 'all'}
                onChange={() => setFormData({ ...data, filterType: 'all', categoryId: null, courseId: null })}
                className="mt-1"
              />
              <div>
                <Label htmlFor="filter-all" className="cursor-pointer">Todos os cursos</Label>
                <p className="text-xs text-muted-foreground">Mostra todos os cursos disponíveis</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="filter-category"
                name="filterType"
                checked={data.filterType === 'category'}
                onChange={() => setFormData({ ...data, filterType: 'category', courseId: null })}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="filter-category" className="cursor-pointer">Categoria específica</Label>
                <Select
                  value={data.categoryId || ''}
                  onValueChange={(value) => setFormData({ ...data, categoryId: value })}
                  disabled={data.filterType !== 'category'}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="filter-single"
                name="filterType"
                checked={data.filterType === 'single'}
                onChange={() => setFormData({ ...data, filterType: 'single', categoryId: null })}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="filter-single" className="cursor-pointer">Curso único</Label>
                <Select
                  value={data.courseId || ''}
                  onValueChange={(value) => setFormData({ ...data, courseId: value })}
                  disabled={data.filterType !== 'single'}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={data.layout}
            onValueChange={(value: 'grid' | 'carousel') => setFormData({ ...data, layout: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="carousel">Carrossel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Itens por linha</Label>
          <Select
            value={String(data.itemsPerRow)}
            onValueChange={(value) => setFormData({ ...data, itemsPerRow: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 (largura total)</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Limite de itens</Label>
          <Input
            type="number"
            value={data.limit || ''}
            onChange={(e) => setFormData({ ...data, limit: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Deixe vazio para mostrar todos"
            min="1"
          />
          <p className="text-xs text-muted-foreground">
            Deixe vazio para mostrar todos os cursos
          </p>
        </div>
      </div>
    );
  };

  const renderTextForm = () => {
    const data = formData as TextBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título *</Label>
          <Input
            value={data.title}
            onChange={(e) => setFormData({ ...data, title: e.target.value })}
            placeholder="Ex: O que vem por aí"
            className="text-xl font-bold"
          />
        </div>

        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Input
            value={data.subtitle}
            onChange={(e) => setFormData({ ...data, subtitle: e.target.value })}
            placeholder="Texto secundário (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label>Alinhamento</Label>
          <Select
            value={data.alignment}
            onValueChange={(value: 'left' | 'center' | 'right') => setFormData({ ...data, alignment: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderButtonForm = () => {
    const data = formData as ButtonBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Texto do Botão *</Label>
          <Input
            value={data.text}
            onChange={(e) => setFormData({ ...data, text: e.target.value })}
            placeholder="Ex: Clique aqui"
          />
        </div>

        <div className="space-y-2">
          <Label>Link *</Label>
          <Input
            value={data.link}
            onChange={(e) => setFormData({ ...data, link: e.target.value })}
            placeholder="https://... ou /pagina"
          />
        </div>

        <div className="space-y-2">
          <Label>Cor do Botão</Label>
          <Input
            type="color"
            value={data.color}
            onChange={(e) => setFormData({ ...data, color: e.target.value })}
            className="h-12 cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <Select
            value={data.size}
            onValueChange={(value: 'small' | 'medium' | 'large') => setFormData({ ...data, size: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderVideoForm = () => {
    const data = formData as VideoBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>URL do Vídeo *</Label>
          <Input
            value={data.url}
            onChange={(e) => setFormData({ ...data, url: e.target.value })}
            placeholder="https://vimeo.com/... ou https://youtube.com/..."
          />
          <p className="text-xs text-muted-foreground">
            Suporta Vimeo e YouTube
          </p>
        </div>

        <div className="space-y-2">
          <Label>Altura do Player</Label>
          <Select
            value={data.height}
            onValueChange={(value) => setFormData({ ...data, height: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300px">300px</SelectItem>
              <SelectItem value="400px">400px</SelectItem>
              <SelectItem value="500px">500px</SelectItem>
              <SelectItem value="600px">600px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderDividerForm = () => {
    const data = formData as DividerBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Espaçamento</Label>
          <Select
            value={data.spacing}
            onValueChange={(value) => setFormData({ ...data, spacing: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20px">20px (Pequeno)</SelectItem>
              <SelectItem value="40px">40px (Médio)</SelectItem>
              <SelectItem value="60px">60px (Grande)</SelectItem>
              <SelectItem value="80px">80px (Extra Grande)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderHeroCarouselForm = () => {
    const data = formData as HeroCarouselBlockData;
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Este bloco exibe os banners configurados em <strong>Admin → Banners</strong>. 
            Para adicionar ou editar banners, acesse a seção de gerenciamento de banners.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Altura do Carrossel</Label>
          <Select
            value={data.height}
            onValueChange={(value) => setFormData({ ...data, height: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400px">400px (Pequeno)</SelectItem>
              <SelectItem value="500px">500px (Médio)</SelectItem>
              <SelectItem value="600px">600px (Grande)</SelectItem>
              <SelectItem value="700px">700px (Extra Grande)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Intervalo de Autoplay (ms)</Label>
          <Select
            value={String(data.autoplayInterval)}
            onValueChange={(value) => setFormData({ ...data, autoplayInterval: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3000">3 segundos</SelectItem>
              <SelectItem value="5000">5 segundos</SelectItem>
              <SelectItem value="7000">7 segundos</SelectItem>
              <SelectItem value="10000">10 segundos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderContinueWatchingForm = () => {
    const data = formData as ContinueWatchingBlockData;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={data.title}
            onChange={(e) => setFormData({ ...data, title: e.target.value })}
            placeholder="Continue Assistindo"
          />
        </div>

        <div className="space-y-2">
          <Label>Subtítulo (opcional)</Label>
          <Input
            value={data.subtitle}
            onChange={(e) => setFormData({ ...data, subtitle: e.target.value })}
            placeholder="Continue de onde você parou"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showThumbnail"
            checked={data.showThumbnail}
            onCheckedChange={(checked) => setFormData({ ...data, showThumbnail: !!checked })}
          />
          <Label htmlFor="showThumbnail">Mostrar thumbnail do curso</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showProgressBar"
            checked={data.showProgressBar}
            onCheckedChange={(checked) => setFormData({ ...data, showProgressBar: !!checked })}
          />
          <Label htmlFor="showProgressBar">Mostrar barra de progresso</Label>
        </div>

        <div className="space-y-2">
          <Label>Texto do Botão</Label>
          <Input
            value={data.buttonText}
            onChange={(e) => setFormData({ ...data, buttonText: e.target.value })}
            placeholder="Continuar"
          />
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (block.type) {
      case 'hero_carousel': return renderHeroCarouselForm();
      case 'banner': return renderBannerForm();
      case 'courses': return renderCoursesForm();
      case 'continue_watching': return renderContinueWatchingForm();
      case 'text': return renderTextForm();
      case 'button': return renderButtonForm();
      case 'video': return renderVideoForm();
      case 'divider': return renderDividerForm();
      default: return null;
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {getBlockIcon(block.type)}
            Editar {getBlockName(block.type)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="py-4">
            {renderForm()}
          </div>
        </form>

        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlockModal;
