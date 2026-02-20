import React, { useState } from 'react';
import { useFinancialStore, MCProcedimento } from '@/stores/financialStore';
import { formatCurrency, formatPercent } from './InputMoeda';
import { Plus, Settings, Trash2, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import InputMoeda from './InputMoeda';
import CardResultado from './CardResultado';

const MCProcedimentos: React.FC = () => {
  const {
    mcProcedimentos,
    addMCProcedimento,
    updateMCProcedimento,
    removeMCProcedimento,
    calcularMCProcedimento,
    getResumoMC,
  } = useFinancialStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProc, setEditingProc] = useState<MCProcedimento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: 0,
    custoVariavel: 0,
    qtdVendas: 0,
  });

  const resumo = getResumoMC();

  const openAddModal = () => {
    setEditingProc(null);
    setFormData({ nome: '', preco: 0, custoVariavel: 0, qtdVendas: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (proc: MCProcedimento) => {
    setEditingProc(proc);
    setFormData({
      nome: proc.nome,
      preco: proc.preco,
      custoVariavel: proc.custoVariavel,
      qtdVendas: proc.qtdVendas,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) return;
    
    if (editingProc) {
      updateMCProcedimento(editingProc.id, formData);
    } else {
      addMCProcedimento(formData);
    }
    setIsModalOpen(false);
  };

  const previewMC = () => {
    const mcUnitaria = formData.preco - formData.custoVariavel;
    const mcPercentual = formData.preco > 0 ? (mcUnitaria / formData.preco) * 100 : 0;
    const mcTotal = mcUnitaria * formData.qtdVendas;
    return { mcUnitaria, mcPercentual, mcTotal };
  };

  const preview = previewMC();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          MARGEM DE CONTRIBUIÇÃO POR PROCEDIMENTO
        </h2>
        <p className="text-[#a0a0a0]">Descubra qual procedimento é mais lucrativo</p>
      </div>

      {/* Filtro de Período */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[#a0a0a0]">Período de Análise:</span>
            <select 
              className="bg-[#3a3a3a] border border-[#404040] rounded-lg px-3 py-2 text-white"
              defaultValue="1"
            >
              <option value="1">1 Mês</option>
            </select>
          </div>
          <p className="text-sm text-[#a0a0a0]">
            Versão gratuita analisa apenas 1 mês. Sistema PRO: histórico ilimitado.
          </p>
        </div>
      </div>

      {/* Tabela de Procedimentos - Desktop */}
      <div className="hidden md:block bg-[#2d2d2d] rounded-lg border border-[#404040] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#404040] hover:bg-transparent">
              <TableHead className="text-[#a0a0a0]">Procedimento</TableHead>
              <TableHead className="text-[#a0a0a0] text-right">Preço (R$)</TableHead>
              <TableHead className="text-[#a0a0a0] text-right">Custo Var. (R$)</TableHead>
              <TableHead className="text-[#a0a0a0] text-right">Qtd. Vendas</TableHead>
              <TableHead className="text-[#a0a0a0] text-right">MC Unit. (R$)</TableHead>
              <TableHead className="text-[#a0a0a0] text-center">MC (%)</TableHead>
              <TableHead className="text-[#a0a0a0] text-right">MC Total (R$)</TableHead>
              <TableHead className="text-[#a0a0a0] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mcProcedimentos.map((proc) => {
              const mc = calcularMCProcedimento(proc);
              const isBest = resumo.maisLucrativo?.id === proc.id;
              const isLowMargin = mc.mcPercentual < 30;
              
              return (
                <TableRow
                  key={proc.id}
                  className={`border-[#404040] ${isBest ? 'bg-[#f59e0b]/10' : ''}`}
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      {isBest && <Trophy className="w-4 h-4 text-[#f59e0b]" />}
                      {proc.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="text"
                      value={proc.preco.toLocaleString('pt-BR')}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                        updateMCProcedimento(proc.id, { preco: value });
                      }}
                      className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-2 py-1 w-24 text-right text-white"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="text"
                      value={proc.custoVariavel.toLocaleString('pt-BR')}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                        updateMCProcedimento(proc.id, { custoVariavel: value });
                      }}
                      className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-2 py-1 w-24 text-right text-white"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      value={proc.qtdVendas}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateMCProcedimento(proc.id, { qtdVendas: value });
                      }}
                      className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-2 py-1 w-20 text-right text-white"
                    />
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {formatCurrency(mc.mcUnitaria)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(mc.mcPercentual, 100)} 
                        className="h-2 w-16"
                      />
                      <span className={`text-sm ${isLowMargin ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                        {isLowMargin && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {formatPercent(mc.mcPercentual)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white font-medium">
                    {formatCurrency(mc.mcTotal)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(proc)}
                        className="p-1 hover:bg-[#3a3a3a] rounded"
                      >
                        <Settings className="w-4 h-4 text-[#a0a0a0]" />
                      </button>
                      <button
                        onClick={() => removeMCProcedimento(proc.id)}
                        className="p-1 hover:bg-[#3a3a3a] rounded"
                      >
                        <Trash2 className="w-4 h-4 text-[#ef4444]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-4">
        {mcProcedimentos.map((proc) => {
          const mc = calcularMCProcedimento(proc);
          const isBest = resumo.maisLucrativo?.id === proc.id;
          const isLowMargin = mc.mcPercentual < 30;
          
          return (
            <div
              key={proc.id}
              className={`bg-[#2d2d2d] rounded-lg border p-4 ${
                isBest ? 'border-[#f59e0b] bg-[#f59e0b]/10' : 'border-[#404040]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isBest && <Trophy className="w-4 h-4 text-[#f59e0b]" />}
                  <span className="font-bold text-white">{proc.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proc)}
                    className="p-2 hover:bg-[#3a3a3a] rounded"
                  >
                    <Settings className="w-4 h-4 text-[#a0a0a0]" />
                  </button>
                  <button
                    onClick={() => removeMCProcedimento(proc.id)}
                    className="p-2 hover:bg-[#3a3a3a] rounded"
                  >
                    <Trash2 className="w-4 h-4 text-[#ef4444]" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#a0a0a0]">Preço:</span>
                  <span className="text-white ml-2">{formatCurrency(proc.preco)}</span>
                </div>
                <div>
                  <span className="text-[#a0a0a0]">Custo Var.:</span>
                  <span className="text-white ml-2">{formatCurrency(proc.custoVariavel)}</span>
                </div>
                <div>
                  <span className="text-[#a0a0a0]">Qtd:</span>
                  <span className="text-white ml-2">{proc.qtdVendas}</span>
                </div>
                <div>
                  <span className="text-[#a0a0a0]">MC Unit.:</span>
                  <span className="text-white ml-2">{formatCurrency(mc.mcUnitaria)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#404040]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a0a0a0]">MC:</span>
                    <span className={`font-bold ${isLowMargin ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                      {formatPercent(mc.mcPercentual)}
                    </span>
                    {isLowMargin && <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />}
                  </div>
                  <span className="text-white font-bold">{formatCurrency(mc.mcTotal)}</span>
                </div>
                <Progress value={Math.min(mc.mcPercentual, 100)} className="h-2 mt-2" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Adicionar */}
      <Button
        onClick={openAddModal}
        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Procedimento
      </Button>

      {/* Card Resumo */}
      <div className="bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#f59e0b] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          RESUMO DO MÊS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <CardResultado
            title="Receita Total"
            value={resumo.receitaTotal}
            variant="default"
          />
          <CardResultado
            title="MC Total"
            value={resumo.mcTotalGeral}
            variant="success"
          />
          <CardResultado
            title="Índice Médio MC"
            value={resumo.indiceMedioMC}
            isPercent
            isCurrency={false}
            variant="default"
          />
        </div>
        {resumo.maisLucrativo && (
          <div className="bg-[#2d2d2d] rounded-lg p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#f59e0b]" />
            <div>
              <span className="text-[#a0a0a0]">Mais Lucrativo: </span>
              <span className="text-white font-bold">{resumo.maisLucrativo.nome}</span>
              <span className="text-[#10b981] ml-2">
                ({formatPercent(calcularMCProcedimento(resumo.maisLucrativo).mcPercentual)} de MC)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="text-center text-sm text-[#a0a0a0]">
        Foque nos procedimentos com maior MC% - são os mais rentáveis!
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#2d2d2d] border-[#404040] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProc ? 'Editar Procedimento' : 'Adicionar Procedimento'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#a0a0a0]">Nome do Procedimento</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-[#3a3a3a] border border-[#404040] rounded-lg px-3 py-2 text-white mt-1"
                placeholder="Ex: Botox"
              />
            </div>
            
            <InputMoeda
              label="Preço Cobrado"
              value={formData.preco}
              onChange={(value) => setFormData({ ...formData, preco: value })}
            />
            
            <div>
              <InputMoeda
                label="Custo Variável"
                value={formData.custoVariavel}
                onChange={(value) => setFormData({ ...formData, custoVariavel: value })}
              />
              <p className="text-xs text-[#a0a0a0] mt-1">Apenas insumos/materiais</p>
            </div>
            
            <div>
              <label className="text-sm text-[#a0a0a0]">Quantidade Vendida no Mês</label>
              <input
                type="number"
                value={formData.qtdVendas}
                onChange={(e) => setFormData({ ...formData, qtdVendas: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#3a3a3a] border border-[#404040] rounded-lg px-3 py-2 text-white mt-1"
                min="0"
              />
            </div>

            {/* Preview */}
            <div className="bg-[#3a3a3a] rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-[#a0a0a0]">PRÉVIA DA MC</h4>
              <div className="flex justify-between">
                <span className="text-[#a0a0a0]">MC Unitária:</span>
                <span className="text-white">{formatCurrency(preview.mcUnitaria)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a0a0a0]">MC %:</span>
                <span className={preview.mcPercentual < 30 ? 'text-[#f59e0b]' : 'text-[#10b981]'}>
                  {formatPercent(preview.mcPercentual)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a0a0a0]">MC Total:</span>
                <span className="text-white font-bold">{formatCurrency(preview.mcTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#404040] text-[#a0a0a0]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={!formData.nome.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MCProcedimentos;
