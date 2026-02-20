import React from 'react';
import InputMoeda, { formatCurrency } from './InputMoeda';
import CardResultado from './CardResultado';
import { useFinancialStore } from '@/stores/financialStore';
import { Target, TrendingUp, DollarSign, Lightbulb } from 'lucide-react';

const PontoEquilibrio: React.FC = () => {
  const {
    dadosPE,
    setDadosPE,
    getTotalDespesasFixas
  } = useFinancialStore();

  const despesasFixas = getTotalDespesasFixas();

  // Margem de Contribuição
  const margemContribuicao = dadosPE.receitaMensal - dadosPE.custosVariaveis;
  const indiceMC = dadosPE.receitaMensal > 0 ? margemContribuicao / dadosPE.receitaMensal : 0;

  // Pontos de Equilíbrio
  const peBasico = indiceMC > 0 ? despesasFixas / indiceMC : 0;

  // PE com meta %: DF / (IMC - meta%)
  const metaDecimal = dadosPE.metaLucroPercent / 100;
  const peComMetaPercent = indiceMC - metaDecimal > 0 ?
  despesasFixas / (indiceMC - metaDecimal) :
  0;

  // PE com lucro R$: (DF + lucroDesejado) / IMC
  const peComLucroValor = indiceMC > 0 ?
  (despesasFixas + dadosPE.lucroDesejado) / indiceMC :
  0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">PONTO DE EQUILÍBRIO</h2>
        <p className="text-[#a0a0a0]">Quanto você precisa faturar para não ter prejuízo</p>
      </div>

      {/* Seção 1: Dados para Cálculo */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#3b82f6]" />
          Dados para Cálculo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputMoeda
            label="Receita Mensal Típica"
            value={dadosPE.receitaMensal}
            onChange={(v) => setDadosPE({ receitaMensal: v })}
            tooltip="Faturamento médio mensal" />

          <InputMoeda
            label="Custos Variáveis Mensais"
            value={dadosPE.custosVariaveis}
            onChange={(v) => setDadosPE({ custosVariaveis: v })}
            tooltip="Custos que variam com o faturamento (materiais, comissões)" />

          <InputMoeda
            label="Despesas Fixas"
            value={despesasFixas}
            onChange={() => {}}
            readOnly
            tooltip="Calculado automaticamente na aba Despesas Fixas" />

        </div>
      </div>

      {/* Seção 2: Margem de Contribuição */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#10b981]" />
          Margem de Contribuição
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardResultado
            title="MC em R$"
            value={margemContribuicao}
            subtitle="Receita - Custos Variáveis"
            variant={margemContribuicao >= 0 ? 'success' : 'danger'} />

          <CardResultado
            title="Índice de MC (%)"
            value={indiceMC * 100}
            isPercent
            subtitle="MC ÷ Receita"
            variant="default" />

        </div>
      </div>

      {/* Seção 3: Três Tipos de PE */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#f59e0b]" />
          Pontos de Equilíbrio
        </h3>

        {/* PE Básico */}
        <div className="bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b] p-6">
          <div className="flex items-start gap-4">
            
            <div className="flex-1">
              <h4 className="text-[#f59e0b] font-bold text-lg mb-2">BÁSICO (Lucro = Zero)</h4>
              <p className="text-[#a0a0a0] text-sm mb-4">Você precisa faturar:</p>
              <p className="text-[#f59e0b] text-3xl font-bold mb-2">
                {formatCurrency(peBasico)} / mês
              </p>
              <p className="text-[#a0a0a0] text-sm">Para apenas empatar (sem lucro)</p>
            </div>
          </div>
        </div>

        {/* PE com Meta % */}
        <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
          <div className="flex items-start gap-4">
            
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-4">COM META DE LUCRO (%)</h4>
              
              <div className="mb-4 max-w-[200px]">
                <InputMoeda
                  label="Quero lucro de:"
                  value={dadosPE.metaLucroPercent}
                  onChange={(v) => setDadosPE({ metaLucroPercent: v })}
                  prefix=""
                  suffix="%" />

              </div>

              <p className="text-[#a0a0a0] text-sm mb-2">Você precisa faturar:</p>
              <p className="text-[#10b981] text-3xl font-bold mb-2">
                {formatCurrency(peComMetaPercent)} / mês
              </p>
              <p className="text-[#a0a0a0] text-sm">
                Para ter {dadosPE.metaLucroPercent}% de lucro
              </p>
            </div>
          </div>
        </div>

        {/* PE com Lucro R$ */}
        <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">3️⃣</div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-4">COM LUCRO EM VALOR (R$)</h4>
              
              <div className="mb-4 max-w-[200px]">
                <InputMoeda
                  label="Quero lucro de:"
                  value={dadosPE.lucroDesejado}
                  onChange={(v) => setDadosPE({ lucroDesejado: v })} />

              </div>

              <p className="text-[#a0a0a0] text-sm mb-2">Você precisa faturar:</p>
              <p className="text-[#10b981] text-3xl font-bold mb-2">
                {formatCurrency(peComLucroValor)} / mês
              </p>
              <p className="text-[#a0a0a0] text-sm">
                Para ter {formatCurrency(dadosPE.lucroDesejado)} de lucro líquido
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta */}
      <div className="flex items-start gap-3 p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg">
        <Lightbulb className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
        <p className="text-[#a0a0a0] text-sm">
          <span className="text-white font-medium">💡 Dica:</span> Valores acima do PE = <span className="text-[#10b981] font-medium">LUCRO</span> | Abaixo = <span className="text-[#ef4444] font-medium">PREJUÍZO</span>
        </p>
      </div>
    </div>);

};

export default PontoEquilibrio;