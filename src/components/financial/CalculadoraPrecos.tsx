import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings, Check, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import InputMoeda, { formatCurrency } from './InputMoeda';
import { useFinancialStore, Procedimento } from '@/stores/financialStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type FilterType = 'all' | 'profit' | 'loss';
type SortType = 'name' | 'profit' | 'margin';

const CalculadoraPrecos: React.FC = () => {
  const {
    procedimentos,
    parametros,
    setParametros,
    addProcedimento,
    updateProcedimento,
    removeProcedimento,
    getMinutoClinicoValor,
    calcularLucroProcedimento,
  } = useFinancialStore();

  const minutoClinico = getMinutoClinicoValor();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProc, setEditingProc] = useState<Procedimento | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formValor, setFormValor] = useState(0);
  const [formTempo, setFormTempo] = useState(0);
  const [formCusto, setFormCusto] = useState(0);

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedCards);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedCards(next);
  };

  const openModal = (proc?: Procedimento) => {
    if (proc) {
      setEditingProc(proc);
      setFormNome(proc.nome);
      setFormValor(proc.valorCobrado);
      setFormTempo(proc.tempoMinutos);
      setFormCusto(proc.custoMaterial);
    } else {
      setEditingProc(null);
      setFormNome('');
      setFormValor(0);
      setFormTempo(0);
      setFormCusto(0);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formNome.trim() || formValor <= 0) return;

    if (editingProc) {
      updateProcedimento(editingProc.id, {
        nome: formNome.trim(),
        valorCobrado: formValor,
        tempoMinutos: formTempo,
        custoMaterial: formCusto,
      });
    } else {
      addProcedimento({
        nome: formNome.trim(),
        valorCobrado: formValor,
        tempoMinutos: formTempo,
        custoMaterial: formCusto,
      });
    }
    setModalOpen(false);
  };

  // Preview calculation for modal
  const previewCalc = useMemo(() => {
    if (formValor <= 0) return null;
    const custoTempo = formTempo * minutoClinico;
    const imposto = formValor * (parametros.aliquotaImposto / 100);
    const taxaCartao = formValor * (parametros.taxaCartao / 100);
    const custoTotal = custoTempo + formCusto + imposto + taxaCartao;
    const lucro = formValor - custoTotal;
    const margem = (lucro / formValor) * 100;
    return { custoTotal, lucro, margem };
  }, [formValor, formTempo, formCusto, minutoClinico, parametros]);

  // Filtered and sorted procedures
  const filteredProcs = useMemo(() => {
    let result = procedimentos.map((proc) => ({
      ...proc,
      calc: calcularLucroProcedimento(proc),
    }));

    // Filter
    if (filter === 'profit') {
      result = result.filter((p) => p.calc.lucro >= 0);
    } else if (filter === 'loss') {
      result = result.filter((p) => p.calc.lucro < 0);
    }

    // Sort
    if (sortBy === 'profit') {
      result.sort((a, b) => b.calc.lucro - a.calc.lucro);
    } else if (sortBy === 'margin') {
      result.sort((a, b) => b.calc.margemLucro - a.calc.margemLucro);
    } else {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [procedimentos, filter, sortBy, calcularLucroProcedimento]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">CALCULADORA DE PRECIFICAÇÃO</h2>
        <p className="text-[#a0a0a0]">Descubra se está lucrando ou tendo prejuízo</p>
      </div>

      {/* Parâmetros Globais */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">⚙️ Parâmetros Globais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputMoeda
            label="Minuto Clínico"
            value={minutoClinico}
            onChange={() => {}}
            readOnly
            tooltip="Calculado automaticamente a partir das despesas fixas"
          />
          <InputMoeda
            label="Alíquota Imposto"
            value={parametros.aliquotaImposto}
            onChange={(v) => setParametros({ aliquotaImposto: v })}
            prefix=""
            suffix="%"
            tooltip="Consulte seu contador para o valor correto"
          />
          <InputMoeda
            label="Taxa Cartão"
            value={parametros.taxaCartao}
            onChange={(v) => setParametros({ taxaCartao: v })}
            prefix=""
            suffix="%"
            tooltip="Taxa média da maquininha de cartão"
          />
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-[140px] bg-[#2d2d2d] border-[#404040] text-white">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent className="bg-[#2d2d2d] border-[#404040]">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="profit">✅ Lucrativos</SelectItem>
              <SelectItem value="loss">❌ Prejuízo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[140px] bg-[#2d2d2d] border-[#404040] text-white">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="bg-[#2d2d2d] border-[#404040]">
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="profit">Lucro</SelectItem>
              <SelectItem value="margin">Margem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => openModal()} className="bg-[#3b82f6] hover:bg-[#3b82f6]/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Procedimento
        </Button>
      </div>

      {/* Lista de Procedimentos */}
      <div className="space-y-3">
        {filteredProcs.length === 0 ? (
          <div className="text-center py-12 text-[#a0a0a0]">
            <p>Nenhum procedimento cadastrado</p>
          </div>
        ) : (
          filteredProcs.map((proc) => {
            const isProfit = proc.calc.lucro >= 0;
            const isExpanded = expandedCards.has(proc.id);

            return (
              <Collapsible key={proc.id} open={isExpanded} onOpenChange={() => toggleExpanded(proc.id)}>
                <div
                  className={`
                    rounded-lg border transition-all
                    ${isProfit 
                      ? 'bg-[#10b981]/5 border-[#10b981]/30' 
                      : 'bg-[#ef4444]/5 border-[#ef4444]/30'
                    }
                  `}
                >
                  {/* Header */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        {isProfit ? (
                          <Check className="w-5 h-5 text-[#10b981]" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                        )}
                        <div>
                          <h4 className="text-white font-semibold">{proc.nome}</h4>
                          <p className="text-[#a0a0a0] text-sm">{formatCurrency(proc.valorCobrado)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {isProfit ? '' : '- '}{formatCurrency(Math.abs(proc.calc.lucro))}
                          </p>
                          <p className="text-[#a0a0a0] text-xs">
                            {proc.calc.margemLucro.toFixed(1)}% margem
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#a0a0a0]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#a0a0a0]" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Details */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-[#404040]/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Tempo</p>
                          <p className="text-white font-medium">{proc.tempoMinutos} min</p>
                        </div>
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Custo Tempo</p>
                          <p className="text-white font-medium">{formatCurrency(proc.calc.custoTempo)}</p>
                        </div>
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Custo Material</p>
                          <p className="text-white font-medium">{formatCurrency(proc.custoMaterial)}</p>
                        </div>
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Imposto ({parametros.aliquotaImposto}%)</p>
                          <p className="text-white font-medium">{formatCurrency(proc.calc.imposto)}</p>
                        </div>
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Taxa Cartão ({parametros.taxaCartao}%)</p>
                          <p className="text-white font-medium">{formatCurrency(proc.calc.taxaCartao)}</p>
                        </div>
                        <div>
                          <p className="text-[#a0a0a0] text-xs">Custo Total</p>
                          <p className="text-white font-medium">{formatCurrency(proc.calc.custoTotal)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2 border-t border-[#404040]/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(proc)}
                          className="text-[#a0a0a0] hover:text-white"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedimento(proc.id)}
                          className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#2d2d2d] border-[#404040] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProc ? 'Editar Procedimento' : 'Novo Procedimento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-[#a0a0a0]">Nome do Procedimento</label>
              <Input
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Botox"
                className="bg-[#3a3a3a] border-[#404040] text-white"
              />
            </div>

            <InputMoeda
              label="Valor Cobrado"
              value={formValor}
              onChange={setFormValor}
            />

            <InputMoeda
              label="Tempo Total (minutos)"
              value={formTempo}
              onChange={setFormTempo}
              prefix=""
              suffix="min"
              tooltip="Inclua consulta + procedimento + retorno"
            />

            <InputMoeda
              label="Custo do Material/Insumo"
              value={formCusto}
              onChange={setFormCusto}
            />

            {/* Preview */}
            {previewCalc && (
              <div className={`
                p-4 rounded-lg border
                ${previewCalc.lucro >= 0 
                  ? 'bg-[#10b981]/10 border-[#10b981]' 
                  : 'bg-[#ef4444]/10 border-[#ef4444]'
                }
              `}>
                <h4 className="text-white font-semibold mb-3">PRÉVIA DO LUCRO</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Receita:</span>
                    <span className="text-white">{formatCurrency(formValor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Custos:</span>
                    <span className="text-white">{formatCurrency(previewCalc.custoTotal)}</span>
                  </div>
                  <div className="border-t border-[#404040] pt-2 flex justify-between">
                    <span className="text-white font-medium">Lucro:</span>
                    <span className={`font-bold ${previewCalc.lucro >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {formatCurrency(previewCalc.lucro)} {previewCalc.lucro >= 0 ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Margem:</span>
                    <span className="text-white">{previewCalc.margem.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-[#404040]">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#3b82f6] hover:bg-[#3b82f6]/90">
              {editingProc ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalculadoraPrecos;
