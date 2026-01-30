import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Target, BookOpen, Receipt, Clock, Calculator, TrendingUp, BarChart3, ClipboardList, Lightbulb, HelpCircle, BookMarked } from 'lucide-react';
import DespesasFixas from '@/components/financial/DespesasFixas';
import HoraClinica from '@/components/financial/HoraClinica';
import CalculadoraPrecos from '@/components/financial/CalculadoraPrecos';
import PontoEquilibrio from '@/components/financial/PontoEquilibrio';
import MCProcedimentos from '@/components/financial/MCProcedimentos';
import PlanoMetas from '@/components/financial/PlanoMetas';
import Conceitos from '@/components/financial/Conceitos';
import ComoUsar from '@/components/financial/ComoUsar';
import Glossario from '@/components/financial/Glossario';

const FinancialSystemPage: React.FC = () => {
  const [mainTab, setMainTab] = useState('precificacao');
  const [subTab, setSubTab] = useState('despesas');
  const [metasSubTab, setMetasSubTab] = useState('mc');
  const [guiaSubTab, setGuiaSubTab] = useState('conceitos');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header com navegação principal */}
      <div className="border-b" style={{ borderColor: '#404040', backgroundColor: '#2d2d2d' }}>
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Sistema Financeiro HOF Circle</h1>
          
          {/* Tabs Principais */}
          <Tabs value={mainTab} onValueChange={setMainTab}>
            <TabsList className="bg-[#3a3a3a] border border-[#404040] p-1">
              <TabsTrigger 
                value="precificacao" 
                className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white text-[#a0a0a0] px-4 py-2"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Precificação
              </TabsTrigger>
              <TabsTrigger 
                value="metas" 
                className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white text-[#a0a0a0] px-4 py-2"
              >
                <Target className="w-4 h-4 mr-2" />
                Metas
              </TabsTrigger>
              <TabsTrigger 
                value="guia" 
                className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white text-[#a0a0a0] px-4 py-2"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Guia
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          {/* Tab Precificação */}
          <TabsContent value="precificacao" className="mt-0">
            {/* Sub-navegação */}
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList className="bg-[#2d2d2d] border border-[#404040] p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="despesas" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Despesas Fixas</span>
                  <span className="sm:hidden">Despesas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hora" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Hora Clínica</span>
                  <span className="sm:hidden">Hora</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calculadora" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Calculadora</span>
                  <span className="sm:hidden">Calc.</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="equilibrio" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Ponto Equilíbrio</span>
                  <span className="sm:hidden">P.E.</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="despesas" className="mt-0">
                <DespesasFixas />
              </TabsContent>

              <TabsContent value="hora" className="mt-0">
                <HoraClinica />
              </TabsContent>

              <TabsContent value="calculadora" className="mt-0">
                <CalculadoraPrecos />
              </TabsContent>

              <TabsContent value="equilibrio" className="mt-0">
                <PontoEquilibrio />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Tab Metas */}
          <TabsContent value="metas" className="mt-0">
            <Tabs value={metasSubTab} onValueChange={setMetasSubTab}>
              <TabsList className="bg-[#2d2d2d] border border-[#404040] p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="mc" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">MC por Procedimento</span>
                  <span className="sm:hidden">MC</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="plano" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Plano de Metas</span>
                  <span className="sm:hidden">Plano</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mc" className="mt-0">
                <MCProcedimentos />
              </TabsContent>

              <TabsContent value="plano" className="mt-0">
                <PlanoMetas />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Tab Guia */}
          <TabsContent value="guia" className="mt-0">
            <Tabs value={guiaSubTab} onValueChange={setGuiaSubTab}>
              <TabsList className="bg-[#2d2d2d] border border-[#404040] p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="conceitos" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Conceitos</span>
                  <span className="sm:hidden">Conceitos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="como-usar" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Como Usar</span>
                  <span className="sm:hidden">Uso</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="glossario" 
                  className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-[#a0a0a0] px-3 py-2"
                >
                  <BookMarked className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Glossário</span>
                  <span className="sm:hidden">Glossário</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conceitos" className="mt-0">
                <Conceitos />
              </TabsContent>

              <TabsContent value="como-usar" className="mt-0">
                <ComoUsar />
              </TabsContent>

              <TabsContent value="glossario" className="mt-0">
                <Glossario />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialSystemPage;
