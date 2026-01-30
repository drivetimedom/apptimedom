import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface FinancialStore {
  // Data
  despesasFixas: DespesasFixas;
  horaClinica: HoraClinica;
  procedimentos: Procedimento[];
  parametros: Parametros;
  dadosPE: DadosPE;

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

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      despesasFixas: defaultDespesasFixas,
      horaClinica: defaultHoraClinica,
      procedimentos: defaultProcedimentos,
      parametros: defaultParametros,
      dadosPE: defaultDadosPE,

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

      // Computed values
      getTotalDespesasFixas: () => {
        const df = get().despesasFixas;
        const infra = Object.values(df.infraestrutura).reduce((a, b) => a + b, 0);
        const rh = Object.values(df.recursosHumanos).reduce((a, b) => a + b, 0);
        // Calculated RH costs
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
    }),
    {
      name: 'hof-financial-store',
    }
  )
);
