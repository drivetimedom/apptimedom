import React, { useState } from 'react';
import { useFinancialStore } from '@/stores/financialStore';
import { formatCurrency } from './InputMoeda';
import { Plus, Trash2, Check, AlertTriangle, Target, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardResultado from './CardResultado';

type Cenario = 'minima' | 'ideal' | 'sonho';

const CUSTO_MEDIO_LEAD = 285;

const PlanoMetas: React.FC = () => {
  const {
    planoMetas,
    setCenario,
    setTicketMedio,
    setFonte,
    addFonteCustomizada,
    removeFonteCustomizada,
    getPacientesNecessarios,
    getTotalCaptacao,
  } = useFinancialStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFonte, setNewFonte] = useState({ nome: '', minima: 0, ideal: 0, sonho: 0 });
  const [mobileCenario, setMobileCenario] = useState<Cenario>('ideal');

  const cenarios: Cenario[] = ['minima', 'ideal', 'sonho'];
  const cenarioLabels = { minima: 'MÍNIMA', ideal: 'IDEAL', sonho: 'SONHO' };

  const fontesFixas = [
    { key: 'basePacientes', label: 'Base de Pacientes', dica: 'Campanha interna' },
    { key: 'leadsAntigos', label: 'Leads Antigos', dica: 'Reativação' },
    { key: 'trafegoPago', label: 'Tráfego Pago', dica: 'Meta Ads' },
    { key: 'socialSelling', label: 'Social Selling', dica: 'Orgânico/Stories' },
    { key: 'indicacoes', label: 'Indicações', dica: 'Boca a boca' },
  ] as const;

  const handleAddFonte = () => {
    if (!newFonte.nome.trim()) return;
    addFonteCustomizada(newFonte.nome, newFonte.minima, newFonte.ideal, newFonte.sonho);
    setNewFonte({ nome: '', minima: 0, ideal: 0, sonho: 0 });
    setIsModalOpen(false);
  };

  const getStatus = (cenario: Cenario) => {
    const total = getTotalCaptacao(cenario);
    const necessarios = getPacientesNecessarios(cenario);
    return total >= necessarios;
  };

  const investimentoTrafego = (cenario: Cenario) => {
    return planoMetas.fontes.trafegoPago[cenario] * CUSTO_MEDIO_LEAD;
  };

  const roiEsperado = (cenario: Cenario) => {
    const invest = investimentoTrafego(cenario);
    return invest > 0 ? planoMetas.cenarios[cenario] / invest : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          PLANO DE METAS E CAPTAÇÃO
        </h2>
        <p className="text-[#a0a0a0]">Planeje quantos pacientes precisa captar este mês</p>
      </div>

      {/* Seção 1: Cenários de Meta - Desktop */}
      <div className="hidden md:block bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#3b82f6]" />
          Cenários de Meta
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#404040]">
                <th className="text-left py-3 text-[#a0a0a0]"></th>
                {cenarios.map((c) => (
                  <th key={c} className="text-center py-3 text-[#a0a0a0] font-semibold">
                    {cenarioLabels[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#404040]">
                <td className="py-3 text-white font-medium">Meta (R$)</td>
                {cenarios.map((c) => (
                  <td key={c} className="text-center py-3">
                    <input
                      type="text"
                      value={planoMetas.cenarios[c].toLocaleString('pt-BR')}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                        setCenario(c, value);
                      }}
                      className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-3 py-2 w-28 text-center text-white"
                    />
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#404040]">
                <td className="py-3 text-white font-medium">Ticket Médio</td>
                {cenarios.map((c, i) => (
                  <td key={c} className="text-center py-3">
                    {i === 0 ? (
                      <input
                        type="text"
                        value={planoMetas.ticketMedio.toLocaleString('pt-BR')}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                          setTicketMedio(value);
                        }}
                        className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-3 py-2 w-28 text-center text-white"
                      />
                    ) : (
                      <span className="text-[#a0a0a0]">
                        {formatCurrency(planoMetas.ticketMedio)} (=)
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-white font-medium">Pacientes Necessários</td>
                {cenarios.map((c) => (
                  <td key={c} className="text-center py-3">
                    <span className="text-[#f59e0b] font-bold text-lg">
                      {getPacientesNecessarios(c)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 1: Cenários de Meta - Mobile */}
      <div className="md:hidden">
        <Tabs value={mobileCenario} onValueChange={(v) => setMobileCenario(v as Cenario)}>
          <TabsList className="w-full bg-[#3a3a3a] border border-[#404040]">
            {cenarios.map((c) => (
              <TabsTrigger
                key={c}
                value={c}
                className="flex-1 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
              >
                {cenarioLabels[c]}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {cenarios.map((c) => (
            <TabsContent key={c} value={c} className="mt-4">
              <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-4 space-y-4">
                <div>
                  <label className="text-sm text-[#a0a0a0]">Meta (R$)</label>
                  <input
                    type="text"
                    value={planoMetas.cenarios[c].toLocaleString('pt-BR')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                      setCenario(c, value);
                    }}
                    className="w-full bg-[#3b82f6]/10 border border-[#3b82f6] rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a0a0a0]">Ticket Médio</label>
                  <input
                    type="text"
                    value={planoMetas.ticketMedio.toLocaleString('pt-BR')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/\D/g, '')) || 0;
                      setTicketMedio(value);
                    }}
                    className="w-full bg-[#3b82f6]/10 border border-[#3b82f6] rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <CardResultado
                  title="Pacientes Necessários"
                  value={getPacientesNecessarios(c)}
                  isCurrency={false}
                  variant="total"
                  icon={<Users className="w-5 h-5" />}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Seção 2: Plano de Captação - Desktop */}
      <div className="hidden md:block bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#3b82f6]" />
          Plano de Captação
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#404040]">
                <th className="text-left py-3 text-[#a0a0a0]">Fonte de Captação</th>
                {cenarios.map((c) => (
                  <th key={c} className="text-center py-3 text-[#a0a0a0]">
                    {cenarioLabels[c]}
                  </th>
                ))}
                <th className="text-left py-3 text-[#a0a0a0]">Dicas</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {fontesFixas.map((fonte) => (
                <tr key={fonte.key} className="border-b border-[#404040]">
                  <td className="py-3 text-white">{fonte.label}</td>
                  {cenarios.map((c) => (
                    <td key={c} className="text-center py-3">
                      <input
                        type="number"
                        value={planoMetas.fontes[fonte.key][c]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFonte(fonte.key, c, value);
                        }}
                        className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-2 py-1 w-16 text-center text-white"
                        min="0"
                      />
                    </td>
                  ))}
                  <td className="py-3 text-[#a0a0a0] text-sm">{fonte.dica}</td>
                  <td></td>
                </tr>
              ))}
              {planoMetas.fontes.customizadas.map((fonte) => (
                <tr key={fonte.id} className="border-b border-[#404040]">
                  <td className="py-3 text-white">{fonte.nome}</td>
                  {cenarios.map((c) => (
                    <td key={c} className="text-center py-3">
                      <span className="text-white">{fonte[c]}</span>
                    </td>
                  ))}
                  <td className="py-3 text-[#a0a0a0] text-sm">Personalizada</td>
                  <td className="py-3">
                    <button
                      onClick={() => removeFonteCustomizada(fonte.id)}
                      className="p-1 hover:bg-[#3a3a3a] rounded"
                    >
                      <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-[#f59e0b]/10">
                <td className="py-3 text-[#f59e0b] font-bold">TOTAL PLANEJADO</td>
                {cenarios.map((c) => (
                  <td key={c} className="text-center py-3">
                    <span className="text-[#f59e0b] font-bold text-lg">
                      {getTotalCaptacao(c)}
                    </span>
                  </td>
                ))}
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="mt-4 border-[#404040] text-[#a0a0a0] hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Fonte Customizada
        </Button>
      </div>

      {/* Seção 2: Plano de Captação - Mobile */}
      <div className="md:hidden">
        <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3b82f6]" />
            Plano de Captação - {cenarioLabels[mobileCenario]}
          </h3>
          <div className="space-y-3">
            {fontesFixas.map((fonte) => (
              <div key={fonte.key} className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">{fonte.label}</span>
                  <span className="text-[#a0a0a0] text-xs block">{fonte.dica}</span>
                </div>
                <input
                  type="number"
                  value={planoMetas.fontes[fonte.key][mobileCenario]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFonte(fonte.key, mobileCenario, value);
                  }}
                  className="bg-[#3b82f6]/10 border border-[#3b82f6] rounded px-2 py-1 w-16 text-center text-white"
                  min="0"
                />
              </div>
            ))}
            {planoMetas.fontes.customizadas.map((fonte) => (
              <div key={fonte.id} className="flex items-center justify-between">
                <span className="text-white text-sm">{fonte.nome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">{fonte[mobileCenario]}</span>
                  <button
                    onClick={() => removeFonteCustomizada(fonte.id)}
                    className="p-1"
                  >
                    <Trash2 className="w-4 h-4 text-[#ef4444]" />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[#404040] flex items-center justify-between">
              <span className="text-[#f59e0b] font-bold">TOTAL</span>
              <span className="text-[#f59e0b] font-bold text-lg">
                {getTotalCaptacao(mobileCenario)}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="w-full mt-4 border-[#404040] text-[#a0a0a0]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Fonte
          </Button>
        </div>
      </div>

      {/* Seção 3: Status do Plano */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
        <h3 className="text-lg font-bold text-white mb-4">STATUS DO PLANO</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cenarios.map((c) => {
            const ok = getStatus(c);
            const total = getTotalCaptacao(c);
            const necessarios = getPacientesNecessarios(c);
            
            return (
              <div
                key={c}
                className={`rounded-lg p-4 border ${
                  ok
                    ? 'bg-[#10b981]/10 border-[#10b981]'
                    : 'bg-[#f59e0b]/10 border-[#f59e0b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{cenarioLabels[c]}</span>
                  {ok ? (
                    <Check className="w-5 h-5 text-[#10b981]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{total}</span>
                  <span className="text-[#a0a0a0]"> / {necessarios}</span>
                </div>
                <p className={`text-sm mt-1 ${ok ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                  {ok ? '✅ Plano OK' : '⚠️ Ajustar plano'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção 4: Estimativa de Investimento */}
      {planoMetas.fontes.trafegoPago.ideal > 0 && (
        <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#3b82f6]" />
            💰 INVESTIMENTO ESTIMADO (Meta Ideal)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Tráfego Pago:</span>
              <span className="text-white font-medium">
                {formatCurrency(investimentoTrafego('ideal'))}
              </span>
            </div>
            <p className="text-xs text-[#a0a0a0]">
              ({planoMetas.fontes.trafegoPago.ideal} pacientes × R$ {CUSTO_MEDIO_LEAD}/lead aprox.)
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-[#404040]">
              <span className="text-[#a0a0a0]">ROI Esperado:</span>
              <span className="text-[#10b981] font-bold text-lg">
                {roiEsperado('ideal').toFixed(0)}x
              </span>
            </div>
            <p className="text-xs text-[#a0a0a0]">
              ({formatCurrency(planoMetas.cenarios.ideal)} meta ÷ {formatCurrency(investimentoTrafego('ideal'))} invest.)
            </p>
          </div>
        </div>
      )}

      {/* Dica */}
      <div className="text-center text-sm text-[#a0a0a0]">
        💡 Ajuste as fontes até o TOTAL PLANEJADO atingir os Pacientes Necessários
      </div>

      {/* Modal Adicionar Fonte */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#2d2d2d] border-[#404040] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Fonte de Captação</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#a0a0a0]">Nome da Fonte</label>
              <input
                type="text"
                value={newFonte.nome}
                onChange={(e) => setNewFonte({ ...newFonte, nome: e.target.value })}
                className="w-full bg-[#3a3a3a] border border-[#404040] rounded-lg px-3 py-2 text-white mt-1"
                placeholder="Ex: Parcerias"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {cenarios.map((c) => (
                <div key={c}>
                  <label className="text-xs text-[#a0a0a0]">{cenarioLabels[c]}</label>
                  <input
                    type="number"
                    value={newFonte[c]}
                    onChange={(e) => setNewFonte({ ...newFonte, [c]: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#3a3a3a] border border-[#404040] rounded-lg px-3 py-2 text-white mt-1"
                    min="0"
                  />
                </div>
              ))}
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
              onClick={handleAddFonte}
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={!newFonte.nome.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanoMetas;
