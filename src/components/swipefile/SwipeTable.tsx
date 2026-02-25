import React from 'react';
import { 
  FileText, 
  ScrollText, 
  MessageSquare, 
  BarChart3, 
  Target, 
  ClipboardList, 
  Bookmark,
  LucideIcon
} from 'lucide-react';
import SwipeActionMenu from './SwipeActionMenu';
import { SwipeProcess } from './SwipeProcessModal';

interface SwipeTableProps {
  processes: SwipeProcess[];
  isAdmin: boolean;
  favorites: string[];
  onView: (process: SwipeProcess) => void;
  onEdit: (process: SwipeProcess) => void;
  onDuplicate: (process: SwipeProcess) => void;
  onCopyLink: (process: SwipeProcess) => void;
  onToggleFavorite: (processId: string) => void;
  onDelete: (process: SwipeProcess) => void;
}

const typeIcons: Record<string, LucideIcon> = {
  'Processo': FileText,
  'Script': ScrollText,
  'Coleção': MessageSquare,
  'Checklist': BarChart3,
  'Guia': Target,
  'Template': ClipboardList,
  'Referência': Bookmark,
};

const SwipeTable: React.FC<SwipeTableProps> = ({
  processes,
  isAdmin,
  favorites,
  onView,
  onEdit,
  onDuplicate,
  onCopyLink,
  onToggleFavorite,
  onDelete,
}) => {
  const getIcon = (type: string) => {
    const Icon = typeIcons[type] || FileText;
    return Icon;
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[56px_80px_1fr_140px_120px_80px] bg-background border-b-2 border-border sticky top-0 z-10">
        <div className="h-12 px-4 flex items-center" />
        <div className="h-12 px-4 flex items-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Código
        </div>
        <div className="h-12 px-4 flex items-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Título
        </div>
        <div className="h-12 px-4 flex items-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categoria
        </div>
        <div className="h-12 px-4 flex items-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tipo
        </div>
        <div className="h-12 px-4 flex items-center justify-end text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ações
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/50">
        {processes.map((process) => {
          const Icon = getIcon(process.type || 'Processo');
          const isFavorite = favorites.includes(process.id);

          return (
            <div
              key={process.id}
              className="group grid grid-cols-1 md:grid-cols-[56px_80px_1fr_140px_120px_80px] h-auto md:h-16 hover:bg-card/50 transition-colors duration-150"
            >
              {/* Mobile Card Layout */}
              <div className="md:hidden p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onView(process)}
                      className="text-left"
                    >
                      <h3 className="font-semibold text-foreground text-sm truncate hover:text-muted-foreground transition-colors">
                        {process.title}
                      </h3>
                    </button>
                    <SwipeActionMenu
                      isAdmin={isAdmin}
                      isFavorite={isFavorite}
                      onView={() => onView(process)}
                      onEdit={() => onEdit(process)}
                      onDuplicate={() => onDuplicate(process)}
                      onCopyLink={() => onCopyLink(process)}
                      onToggleFavorite={() => onToggleFavorite(process.id)}
                      onDelete={() => onDelete(process)}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
                      {process.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {process.type || 'Processo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Row Layout */}
              {/* Icon */}
              <div className="hidden md:flex h-16 px-4 items-center">
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Code */}
              <div className="hidden md:flex h-16 px-4 items-center">
                {process.code && (
                  <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                    {process.code}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="hidden md:flex h-16 px-4 items-center">
                <button
                  onClick={() => onView(process)}
                  className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors truncate text-left"
                >
                  {process.title}
                </button>
              </div>

              {/* Category */}
              <div className="hidden md:flex h-16 px-4 items-center">
                <span className="px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground font-medium truncate">
                  {process.category}
                </span>
              </div>

              {/* Type */}
              <div className="hidden md:flex h-16 px-4 items-center">
                <span className="text-[13px] text-muted-foreground">
                  {process.type || 'Processo'}
                </span>
              </div>

              {/* Actions */}
              <div className="hidden md:flex h-16 px-4 items-center justify-end">
                <SwipeActionMenu
                  isAdmin={isAdmin}
                  isFavorite={isFavorite}
                  onView={() => onView(process)}
                  onEdit={() => onEdit(process)}
                  onDuplicate={() => onDuplicate(process)}
                  onCopyLink={() => onCopyLink(process)}
                  onToggleFavorite={() => onToggleFavorite(process.id)}
                  onDelete={() => onDelete(process)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SwipeTable;
