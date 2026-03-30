import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GenerateContractModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
}

const GenerateContractModal = ({ open, onClose, onSuccess, submission }: GenerateContractModalProps) => {
  const [duration, setDuration] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const generateContract = useMutation({
    mutationFn: async () => {
      if (!duration || !paymentMethod) {
        throw new Error('Preencha todos os campos');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Update submission with contract info
      const { error } = await supabase
        .from('onboarding_submissions')
        .update({
          contract_duration: duration,
          payment_method: paymentMethod,
          status: 'contract_generated',
          contract_generated_at: new Date().toISOString(),
          contract_generated_by: user.id,
        })
        .eq('id', submission.id);

      if (error) throw error;

      // TODO: Generate actual DOCX using docxtemplater when template is uploaded
      toast.success('Status atualizado para "Contrato Gerado". Faça upload do template DOCX no bucket contract-templates para gerar automaticamente.');
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar contrato');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📄 Gerar Contrato - {submission?.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Duração do Contrato *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3 meses">3 meses</SelectItem>
                <SelectItem value="6 meses">6 meses</SelectItem>
                <SelectItem value="12 meses">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Forma de Pagamento *</Label>
            <Textarea
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ex: PIX à vista, 6x cartão de crédito..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => generateContract.mutate()}
              disabled={generateContract.isPending || !duration || !paymentMethod}
            >
              {generateContract.isPending ? 'Gerando...' : 'Gerar Contrato'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateContractModal;
