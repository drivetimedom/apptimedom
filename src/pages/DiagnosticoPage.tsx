import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, CheckCircle, Home, ChevronRight } from 'lucide-react';

const DiagnosticoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [respostas, setRespostas] = useState({
    faturamento: '',
    ticket_medio: '',
    atendimentos: '',
    estrutura: '',
    posicionamento: '',
    origem_pacientes: '',
    dificuldade: '',
    comercial: '',
    objetivo: '',
  });

  const updateField = (field: string, value: string) => {
    setRespostas(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['faturamento', 'ticket_medio', 'atendimentos', 'estrutura', 'posicionamento', 'origem_pacientes', 'dificuldade', 'comercial', 'objetivo'];
    for (const field of requiredFields) {
      if (!respostas[field as keyof typeof respostas]) {
        toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('processar-diagnostico', {
        body: { respostas },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setSubmitted(true);
      toast({ title: '✅ Diagnóstico enviado com sucesso!' });
    } catch (err: any) {
      console.error('Error submitting diagnostic:', err);
      toast({ 
        title: 'Erro ao enviar diagnóstico', 
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Diagnóstico HOF Circle</h1>
          <p className="text-muted-foreground mb-4">Faça login para acessar o diagnóstico.</p>
          <Button onClick={() => navigate('/login')}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-lg mx-auto p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Diagnóstico Enviado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu diagnóstico foi processado e está aguardando a prescrição do seu mentor. 
            Você receberá uma notificação quando o resultado estiver disponível.
          </p>
          <Button onClick={() => navigate('/hoff-circle')} className="gap-2">
            <Target className="w-4 h-4" />
            Voltar ao HOF Circle
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate('/hoff-circle')} className="hover:text-foreground transition-colors">
              HOF Circle
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Diagnóstico</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Diagnóstico HOF Circle</h1>
              <p className="text-muted-foreground">Responda as perguntas para receber sua prescrição personalizada</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Faturamento */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">1. Qual foi seu faturamento médio nos últimos 3 meses? (R$)</Label>
            <Input
              type="number"
              value={respostas.faturamento}
              onChange={(e) => updateField('faturamento', e.target.value)}
              placeholder="Ex: 15000"
              className="bg-input border-border"
              required
            />
          </Card>

          {/* 2. Ticket Médio */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">2. Qual é seu ticket médio hoje? (R$)</Label>
            <Input
              type="number"
              value={respostas.ticket_medio}
              onChange={(e) => updateField('ticket_medio', e.target.value)}
              placeholder="Ex: 2000"
              className="bg-input border-border"
              required
            />
          </Card>

          {/* 3. Atendimentos */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">3. Desde que entrou no HOF Circle, qual foi o seu pico de faturamento em um mês?</Label>
            <Input
              type="number"
              value={respostas.atendimentos}
              onChange={(e) => updateField('atendimentos', e.target.value)}
              placeholder="Ex: 20"
              className="bg-input border-border"
              required
            />
          </Card>

          {/* 4. Estrutura */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">4. Você trabalha sozinha ou tem equipe?</Label>
            <Select value={respostas.estrutura} onValueChange={(v) => updateField('estrutura', v)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="sozinha">Sozinha</SelectItem>
                <SelectItem value="1-assistente">1 assistente</SelectItem>
                <SelectItem value="equipe-2+">Equipe de 2+ pessoas</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* 5. Posicionamento */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">5. Você tem procedimento de referência definido e posicionamento claro no Instagram?</Label>
            <Select value={respostas.posicionamento} onValueChange={(v) => updateField('posicionamento', v)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="mais-ou-menos">Mais ou menos</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* 6. Origem Pacientes */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">6. De onde vêm a maioria dos seus pacientes hoje?</Label>
            <Select value={respostas.origem_pacientes} onValueChange={(v) => updateField('origem_pacientes', v)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="indicacao-base">Só indicação e base de pacientes</SelectItem>
                <SelectItem value="trafego-pago">Tenho tráfego pago rodando</SelectItem>
                <SelectItem value="multiplos-motores">Múltiplos motores ativos</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* 7. Dificuldade */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">7. Sua dificuldade principal é:</Label>
            <Select value={respostas.dificuldade} onValueChange={(v) => updateField('dificuldade', v)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="falta-demanda">Falta demanda</SelectItem>
                <SelectItem value="nao-converte">Tenho demanda mas não converto</SelectItem>
                <SelectItem value="os-dois">Os dois</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* 8. Comercial */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">8. Você domina processo comercial — script, follow-up, quebra de objeções?</Label>
            <Select value={respostas.comercial} onValueChange={(v) => updateField('comercial', v)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="parcialmente">Parcialmente</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* 9. Objetivo */}
          <Card className="p-6 space-y-3">
            <Label className="text-base font-semibold">9. Qual faturamento você quer alcançar nos próximos 6 meses? (R$)</Label>
            <Input
              type="number"
              value={respostas.objetivo}
              onChange={(e) => updateField('objetivo', e.target.value)}
              placeholder="Ex: 50000"
              className="bg-input border-border"
              required
            />
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando Diagnóstico...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Enviar Diagnóstico
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DiagnosticoPage;
