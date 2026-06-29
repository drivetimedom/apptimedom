export interface HofBoxCard {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  available: boolean;
}

export const hofBoxCards: HofBoxCard[] = [
  {
    id: 1,
    slug: 'sistema-abordagem-comercial',
    title: 'Sistema de Abordagem Comercial',
    description: 'Da captação ao fechamento: scripts, checklists e estratégias',
    category: 'Vendas',
    available: true,
  },
  {
    id: 2,
    slug: 'a-verdade-sobre-objecoes',
    title: 'A Verdade Sobre Objeções',
    description: 'Scripts testados para as 7 objeções mais comuns',
    category: 'Vendas',
    available: true,
  },
  {
    id: 3,
    slug: '',
    title: 'Em breve',
    description: 'Novo material chegando em breve',
    category: '',
    available: false,
  },
  {
    id: 4,
    slug: '',
    title: 'Em breve',
    description: 'Novo material chegando em breve',
    category: '',
    available: false,
  },
  {
    id: 5,
    slug: '',
    title: 'Em breve',
    description: 'Novo material chegando em breve',
    category: '',
    available: false,
  },
];

// ────────────────────────────────────────────────
// Ebook content types
// ────────────────────────────────────────────────

export type EbookBlock =
  | { type: 'section'; number: number; title: string }
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; text: string }
  | { type: 'pillar-grid'; pillars: { title: string; description: string }[] }
  | { type: 'checklist'; id: string; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'phase'; title: string; body: string }
  | { type: 'script'; text: string }
  | { type: 'dialog'; exchanges: { speaker: 'Você' | 'Paciente'; text: string }[] }
  | { type: 'procedure-grid'; items: { title: string; note: string }[] }
  | { type: 'numbered-list'; title?: string; items: string[] };

export interface Ebook {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  blocks: EbookBlock[];
}

