import React from 'react';
import { 
  HomeBlock, 
  BannerBlockData, 
  CoursesBlockData, 
  TextBlockData, 
  ButtonBlockData, 
  VideoBlockData, 
  DividerBlockData 
} from '@/hooks/useHomeBlocks';

interface BlockPreviewProps {
  block: HomeBlock;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block }) => {
  switch (block.type) {
    case 'banner': {
      const data = block.data as BannerBlockData;
      return (
        <div className="relative">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Banner preview"
              className="w-full h-24 object-cover rounded opacity-70"
            />
          ) : (
            <div className="w-full h-24 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Sem imagem</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Link: {data.link || 'Não definido'}
          </div>
        </div>
      );
    }

    case 'courses': {
      const data = block.data as CoursesBlockData;
      return (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{data.title}</p>
          <p className="text-xs text-muted-foreground">
            Filtro: {data.filterType === 'all' ? 'Todos os cursos' :
                    data.filterType === 'category' ? 'Por categoria' : 'Curso único'}
          </p>
          <p className="text-xs text-muted-foreground">
            Layout: {data.layout} • {data.itemsPerRow} por linha
            {data.limit && ` • Limite: ${data.limit}`}
          </p>
        </div>
      );
    }

    case 'text': {
      const data = block.data as TextBlockData;
      return (
        <div className={`text-${data.alignment}`}>
          <p className="text-lg font-bold text-foreground">{data.title}</p>
          {data.subtitle && (
            <p className="text-sm text-muted-foreground">{data.subtitle}</p>
          )}
        </div>
      );
    }

    case 'button': {
      const data = block.data as ButtonBlockData;
      const sizeClasses = {
        small: 'px-4 py-2 text-sm',
        medium: 'px-6 py-3',
        large: 'px-8 py-4 text-lg'
      };
      return (
        <button
          className={`${sizeClasses[data.size]} rounded-lg font-semibold text-background`}
          style={{ backgroundColor: data.color }}
        >
          {data.text}
        </button>
      );
    }

    case 'video': {
      const data = block.data as VideoBlockData;
      return (
        <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
          <span className="text-muted-foreground">📺 Player de Vídeo {data.url ? `(${data.height})` : '(URL não definida)'}</span>
        </div>
      );
    }

    case 'divider': {
      const data = block.data as DividerBlockData;
      return (
        <div className="py-2 flex items-center">
          <div className="w-full h-px bg-border" />
          <span className="px-2 text-xs text-muted-foreground whitespace-nowrap">
            Espaçamento: {data.spacing}
          </span>
          <div className="w-full h-px bg-border" />
        </div>
      );
    }

    default:
      return null;
  }
};

export default BlockPreview;
