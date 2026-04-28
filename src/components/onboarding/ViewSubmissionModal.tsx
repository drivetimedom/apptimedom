import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
          <DialogTitle>📋 {submission.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Dados Pessoais */}
          <section>
            <h3 className="font-semibold text-base mb-3">👤 Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Nome</p>
                <p className="font-medium">{submission.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">CPF</p>
                <p className="font-medium">{submission.cpf}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">RG</p>
                <p className="font-medium">{submission.rg}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data Nascimento</p>
                <p className="font-medium">{submission.birth_date ? (() => { const [y,m,d] = String(submission.birth_date).split('T')[0].split('-'); return `${d}/${m}/${y}`; })() : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium">{submission.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Telefone</p>
                <p className="font-medium">{submission.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Endereço</p>
                <p className="font-medium">
                  {submission.address_street}, {submission.address_number}
                  {submission.address_complement ? ` - ${submission.address_complement}` : ''}
                  , {submission.address_neighborhood}, {submission.address_city}/{submission.address_state} - CEP: {submission.address_zip}
                </p>
              </div>
            </div>
          </section>

          {/* Dados Clínica */}
          <section>
            <h3 className="font-semibold text-base mb-3">🏥 Dados da Clínica</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Nome Fantasia</p>
                <p className="font-medium">{submission.clinic_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Razão Social</p>
                <p className="font-medium">{submission.clinic_legal_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">CNPJ</p>
                <p className="font-medium">{submission.clinic_cnpj}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Responsável Técnico</p>
                <p className="font-medium">{submission.technical_responsible}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Endereço da Clínica</p>
                <p className="font-medium">
                  {submission.clinic_address_street}, {submission.clinic_address_number}
                  {submission.clinic_address_complement ? ` - ${submission.clinic_address_complement}` : ''}
                  , {submission.clinic_address_neighborhood}, {submission.clinic_address_city}/{submission.clinic_address_state} - CEP: {submission.clinic_address_zip}
                </p>
              </div>
            </div>
          </section>

          {/* Diagnóstico */}
          <section>
            <h3 className="font-semibold text-base mb-3">📊 Diagnóstico</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Faturamento médio (3 meses)</p>
                <p className="font-medium">{formatCurrency(submission.revenue_avg_3months)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Ticket médio</p>
                <p className="font-medium">{formatCurrency(submission.avg_ticket)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pico de faturamento</p>
                <p className="font-medium">{formatCurrency(submission.peak_revenue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Meta 6 meses</p>
                <p className="font-medium">{formatCurrency(submission.target_revenue_6months)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Equipe</p>
                <p className="font-medium">{submission.team_size}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Posicionamento</p>
                <p className="font-medium">{submission.has_positioning}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Origem pacientes</p>
                <p className="font-medium">{submission.patient_source}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Dificuldade principal</p>
                <p className="font-medium">{submission.main_difficulty}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Domínio comercial</p>
                <p className="font-medium">{submission.commercial_mastery}</p>
              </div>
            </div>
            {submission.general_notes && (
              <div className="mt-3">
                <p className="text-muted-foreground text-xs">Observações</p>
                <p className="font-medium">{submission.general_notes}</p>
              </div>
            )}
          </section>

          {/* Ações */}
          <div className="flex gap-2 pt-4 border-t flex-wrap">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>

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
