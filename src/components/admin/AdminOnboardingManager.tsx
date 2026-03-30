import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, Download, Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import GenerateLinkModal from '@/components/onboarding/GenerateLinkModal';
import ViewSubmissionModal from '@/components/onboarding/ViewSubmissionModal';
import GenerateContractModal from '@/components/onboarding/GenerateContractModal';
import CreateAccessModal from '@/components/onboarding/CreateAccessModal';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Aguardando', variant: 'secondary' },
  contract_generated: { label: 'Contrato Gerado', variant: 'default' },
  sent_to_autentique: { label: 'No Autentique', variant: 'outline' },
  signed: { label: 'Assinado', variant: 'outline' },
  access_created: { label: 'Acesso Criado', variant: 'default' },
  completed: { label: 'Completo', variant: 'default' },
};

const statusProgress: Record<string, number> = {
  pending: 20,
  contract_generated: 40,
  sent_to_autentique: 60,
  signed: 80,
  access_created: 100,
  completed: 100,
};

const AdminOnboardingManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showGenerateLink, setShowGenerateLink] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showGenerateContract, setShowGenerateContract] = useState(false);
  const [showCreateAccess, setShowCreateAccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['onboarding-submissions', searchQuery, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('onboarding_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const statusCounts = submissions?.reduce((acc: Record<string, number>, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['onboarding-submissions'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🎯 Onboarding de Alunos</h2>
          <p className="text-muted-foreground text-sm">Gerencie cadastros e contratos</p>
        </div>
        <Button onClick={() => setShowGenerateLink(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Gerar Link
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{submissions?.length || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">⏳ Aguardando</p>
          <p className="text-2xl font-bold">{statusCounts.pending || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">📄 Contrato</p>
          <p className="text-2xl font-bold">{statusCounts.contract_generated || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">📤 Autentique</p>
          <p className="text-2xl font-bold">{statusCounts.sent_to_autentique || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">✍️ Assinado</p>
          <p className="text-2xl font-bold">{statusCounts.signed || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">✅ Acesso</p>
          <p className="text-2xl font-bold">{statusCounts.access_created || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'pending', 'contract_generated', 'signed', 'access_created'].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(status)}
            >
              {status === 'all' ? 'Todos' : statusConfig[status]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : submissions && submissions.length > 0 ? (
          submissions.map((submission) => {
            const progress = statusProgress[submission.status] || 0;
            const cfg = statusConfig[submission.status] || { label: submission.status, variant: 'secondary' as const };

            return (
              <div key={submission.id} className="bg-card border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{submission.full_name}</h3>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>📧 {submission.email}</span>
                      <span>🏥 {submission.clinic_name}</span>
                      {submission.submitted_at && (
                        <span>📅 {format(new Date(submission.submitted_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </Button>

                    {submission.status === 'pending' && (
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowGenerateContract(true);
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Contrato
                      </Button>
                    )}

                    {submission.contract_docx_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(submission.contract_docx_url!, '_blank')}
                      >
                        <Download className="w-3 h-3" />
                        Baixar
                      </Button>
                    )}

                    {['contract_generated', 'sent_to_autentique', 'signed'].includes(submission.status) && !submission.user_id && (
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowCreateAccess(true);
                        }}
                      >
                        <Users className="w-3 h-3" />
                        Criar Acesso
                      </Button>
                    )}

                    {submission.user_id && (
                      <Badge variant="outline" className="text-green-600">
                        ✅ Acesso criado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhuma submissão encontrada</p>
        )}
      </div>

      {/* Modals */}
      <GenerateLinkModal open={showGenerateLink} onClose={() => setShowGenerateLink(false)} />

      <ViewSubmissionModal
        open={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedSubmission(null); }}
        submission={selectedSubmission}
        onGenerateContract={() => {
          setShowViewModal(false);
          setShowGenerateContract(true);
        }}
        onCreateAccess={() => {
          setShowViewModal(false);
          setShowCreateAccess(true);
        }}
      />

      <GenerateContractModal
        open={showGenerateContract}
        onClose={() => { setShowGenerateContract(false); setSelectedSubmission(null); }}
        onSuccess={() => {
          setShowGenerateContract(false);
          setSelectedSubmission(null);
          invalidateAll();
        }}
        submission={selectedSubmission}
      />

      <CreateAccessModal
        open={showCreateAccess}
        onClose={() => { setShowCreateAccess(false); setSelectedSubmission(null); }}
        onSuccess={() => {
          setShowCreateAccess(false);
          setSelectedSubmission(null);
          invalidateAll();
        }}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default AdminOnboardingManager;
