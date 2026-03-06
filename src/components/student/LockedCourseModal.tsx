import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LockedCourseModalProps {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  courseDescription?: string;
}

const LockedCourseModal: React.FC<LockedCourseModalProps> = ({ open, onClose, courseTitle, courseDescription }) => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de ter acesso ao curso: ${courseTitle}`
    );
    window.open(`https://wa.me/5544998792925?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-center">{courseTitle}</DialogTitle>
          <DialogDescription className="text-center">
            Você ainda não tem acesso a este curso.
          </DialogDescription>
        </DialogHeader>

        {courseDescription && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{courseDescription}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleWhatsApp} className="w-full">
            💬 Falar no WhatsApp
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LockedCourseModal;
