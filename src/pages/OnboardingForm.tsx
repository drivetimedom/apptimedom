import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const OnboardingForm = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    email: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    clinic_name: '',
    clinic_legal_name: '',
    clinic_cnpj: '',
    clinic_address_street: '',
    clinic_address_number: '',
    clinic_address_complement: '',
    clinic_address_neighborhood: '',
    clinic_address_city: '',
    clinic_address_state: '',
    clinic_address_zip: '',
    technical_responsible: '',
    revenue_avg_3months: '',
    avg_ticket: '',
    peak_revenue: '',
    team_size: '',
    has_positioning: '',
    patient_source: '',
    main_difficulty: '',
    commercial_mastery: '',
    target_revenue_6months: '',
    general_notes: '',
    accepted_terms: false,
    accepted_data_usage: false,
    declared_truthfulness: false,
  });

  // Validate link
  const { data: linkData, isLoading: linkLoading, error: linkError } = useQuery({
    queryKey: ['onboarding-link', code],
    queryFn: async () => {
      if (!code) throw new Error('Código não informado');
      const { data, error } = await supabase
        .from('onboarding_links' as any)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .is('submission_id', null)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Link inválido ou já utilizado');
      if ((data as any).expires_at && new Date((data as any).expires_at) < new Date()) {
        throw new Error('Este link expirou');
      }
      return data;
    },
    enabled: !!code,
    retry: false,
  });

  // Input masks
  const maskCPF = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const maskCNPJ = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 14);
    return d.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const maskPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  };

  const maskCEP = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 8);
    return d.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitForm = useMutation({
    mutationFn: async () => {
      if (!formData.accepted_terms || !formData.accepted_data_usage || !formData.declared_truthfulness) {
        throw new Error('Você deve aceitar todos os termos obrigatórios');
      }

      const { data, error } = await supabase
        .from('onboarding_submissions' as any)
        .insert({
          full_name: formData.full_name,
          cpf: formData.cpf,
          rg: formData.rg,
          birth_date: formData.birth_date,
          email: formData.email,
          phone: formData.phone,
          address_street: formData.address_street,
          address_number: formData.address_number,
          address_complement: formData.address_complement || null,
          address_neighborhood: formData.address_neighborhood,
          address_city: formData.address_city,
          address_state: formData.address_state,
          address_zip: formData.address_zip,
          clinic_name: formData.clinic_name,
          clinic_legal_name: formData.clinic_legal_name,
          clinic_cnpj: formData.clinic_cnpj,
          clinic_address_street: formData.clinic_address_street,
          clinic_address_number: formData.clinic_address_number,
          clinic_address_complement: formData.clinic_address_complement || null,
          clinic_address_neighborhood: formData.clinic_address_neighborhood,
          clinic_address_city: formData.clinic_address_city,
          clinic_address_state: formData.clinic_address_state,
          clinic_address_zip: formData.clinic_address_zip,
          technical_responsible: formData.technical_responsible,
          revenue_avg_3months: parseFloat(formData.revenue_avg_3months) || 0,
          avg_ticket: parseFloat(formData.avg_ticket) || 0,
          peak_revenue: parseFloat(formData.peak_revenue) || 0,
          team_size: formData.team_size,
          has_positioning: formData.has_positioning,
          patient_source: formData.patient_source,
          main_difficulty: formData.main_difficulty,
          commercial_mastery: formData.commercial_mastery,
          target_revenue_6months: parseFloat(formData.target_revenue_6months) || 0,
          general_notes: formData.general_notes || null,
          accepted_terms: formData.accepted_terms,
          accepted_data_usage: formData.accepted_data_usage,
          declared_truthfulness: formData.declared_truthfulness,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Update link with submission_id
      if (code && data) {
        await supabase
          .from('onboarding_links' as any)
          .update({ submission_id: (data as any).id, is_active: false } as any)
          .eq('code', code);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Cadastro enviado com sucesso!');
      navigate('/onboard/success');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar cadastro');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm.mutate();
  };

  if (linkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (linkError || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">
              {(linkError as any)?.message || 'Este link de cadastro não é válido ou já foi utilizado.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo ao TIME DOM! 🎉</h1>
          <p className="text-muted-foreground">Complete seu cadastro para iniciar sua jornada</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input value={formData.full_name} onChange={e => updateField('full_name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CPF *</Label>
                  <Input value={formData.cpf} onChange={e => updateField('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} required />
                </div>
                <div>
                  <Label>RG *</Label>
                  <Input value={formData.rg} onChange={e => updateField('rg', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Nascimento *</Label>
                  <Input type="date" value={formData.birth_date} onChange={e => updateField('birth_date', e.target.value)} required />
                </div>
                <div>
                  <Label>Telefone *</Label>
                  <Input value={formData.phone} onChange={e => updateField('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} required />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Endereço Residencial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Rua *</Label>
                  <Input value={formData.address_street} onChange={e => updateField('address_street', e.target.value)} required />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input value={formData.address_number} onChange={e => updateField('address_number', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Complemento</Label>
                  <Input value={formData.address_complement} onChange={e => updateField('address_complement', e.target.value)} />
                </div>
                <div>
                  <Label>Bairro *</Label>
                  <Input value={formData.address_neighborhood} onChange={e => updateField('address_neighborhood', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input value={formData.address_city} onChange={e => updateField('address_city', e.target.value)} required />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Input value={formData.address_state} onChange={e => updateField('address_state', e.target.value.toUpperCase())} maxLength={2} placeholder="SP" required />
                </div>
                <div>
                  <Label>CEP *</Label>
                  <Input value={formData.address_zip} onChange={e => updateField('address_zip', maskCEP(e.target.value))} placeholder="00000-000" maxLength={9} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clínica */}
          <Card>
            <CardHeader>
              <CardTitle>🏥 Dados da Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Fantasia *</Label>
                  <Input value={formData.clinic_name} onChange={e => updateField('clinic_name', e.target.value)} required />
                </div>
                <div>
                  <Label>Razão Social *</Label>
                  <Input value={formData.clinic_legal_name} onChange={e => updateField('clinic_legal_name', e.target.value)} required />
                </div>
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input value={formData.clinic_cnpj} onChange={e => updateField('clinic_cnpj', maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} required />
              </div>
              <div>
                <Label>Responsável Técnico *</Label>
                <Input value={formData.technical_responsible} onChange={e => updateField('technical_responsible', e.target.value)} required />
              </div>

              <h3 className="text-lg font-semibold pt-4">📍 Endereço da Clínica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Rua *</Label>
                  <Input value={formData.clinic_address_street} onChange={e => updateField('clinic_address_street', e.target.value)} required />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input value={formData.clinic_address_number} onChange={e => updateField('clinic_address_number', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Complemento</Label>
                  <Input value={formData.clinic_address_complement} onChange={e => updateField('clinic_address_complement', e.target.value)} />
                </div>
                <div>
                  <Label>Bairro *</Label>
                  <Input value={formData.clinic_address_neighborhood} onChange={e => updateField('clinic_address_neighborhood', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input value={formData.clinic_address_city} onChange={e => updateField('clinic_address_city', e.target.value)} required />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Input value={formData.clinic_address_state} onChange={e => updateField('clinic_address_state', e.target.value.toUpperCase())} maxLength={2} placeholder="SP" required />
                </div>
                <div>
                  <Label>CEP *</Label>
                  <Input value={formData.clinic_address_zip} onChange={e => updateField('clinic_address_zip', maskCEP(e.target.value))} placeholder="00000-000" maxLength={9} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Diagnóstico Inicial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>1. Qual foi seu faturamento médio nos últimos 3 meses? (R$) *</Label>
                <Input type="number" step="0.01" value={formData.revenue_avg_3months} onChange={e => updateField('revenue_avg_3months', e.target.value)} placeholder="10000.00" required />
              </div>
              <div>
                <Label>2. Qual é seu ticket médio hoje? (R$) *</Label>
                <Input type="number" step="0.01" value={formData.avg_ticket} onChange={e => updateField('avg_ticket', e.target.value)} placeholder="1500.00" required />
              </div>
              <div>
                <Label>3. Qual foi o seu pico de faturamento em um mês? (R$) *</Label>
                <Input type="number" step="0.01" value={formData.peak_revenue} onChange={e => updateField('peak_revenue', e.target.value)} placeholder="15000.00" required />
              </div>
              <div>
                <Label>4. Você trabalha sozinha ou tem equipe? *</Label>
                <Select value={formData.team_size} onValueChange={v => updateField('team_size', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sozinha">Sozinha</SelectItem>
                    <SelectItem value="1 assistente">1 assistente</SelectItem>
                    <SelectItem value="Equipe de 2+ pessoas">Equipe de 2+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>5. Você tem procedimento de referência definido e posicionamento claro no Instagram? *</Label>
                <Select value={formData.has_positioning} onValueChange={v => updateField('has_positioning', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Mais ou menos">Mais ou menos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>6. De onde vêm a maioria dos seus pacientes hoje? *</Label>
                <Select value={formData.patient_source} onValueChange={v => updateField('patient_source', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Só indicação e base de pacientes">Só indicação e base de pacientes</SelectItem>
                    <SelectItem value="Tenho tráfego pago rodando">Tenho tráfego pago rodando</SelectItem>
                    <SelectItem value="Múltiplos motores ativos">Múltiplos motores ativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>7. Sua dificuldade principal é: *</Label>
                <Select value={formData.main_difficulty} onValueChange={v => updateField('main_difficulty', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Falta demanda">Falta demanda</SelectItem>
                    <SelectItem value="Tenho demanda mas não converto">Tenho demanda mas não converto</SelectItem>
                    <SelectItem value="Os dois">Os dois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>8. Você domina processo comercial — script, follow-up, quebra de objeções? *</Label>
                <Select value={formData.commercial_mastery} onValueChange={v => updateField('commercial_mastery', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Parcialmente">Parcialmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>9. Qual faturamento você quer alcançar nos próximos 6 meses? (R$) *</Label>
                <Input type="number" step="0.01" value={formData.target_revenue_6months} onChange={e => updateField('target_revenue_6months', e.target.value)} placeholder="50000.00" required />
              </div>
              <div>
                <Label>10. Considerações gerais (opcional)</Label>
                <Textarea value={formData.general_notes} onChange={e => updateField('general_notes', e.target.value)} placeholder="Conte-nos algo que não conseguiu preencher acima..." rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Termos */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Termos e Condições</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.accepted_terms}
                  onCheckedChange={(checked) => updateField('accepted_terms', checked as boolean)}
                />
                <span className="text-sm leading-relaxed">
                  Ao marcar esta opção, declaro que li e aceito os termos de contratação,
                  autorizando o início imediato da prestação de serviços. Estou ciente de
                  que o prazo de 7 dias para cancelamento inicia-se a partir deste aceite,
                  conforme previsto no Art. 49 do Código de Defesa do Consumidor. *
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.accepted_data_usage}
                  onCheckedChange={(checked) => updateField('accepted_data_usage', checked as boolean)}
                />
                <span className="text-sm">
                  Estou ciente que as informações fornecidas serão utilizadas para
                  elaboração do contrato *
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.declared_truthfulness}
                  onCheckedChange={(checked) => updateField('declared_truthfulness', checked as boolean)}
                />
                <span className="text-sm">
                  Declaro que todas as informações são verdadeiras *
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center pt-2 pb-8">
            <Button type="submit" size="lg" disabled={submitForm.isPending} className="min-w-[200px]">
              {submitForm.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enviando...</>
              ) : (
                'Enviar Cadastro 🚀'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
