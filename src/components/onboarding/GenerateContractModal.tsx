import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { openContract } from '@/lib/contractStorage';

interface GenerateContractModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
}

const GenerateContractModal = ({ open, onClose, onSuccess, submission }: GenerateContractModalProps) => {
  const [contractDuration, setContractDuration] = useState('6 meses');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const generateContract = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      if (!paymentMethod) {
        throw new Error('Preencha a forma de pagamento');
      }

      // 1. Download template
      const { data: templateData, error: templateError } = await supabase.storage
        .from('contract-templates')
        .download('contrato_template.docx');

      if (templateError) throw new Error('Template não encontrado. Faça upload em Storage > contract-templates > contrato_template.docx');

      // 2. Parse template
      const arrayBuffer = await templateData.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
      });

      // 3. Fill template data
      const contractData = {
        full_name: submission.full_name,
        cpf: submission.cpf,
        rg: submission.rg,
        birth_date: (() => {
          // Evita problemas de timezone: parse manual de YYYY-MM-DD
          const [y, m, d] = String(submission.birth_date).split('T')[0].split('-');
          return `${d}/${m}/${y}`;
        })(),
        email: submission.email,
        phone: submission.phone,
        address_full: `${submission.address_street}, ${submission.address_number}${submission.address_complement ? ' - ' + submission.address_complement : ''}, ${submission.address_neighborhood}, ${submission.address_city}/${submission.address_state}, CEP ${submission.address_zip}`,
        address_street: submission.address_street,
        address_number: submission.address_number,
        address_complement: submission.address_complement || '',
        address_neighborhood: submission.address_neighborhood,
        address_city: submission.address_city,
        address_state: submission.address_state,
        address_zip: submission.address_zip,
        clinic_name: submission.clinic_name,
        clinic_legal_name: submission.clinic_legal_name,
        clinic_cnpj: submission.clinic_cnpj,
        clinic_address_full: `${submission.clinic_address_street}, ${submission.clinic_address_number}${submission.clinic_address_complement ? ' - ' + submission.clinic_address_complement : ''}, ${submission.clinic_address_neighborhood}, ${submission.clinic_address_city}/${submission.clinic_address_state}, CEP ${submission.clinic_address_zip}`,
        clinic_address_street: submission.clinic_address_street,
        clinic_address_number: submission.clinic_address_number,
        clinic_address_complement: submission.clinic_address_complement || '',
        clinic_address_neighborhood: submission.clinic_address_neighborhood,
        clinic_address_city: submission.clinic_address_city,
        clinic_address_state: submission.clinic_address_state,
        clinic_address_zip: submission.clinic_address_zip,
        technical_responsible: submission.technical_responsible,
        contract_duration: contractDuration,
        payment_method: paymentMethod,
        contract_date: new Date().toLocaleDateString('pt-BR'),
      };

      doc.setData(contractData);

      try {
        doc.render();
      } catch (error: any) {
        throw new Error(`Erro ao preencher template: ${error.message}`);
      }

      // 4. Generate blob
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // 5. Upload — sanitize filename: remove accents and special chars (Supabase Storage requires ASCII keys)
      const sanitizedName = submission.full_name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // replace non-alphanumeric with underscore
        .replace(/^_+|_+$/g, ''); // trim underscores
      const fileName = `contrato_${sanitizedName}_${Date.now()}.docx`;

      const { error: uploadError } = await supabase.storage
        .from('generated-contracts')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // 6. Store only the file path (bucket is private; signed URLs are generated on demand)
      const contractUrl = fileName;

      // 7. Update submission
      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({
          status: 'contract_generated',
          contract_duration: contractDuration,
          payment_method: paymentMethod,
          contract_docx_url: contractUrl,
          contract_generated_at: new Date().toISOString(),
          contract_generated_by: user.id,
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // 8. Auto-download
      saveAs(blob, fileName);
      setGeneratedUrl(contractUrl);

      return contractUrl;
    },
    onSuccess: () => {
      toast.success('Contrato gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao gerar contrato');
    },
  });

  const handleClose = () => {
    if (generatedUrl) {
      onSuccess();
    } else {
      onClose();
    }
    setGeneratedUrl('');
    setPaymentMethod('');
    setContractDuration('6 meses');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📄 Gerar Contrato</DialogTitle>
        </DialogHeader>

        {!generatedUrl ? (
          <form onSubmit={(e) => { e.preventDefault(); generateContract.mutate(); }} className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              ℹ️ Os dados pessoais e da clínica são preenchidos automaticamente do formulário.
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duração da Mentoria *</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${contractDuration === '6 meses' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="6 meses"
                    checked={contractDuration === '6 meses'}
                    onChange={(e) => setContractDuration(e.target.value)}
                  />
                  <div>
                    <p className="font-medium text-sm">6 meses</p>
                    <p className="text-xs text-muted-foreground">Mentoria padrão</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${contractDuration === '12 meses' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="12 meses"
                    checked={contractDuration === '12 meses'}
                    onChange={(e) => setContractDuration(e.target.value)}
                  />
                  <div>
                    <p className="font-medium text-sm">12 meses</p>
                    <p className="text-xs text-muted-foreground">Mentoria estendida</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Textarea
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Ex: 12x de R$ 997,00 no cartão de crédito"
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Exemplos: "12x de R$ 997 no cartão", "À vista R$ 10.000 via PIX"
              </p>
            </div>

            {/* Student info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">Contrato para:</p>
              <p className="text-sm">{submission?.full_name}</p>
              <p className="text-xs text-muted-foreground">{submission?.email}</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose} disabled={generateContract.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={generateContract.isPending || !paymentMethod}>
                {generateContract.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><FileText className="w-4 h-4 mr-2" /> Gerar Contrato</>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">✅ Contrato Gerado!</h3>
            <p className="text-sm text-muted-foreground">O download foi iniciado automaticamente.</p>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <h4 className="font-semibold mb-2 text-sm">📋 Próximos passos:</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Revise o contrato (se necessário)</li>
                <li>Faça upload no Autentique</li>
                <li>Envie para assinatura do aluno</li>
                <li>Após assinado, crie o acesso na plataforma</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.open(generatedUrl, '_blank')}>
                <Download className="w-4 h-4 mr-2" /> Baixar Novamente
              </Button>
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateContractModal;
