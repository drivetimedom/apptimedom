import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  Loader2,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

interface Diagnostico {
  id: string;
  user_id: string;
  respostas: any;
  resultado_ia: any;
  resultado_final: any;
  mapa_prescrito_final: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const useDiagnosticos = () => {
  return useQuery({
    queryKey: ['admin-diagnosticos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnosticos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Diagnostico[];
    },
  });
};

const useProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['profiles-for-diagnosticos', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, status')
        .in('user_id', userIds);

      if (error) throw error;
      return data;
    },
    enabled: userIds.length > 0,
  });
};

const AdminDiagnosticos: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDiag, setSelectedDiag] = useState<Diagnostico | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustedMap, setAdjustedMap] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: diagnosticos = [], isLoading } = useDiagnosticos();
  const userIds = diagnosticos.map(d => d.user_id);
  const { data: profiles = [] } = useProfiles(userIds);

  const getProfile = (userId: string) => profiles.find(p => p.user_id === userId);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, resultado_final, mapa_prescrito_final }: {
      id: string;
      status: string;
      resultado_final?: any;
      mapa_prescrito_final?: string;
    }) => {
      const updateData: any = { status };
      if (resultado_final) updateData.resultado_final = resultado_final;
      if (mapa_prescrito_final) updateData.mapa_prescrito_final = mapa_prescrito_final;

      const { error } = await supabase
        .from('diagnosticos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diagnosticos'] });
      toast({ title: 'Diagnóstico atualizado!' });
      setDetailOpen(false);
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    },
  });

  const handleApprove = (diag: Diagnostico) => {
    updateStatusMutation.mutate({
      id: diag.id,
      status: 'aprovado',
      resultado_final: diag.resultado_ia,
      mapa_prescrito_final: diag.resultado_ia?.mapa_prescrito || '',
    });
  };

  const handleAdjust = () => {
    if (!selectedDiag) return;
    const adjustedResult = {
      ...selectedDiag.resultado_ia,
      mapa_prescrito: adjustedMap || selectedDiag.resultado_ia?.mapa_prescrito,
      notas_mentor: adjustNotes,
    };
    updateStatusMutation.mutate({
      id: selectedDiag.id,
      status: 'ajustado',
      resultado_final: adjustedResult,
      mapa_prescrito_final: adjustedMap || selectedDiag.resultado_ia?.mapa_prescrito,
    });
  };

  const handleReject = (diag: Diagnostico) => {
    updateStatusMutation.mutate({
      id: diag.id,
      status: 'reprovado',
    });
  };

  const openDetail = (diag: Diagnostico) => {
    setSelectedDiag(diag);
    setAdjustedMap(diag.resultado_ia?.mapa_prescrito || '');
    setAdjustNotes('');
    setDetailOpen(true);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">⏳ Pendente</Badge>;
      case 'aprovado': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">✅ Aprovado</Badge>;
      case 'ajustado': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">✏️ Ajustado</Badge>;
      case 'reprovado': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">❌ Reprovado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendentes = diagnosticos.filter(d => d.status === 'pendente');
  const processados = diagnosticos.filter(d => d.status !== 'pendente');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{diagnosticos.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{pendentes.length}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{diagnosticos.filter(d => d.status === 'aprovado').length}</p>
          <p className="text-xs text-muted-foreground">Aprovados</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{diagnosticos.filter(d => d.status === 'ajustado').length}</p>
          <p className="text-xs text-muted-foreground">Ajustados</p>
        </div>
      </div>

      {/* Pending Queue */}
      {pendentes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Diagnósticos Pendentes ({pendentes.length})
          </h3>
          <div className="space-y-3">
            {pendentes.map(diag => {
              const profile = getProfile(diag.user_id);
              const isExpanded = expandedId === diag.id;
              return (
                <div key={diag.id} className="bg-card border border-yellow-500/30 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">{profile?.name || 'Aluno'}</p>
                        {statusBadge(diag.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile?.email} • {new Date(diag.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {diag.resultado_ia && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{diag.resultado_ia.mapa_prescrito}</Badge>
                          <Badge variant="outline">Gargalo: {diag.resultado_ia.pilar_gargalo}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setExpandedId(isExpanded ? null : diag.id)}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openDetail(diag)}>
                        <Eye className="w-4 h-4 mr-1" /> Detalhar
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(diag)} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                      </Button>
                    </div>
                  </div>
                  {isExpanded && diag.resultado_ia && (
                    <div className="border-t border-border p-4 bg-muted/20 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Justificativa da IA:</p>
                        <p className="text-sm text-muted-foreground">{diag.resultado_ia.justificativa}</p>
                      </div>
                      {diag.resultado_ia.aulas_prioritarias?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1"><BookOpen className="w-4 h-4" /> Aulas Prioritárias:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {diag.resultado_ia.aulas_prioritarias.map((a: string, i: number) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {diag.resultado_ia.alertas?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-yellow-500">⚠️ Alertas:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {diag.resultado_ia.alertas.map((a: string, i: number) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span>Protocolo Comercial Pendente:</span>
                        {diag.resultado_ia.protocolo_comercial_pendente ? 
                          <Badge variant="destructive">Sim</Badge> : 
                          <Badge variant="secondary">Não</Badge>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Respostas do Aluno:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-1">
                          <span>Faturamento: R$ {diag.respostas?.faturamento}</span>
                          <span>Ticket Médio: R$ {diag.respostas?.ticket_medio}</span>
                          <span>Pico Faturamento: R$ {diag.respostas?.atendimentos}</span>
                          <span>Estrutura: {diag.respostas?.estrutura}</span>
                          <span>Posicionamento: {diag.respostas?.posicionamento}</span>
                          <span>Origem: {diag.respostas?.origem_pacientes}</span>
                          <span>Dificuldade: {diag.respostas?.dificuldade}</span>
                          <span>Comercial: {diag.respostas?.comercial}</span>
                          <span>Objetivo: R$ {diag.respostas?.objetivo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Processed */}
      {processados.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Diagnósticos Processados ({processados.length})</h3>
          <div className="space-y-3">
            {processados.map(diag => {
              const profile = getProfile(diag.user_id);
              return (
                <div key={diag.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground">{profile?.name || 'Aluno'}</p>
                      {statusBadge(diag.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(diag.created_at).toLocaleDateString('pt-BR')} • 
                      Mapa: {diag.mapa_prescrito_final || diag.resultado_ia?.mapa_prescrito || 'N/A'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openDetail(diag)}>
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {diagnosticos.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum diagnóstico enviado ainda.</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Diagnóstico — {getProfile(selectedDiag?.user_id || '')?.name || 'Aluno'}
            </DialogTitle>
          </DialogHeader>

          {selectedDiag && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {statusBadge(selectedDiag.status)}
              </div>

              {/* Respostas */}
              <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-foreground">Respostas do Aluno</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <p><strong>Faturamento:</strong> R$ {selectedDiag.respostas?.faturamento}</p>
                  <p><strong>Ticket Médio:</strong> R$ {selectedDiag.respostas?.ticket_medio}</p>
                  <p><strong>Pico Faturamento:</strong> R$ {selectedDiag.respostas?.atendimentos}</p>
                  <p><strong>Estrutura:</strong> {selectedDiag.respostas?.estrutura}</p>
                  <p><strong>Posicionamento:</strong> {selectedDiag.respostas?.posicionamento}</p>
                  <p><strong>Origem pacientes:</strong> {selectedDiag.respostas?.origem_pacientes}</p>
                  <p><strong>Dificuldade:</strong> {selectedDiag.respostas?.dificuldade}</p>
                  <p><strong>Comercial:</strong> {selectedDiag.respostas?.comercial}</p>
                  <p><strong>Objetivo 6 meses:</strong> R$ {selectedDiag.respostas?.objetivo}</p>
                </div>
              </div>

              {/* Resultado IA */}
              {selectedDiag.resultado_ia && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">🤖 Sugestão da IA</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>{selectedDiag.resultado_ia.mapa_prescrito}</Badge>
                    <Badge variant="outline">Gargalo: {selectedDiag.resultado_ia.pilar_gargalo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedDiag.resultado_ia.justificativa}</p>
                  
                  {selectedDiag.resultado_ia.aulas_prioritarias?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">Aulas Prioritárias:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {selectedDiag.resultado_ia.aulas_prioritarias.map((a: string, i: number) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}

                  {selectedDiag.resultado_ia.alertas?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-yellow-500">Alertas:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {selectedDiag.resultado_ia.alertas.map((a: string, i: number) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions for pending */}
              {selectedDiag.status === 'pendente' && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="font-semibold text-foreground">Ajustar Prescrição</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mapa Prescrito:</label>
                    <Select value={adjustedMap} onValueChange={setAdjustedMap}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="PLANO DE ATIVAÇÃO">PLANO DE ATIVAÇÃO (até R$15k)</SelectItem>
                        <SelectItem value="MAPA 30K — CONSISTÊNCIA">MAPA 30K — CONSISTÊNCIA</SelectItem>
                        <SelectItem value="MAPA 50K — ESCALA">MAPA 50K — ESCALA</SelectItem>
                        <SelectItem value="MAPA 100K — OPERAÇÃO">MAPA 100K — OPERAÇÃO</SelectItem>
                        <SelectItem value="MAPA 300K+ — EXPANSÃO">MAPA 300K+ — EXPANSÃO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notas do Mentor:</label>
                    <Textarea
                      value={adjustNotes}
                      onChange={(e) => setAdjustNotes(e.target.value)}
                      placeholder="Observações ou ajustes na prescrição..."
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(selectedDiag)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <CheckCircle className="w-4 h-4" /> Aprovar como está
                    </Button>
                    <Button onClick={handleAdjust} variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" /> Aprovar com Ajustes
                    </Button>
                    <Button onClick={() => handleReject(selectedDiag)} variant="destructive" className="gap-2">
                      <XCircle className="w-4 h-4" /> Reprovar
                    </Button>
                  </div>
                </div>
              )}

              {/* Show final result if processed */}
              {selectedDiag.resultado_final && selectedDiag.status !== 'pendente' && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-foreground">✅ Resultado Final</h4>
                  <Badge>{selectedDiag.mapa_prescrito_final}</Badge>
                  {selectedDiag.resultado_final.notas_mentor && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Notas do Mentor:</strong> {selectedDiag.resultado_final.notas_mentor}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDiagnosticos;
