import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface SwipeDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  processTitle?: string;
}

const SwipeDeleteConfirmation: React.FC<SwipeDeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  processTitle,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border max-w-[400px]">
        <AlertDialogHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-foreground text-center">
            Excluir processo?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-center">
            Esta ação não pode ser desfeita. O processo 
            {processTitle && <strong className="text-foreground"> "{processTitle}"</strong>} será permanentemente removido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:justify-center mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="flex-1 bg-secondary border-0 hover:bg-secondary/80"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SwipeDeleteConfirmation;