export const ebooks: Record<string, Ebook> = {
  'sistema-abordagem-comercial': {
    slug: 'sistema-abordagem-comercial',
    title: 'Sistema de Abordagem Comercial',
    subtitle: 'Da captação ao fechamento: scripts, checklists e estratégias testadas',
    category: 'Vendas',
    blocks: [
      {
        type: 'callout',
        text: 'Este material foi construído a partir de centenas de atendimentos reais. Cada script, cada checklist e cada estratégia aqui presente foi validado em consultórios que faturam consistentemente acima da média do mercado.',
      },
      {
        type: 'section',
        number: 1,
        title: 'Os 3 Pilares de uma Abordagem Comercial Eficiente',
      },
      {
        type: 'paragraph',
        text: 'Antes de qualquer script ou técnica, você precisa entender a base. Clínicas que fecham consistentemente não fecham porque têm "jeito para vender". Fecham porque dominam três pilares fundamentais que transformam atendimento em resultado.',
      },
      {
        type: 'pillar-grid',
        pillars: [
          {
            title: 'Diagnóstico Real',
            description: 'Entender o que o paciente quer — não só o que ele pede. A queixa estética esconde sempre uma dor emocional mais profunda.',
          },
          {
            title: 'Proposta de Valor',
            description: 'Apresentar o plano como solução para a vida do paciente, não como uma lista de procedimentos com preço.',
          },
          {
            title: 'Condução Segura',
            description: 'Guiar o paciente pelo processo de decisão sem pressão, criando confiança em cada etapa.',
          },
        ],
      },
      {
        type: 'section',
        number: 2,
        title: 'O Funil de Atendimento em 5 Fases',
      },
      {
        type: 'paragraph',
        text: 'Cada atendimento comercial segue um funil previsível. Quando você entende em qual fase o paciente está, sabe exatamente o que dizer e o que NÃO dizer.',
      },
      {
        type: 'phase',
        title: 'Fase 1 — Conexão (primeiros 5 min)',
        body: 'O objetivo aqui não é vender. É criar segurança. O paciente precisa sentir que chegou ao lugar certo. Use perguntas abertas, demonstre genuíno interesse e evite falar de preço ou procedimentos ainda.',
      },
      {
        type: 'phase',
        title: 'Fase 2 — Diagnóstico (5 a 15 min)',
        body: 'Aqui você investiga. Perguntas de diagnóstico bem feitas revelam a motivação real do paciente. A dor que ele não fala abertamente, mas que é o verdadeiro motor da decisão.',
      },
      {
        type: 'phase',
        title: 'Fase 3 — Apresentação do Plano (15 a 30 min)',
        body: 'Apresente a solução conectada às dores que ele mesmo descreveu. Use as palavras dele. "Você me disse que quer se sentir confiante no trabalho — esse plano foi desenhado exatamente para isso."',
      },
      {
        type: 'phase',
        title: 'Fase 4 — Ancoragem de Valor (30 a 40 min)',
        body: 'Antes de falar de preço, solidifique o valor. Mostre resultados reais, depoimentos de pacientes similares, o tempo de transformação. O paciente precisa querer o resultado antes de ver o número.',
      },
      {
        type: 'phase',
        title: 'Fase 5 — Condução ao Fechamento',
        body: 'Apresente o investimento com naturalidade. Tenha opções de parcelamento prontas. Não pergunte "o que achou?" — pergunte "qual forma de pagamento funciona melhor para você?".',
      },
      {
        type: 'section',
        number: 3,
        title: 'Checklist Pré-Atendimento',
      },
      {
        type: 'paragraph',
        text: 'Os melhores fechamentos começam antes do paciente entrar. Use este checklist toda vez que tiver um atendimento agendado.',
      },
      {
        type: 'checklist',
        id: 'pre-atendimento',
        items: [
          'Revisar o histórico do paciente (se já é cliente)',
          'Verificar de onde ele veio (indicação, Instagram, Google)',
          'Preparar 2 ou 3 casos similares para mostrar',
          'Ter tabela de preços e opções de parcelamento em mãos',
          'Confirmar ambiente limpo, organizado e acolhedor',
          'Definir a "oferta principal" e a "oferta alternativa" para o fechamento',
          'Revisar as objeções mais comuns para esse perfil de paciente',
        ],
      },
      {
        type: 'section',
        number: 4,
        title: 'Scripts de Diagnóstico',
      },
      {
        type: 'paragraph',
        text: 'As perguntas certas fazem o paciente vender para si mesmo. Use estas perguntas na fase de diagnóstico para revelar a motivação real.',
      },
      {
        type: 'dialog',
        exchanges: [
          { speaker: 'Você', text: 'Me conta um pouco — o que te trouxe até aqui hoje? O que você gostaria de mudar ou melhorar?' },
          { speaker: 'Paciente', text: 'Ah, eu queria clarear um pouco os dentes sabe? Tô com eles bem amarelados.' },
          { speaker: 'Você', text: 'Entendo. E quando você imagina os dentes mais brancos, como você se vê? Tem alguma situação específica que você pensa — "quando eu resolver isso, vou me sentir diferente"?' },
          { speaker: 'Paciente', text: 'É... tenho uma entrevista de emprego mês que vem e fico com vergonha de sorrir nas fotos.' },
          { speaker: 'Você', text: 'Isso faz todo sentido. Então não é só sobre os dentes em si — é sobre como você vai se sentir nessa entrevista, certo? Vamos montar um plano que resolva isso dentro do seu prazo.' },
        ],
      },
      {
        type: 'callout',
        text: 'Regra de ouro: nunca interrompa o paciente quando ele está descrevendo a dor. Cada detalhe que ele dá é ouro para o fechamento. Anote mentalmente e use as palavras dele na apresentação do plano.',
      },
      {
        type: 'section',
        number: 5,
        title: 'Tabela de Perfis de Pacientes',
      },
      {
        type: 'paragraph',
        text: 'Cada perfil tem uma abordagem diferente. Identifique o perfil nos primeiros 5 minutos e adapte seu estilo.',
      },
      {
        type: 'table',
        headers: ['Perfil', 'Comportamento', 'O que valoriza', 'Como abordar'],
        rows: [
          ['Analítico', 'Faz muitas perguntas, pesquisou antes', 'Dados, evidências, garantias', 'Seja direto, mostre números e resultados mensuráveis'],
          ['Emotivo', 'Fala de sentimentos, quer ser compreendido', 'Conexão, confiança, histórias', 'Escute mais, use casos de outros pacientes'],
          ['Pragmático', 'Quer resolver rápido, objetivo', 'Agilidade, resultado claro', 'Vá direto ao plano, evite rodeios'],
          ['Indeciso', 'Pede para pensar, adia decisão', 'Segurança, sem arrependimento', 'Ofereça garantia, reduza o risco percebido'],
        ],
      },
      {
        type: 'section',
        number: 6,
        title: 'Scripts de Apresentação do Plano',
      },
      {
        type: 'paragraph',
        text: 'A apresentação do plano deve soar como uma conversa, não como uma proposta de vendas. Use estas estruturas como base e adapte ao que o paciente revelou na fase de diagnóstico.',
      },
      {
        type: 'script',
        text: '"Com base no que você me contou, montei um plano que vai [resultado que ele quer] em [prazo]. São [N] etapas e cada uma tem um propósito específico. Posso te explicar cada passo?"',
      },
      {
        type: 'script',
        text: '"Você mencionou que [dor específica que ele descreveu]. É exatamente isso que esse protocolo resolve. Pacientes com o mesmo perfil que o seu geralmente veem resultado já na [semana/sessão X]."',
      },
      {
        type: 'callout',
        text: 'Nunca apresente o plano antes de ter feito o diagnóstico. Se você não sabe o que dói no paciente, qualquer plano vai parecer genérico — e genérico não fecha.',
      },
      {
        type: 'section',
        number: 7,
        title: 'Procedimentos por Categoria de Queixa',
      },
      {
        type: 'procedure-grid',
        items: [
          { title: 'Clareamento', note: 'Alta conversão — paciente já decidiu, conduza para o plano completo' },
          { title: 'Harmonização Facial', note: 'Diagnóstico aprofundado — mapeie todas as queixas antes de propor' },
          { title: 'Implantes', note: 'Ciclo longo — foque em segurança e construção de confiança' },
          { title: 'Ortodontia', note: 'Resultado visível lento — ancore o "antes e depois" emocional' },
          { title: 'Facetas', note: 'Alto ticket — use casos reais e mostre fotos de pacientes similares' },
          { title: 'Prótese', note: 'Urgência real — valide a dor funcional antes da estética' },
        ],
      },
      {
        type: 'section',
        number: 8,
        title: 'Checklist de Fechamento',
      },
      {
        type: 'checklist',
        id: 'fechamento',
        items: [
          'Você resumiu o plano usando as palavras do próprio paciente?',
          'Você ancorou o valor antes de apresentar o preço?',
          'Você apresentou pelo menos 2 opções de parcelamento?',
          'Você fez a pergunta de fechamento (não perguntou "o que achou?")?',
          'Se houve objeção, você acolheu antes de responder?',
          'Você agendou o próximo passo antes de o paciente sair?',
          'Você enviou um resumo por WhatsApp após o atendimento?',
        ],
      },
      {
        type: 'section',
        number: 9,
        title: 'Plano de Implementação em 30 Dias',
      },
      {
        type: 'numbered-list',
        title: 'Semana 1 — Diagnóstico Interno',
        items: [
          'Grave (com consentimento) ou anote seus próximos 5 atendimentos',
          'Identifique em qual fase você costuma perder o paciente',
          'Escolha UMA habilidade para focar esta semana',
        ],
      },
      {
        type: 'numbered-list',
        title: 'Semana 2 — Implementação do Diagnóstico',
        items: [
          'Use as perguntas da Seção 4 em todos os atendimentos',
          'Anote a "dor real" de cada paciente antes de apresentar qualquer plano',
          'Compare os resultados com a semana anterior',
        ],
      },
      {
        type: 'numbered-list',
        title: 'Semana 3 — Apresentação e Ancoragem',
        items: [
          'Implemente os scripts da Seção 6 adaptando ao seu estilo',
          'Treine a ancoragem de valor com um colega antes dos atendimentos reais',
          'Registre taxa de conversão desta semana',
        ],
      },
      {
        type: 'numbered-list',
        title: 'Semana 4 — Fechamento e Análise',
        items: [
          'Use o checklist de fechamento em 100% dos atendimentos',
          'Compile os dados das 4 semanas: quantos atendimentos, quantos fechamentos',
          'Identifique o padrão das objeções que ainda não resolveu — leia o próximo material do HOF BOX',
        ],
      },
      {
        type: 'callout',
        text: 'Lembre-se: consistência bate talento. Um profissional mediano que usa um sistema consistentemente supera um profissional talentoso que improvisa. Implemente. Meça. Ajuste. Repita.',
      },
    ],
  },

  'a-verdade-sobre-objecoes': {
    slug: 'a-verdade-sobre-objecoes',
    title: 'A Verdade Sobre Objeções',
    subtitle: 'Scripts testados para as 7 objeções mais comuns',
    category: 'Vendas',
    blocks: [
      {
        type: 'callout',
        text: 'Objeção não é rejeição. É um pedido de mais informação ou mais segurança. Quem entende isso para de temer objeções e começa a usá-las como alavanca de fechamento.',
      },
      {
        type: 'section',
        number: 1,
        title: 'Por Que Pacientes Objecionam',
      },
      {
        type: 'paragraph',
        text: 'Antes de qualquer script, entenda a raiz. Pacientes levantam objeções por três motivos: não confiam o suficiente ainda, não perceberam o valor completo ou precisam de ajuda para se decidir. Em todos os casos, a resposta certa não é argumentar — é acolher e conduzir.',
      },
    ],
  },
};
