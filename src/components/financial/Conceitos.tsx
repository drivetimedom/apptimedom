import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight } from 'lucide-react';

interface ConceptLink {
  text: string;
  href: string;
}

interface Concept {
  icon: string;
  title: string;
  content: React.ReactNode;
  link?: ConceptLink;
}

const concepts: Concept[] = [
  {
    icon: '$',
    title: 'DESPESAS FIXAS',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          São despesas que você tem <span className="text-white font-semibold">TODO MÊS</span>, 
          independente de atender pacientes ou não.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Exemplos:</p>
          <ul className="text-white text-sm space-y-1">
            <li>• Aluguel</li>
            <li>• Salários dos funcionários</li>
            <li>• Contador</li>
            <li>• Marketing (agência)</li>
            <li>• Sua retirada (pró-labore)</li>
          </ul>
        </div>
        <p className="text-[#f59e0b] text-sm">
          Mesmo em férias, você paga essas contas!
        </p>
      </div>
    ),
    link: { text: 'Ver calculadora', href: '/financial-system' },
  },
  {
    icon: 'R$',
    title: 'CUSTOS VARIÁVEIS',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          São custos que você <span className="text-white font-semibold">SÓ TEM</span> se atender pacientes.
          <br />
          Sem atendimento = sem custo variável.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Exemplos:</p>
          <ul className="text-white text-sm space-y-1">
            <li>• Toxina botulínica</li>
            <li>• Preenchedor (ácido hialurônico)</li>
            <li>• Fios de sustentação</li>
            <li>• Materiais descartáveis (agulhas, seringas)</li>
            <li>• Comissões por venda</li>
          </ul>
        </div>
        <p className="text-[#10b981] text-sm">
          Quanto menor o custo variável, maior seu lucro!
        </p>
      </div>
    ),
  },
  {
    icon: 'h',
    title: 'HORA CLÍNICA',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          É quanto <span className="text-white font-semibold">CUSTA</span> cada hora do seu tempo de trabalho.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Fórmula:</p>
          <p className="text-white font-mono text-sm">
            Hora Clínica = Despesas Fixas ÷ Horas Trabalhadas Mensais
          </p>
          <p className="text-[#a0a0a0] text-sm mt-3 mb-1">Exemplo:</p>
          <p className="text-[#f59e0b] font-mono text-sm">
            R$ 21.830 ÷ 176h = R$ 124/hora
          </p>
        </div>
        <p className="text-[#a0a0a0] text-sm">
          Ou seja, cada hora que você trabalha tem um custo operacional de R$ 124,00.
        </p>
        <p className="text-[#10b981] text-sm">
          Use para calcular quanto tempo você "gasta" em cada procedimento e incluir no preço!
        </p>
      </div>
    ),
    link: { text: 'Calcular minha hora clínica', href: '/financial-system' },
  },
  {
    icon: '%',
    title: 'MARGEM DE CONTRIBUIÇÃO (MC)',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          É o que <span className="text-white font-semibold">SOBRA</span> da venda após pagar os custos variáveis.
          <br />
          Esse valor serve para pagar as despesas fixas.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Fórmulas:</p>
          <p className="text-white font-mono text-sm">MC (R$) = Receita - Custos Variáveis</p>
          <p className="text-white font-mono text-sm">MC (%) = (MC ÷ Receita) × 100</p>
          <p className="text-[#a0a0a0] text-sm mt-3 mb-1">Exemplo:</p>
          <p className="text-white text-sm">Botox vendido por R$ 1.200</p>
          <p className="text-white text-sm">Toxina custou R$ 467</p>
          <p className="text-[#f59e0b] font-mono text-sm mt-1">
            MC = R$ 1.200 - R$ 467 = R$ 733
          </p>
          <p className="text-[#f59e0b] font-mono text-sm">
            MC% = (R$ 733 ÷ R$ 1.200) × 100 = 61,1%
          </p>
        </div>
        <p className="text-[#10b981] text-sm">
          Quanto MAIOR a MC%, melhor! Significa que sobra mais dinheiro para pagar suas despesas fixas e gerar lucro.
        </p>
      </div>
    ),
    link: { text: 'Analisar MC dos meus procedimentos', href: '/financial-system' },
  },
  {
    icon: '=',
    title: 'PONTO DE EQUILÍBRIO (PE)',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          É o faturamento <span className="text-white font-semibold">MÍNIMO</span> mensal para não ter prejuízo.
          <br />
          No Ponto de Equilíbrio, seu lucro = ZERO (você apenas empata).
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Fórmula:</p>
          <p className="text-white font-mono text-sm">PE = Despesas Fixas ÷ Índice de MC</p>
          <p className="text-[#a0a0a0] text-sm mt-3 mb-1">Exemplo:</p>
          <p className="text-white text-sm">Despesas Fixas: R$ 21.830</p>
          <p className="text-white text-sm">Índice MC: 60%</p>
          <p className="text-[#f59e0b] font-mono text-sm mt-1">
            PE = R$ 21.830 ÷ 0,60 = R$ 36.383
          </p>
        </div>
        <div className="bg-[#3a3a3a] rounded-lg p-3 space-y-1">
          <p className="text-[#a0a0a0] text-sm">Interpretação:</p>
          <p className="text-[#ef4444] text-sm">Faturar ABAIXO de R$ 36.383 = PREJUÍZO</p>
          <p className="text-[#10b981] text-sm">Faturar ACIMA de R$ 36.383 = LUCRO</p>
        </div>
        <p className="text-[#10b981] text-sm">
          O PE te diz o "chão" que você não pode ficar abaixo!
        </p>
      </div>
    ),
    link: { text: 'Calcular meu PE', href: '/financial-system' },
  },
  {
    icon: 'T',
    title: 'TICKET MÉDIO',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          É o valor <span className="text-white font-semibold">MÉDIO</span> que cada paciente gasta na sua clínica.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Fórmula:</p>
          <p className="text-white font-mono text-sm">Ticket Médio = Faturamento Total ÷ Número de Pacientes</p>
          <p className="text-[#a0a0a0] text-sm mt-3 mb-1">Exemplo:</p>
          <p className="text-white text-sm">Faturou R$ 40.000 com 20 pacientes</p>
          <p className="text-[#f59e0b] font-mono text-sm mt-1">
            Ticket Médio = R$ 40.000 ÷ 20 = R$ 2.000
          </p>
        </div>
        <p className="text-[#10b981] text-sm">
          Quanto MAIOR o ticket médio, melhor! Você atende menos pessoas e ganha mais. Trabalho inteligente.
        </p>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Dicas para aumentar:</p>
          <ul className="text-white text-sm space-y-1">
            <li>• Venda múltiplos procedimentos por consulta</li>
            <li>• Crie protocolos combinados</li>
            <li>• Ofereça manutenções e retornos</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: 'PL',
    title: 'PRÓ-LABORE',
    content: (
      <div className="space-y-3">
        <p className="text-[#a0a0a0]">
          É a sua <span className="text-white font-semibold">RETIRADA MENSAL</span> como proprietário da clínica.
          <br />
          É diferente de lucro!
        </p>
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg p-3 space-y-1">
          <p className="text-[#f59e0b] text-sm font-semibold">Importante:</p>
          <p className="text-white text-sm">Pró-labore É despesa fixa (entra no cálculo do PE)</p>
          <p className="text-white text-sm">Lucro é o que sobra DEPOIS de pagar tudo, incluindo pró-labore</p>
        </div>
        <div className="bg-[#3a3a3a] rounded-lg p-3">
          <p className="text-[#a0a0a0] text-sm mb-2">Exemplo:</p>
          <p className="text-white text-sm">Você define pró-labore de R$ 5.000/mês</p>
          <p className="text-white text-sm">Esse valor entra nas Despesas Fixas</p>
          <p className="text-white text-sm">Se tiver lucro no final, pode distribuir além do pró-labore</p>
        </div>
        <p className="text-[#ef4444] text-sm font-semibold">
          NUNCA deixe seu pró-labore em R$ 0,00! Você também precisa receber pelo seu trabalho.
        </p>
      </div>
    ),
  },
];

const Conceitos: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          CONCEITOS FUNDAMENTAIS DE GESTÃO FINANCEIRA
        </h2>
        <p className="text-[#a0a0a0]">Entenda os termos e cálculos que usamos</p>
      </div>

      {/* Acordeões */}
      <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
        {concepts.map((concept, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-[#404040] bg-[#2d2d2d] rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#3a3a3a]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{concept.icon}</span>
                <span className="font-semibold text-white">{concept.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              {concept.content}
              {concept.link && (
                <Link
                  to={concept.link.href}
                  className="inline-flex items-center gap-2 text-[#3b82f6] hover:text-[#60a5fa] text-sm mt-4"
                >
                  {concept.link.text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Conceitos;
