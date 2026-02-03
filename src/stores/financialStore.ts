import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface DespesasFixas {
  infraestrutura: {
    aluguel: number;
    iptu: number;
    luz: number;
    telefone: number;
    limpeza: number;
  };
  recursosHumanos: {
    salarios: number;
    valeAlimentacao: number;
    assistenciaMedica: number;
  };
  retiradaPessoal: {
    proLabore: number;
  };
  marketing: {
    agencia: number;
    trafegoPago: number;
  };
  administrativo: {
    contador: number;
    juridico: number;
    escritorio: number;
  };
  provisionamentos: {
    reforma: number;
    equipamentos: number;
  };
  customizadas: Array<{
    id: string;
    nome: string;
    valor: number;
  }>;
}

export interface HoraClinica {
  horasSemana: number;
  diasSemana: number;
  horasSabado: number;
  diasSabado: number;
}

export interface Procedimento {
  id: string;
  nome: string;
  valorCobrado: number;
  tempoMinutos: number;
  custoMaterial: number;
}

export interface Parametros {
  aliquotaImposto: number;
  taxaCartao: number;
}

export interface DadosPE {
  receitaMensal: number;
  custosVariaveis: number;
  metaLucroPercent: number;
  lucroDesejado: number;
}

export interface MCProcedimento {
  id: string;
  nome: string;
  preco: number;
  custoVariavel: number;
  qtdVendas: number;
}

export interface PlanoMetas {
  cenarios: {
    minima: number;
    ideal: number;
    sonho: number;
  };
  ticketMedio: number;
  fontes: {
    basePacientes: { minima: number; ideal: number; sonho: number };
    leadsAntigos: { minima: number; ideal: number; sonho: number };
    trafegoPago: { minima: number; ideal: number; sonho: number };
    socialSelling: { minima: number; ideal: number; sonho: number };
    indicacoes: { minima: number; ideal: number; sonho: number };
    customizadas: Array<{
      id: string;
      nome: string;
      minima: number;
      ideal: number;
      sonho: number;
    }>;
  };
}

interface FinancialStore {
  // Data
  despesasFixas: DespesasFixas;
  horaClinica: HoraClinica;
  procedimentos: Procedimento[];
  parametros: Parametros;
  dadosPE: DadosPE;
  mcProcedimentos: MCProcedimento[];
  planoMetas: PlanoMetas;

  // Actions
  setDespesasFixas: (data: Partial<DespesasFixas>) => void;
  setInfraestrutura: (field: keyof DespesasFixas['infraestrutura'], value: number) => void;
  setRecursosHumanos: (field: keyof DespesasFixas['recursosHumanos'], value: number) => void;
  setRetiradaPessoal: (field: keyof DespesasFixas['retiradaPessoal'], value: number) => void;
  setMarketing: (field: keyof DespesasFixas['marketing'], value: number) => void;
  setAdministrativo: (field: keyof DespesasFixas['administrativo'], value: number) => void;
  setProvisionamentos: (field: keyof DespesasFixas['provisionamentos'], value: number) => void;
  addDespesaCustomizada: (nome: string, valor: number) => void;
  removeDespesaCustomizada: (id: string) => void;
  updateDespesaCustomizada: (id: string, nome: string, valor: number) => void;
  
  setHoraClinica: (data: Partial<HoraClinica>) => void;
  
  addProcedimento: (proc: Omit<Procedimento, 'id'>) => void;
  updateProcedimento: (id: string, proc: Partial<Procedimento>) => void;
  removeProcedimento: (id: string) => void;
  
  setParametros: (data: Partial<Parametros>) => void;
  setDadosPE: (data: Partial<DadosPE>) => void;

  // MC Procedimentos
  addMCProcedimento: (proc: Omit<MCProcedimento, 'id'>) => void;
  updateMCProcedimento: (id: string, proc: Partial<MCProcedimento>) => void;
  removeMCProcedimento: (id: string) => void;

