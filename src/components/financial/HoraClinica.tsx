import React from 'react';
import InputMoeda, { formatCurrency } from './InputMoeda';
import CardResultado from './CardResultado';
import { useFinancialStore } from '@/stores/financialStore';
import { Clock, Calculator, Lightbulb } from 'lucide-react';

const HoraClinica: React.FC = () => {
  const {
    horaClinica,
    setHoraClinica,
    getTotalDespesasFixas,
    getTotalHorasMensais,
    getHoraClinicaValor,
    getMinutoClinicoValor,
  } = useFinancialStore();

  const totalDespesas = getTotalDespesasFixas();
  const totalHoras = getTotalHorasMensais();
  const horaClinicaValor = getHoraClinicaValor();
  const minutoClinico = getMinutoClinicoValor();

  const horasSemanaTotal = horaClinica.horasSemana * horaClinica.diasSemana;
  const horasSabadoTotal = horaClinica.horasSabado * horaClinica.diasSabado;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">CÁLCULO DA HORA CLÍNICA</h2>
        <p className="text-[#a0a0a0]">Descubra quanto custa cada hora do seu tempo</p>
      </div>

      {/* Seção 1: Horas Trabalhadas */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-[#3b82f6]" />
          <h3 className="text-lg font-semibold text-white">Horas Trabalhadas</h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#404040]">
                <th className="text-left py-3 px-4 text-[#a0a0a0] font-medium">Período</th>
                <th className="text-center py-3 px-4 text-[#a0a0a0] font-medium">Horas/Dia</th>
                <th className="text-center py-3 px-4 text-[#a0a0a0] font-medium">Dias/Mês</th>
                <th className="text-center py-3 px-4 text-[#a0a0a0] font-medium">Total Horas</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#404040]/50">
                <td className="py-4 px-4 text-white">Segunda a Sexta</td>
                <td className="py-4 px-4">
                  <InputMoeda
                    label=""
                    value={horaClinica.horasSemana}
                    onChange={(v) => setHoraClinica({ horasSemana: v })}
                    prefix=""
                    suffix="h"
                    className="max-w-[100px] mx-auto"
                  />
                </td>
                <td className="py-4 px-4">
                  <InputMoeda
                    label=""
                    value={horaClinica.diasSemana}
                    onChange={(v) => setHoraClinica({ diasSemana: v })}
                    prefix=""
                    suffix="dias"
                    className="max-w-[100px] mx-auto"
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-[#10b981] font-bold text-lg">{horasSemanaTotal}h</span>
                </td>
              </tr>
              <tr className="border-b border-[#404040]/50">
                <td className="py-4 px-4 text-white">Sábados</td>
                <td className="py-4 px-4">
                  <InputMoeda
                    label=""
                    value={horaClinica.horasSabado}
                    onChange={(v) => setHoraClinica({ horasSabado: v })}
                    prefix=""
                    suffix="h"
                    className="max-w-[100px] mx-auto"
                  />
                </td>
                <td className="py-4 px-4">
                  <InputMoeda
                    label=""
                    value={horaClinica.diasSabado}
                    onChange={(v) => setHoraClinica({ diasSabado: v })}
                    prefix=""
                    suffix="dias"
                    className="max-w-[100px] mx-auto"
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-[#10b981] font-bold text-lg">{horasSabadoTotal}h</span>
                </td>
              </tr>
              <tr className="bg-[#f59e0b]/10">
                <td className="py-4 px-4 text-[#f59e0b] font-bold" colSpan={3}>
                  TOTAL MENSAL
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-[#f59e0b] font-bold text-xl">{totalHoras}h</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          <div className="bg-[#3a3a3a] rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Segunda a Sexta</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputMoeda
                label="Horas/Dia"
                value={horaClinica.horasSemana}
                onChange={(v) => setHoraClinica({ horasSemana: v })}
                prefix=""
                suffix="h"
              />
              <InputMoeda
                label="Dias/Mês"
                value={horaClinica.diasSemana}
                onChange={(v) => setHoraClinica({ diasSemana: v })}
                prefix=""
                suffix="dias"
              />
            </div>
            <div className="mt-3 text-right">
              <span className="text-[#a0a0a0] text-sm">Total: </span>
              <span className="text-[#10b981] font-bold">{horasSemanaTotal}h</span>
            </div>
          </div>

          <div className="bg-[#3a3a3a] rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Sábados</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputMoeda
                label="Horas/Dia"
                value={horaClinica.horasSabado}
                onChange={(v) => setHoraClinica({ horasSabado: v })}
                prefix=""
                suffix="h"
              />
              <InputMoeda
                label="Dias/Mês"
                value={horaClinica.diasSabado}
                onChange={(v) => setHoraClinica({ diasSabado: v })}
                prefix=""
                suffix="dias"
              />
            </div>
            <div className="mt-3 text-right">
              <span className="text-[#a0a0a0] text-sm">Total: </span>
              <span className="text-[#10b981] font-bold">{horasSabadoTotal}h</span>
            </div>
          </div>

          <div className="bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg p-4 text-center">
            <span className="text-[#f59e0b] font-bold">TOTAL MENSAL: {totalHoras}h</span>
          </div>
        </div>
      </div>

      {/* Seção 2: Cálculo */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-[#3b82f6]" />
          <h3 className="text-lg font-semibold text-white">CÁLCULO</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[#404040]/50">
            <span className="text-[#a0a0a0]">Total Despesas Fixas:</span>
            <span className="text-white font-medium">{formatCurrency(totalDespesas)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#404040]/50">
            <span className="text-[#a0a0a0]">Total Horas Trabalhadas:</span>
            <span className="text-white font-medium">{totalHoras}h</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardResultado
            title="💎 SUA HORA CLÍNICA"
            value={horaClinicaValor}
            subtitle="por hora"
            variant="total"
          />
          <CardResultado
            title="⏱️ MINUTO CLÍNICO"
            value={minutoClinico}
            subtitle="por minuto"
            variant="success"
          />
        </div>
      </div>

      {/* Dica */}
      <div className="flex items-start gap-3 p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg">
        <Lightbulb className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
        <p className="text-[#a0a0a0] text-sm">
          <span className="text-white font-medium">💡 Dica:</span> Use este valor para calcular o custo do seu tempo em cada procedimento!
        </p>
      </div>
    </div>
  );
};

export default HoraClinica;
