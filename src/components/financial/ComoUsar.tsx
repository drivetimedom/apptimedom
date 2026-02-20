import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Target, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComoUsar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          COMO USAR O SISTEMA FINANCEIRO
        </h2>
        <p className="text-[#a0a0a0]">Passo a passo para aproveitar ao máximo</p>
      </div>

      {/* Card 1 */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] overflow-hidden">
        <div className="bg-[#3b82f6]/10 border-b border-[#404040] px-6 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-[#3b82f6]" />
            <h3 className="text-lg font-bold text-white">
              1. COMECE PELA CALCULADORA DE PRECIFICAÇÃO
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#3b82f6]">•</span>
              <div>
                <p className="text-white font-medium">Preencha suas Despesas Fixas</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Liste TODAS as despesas mensais</li>
                  <li>• Não esqueça sua retirada (pró-labore)!</li>
                  <li>• Provisione férias, 13º, reformas</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#3b82f6]">•</span>
              <div>
                <p className="text-white font-medium">Calcule sua Hora Clínica</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Informe suas horas trabalhadas</li>
                  <li>• O sistema calcula automaticamente</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#3b82f6]">•</span>
              <div>
                <p className="text-white font-medium">Precifique seus Procedimentos</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Adicione cada procedimento</li>
                  <li>• Veja se está lucrando ou tendo prejuízo</li>
                  <li>• Ajuste preços se necessário</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#3b82f6]">•</span>
              <div>
                <p className="text-white font-medium">Descubra seu Ponto de Equilíbrio</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Saiba quanto PRECISA faturar</li>
                  <li>• Defina sua meta de lucro</li>
                </ul>
              </div>
            </div>
          </div>
          <Link to="/financial-system">
            <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] mt-4">
              IR PARA PRECIFICAÇÃO
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] overflow-hidden">
        <div className="bg-[#10b981]/10 border-b border-[#404040] px-6 py-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-[#10b981]" />
            <h3 className="text-lg font-bold text-white">
              2. DEPOIS, USE O SIMULADOR DE METAS
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#10b981]">•</span>
              <div>
                <p className="text-white font-medium">Analise MC por Procedimento</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Veja qual é mais lucrativo</li>
                  <li>• Foque nos de maior margem</li>
                  <li>• Compare rentabilidade</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#10b981]">•</span>
              <div>
                <p className="text-white font-medium">Monte seu Plano de Metas</p>
                <ul className="text-[#a0a0a0] text-sm mt-1 space-y-1">
                  <li>• Defina meta mensal (mínima/ideal/sonho)</li>
                  <li>• Calcule quantos pacientes precisa</li>
                  <li>• Planeje de onde virão (fontes)</li>
                  <li>• Veja se o plano fecha</li>
                </ul>
              </div>
            </div>
          </div>
          <Link to="/financial-system">
            <Button className="w-full bg-[#10b981] hover:bg-[#059669] mt-4">
              IR PARA SIMULADOR
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#404040] overflow-hidden">
        <div className="bg-[#f59e0b]/10 border-b border-[#404040] px-6 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#f59e0b]" />
            <h3 className="text-lg font-bold text-white">
              3. REVISE MENSALMENTE
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white font-medium mb-2">Todo início de mês:</p>
              <ul className="text-[#a0a0a0] text-sm space-y-1">
                <li>• Revise despesas fixas (mudou algo?)</li>
                <li>• Ajuste preços se necessário</li>
                <li>• Refaça o plano de metas</li>
                <li>• Atualize MC dos procedimentos</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2">Trimestralmente:</p>
              <ul className="text-[#a0a0a0] text-sm space-y-1">
                <li>• Analise procedimentos mais vendidos</li>
                <li>• Reavalie MC de cada um</li>
                <li>• Considere novos procedimentos</li>
                <li>• Verifique se PE está adequado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4 - Dicas */}
      <div className="bg-[#2d2d2d] rounded-lg border border-[#f59e0b] overflow-hidden">
        <div className="bg-[#f59e0b]/10 border-b border-[#f59e0b] px-6 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
            <h3 className="text-lg font-bold text-white">
              DICAS IMPORTANTES
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <p className="text-white flex items-center gap-2">
              <span className="text-[#10b981]">+</span>
              Seus dados ficam salvos automaticamente
              <span className="text-[#a0a0a0] text-sm">(localStorage do navegador)</span>
            </p>
            <p className="text-white flex items-center gap-2">
              <span className="text-[#10b981]">+</span>
              Use os tooltips se tiver dúvida
            </p>
            <p className="text-white flex items-center gap-2">
              <span className="text-[#10b981]">+</span>
              Não precisa ser perfeito, comece!
            </p>
            <p className="text-white flex items-center gap-2">
              <span className="text-[#10b981]">+</span>
              Melhor ter números aproximados que nenhum número
            </p>
            <p className="text-[#f59e0b] flex items-center gap-2">
              <span>!</span>
              Limpar cache do navegador apaga os dados
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#404040]">
            <p className="text-[#a0a0a0] text-sm mb-3">
              Para gestão completa com histórico, backup em nuvem e relatórios avançados:
            </p>
            <Button
              variant="outline"
              className="w-full border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10"
            >
              CONHECER SISTEMA PRO
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoUsar;