  // Plano de Metas
  setPlanoMetas: (data: Partial<PlanoMetas>) => void;
  setCenario: (cenario: 'minima' | 'ideal' | 'sonho', value: number) => void;
  setTicketMedio: (value: number) => void;
  setFonte: (fonte: keyof PlanoMetas['fontes'], cenario: 'minima' | 'ideal' | 'sonho', value: number) => void;
  addFonteCustomizada: (nome: string, minima: number, ideal: number, sonho: number) => void;
  removeFonteCustomizada: (id: string) => void;
  updateFonteCustomizada: (id: string, nome: string, minima: number, ideal: number, sonho: number) => void;

  // Computed
  getTotalDespesasFixas: () => number;
  getTotalHorasMensais: () => number;
  getHoraClinicaValor: () => number;
  getMinutoClinicoValor: () => number;
  calcularLucroProcedimento: (proc: Procedimento) => {
    custoTempo: number;
    imposto: number;
    taxaCartao: number;
    custoTotal: number;
    lucro: number;
    margemLucro: number;
  };
  calcularMCProcedimento: (proc: MCProcedimento) => {
    mcUnitaria: number;
    mcPercentual: number;
    mcTotal: number;
  };
  getResumoMC: () => {
    receitaTotal: number;
    mcTotalGeral: number;
    indiceMedioMC: number;
    maisLucrativo: MCProcedimento | null;
  };
  getPacientesNecessarios: (cenario: 'minima' | 'ideal' | 'sonho') => number;
  getTotalCaptacao: (cenario: 'minima' | 'ideal' | 'sonho') => number;
  
  // Cloud sync
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  _isSyncing: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultDespesasFixas: DespesasFixas = {
  infraestrutura: {
    aluguel: 2350,
    iptu: 150,
    luz: 300,
    telefone: 200,
    limpeza: 200,
  },
  recursosHumanos: {
    salarios: 3500,
    valeAlimentacao: 600,
    assistenciaMedica: 800,
  },
  retiradaPessoal: {
    proLabore: 5000,
  },
  marketing: {
    agencia: 1500,
    trafegoPago: 2000,
  },
  administrativo: {
    contador: 500,
    juridico: 300,
    escritorio: 150,
  },
  provisionamentos: {
    reforma: 417,
    equipamentos: 300,
  },
  customizadas: [],
};

const defaultHoraClinica: HoraClinica = {
  horasSemana: 8,
  diasSemana: 20,
  horasSabado: 4,
  diasSabado: 4,
};

const defaultProcedimentos: Procedimento[] = [
  { id: generateId(), nome: 'Botox', valorCobrado: 1200, tempoMinutos: 90, custoMaterial: 467 },
  { id: generateId(), nome: 'Preenchimento Labial', valorCobrado: 1800, tempoMinutos: 90, custoMaterial: 250 },
  { id: generateId(), nome: 'Botox (PROMOÇÃO)', valorCobrado: 700, tempoMinutos: 60, custoMaterial: 467 },
];

const defaultParametros: Parametros = {
  aliquotaImposto: 13,
  taxaCartao: 10,
};

const defaultDadosPE: DadosPE = {
  receitaMensal: 30000,
  custosVariaveis: 12000,
  metaLucroPercent: 5,
  lucroDesejado: 10000,
};

const defaultMCProcedimentos: MCProcedimento[] = [
  { id: generateId(), nome: 'Botox', preco: 1200, custoVariavel: 467, qtdVendas: 30 },
  { id: generateId(), nome: 'Preenchimento', preco: 1800, custoVariavel: 250, qtdVendas: 25 },
  { id: generateId(), nome: 'Bioestimulador', preco: 2200, custoVariavel: 700, qtdVendas: 20 },
  { id: generateId(), nome: 'Fios Sustentação', preco: 3500, custoVariavel: 1000, qtdVendas: 10 },
];

const defaultPlanoMetas: PlanoMetas = {
  cenarios: {
    minima: 25000,
    ideal: 40000,
    sonho: 60000,
  },
  ticketMedio: 2000,
  fontes: {
    basePacientes: { minima: 5, ideal: 8, sonho: 12 },
    leadsAntigos: { minima: 2, ideal: 2, sonho: 3 },
    trafegoPago: { minima: 3, ideal: 7, sonho: 10 },
    socialSelling: { minima: 2, ideal: 3, sonho: 5 },
    indicacoes: { minima: 1, ideal: 2, sonho: 3 },
    customizadas: [],
  },
};

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      despesasFixas: defaultDespesasFixas,
      horaClinica: defaultHoraClinica,
      procedimentos: defaultProcedimentos,
      parametros: defaultParametros,
      dadosPE: defaultDadosPE,
      mcProcedimentos: defaultMCProcedimentos,
      planoMetas: defaultPlanoMetas,

