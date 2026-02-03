import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DollarSign, Target, BookOpen, Receipt, Clock, Calculator, TrendingUp, BarChart3, ClipboardList, Lightbulb, HelpCircle, BookMarked, Home, ChevronRight, ArrowDown } from 'lucide-react';
import DespesasFixas from '@/components/financial/DespesasFixas';
import HoraClinica from '@/components/financial/HoraClinica';
import CalculadoraPrecos from '@/components/financial/CalculadoraPrecos';
import PontoEquilibrio from '@/components/financial/PontoEquilibrio';
import MCProcedimentos from '@/components/financial/MCProcedimentos';
import PlanoMetas from '@/components/financial/PlanoMetas';
import Conceitos from '@/components/financial/Conceitos';
import ComoUsar from '@/components/financial/ComoUsar';
import Glossario from '@/components/financial/Glossario';
import { useFinancialStore } from '@/stores/financialStore';
import { useAuth } from '@/contexts/AuthContext';

const FinancialSystemPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loadFromCloud = useFinancialStore(state => state.loadFromCloud);
  const [mainTab, setMainTab] = useState('precificacao');
  const [subTab, setSubTab] = useState('despesas');
  const [metasSubTab, setMetasSubTab] = useState('mc');
  const [guiaSubTab, setGuiaSubTab] = useState('conceitos');

  // Load data from cloud on mount
  useEffect(() => {
    if (user) {
      loadFromCloud();
    }
  }, [user, loadFromCloud]);

  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section 
        className="relative h-[350px] md:h-[400px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(/images/banner-calculadoras.png)`
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        
        {/* Content */}
        <div className="relative z-10 container h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Calculadoras</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Calculator className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Calculadoras Financeiras
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Ferramentas de precificação, metas e gestão financeira para profissionais de estética facial
          </p>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              onClick={scrollToContent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Começar a Calcular
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <span className="text-sm text-muted-foreground">
              3 módulos disponíveis
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8" id="main-content">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          {/* Tabs Principais */}
          <TabsList className="bg-card border border-border p-1 mb-6">
            <TabsTrigger 
              value="precificacao" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Precificação
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2"
            >
              <Target className="w-4 h-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger 
              value="guia" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Guia
            </TabsTrigger>
          </TabsList>

          {/* Tab Precificação */}
          <TabsContent value="precificacao" className="mt-0">
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList className="bg-card border border-border p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="despesas" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Despesas Fixas</span>
                  <span className="sm:hidden">Despesas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hora" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Hora Clínica</span>
                  <span className="sm:hidden">Hora</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calculadora" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Calculadora</span>
                  <span className="sm:hidden">Calc.</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="equilibrio" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
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
              <TabsList className="bg-card border border-border p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="mc" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">MC por Procedimento</span>
                  <span className="sm:hidden">MC</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="plano" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
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
              <TabsList className="bg-card border border-border p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger 
                  value="conceitos" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Conceitos</span>
                  <span className="sm:hidden">Conceitos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="como-usar" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Como Usar</span>
                  <span className="sm:hidden">Uso</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="glossario" 
                  className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-2"
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
