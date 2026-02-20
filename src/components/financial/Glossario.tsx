import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  letter: string;
  definition: React.ReactNode;
  seeAlso?: string;
  isPro?: boolean;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Alíquota de Imposto',
    letter: 'A',
    definition: (
      <>
        Percentual de imposto cobrado sobre o faturamento. Varia conforme regime tributário 
        (Simples Nacional, Lucro Presumido, Lucro Real).
        <p className="text-[#10b981] text-sm mt-2">Consulte seu contador para saber a sua.</p>
      </>
    ),
  },
  {
    term: 'Capital de Giro',
    letter: 'C',
    definition: 'Dinheiro disponível no caixa para operação diária. Essencial para emergências e oportunidades.',
  },
  {
    term: 'Custos Fixos',
    letter: 'C',
    seeAlso: 'Despesas Fixas',
    definition: '',
  },
  {
    term: 'Custos Variáveis',
    letter: 'C',
    definition: 'Despesas que só existem se houver atendimento. Exemplos: toxina, preenchedor, materiais descartáveis.',
  },
  {
    term: 'Despesas Fixas',
    letter: 'D',
    definition: 'Despesas mensais que existem independente de atendimentos. Ex: aluguel, salários, contador, sua retirada (pró-labore).',
  },
  {
    term: 'DRE (Demonstrativo de Resultado)',
    letter: 'D',
    isPro: true,
    definition: 'Relatório que mostra receitas, custos e lucro em um período.',
  },
  {
    term: 'Hora Clínica',
    letter: 'H',
    definition: (
      <>
        Custo de cada hora do seu tempo de trabalho.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: Despesas Fixas ÷ Horas Trabalhadas
        </p>
      </>
    ),
  },
  {
    term: 'Índice de MC',
    letter: 'I',
    definition: (
      <>
        Percentual da receita que vira margem de contribuição.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: (MC ÷ Receita) × 100
        </p>
        <p className="text-[#a0a0a0] text-sm mt-1">Usado para calcular ponto de equilíbrio.</p>
      </>
    ),
  },
  {
    term: 'Lucro Bruto',
    letter: 'L',
    definition: 'Receita - Custos Variáveis (= MC)',
  },
  {
    term: 'Lucro Líquido',
    letter: 'L',
    definition: 'Lucro após pagar TUDO (fixo, variável, impostos). O que realmente sobra para você.',
  },
  {
    term: 'Margem de Contribuição (MC)',
    letter: 'M',
    definition: (
      <>
        Quanto sobra da venda após pagar custos variáveis. Serve para pagar despesas fixas.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: Receita - Custos Variáveis
        </p>
      </>
    ),
  },
  {
    term: 'Ponto de Equilíbrio (PE)',
    letter: 'P',
    definition: (
      <>
        Faturamento mínimo para não ter prejuízo. No PE, lucro = zero.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: Despesas Fixas ÷ Índice MC
        </p>
      </>
    ),
  },
  {
    term: 'Pró-labore',
    letter: 'P',
    definition: 'Retirada mensal do proprietário. É despesa fixa! Não confunda com lucro distribuído.',
  },
  {
    term: 'Provisão',
    letter: 'P',
    definition: 'Separar mensalmente para despesa futura. Ex: Valor anual ÷ 12. Evita surpresas.',
  },
  {
    term: 'ROI (Return on Investment)',
    letter: 'R',
    definition: (
      <>
        Retorno sobre investimento. Quanto você ganhou para cada R$ 1 investido.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: Receita ÷ Investimento
        </p>
      </>
    ),
  },
  {
    term: 'Taxa de Cartão',
    letter: 'T',
    definition: 'Percentual cobrado pela maquininha sobre cada venda. Varia de 2% a 15% conforme parcelamento e operadora.',
  },
  {
    term: 'Ticket Médio',
    letter: 'T',
    definition: (
      <>
        Valor médio gasto por paciente.
        <p className="text-[#a0a0a0] text-sm mt-2 font-mono">
          Fórmula: Faturamento ÷ Nº Pacientes
        </p>
      </>
    ),
  },
];

const Glossario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return glossaryTerms;
    
    const query = searchQuery.toLowerCase();
    return glossaryTerms.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        (typeof term.definition === 'string' && term.definition.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      if (!groups[term.letter]) {
        groups[term.letter] = [];
      }
      groups[term.letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const letters = Object.keys(groupedTerms).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          GLOSSÁRIO DE TERMOS FINANCEIROS
        </h2>
        <p className="text-[#a0a0a0]">Busque qualquer termo que tiver dúvida</p>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0a0]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar termo..."
          className="w-full bg-[#3a3a3a] border border-[#404040] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50"
        />
      </div>

      {/* Lista de Termos */}
      <div className="space-y-6">
        {letters.length === 0 ? (
          <div className="text-center py-8 text-[#a0a0a0]">
            Nenhum termo encontrado para "{searchQuery}"
          </div>
        ) : (
          letters.map((letter) => (
            <div key={letter}>
              {/* Letter Header */}
              <div className="bg-[#3a3a3a] rounded-lg px-4 py-2 mb-3">
                <span className="text-white font-bold text-lg">{letter}</span>
              </div>

              {/* Terms */}
              <div className="space-y-3">
                {groupedTerms[letter].map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#2d2d2d] rounded-lg border border-[#404040] p-4"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[#3b82f6]">#</span>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">
                          {item.term}
                          {item.isPro && (
                            <span className="ml-2 text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded">
                              PRO
                            </span>
                          )}
                        </h4>
                        {item.seeAlso ? (
                          <p className="text-[#3b82f6] text-sm mt-1">
                            → Ver {item.seeAlso}
                          </p>
                        ) : (
                          <div className="text-[#a0a0a0] text-sm mt-2">
                            {item.definition}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className="border-b border-[#404040] mt-6"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Glossario;
