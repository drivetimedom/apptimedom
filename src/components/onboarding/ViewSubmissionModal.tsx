import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Users } from 'lucide-react';

interface ViewSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  submission: any;
  onGenerateContract: () => void;
  onCreateAccess: () => void;
}

const ViewSubmissionModal = ({ open, onClose, submission, onGenerateContract, onCreateAccess }: ViewSubmissionModalProps) => {
  if (!submission) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📋 Dados de {submission.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Dados Pessoais */}
          <section>
            <h3 className="font-semibold text-base mb-2">👤 Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Nome:</span> {submission.full_name}</div>
              <div><span className="text-muted-foreground">CPF:</span> {submission.cpf}</div>
              <div><span className="text-muted-foreground">RG:</span> {submission.rg}</div>
              <div><span className="text-muted-foreground">Nascimento:</span> {submission.birth_date}</div>
              <div><span className="text-muted-foreground">Email:</span> {submission.email}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {submission.phone}</div>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h3 className="font-semibold text-base mb-2">📍 Endereço</h3>
            <p>
              {submission.address_street}, {submission.address_number}
              {submission.address_complement ? ` - ${submission.address_complement}` : ''}
              , {submission.address_neighborhood} - {submission.address_city}/{submission.address_state} - CEP: {submission.address_zip}
            </p>
          </section>

          {/* Clínica */}
          <section>
            <h3 className="font-semibold text-base mb-2">🏥 Clínica</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Nome Fantasia:</span> {submission.clinic_name}</div>
              <div><span className="text-muted-foreground">Razão Social:</span> {submission.clinic_legal_name}</div>
              <div><span className="text-muted-foreground">CNPJ:</span> {submission.clinic_cnpj}</div>
              <div><span className="text-muted-foreground">Resp. Técnico:</span> {submission.technical_responsible}</div>
            </div>
            <p className="mt-2">
              {submission.clinic_address_street}, {submission.clinic_address_number}
              {submission.clinic_address_complement ? ` - ${submission.clinic_address_complement}` : ''}
              , {submission.clinic_address_neighborhood} - {submission.clinic_address_city}/{submission.clinic_address_state} - CEP: {submission.clinic_address_zip}
            </p>
          </section>

          {/* Diagnóstico */}
          <section>
            <h3 className="font-semibold text-base mb-2">📊 Diagnóstico</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">Faturamento médio 3m:</span> {formatCurrency(submission.revenue_avg_3months)}</div>
              <div><span className="text-muted-foreground">Ticket médio:</span> {formatCurrency(submission.avg_ticket)}</div>
              <div><span className="text-muted-foreground">Pico faturamento:</span> {formatCurrency(submission.peak_revenue)}</div>
              <div><span className="text-muted-foreground">Meta 6 meses:</span> {formatCurrency(submission.target_revenue_6months)}</div>
              <div><span className="text-muted-foreground">Equipe:</span> {submission.team_size}</div>
              <div><span className="text-muted-foreground">Posicionamento:</span> {submission.has_positioning}</div>
              <div><span className="text-muted-foreground">Fonte pacientes:</span> {submission.patient_source}</div>
              <div><span className="text-muted-foreground">Dificuldade:</span> {submission.main_difficulty}</div>
              <div><span className="text-muted-foreground">Domínio comercial:</span> {submission.commercial_mastery}</div>
            </div>
            {submission.general_notes && (
              <div className="mt-2">
                <span className="text-muted-foreground">Notas:</span> {submission.general_notes}
              </div>
            )}
          </section>

          {/* Ações */}
          <div className="flex gap-2 pt-4 border-t">
            {submission.status === 'pending' && (
              <Button onClick={onGenerateContract} className="gap-2">
                <FileText className="w-4 h-4" />
                Gerar Contrato
              </Button>
            )}
            {['contract_generated', 'sent_to_autentique', 'signed'].includes(submission.status) && !submission.user_id && (
              <Button onClick={onCreateAccess} className="gap-2">
                <Users className="w-4 h-4" />
                Criar Acesso
              </Button>
            )}
            {submission.contract_docx_url && (
              <Button variant="outline" onClick={() => window.open(submission.contract_docx_url, '_blank')}>
                📥 Baixar Contrato
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionModal;
