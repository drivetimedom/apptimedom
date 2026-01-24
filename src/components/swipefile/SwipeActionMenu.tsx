import React from 'react';
import { 
  Eye, 
  Edit2, 
  Copy, 
  Link, 
  Share2, 
  Star, 
  StarOff,
  FolderOpen, 
  Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface SwipeActionMenuProps {
  isAdmin: boolean;
  isFavorite?: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCopyLink: () => void;
  onShare?: () => void;
  onToggleFavorite: () => void;
  onMove?: () => void;
  onDelete?: () => void;
}

const SwipeActionMenu: React.FC<SwipeActionMenuProps> = ({
  isAdmin,
  isFavorite = false,
  onView,
  onEdit,
  onDuplicate,
  onCopyLink,
  onShare,
  onToggleFavorite,
  onMove,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-foreground transition-all duration-200 md:opacity-0 max-md:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-[18px] h-[18px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[220px] bg-card border-border shadow-lg z-[1000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* View - Always available */}
        <DropdownMenuItem 
          onClick={onView}
          className="h-10 gap-3 px-3 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span>Visualizar</span>
        </DropdownMenuItem>

        {/* Admin-only actions */}
        {isAdmin && onEdit && (
          <DropdownMenuItem 
            onClick={onEdit}
            className="h-10 gap-3 px-3 cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
            <span>Editar</span>
          </DropdownMenuItem>
        )}

        {isAdmin && onDuplicate && (
          <DropdownMenuItem 
            onClick={onDuplicate}
            className="h-10 gap-3 px-3 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
            <span>Duplicar</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-border my-2" />

        {/* Copy Link - Always available */}
        <DropdownMenuItem 
          onClick={onCopyLink}
          className="h-10 gap-3 px-3 cursor-pointer"
        >
          <Link className="w-4 h-4 text-muted-foreground" />
          <span>Copiar Link</span>
        </DropdownMenuItem>

        {/* Share - Admin only */}
        {isAdmin && onShare && (
          <DropdownMenuItem 
            onClick={onShare}
            className="h-10 gap-3 px-3 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span>Compartilhar</span>
          </DropdownMenuItem>
        )}

        {/* Favorites - Always available */}
        <DropdownMenuItem 
          onClick={onToggleFavorite}
          className="h-10 gap-3 px-3 cursor-pointer"
        >
          {isFavorite ? (
            <>
              <StarOff className="w-4 h-4 text-muted-foreground" />
              <span>Remover favorito</span>
            </>
          ) : (
            <>
              <Star className="w-4 h-4 text-muted-foreground" />
              <span>Adicionar favoritos</span>
            </>
          )}
        </DropdownMenuItem>

        {/* Move - Admin only */}
        {isAdmin && onMove && (
          <DropdownMenuItem 
            onClick={onMove}
            className="h-10 gap-3 px-3 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span>Mover para...</span>
          </DropdownMenuItem>
        )}

        {/* Delete - Admin only */}
        {isAdmin && onDelete && (
          <>
            <DropdownMenuSeparator className="bg-border my-2" />
            <DropdownMenuItem 
              onClick={onDelete}
              className="h-10 gap-3 px-3 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SwipeActionMenu;
