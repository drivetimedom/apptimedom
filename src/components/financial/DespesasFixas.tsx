import React, { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import InputMoeda, { formatCurrency } from './InputMoeda';
import FinancialAccordion from './FinancialAccordion';
import CardResultado from './CardResultado';
import { useFinancialStore } from '@/stores/financialStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const DespesasFixas: React.FC = () => {
  const {
    despesasFixas,
    setInfraestrutura,
    setRecursosHumanos,
    setRetiradaPessoal,
    setMarketing,
    setAdministrativo,
    setProvisionamentos,
    addDespesaCustomizada,
    removeDespesaCustomizada,
    getTotalDespesasFixas,
  } = useFinancialStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState(0);

  const totalDespesas = getTotalDespesasFixas();

  // Valores calculados de RH
  const fgts = despesasFixas.recursosHumanos.salarios * 0.08;
  const decimoTerceiro = despesasFixas.recursosHumanos.salarios / 12;
  const ferias = (despesasFixas.recursosHumanos.salarios * 1.33) / 12;

  const handleAddCustom = () => {
    if (novoNome.trim() && novoValor > 0) {
      addDespesaCustomizada(novoNome.trim(), novoValor);
      setNovoNome('');
      setNovoValor(0);
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">DESPESAS FIXAS MENSAIS</h2>
        <p className="text-[#a0a0a0]">Preencha todas as suas despesas mensais</p>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['infra', 'rh', 'retirada', 'marketing', 'adm', 'prov']} className="space-y-3">
        {/* INFRAESTRUTURA */}
        <FinancialAccordion icon="📌" title="INFRAESTRUTURA" value="infra">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputMoeda
              label="Aluguel"
              value={despesasFixas.infraestrutura.aluguel}
              onChange={(v) => setInfraestrutura('aluguel', v)}
              tooltip="Valor mensal do aluguel do espaço"
            />
            <InputMoeda
              label="IPTU"
              value={despesasFixas.infraestrutura.iptu}
              onChange={(v) => setInfraestrutura('iptu', v)}
              tooltip="IPTU mensal ou anual dividido por 12"
            />
            <InputMoeda
              label="Conta de Luz"
              value={despesasFixas.infraestrutura.luz}
              onChange={(v) => setInfraestrutura('luz', v)}
              tooltip="Média mensal da conta de energia"
            />
            <InputMoeda
              label="Telefone/Internet"
              value={despesasFixas.infraestrutura.telefone}
              onChange={(v) => setInfraestrutura('telefone', v)}
              tooltip="Telefone fixo, celular comercial e internet"
            />
            <InputMoeda
              label="Material de Limpeza"
              value={despesasFixas.infraestrutura.limpeza}
              onChange={(v) => setInfraestrutura('limpeza', v)}
              tooltip="Produtos de limpeza e higiene"
            />
          </div>
        </FinancialAccordion>

        {/* RECURSOS HUMANOS */}
        <FinancialAccordion icon="👥" title="RECURSOS HUMANOS" value="rh">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputMoeda
              label="Salários (funcionários)"
              value={despesasFixas.recursosHumanos.salarios}
              onChange={(v) => setRecursosHumanos('salarios', v)}
              tooltip="Soma dos salários de todos os funcionários"
            />
            <InputMoeda
              label="FGTS (8%)"
              value={fgts}
              onChange={() => {}}
              readOnly
              tooltip="Calculado automaticamente: 8% dos salários"
            />
            <InputMoeda
              label="Vale Alimentação"
              value={despesasFixas.recursosHumanos.valeAlimentacao}
              onChange={(v) => setRecursosHumanos('valeAlimentacao', v)}
              tooltip="Valor total de VA/VR para funcionários"
            />
            <InputMoeda
              label="Assistência Médica"
              value={despesasFixas.recursosHumanos.assistenciaMedica}
              onChange={(v) => setRecursosHumanos('assistenciaMedica', v)}
              tooltip="Plano de saúde dos funcionários"
            />
            <InputMoeda
              label="13º (provisão/12)"
              value={decimoTerceiro}
              onChange={() => {}}
              readOnly
              tooltip="Provisão mensal do 13º salário"
            />
            <InputMoeda
              label="Férias (provisão/12)"
              value={ferias}
              onChange={() => {}}
              readOnly
              tooltip="Provisão mensal de férias + 1/3"
            />
          </div>
        </FinancialAccordion>

        {/* RETIRADA PESSOAL */}
        <FinancialAccordion icon="💼" title="RETIRADA PESSOAL" value="retirada">
          <div className="space-y-4">
            <InputMoeda
              label="Pró-labore"
              value={despesasFixas.retiradaPessoal.proLabore}
              onChange={(v) => setRetiradaPessoal('proLabore', v)}
              tooltip="Sua retirada mensal como sócio"
            />
            {despesasFixas.retiradaPessoal.proLabore === 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                <span className="text-[#f59e0b] text-sm font-medium">
                  ⚠️ ESSENCIAL incluir sua retirada!
                </span>
              </div>
            )}
          </div>
        </FinancialAccordion>

        {/* MARKETING */}
        <FinancialAccordion icon="📢" title="MARKETING" value="marketing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputMoeda
              label="Agência de Marketing"
              value={despesasFixas.marketing.agencia}
              onChange={(v) => setMarketing('agencia', v)}
              tooltip="Contrato com agência ou freelancer"
            />
            <InputMoeda
              label="Tráfego Pago"
              value={despesasFixas.marketing.trafegoPago}
              onChange={(v) => setMarketing('trafegoPago', v)}
              tooltip="Investimento em anúncios (Meta, Google)"
            />
          </div>
        </FinancialAccordion>

        {/* ADMINISTRATIVO */}
        <FinancialAccordion icon="🏢" title="ADMINISTRATIVO" value="adm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputMoeda
              label="Contador"
              value={despesasFixas.administrativo.contador}
              onChange={(v) => setAdministrativo('contador', v)}
              tooltip="Honorários mensais do contador"
            />
            <InputMoeda
              label="Assessoria Jurídica"
              value={despesasFixas.administrativo.juridico}
              onChange={(v) => setAdministrativo('juridico', v)}
              tooltip="Advogado ou assessoria jurídica"
            />
            <InputMoeda
              label="Material de Escritório"
              value={despesasFixas.administrativo.escritorio}
              onChange={(v) => setAdministrativo('escritorio', v)}
              tooltip="Papelaria, impressões, etc"
            />
          </div>
        </FinancialAccordion>

        {/* PROVISIONAMENTOS */}
        <FinancialAccordion icon="🔧" title="PROVISIONAMENTOS" value="prov">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputMoeda
              label="Reforma anual ÷ 12"
              value={despesasFixas.provisionamentos.reforma}
              onChange={(v) => setProvisionamentos('reforma', v)}
              tooltip="Provisão para reformas e manutenção"
            />
            <InputMoeda
              label="Equipamentos ÷ 12"
              value={despesasFixas.provisionamentos.equipamentos}
              onChange={(v) => setProvisionamentos('equipamentos', v)}
              tooltip="Provisão para compra/troca de equipamentos"
            />
          </div>
        </FinancialAccordion>
      </Accordion>

      {/* Despesas Customizadas */}
      {despesasFixas.customizadas.length > 0 && (
        <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            Despesas Customizadas
          </h3>
          <div className="space-y-3">
            {despesasFixas.customizadas.map((despesa) => (
              <div key={despesa.id} className="flex items-center gap-3 bg-[#3a3a3a] p-3 rounded-lg">
                <span className="flex-1 text-white">{despesa.nome}</span>
                <span className="text-[#a0a0a0] font-medium">
                  {formatCurrency(despesa.valor)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDespesaCustomizada(despesa.id)}
                  className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Button */}
      <Button
        onClick={() => setModalOpen(true)}
        variant="outline"
        className="w-full border-dashed border-[#404040] text-[#a0a0a0] hover:text-white hover:bg-[#2d2d2d]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Despesa Customizada
      </Button>

      {/* Total Card */}
      <div className="mt-8">
        <CardResultado
          title="TOTAL DE DESPESAS FIXAS"
          value={totalDespesas}
          variant="total"
          className="py-6"
        />
      </div>

      {/* Modal Add Custom */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#2d2d2d] border-[#404040]">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Despesa Customizada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-[#a0a0a0]">Nome da Despesa</label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Seguro do imóvel"
                className="bg-[#3a3a3a] border-[#404040] text-white"
              />
            </div>
            <InputMoeda
              label="Valor Mensal"
              value={novoValor}
              onChange={setNovoValor}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-[#404040]">
              Cancelar
            </Button>
            <Button onClick={handleAddCustom} className="bg-[#3b82f6] hover:bg-[#3b82f6]/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DespesasFixas;