      setDespesasFixas: (data) =>
        set((state) => ({
          despesasFixas: { ...state.despesasFixas, ...data },
        })),

      setInfraestrutura: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            infraestrutura: { ...state.despesasFixas.infraestrutura, [field]: value },
          },
        })),

      setRecursosHumanos: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            recursosHumanos: { ...state.despesasFixas.recursosHumanos, [field]: value },
          },
        })),

      setRetiradaPessoal: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            retiradaPessoal: { ...state.despesasFixas.retiradaPessoal, [field]: value },
          },
        })),

      setMarketing: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            marketing: { ...state.despesasFixas.marketing, [field]: value },
          },
        })),

      setAdministrativo: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            administrativo: { ...state.despesasFixas.administrativo, [field]: value },
          },
        })),

      setProvisionamentos: (field, value) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            provisionamentos: { ...state.despesasFixas.provisionamentos, [field]: value },
          },
        })),

      addDespesaCustomizada: (nome, valor) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            customizadas: [...state.despesasFixas.customizadas, { id: generateId(), nome, valor }],
          },
        })),

      removeDespesaCustomizada: (id) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            customizadas: state.despesasFixas.customizadas.filter((d) => d.id !== id),
          },
        })),

      updateDespesaCustomizada: (id, nome, valor) =>
        set((state) => ({
          despesasFixas: {
            ...state.despesasFixas,
            customizadas: state.despesasFixas.customizadas.map((d) =>
              d.id === id ? { ...d, nome, valor } : d
            ),
          },
        })),

      setHoraClinica: (data) =>
        set((state) => ({
          horaClinica: { ...state.horaClinica, ...data },
        })),

      addProcedimento: (proc) =>
        set((state) => ({
          procedimentos: [...state.procedimentos, { ...proc, id: generateId() }],
        })),

      updateProcedimento: (id, proc) =>
        set((state) => ({
          procedimentos: state.procedimentos.map((p) =>
            p.id === id ? { ...p, ...proc } : p
          ),
        })),

      removeProcedimento: (id) =>
        set((state) => ({
          procedimentos: state.procedimentos.filter((p) => p.id !== id),
        })),

      setParametros: (data) =>
        set((state) => ({
          parametros: { ...state.parametros, ...data },
        })),

      setDadosPE: (data) =>
        set((state) => ({
          dadosPE: { ...state.dadosPE, ...data },
        })),

      // MC Procedimentos
      addMCProcedimento: (proc) =>
        set((state) => ({
          mcProcedimentos: [...state.mcProcedimentos, { ...proc, id: generateId() }],
        })),

      updateMCProcedimento: (id, proc) =>
        set((state) => ({
          mcProcedimentos: state.mcProcedimentos.map((p) =>
            p.id === id ? { ...p, ...proc } : p
          ),
        })),

      removeMCProcedimento: (id) =>
        set((state) => ({
          mcProcedimentos: state.mcProcedimentos.filter((p) => p.id !== id),
        })),

      // Plano de Metas
      setPlanoMetas: (data) =>
        set((state) => ({
          planoMetas: { ...state.planoMetas, ...data },
        })),

      setCenario: (cenario, value) =>
        set((state) => ({
          planoMetas: {
            ...state.planoMetas,
            cenarios: { ...state.planoMetas.cenarios, [cenario]: value },
          },
        })),

      setTicketMedio: (value) =>
        set((state) => ({
          planoMetas: { ...state.planoMetas, ticketMedio: value },
        })),

      setFonte: (fonte, cenario, value) =>
        set((state) => {
          if (fonte === 'customizadas') return state;
          return {
            planoMetas: {
              ...state.planoMetas,
              fontes: {
                ...state.planoMetas.fontes,
                [fonte]: { ...state.planoMetas.fontes[fonte], [cenario]: value },
              },
            },
          };
        }),

      addFonteCustomizada: (nome, minima, ideal, sonho) =>
        set((state) => ({
          planoMetas: {
            ...state.planoMetas,
            fontes: {
              ...state.planoMetas.fontes,
              customizadas: [
                ...state.planoMetas.fontes.customizadas,
                { id: generateId(), nome, minima, ideal, sonho },
              ],
            },
          },
        })),

      removeFonteCustomizada: (id) =>
        set((state) => ({
          planoMetas: {
            ...state.planoMetas,
            fontes: {
              ...state.planoMetas.fontes,
              customizadas: state.planoMetas.fontes.customizadas.filter((f) => f.id !== id),
            },
          },
        })),

      updateFonteCustomizada: (id, nome, minima, ideal, sonho) =>
        set((state) => ({
          planoMetas: {
            ...state.planoMetas,
            fontes: {
              ...state.planoMetas.fontes,
              customizadas: state.planoMetas.fontes.customizadas.map((f) =>
                f.id === id ? { ...f, nome, minima, ideal, sonho } : f
              ),
            },
          },
        })),

      // Computed values
      getTotalDespesasFixas: () => {
        const df = get().despesasFixas;
        const infra = Object.values(df.infraestrutura).reduce((a, b) => a + b, 0);
        const rh = Object.values(df.recursosHumanos).reduce((a, b) => a + b, 0);
        const fgts = df.recursosHumanos.salarios * 0.08;
        const decimoTerceiro = df.recursosHumanos.salarios / 12;
        const ferias = (df.recursosHumanos.salarios * 1.33) / 12;
        const rhTotal = rh + fgts + decimoTerceiro + ferias;
        
        const retirada = Object.values(df.retiradaPessoal).reduce((a, b) => a + b, 0);
        const mkt = Object.values(df.marketing).reduce((a, b) => a + b, 0);
        const adm = Object.values(df.administrativo).reduce((a, b) => a + b, 0);
        const prov = Object.values(df.provisionamentos).reduce((a, b) => a + b, 0);
        const custom = df.customizadas.reduce((a, b) => a + b.valor, 0);
        
        return infra + rhTotal + retirada + mkt + adm + prov + custom;
      },

      getTotalHorasMensais: () => {
        const hc = get().horaClinica;
        return (hc.horasSemana * hc.diasSemana) + (hc.horasSabado * hc.diasSabado);
      },

      getHoraClinicaValor: () => {
        const total = get().getTotalDespesasFixas();
        const horas = get().getTotalHorasMensais();
        return horas > 0 ? total / horas : 0;
      },

      getMinutoClinicoValor: () => {
        return get().getHoraClinicaValor() / 60;
      },

      calcularLucroProcedimento: (proc) => {
        const minuto = get().getMinutoClinicoValor();
        const params = get().parametros;
        
        const custoTempo = proc.tempoMinutos * minuto;
        const imposto = proc.valorCobrado * (params.aliquotaImposto / 100);
        const taxaCartao = proc.valorCobrado * (params.taxaCartao / 100);
        const custoTotal = custoTempo + proc.custoMaterial + imposto + taxaCartao;
        const lucro = proc.valorCobrado - custoTotal;
        const margemLucro = proc.valorCobrado > 0 ? (lucro / proc.valorCobrado) * 100 : 0;
        
        return { custoTempo, imposto, taxaCartao, custoTotal, lucro, margemLucro };
      },

      calcularMCProcedimento: (proc) => {
        const mcUnitaria = proc.preco - proc.custoVariavel;
        const mcPercentual = proc.preco > 0 ? (mcUnitaria / proc.preco) * 100 : 0;
        const mcTotal = mcUnitaria * proc.qtdVendas;
        return { mcUnitaria, mcPercentual, mcTotal };
      },

      getResumoMC: () => {
        const procs = get().mcProcedimentos;
        let receitaTotal = 0;
        let mcTotalGeral = 0;
        let maisLucrativo: MCProcedimento | null = null;
        let maiorMC = -Infinity;

        procs.forEach((proc) => {
          const { mcPercentual, mcTotal } = get().calcularMCProcedimento(proc);
          receitaTotal += proc.preco * proc.qtdVendas;
          mcTotalGeral += mcTotal;
          if (mcPercentual > maiorMC) {
            maiorMC = mcPercentual;
            maisLucrativo = proc;
          }
        });

        const indiceMedioMC = receitaTotal > 0 ? (mcTotalGeral / receitaTotal) * 100 : 0;
        return { receitaTotal, mcTotalGeral, indiceMedioMC, maisLucrativo };
      },

      getPacientesNecessarios: (cenario) => {
        const { cenarios, ticketMedio } = get().planoMetas;
        return ticketMedio > 0 ? Math.ceil(cenarios[cenario] / ticketMedio) : 0;
      },

      getTotalCaptacao: (cenario) => {
        const { fontes } = get().planoMetas;
        const fixas = [
          fontes.basePacientes[cenario],
          fontes.leadsAntigos[cenario],
          fontes.trafegoPago[cenario],
          fontes.socialSelling[cenario],
          fontes.indicacoes[cenario],
        ].reduce((a, b) => a + b, 0);
        const custom = fontes.customizadas.reduce((a, f) => a + f[cenario], 0);
        return fixas + custom;
      },

      // Cloud sync
      _isSyncing: false,

      syncToCloud: async () => {
        const state = get();
        if (state._isSyncing) return;
        
        set({ _isSyncing: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ _isSyncing: false });
            return;
          }

          const payload = {
            despesasFixas: state.despesasFixas,
            horaClinica: state.horaClinica,
            procedimentos: state.procedimentos,
            parametros: state.parametros,
            dadosPE: state.dadosPE,
            mcProcedimentos: state.mcProcedimentos,
            planoMetas: state.planoMetas,
          };

          // Check if record exists
          const { data: existing } = await supabase
            .from('financial_data')
            .select('id, data')
            .eq('user_id', user.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('financial_data')
              .update({ data: payload as any })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('financial_data')
              .insert({
                user_id: user.id,
                data: payload as any,
              });
          }
        } catch (error) {
          console.error('[syncToCloud] error', error);
        } finally {
          set({ _isSyncing: false });
        }
      },

      loadFromCloud: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data } = await supabase
            .from('financial_data')
            .select('data')
            .eq('user_id', user.id)
            .maybeSingle();

          if (data?.data) {
            const cloudData = data.data as any;
            set({
              despesasFixas: cloudData.despesasFixas || defaultDespesasFixas,
              horaClinica: cloudData.horaClinica || defaultHoraClinica,
              procedimentos: cloudData.procedimentos || defaultProcedimentos,
              parametros: cloudData.parametros || defaultParametros,
              dadosPE: cloudData.dadosPE || defaultDadosPE,
              mcProcedimentos: cloudData.mcProcedimentos || defaultMCProcedimentos,
              planoMetas: cloudData.planoMetas || defaultPlanoMetas,
            });
          }
        } catch (error) {
          console.error('[loadFromCloud] error', error);
        }
      },
    }),
    {
      name: 'hof-financial-store',
    }
  )
);

// Auto-sync to cloud on changes (debounced)
let syncTimeout: NodeJS.Timeout | null = null;
useFinancialStore.subscribe((state, prevState) => {
  // Skip if only _isSyncing changed
  if (state._isSyncing !== prevState._isSyncing && 
      state.despesasFixas === prevState.despesasFixas &&
      state.horaClinica === prevState.horaClinica &&
      state.procedimentos === prevState.procedimentos &&
      state.parametros === prevState.parametros &&
      state.dadosPE === prevState.dadosPE &&
      state.mcProcedimentos === prevState.mcProcedimentos &&
      state.planoMetas === prevState.planoMetas) {
    return;
  }
  
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    useFinancialStore.getState().syncToCloud();
  }, 2000); // Debounce 2 seconds
});
