import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

  const [errors, setErrors] = useState<any>({});

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

  // Validações
  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
    
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Máscaras
  const handleCPFChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    const masked = cleaned.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData({ ...formData, cpf: masked });
    
    if (cleaned.length === 11) {
      if (!validateCPF(masked)) {
        setErrors({ ...errors, cpf: 'CPF inválido' });
      } else {
        const { cpf, ...rest } = errors;
        setErrors(rest);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    const masked = cleaned.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    setFormData({ ...formData, phone: masked });
  };

  const handleCEPChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    const masked = cleaned.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    setFormData({ ...formData, address_zip: masked });
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    
    if (value && !validateEmail(value)) {
      setErrors({ ...errors, email: 'Email inválido' });
    } else {
      const { email, ...rest } = errors;
      setErrors(rest);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submeter formulário
  const submitForm = useMutation({
    mutationFn: async () => {
      if (!formData.accepted_terms || !formData.accepted_data_usage || !formData.declared_truthfulness) {
        throw new Error('Você deve aceitar todos os termos obrigatórios');
      }

      const submissionPayload = {
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
          clinic_name: formData.full_name,
          clinic_legal_name: formData.full_name,
          clinic_cnpj: '00.000.000/0000-00',
          clinic_address_street: formData.address_street,
          clinic_address_number: formData.address_number,
          clinic_address_complement: formData.address_complement || null,
          clinic_address_neighborhood: formData.address_neighborhood,
          clinic_address_city: formData.address_city,
          clinic_address_state: formData.address_state,
          clinic_address_zip: formData.address_zip,
          technical_responsible: formData.full_name,
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
      };

      const { data, error } = await supabase.functions.invoke('submit-onboarding', {
        body: {
          code,
          submission: submissionPayload,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
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
    
    const newErrors: any = {};
    
    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrija os campos inválidos');
      return;
    }
    
    submitForm.mutate();
  };

  const inputClass = "mt-2 h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-gray-400 focus-visible:ring-offset-0";
  const selectClass = "mt-2 w-full h-11 px-3 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
  const labelClass = "text-sm font-medium text-gray-700";

  if (linkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (linkError || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-500 text-sm">
            {(linkError as any)?.message || 'Este link de cadastro não é válido ou já foi utilizado.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixo */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Cadastro HOF Circle</h1>
            <p className="text-sm text-gray-500 mt-1">Complete as informações abaixo</p>
          </div>
          <img
            src="http://timedom.com.br/wp-content/uploads/2026/03/LOGO_TIME_DOM-Copia.png"
            alt="Time Dom"
            className="h-8 object-contain"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-16">
          
          {/* Dados Pessoais */}
          <section>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados Pessoais</h2>
              <p className="text-sm text-gray-500">Informações básicas de identificação</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="full_name" className={labelClass}>Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cpf" className={labelClass}>CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`${inputClass} ${errors.cpf ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.cpf && (
                    <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rg" className={labelClass}>RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => updateField('rg', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="birth_date" className={labelClass}>Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => updateField('birth_date', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className={labelClass}>Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className={labelClass}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </section>

          {/* Endereço Residencial */}
          <section>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Endereço Residencial</h2>
              <p className="text-sm text-gray-500">Seu endereço pessoal</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="address_street" className={labelClass}>Rua</Label>
                  <Input id="address_street" value={formData.address_street} onChange={e => updateField('address_street', e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <Label htmlFor="address_number" className={labelClass}>Número</Label>
                  <Input id="address_number" value={formData.address_number} onChange={e => updateField('address_number', e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="address_complement" className={labelClass}>Complemento</Label>
                  <Input id="address_complement" value={formData.address_complement} onChange={e => updateField('address_complement', e.target.value)} className={inputClass} placeholder="Opcional" />
                </div>
                <div>
                  <Label htmlFor="address_neighborhood" className={labelClass}>Bairro</Label>
                  <Input id="address_neighborhood" value={formData.address_neighborhood} onChange={e => updateField('address_neighborhood', e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="address_city" className={labelClass}>Cidade</Label>
                  <Input id="address_city" value={formData.address_city} onChange={e => updateField('address_city', e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <Label htmlFor="address_state" className={labelClass}>Estado</Label>
                  <Input id="address_state" value={formData.address_state} onChange={e => updateField('address_state', e.target.value.toUpperCase())} maxLength={2} placeholder="SP" className={inputClass} required />
                </div>
                <div>
                  <Label htmlFor="address_zip" className={labelClass}>CEP</Label>
                  <Input id="address_zip" value={formData.address_zip} onChange={e => handleCEPChange(e.target.value)} placeholder="00000-000" maxLength={9} className={inputClass} required />
                </div>
              </div>
            </div>
          </section>

          {/* Diagnóstico */}
          <section>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Diagnóstico Inicial</h2>
              <p className="text-sm text-gray-500">Informações sobre sua clínica e objetivos</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="revenue_avg_3months" className={labelClass}>
                  1. Qual foi seu faturamento médio nos últimos 3 meses?
                </Label>
                <Input
                  id="revenue_avg_3months"
                  type="number"
                  step="0.01"
                  value={formData.revenue_avg_3months}
                  onChange={(e) => updateField('revenue_avg_3months', e.target.value)}
                  placeholder="10000.00"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Label htmlFor="avg_ticket" className={labelClass}>
                  2. Qual é seu ticket médio hoje?
                </Label>
                <Input
                  id="avg_ticket"
                  type="number"
                  step="0.01"
                  value={formData.avg_ticket}
                  onChange={(e) => updateField('avg_ticket', e.target.value)}
                  placeholder="1500.00"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Label htmlFor="peak_revenue" className={labelClass}>
                  3. Qual foi o seu pico de faturamento em um mês?
                </Label>
                <Input
                  id="peak_revenue"
                  type="number"
                  step="0.01"
                  value={formData.peak_revenue}
                  onChange={(e) => updateField('peak_revenue', e.target.value)}
                  placeholder="15000.00"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Label htmlFor="team_size" className={labelClass}>
                  4. Você trabalha sozinha ou tem equipe?
                </Label>
                <select
                  id="team_size"
                  value={formData.team_size}
                  onChange={(e) => updateField('team_size', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Sozinha">Sozinha</option>
                  <option value="1 assistente">1 assistente</option>
                  <option value="Equipe de 2+ pessoas">Equipe de 2+ pessoas</option>
                </select>
              </div>

              <div>
                <Label htmlFor="has_positioning" className={labelClass}>
                  5. Você tem procedimento de referência definido e posicionamento claro no Instagram?
                </Label>
                <select
                  id="has_positioning"
                  value={formData.has_positioning}
                  onChange={(e) => updateField('has_positioning', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Mais ou menos">Mais ou menos</option>
                </select>
              </div>

              <div>
                <Label htmlFor="patient_source" className={labelClass}>
                  6. De onde vêm a maioria dos seus pacientes hoje?
                </Label>
                <select
                  id="patient_source"
                  value={formData.patient_source}
                  onChange={(e) => updateField('patient_source', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Só indicação e base de pacientes">Só indicação e base de pacientes</option>
                  <option value="Tenho tráfego pago rodando">Tenho tráfego pago rodando</option>
                  <option value="Múltiplos motores ativos">Múltiplos motores ativos</option>
                </select>
              </div>

              <div>
                <Label htmlFor="main_difficulty" className={labelClass}>
                  7. Sua dificuldade principal é:
                </Label>
                <select
                  id="main_difficulty"
                  value={formData.main_difficulty}
                  onChange={(e) => updateField('main_difficulty', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Falta demanda">Falta demanda</option>
                  <option value="Tenho demanda mas não converto">Tenho demanda mas não converto</option>
                  <option value="Os dois">Os dois</option>
                </select>
              </div>

              <div>
                <Label htmlFor="commercial_mastery" className={labelClass}>
                  8. Você domina processo comercial (script, follow-up, quebra de objeções)?
                </Label>
                <select
                  id="commercial_mastery"
                  value={formData.commercial_mastery}
                  onChange={(e) => updateField('commercial_mastery', e.target.value)}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Parcialmente">Parcialmente</option>
                </select>
              </div>

              <div>
                <Label htmlFor="target_revenue_6months" className={labelClass}>
                  9. Qual faturamento você quer alcançar nos próximos 6 meses?
                </Label>
                <Input
                  id="target_revenue_6months"
                  type="number"
                  step="0.01"
                  value={formData.target_revenue_6months}
                  onChange={(e) => updateField('target_revenue_6months', e.target.value)}
                  placeholder="50000.00"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Label htmlFor="general_notes" className={labelClass}>
                  10. Considerações gerais (opcional)
                </Label>
                <Textarea
                  id="general_notes"
                  value={formData.general_notes}
                  onChange={(e) => updateField('general_notes', e.target.value)}
                  placeholder="Conte-nos algo que não conseguiu preencher acima..."
                  rows={4}
                  className="mt-2 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </section>

          {/* Termos */}
          <section>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Termos e Condições</h2>
              <p className="text-sm text-gray-500">Leia e aceite os termos</p>
            </div>
            
            <div className="space-y-4 bg-gray-50 rounded-lg p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.accepted_terms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, accepted_terms: checked as boolean })
                  }
                  required
                  className="mt-0.5"
                />
                <span className="text-sm leading-relaxed text-gray-700">
                  Ao marcar esta opção, declaro que li e aceito os termos de contratação, 
                  autorizando o início imediato da prestação de serviços. Estou ciente de 
                  que o prazo de 7 dias para cancelamento inicia-se a partir deste aceite, 
                  conforme previsto no Art. 49 do Código de Defesa do Consumidor.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.accepted_data_usage}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, accepted_data_usage: checked as boolean })
                  }
                  required
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Estou ciente que as informações fornecidas serão utilizadas para 
                  elaboração do contrato
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.declared_truthfulness}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, declared_truthfulness: checked as boolean })
                  }
                  required
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Declaro que todas as informações são verdadeiras
                </span>
              </label>
            </div>
          </section>

          {/* Botão Submit */}
          <div className="pt-8">
            <Button
              type="submit"
              size="lg"
              disabled={submitForm.isPending}
              className="w-full h-12 text-base font-medium"
            >
              {submitForm.isPending ? 'Enviando cadastro...' : 'Enviar Cadastro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
