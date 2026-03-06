import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ProResourceModalProps {
  open: boolean;
  onClose: () => void;
  resourceName: string;
}

const resourceInfo: Record<string, { icon: string; description: string }> = {
  'Swipe File': {
    icon: '📋',
    description: 'Biblioteca com +70 processos, scripts e checklists para clínicas de harmonização.',
  },
  'Calculadoras': {
    icon: '🧮',
    description: 'Calculadoras de ROI, precificação e métricas para gestão da sua clínica.',
  },
  'HOF CIRCLE': {
    icon: '🎯',
    description: 'Acompanhamento individual com métricas, mapas e protocolos exclusivos.',
  },
};

const ProResourceModal: React.FC<ProResourceModalProps> = ({ open, onClose, resourceName }) => {
  const info = resourceInfo[resourceName] || { icon: '⭐', description: '' };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de saber mais sobre o acesso completo ao HOF Circle (${resourceName})`
    );
    window.open(`https://wa.me/5544998792925?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              RECURSO PRO
            </span>
          </div>
          <DialogTitle className="text-center">
            {info.icon} {resourceName}
          </DialogTitle>
          <DialogDescription className="text-center">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Faça upgrade para HOF Circle completo:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">✅ Acesso a todos os cursos</li>
            <li className="flex items-center gap-2">✅ +70 processos e scripts (Swipe File)</li>
            <li className="flex items-center gap-2">✅ Calculadoras de gestão</li>
            <li className="flex items-center gap-2">✅ Acompanhamento individual</li>
            <li className="flex items-center gap-2">✅ Comunidade HOF Network</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleWhatsApp} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            💬 Quero saber mais
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProResourceModal;
