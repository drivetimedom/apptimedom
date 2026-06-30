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
    description: 'Da captação ao fechamento: scripts, checklists e estratégias para transformar atendimento reativo em abordagem estratégica.',
    category: 'Vendas',
    available: true,
  },
  {
    id: 2,
    slug: 'arsenal-quebra-objecoes',
    title: 'Arsenal de Quebra de Objeções',
    description: 'Scripts testados para as 7 objeções mais comuns. Domine cada resposta e aumente sua taxa de conversão.',
    category: 'Vendas',
    available: true,
  },
  {
    id: 3,
    slug: 'fluxo-followup-previsivel',
    title: 'Fluxo de Follow-Up Previsível',
    description: 'Sistema de 5 toques nos dias 0, 2, 5, 10 e 15. Pare de perder 80% dos seus leads por falta de sistema.',
    category: 'Follow-Up',
    available: true,
  },
  {
    id: 4,
    slug: 'sistema-campanha-interna',
    title: 'Sistema de Campanha Interna',
    description: 'Reativando sua base com CAC zero. Sua base de pacientes vale 10x mais que tráfego pago.',
    category: 'Campanhas',
    available: true,
  },
  {
    id: 5,
    slug: 'protocolo-consulta-que-vende',
    title: 'Protocolo de Consulta que Vende',
    description: 'Da abertura ao fechamento: roteiro completo para aumentar sua taxa de conversão de 15% para 60-80%.',
    category: 'Consultas',
    available: true,
  },
  {
    id: 6,
    slug: '',
    title: 'Em breve',
    description: 'Novo material chegando em breve',
    category: '',
    available: false,
  },
  {
    id: 7,
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
    subtitle: 'Método D.O.M. para Clínicas HOF — Da Captação ao Fechamento: Scripts, Checklists e Estratégias',
    category: 'Vendas',
    blocks: [
      { type: 'section', number: 1, title: 'Por Que Este Sistema Funciona' },
      { type: 'paragraph', text: 'A maioria das clínicas HOF perde dinheiro porque trata vendas como se fosse atendimento. Sua recepcionista responde perguntas, marca horários, mas não CONDUZ o paciente até a decisão.' },
      { type: 'callout', text: 'Este sistema transforma atendimento reativo em abordagem estratégica.' },
      { type: 'pillar-grid', pillars: [
        { title: 'Qualificação Precoce', description: 'Não agende qualquer pessoa. Filtre pelo problema, não pelo preço.' },
        { title: 'Diagnóstico Antes da Venda', description: 'Você não empurra procedimento. Você identifica o incômodo e apresenta a solução.' },
        { title: 'Follow-Up Estruturado', description: 'Leads não somem por desinteresse. Somem por falta de sistema.' },
      ]},
      { type: 'callout', text: 'INSIGHT ESTRATÉGICO: Clínicas que faturam R$100k+/mês não têm recepcionistas melhores. Elas têm SISTEMAS melhores. A diferença entre sua clínica faturar R$30k ou R$100k não está na sua técnica, está na forma como você conduz o paciente da primeira mensagem até o pagamento.' },

      { type: 'section', number: 2, title: 'Checklist de Qualificação de Leads' },
      { type: 'paragraph', text: 'Antes de agendar qualquer consulta, sua equipe precisa qualificar o lead. Isso economiza tempo, aumenta a conversão e atrai o perfil certo de paciente. Use este checklist em TODA primeira abordagem:' },
      { type: 'checklist', id: 'qualificacao-leads', items: [
        'Identificou o incômodo principal? (ex: papada, rugas, lábios finos)',
        'Entendeu quanto tempo ele tem esse incômodo? (urgência emocional)',
        'Sabe se já fez procedimento estético antes? (experiência prévia)',
        'Perguntou o que já pesquisou sobre soluções? (nível de consciência)',
        'Identificou faixa de investimento? (não preço exato, capacidade)',
        'Agendou dentro de 48-72h? (urgência operacional)',
      ]},
      { type: 'table', headers: ['Pergunta', 'Por que perguntar', 'O que buscar'], rows: [
        ['Qual é o seu principal incômodo com a sua aparência hoje?', 'Identificar DOR específica (não genérica)', "Respostas concretas: 'papada', 'rugas na testa', não 'quero ficar bonita'"],
        ['Há quanto tempo isso te incomoda?', 'Medir URGÊNCIA EMOCIONAL', 'Se >6 meses = dor latente; se recente = gatilho emocional'],
        ['Você já fez algum procedimento estético antes?', 'Avaliar FAMILIARIDADE com procedimentos', 'Se sim = menos objeções; se não = precisa educar mais'],
        ['Você já pesquisou sobre possíveis soluções?', 'Identificar NÍVEL DE CONSCIÊNCIA', 'Se sim = qualificado; se não = lead frio ainda'],
        ['Considerando investir em você mesma, qual faixa faz mais sentido agora?', 'Filtrar CAPACIDADE DE INVESTIMENTO', 'R$1-2k / R$2-5k / R$5k+ (nunca pergunte valor exato)'],
      ]},

      { type: 'section', number: 3, title: 'As 5 Fases da Abordagem Inteligente' },
      { type: 'paragraph', text: 'Este é o fluxo EXATO que você deve seguir em toda abordagem inicial. Não pule etapas.' },
      { type: 'phase', title: 'Fase 1 — Abertura e Identificação do Incômodo', body: 'Script de abertura: "Olá [nome]! [Bom dia/Boa tarde], eu me chamo [seu nome] e faço parte da equipe da Dra. [nome]. Vou te ajudar por aqui a esclarecer todas as suas dúvidas, ok? 😊 Para eu conseguir te dar a melhor orientação possível, deixe-me entender sua queixa principal: O que está te incomodando hoje?"\n\nObjetivo: fazer o paciente FALAR sobre o problema. Não interrompa. Deixe ele desabafar.\nSinais de que você acertou: ele conta uma história (não só "quero botox"), menciona há quanto tempo incomoda, você identifica emoção na fala dele.' },
      { type: 'phase', title: 'Fase 2 — Aprofundamento (Evidenciar o Incômodo)', body: 'Perguntas estratégicas: "Isso te incomoda em quais situações?" (social, profissional, fotos) / "Você já tentou algo para melhorar?" (frustrações anteriores) / "Como você acha que ficaria se isso fosse resolvido?" (futuro desejado)\n\nObjetivo: fazer o paciente VISUALIZAR a transformação. Vender é fazer ele se apaixonar pela versão futura dele mesmo.' },
      { type: 'phase', title: 'Fase 3 — Explicação Comercial da Solução', body: 'Estrutura: 1. Validação ("Certo! Entendo perfeitamente...") 2. Solução ("Conseguimos [resultado] com [procedimento]") 3. Benefício ("O legal é que [transformação específica]") 4. Naturalidade ("...sem perder a naturalidade") 5. Validação ("Isso faz sentido pra você?")\n\nExemplo: "Certo! Conseguimos volumizar e definir o contorno labial, na medida certa e sem perder a naturalidade. Mas também conseguimos fazer aquele bocão para quem deseja algo mais impactante e sexy. Isso faz sentido pra você?"\n\nRegra de ouro: SEMPRE termine com pergunta de validação. Não presuma que ele entendeu/curtiu.' },
      { type: 'phase', title: 'Fase 4 — Prova Social (Antes e Depois)', body: 'Como organizar seus casos: crie pastas no celular por procedimento (não misture tudo), selecione apenas seus melhores 5-8 casos por procedimento, organize por tipo de resultado (natural vs impactante), atualize mensalmente.\n\nScript: "Olha só alguns resultados que conseguimos aqui no consultório! 😍 [enviar 3-5 antes/depois] Com qual desses você mais se identificou, e por quê?"\n\nAtenção: não pergunte só "gostou?". Pergunte "com qual se identificou?" — isso cria compromisso emocional.' },
      { type: 'phase', title: 'Fase 5 — Fechamento Comercial', body: 'Esta é a fase mais importante. Aqui você CONVIDA para agendamento — não pergunta SE quer agendar, pergunta QUANDO.\n\nScript: "Então, se isso faz sentido pra você, eu posso tentar um encaixe para [dia da semana], [período]. Posso tentar?"\n\nImportante: use "Posso tentar?" ao invés de "Você quer?" — isso cria sensação de escassez.\n\nSe houver resistência ao horário: "Poxa, a agenda está muito completa e cheia, mas me fala: o que VOCÊ pode fazer? Quando você sugere? Porque posso tentar remanejar alguma coisa aqui."\n\nTécnica: sempre ofereça 2 opções de horário (não uma só, não pergunte "qual horário você quer?").' },

      { type: 'section', number: 4, title: 'Scripts por Canal: WhatsApp, DM e Telefone' },
      { type: 'paragraph', text: 'Cada canal tem particularidades. Aqui estão os scripts adaptados para cada um.' },
      { type: 'script', text: 'WHATSAPP (canal principal — 70% dos leads)\n\nMENSAGEM 1 (Abertura): "Olá [Nome]! 😊 Bom dia/Boa tarde! Eu me chamo [Seu Nome] e faço parte da equipe da Dra. [Nome]. Vi que você entrou em contato conosco! Como posso te ajudar hoje?" — aguardar resposta\n\nMENSAGEM 2 (Qualificação): "Entendi! Para eu conseguir te orientar da melhor forma possível, me conta: qual é o seu principal incômodo com a sua aparência hoje?" — aguardar resposta detalhada\n\nMENSAGEM 3 (Aprofundamento): "Entendo perfeitamente. E há quanto tempo isso te incomoda?" [Se >6 meses:] "Imagino o quanto isso tem afetado você... E você já tentou algo antes para melhorar?"\n\nMENSAGEM 4 (Explicação Comercial): "Certo! Olha, conseguimos [resultado específico] com [procedimento]. O legal é que [benefício principal], sem perder a naturalidade. Isso faz sentido pra você?"\n\nMENSAGEM 5 (Casos): "Perfeito! Deixa eu te mostrar alguns resultados que conseguimos aqui 😍 [enviar 3-5 antes/depois] Com qual desses você mais se identificou?"\n\nMENSAGEM 6 (Fechamento): "Que legal! Então, se faz sentido pra você, eu posso tentar um encaixe para [dia], [período]. Posso tentar? 🗓️" [SE RESISTÊNCIA:] "Poxa, a agenda está bem cheia, mas me fala: quando VOCÊ pode? Porque posso tentar remanejar algo aqui."\n\nRegras: nunca envie textão (quebre em mensagens de 2-4 linhas), use emojis estrategicamente, aguarde resposta antes de continuar, responda em até 5 minutos no horário comercial.' },
      { type: 'script', text: 'INSTAGRAM DM (canal de relacionamento)\n\nMENSAGEM 1: "Oi [Nome]! 💕 Vi sua mensagem aqui! Como posso te ajudar?"\nMENSAGEM 2: "Ahhh entendi! Me conta uma coisa: o que mais te incomoda hoje em relação à sua aparência?"\nMENSAGEM 3: "Siiim! Muitas pessoas aqui têm essa mesma queixa. Você já fez algum procedimento antes?"\nMENSAGEM 4: "Perfeito! Olha, a gente consegue [resultado] aqui no consultório! Deixa eu te mostrar alguns casos parecidos com o seu 👇 [2-3 antes/depois]"\nMENSAGEM 5 (Transição para WhatsApp): "Que legal que você gostou! 😍 Vou te passar meu WhatsApp pra gente conseguir agendar sua consulta com mais facilidade, ok? Me chama lá que a gente finaliza! 💙"\n\nPor que migrar para WhatsApp: DM não tem histórico organizado, WhatsApp permite follow-up estruturado, é mais fácil enviar documentos/formulários.' },
      { type: 'script', text: 'TELEFONE (para leads quentes ou reativação)\n\nABERTURA: "Alô, [Nome]? Bom dia/Boa tarde! Aqui é [Seu Nome] da Clínica [Nome]. Tudo bem com você? Olha, estou entrando em contato porque vi que você demonstrou interesse em [procedimento]. Você tem uns minutinhos agora pra gente conversar?"\n\nQUALIFICAÇÃO: "Perfeito! Me conta uma coisa: qual é a sua principal preocupação com a sua aparência hoje? O que mais te incomoda?" (escutar atentamente, não interromper)\n\nEXPLICAÇÃO COMERCIAL (mais resumida): "Certo! Olha, aqui no consultório a gente consegue [resultado principal] com [procedimento]. O legal é que [benefício 1] e [benefício 2], sem perder a naturalidade. Isso faz sentido pra você?"\n\nFECHAMENTO DIRETO: "Maravilha! Olha, deixa eu ver a agenda aqui rapidinho... Tenho uma vaga para [dia], [horário]. Esse horário funciona pra você?"\n\nRegras: fale devagar e com clareza, faça pausas, sorria enquanto fala (muda o tom de voz), se tiver objeção não force — agende follow-up.' },
      { type: 'table', headers: ['Situação', 'WhatsApp', 'Instagram DM', 'Telefone'], rows: [
        ['Lead novo (primeiro contato)', '✅ Ideal', '✅ OK (depois migrar)', '❌ Não'],
        ['Lead que já interagiu antes', '✅ Ideal', '✅ OK', '✅ Bom para aquecer'],
        ['Lead que sumiu (follow-up)', '✅ Ideal', '❌ Ruim', '✅ Ideal'],
        ['Lead pronto para fechar', '✅ Bom', '❌ Não', '✅ Ideal'],
      ]},

      { type: 'section', number: 5, title: 'Biblioteca de Explicações Comerciais' },
      { type: 'callout', text: 'REGRA CRÍTICA: sua recepcionista NÃO faz indicação técnica. Ela APRESENTA possibilidades baseadas no incômodo do paciente.' },
      { type: 'procedure-grid', items: [
        { title: 'Preenchimento Labial', note: 'Conseguimos volumizar e definir o contorno, na medida certa e sem perder a naturalidade. Também conseguimos fazer aquele bocão para quem deseja algo mais impactante e sexy.' },
        { title: 'Rinomodelação', note: 'Com o ácido hialurônico, quando há indicação, é possível preencher ondulações na giba nasal, corrigir assimetrias e dar uma leve empinadinha quando se tem a pontinha do nariz caída.' },
        { title: 'Toxina Botulínica (Botox)', note: 'Usada para tratamento de rugas dinâmicas, marcas de expressão ou arqueamento das sobrancelhas. Trata pés de galinha, rugas entre as sobrancelhas e linhas na testa, relaxando a musculatura.' },
        { title: 'Preenchimento de Malar', note: 'A região do malar é a primeira a sofrer com gravidade e envelhecimento. Conseguimos preencher e reestruturar essa região, proporcionando um rosto mais jovem e harmônico.' },
        { title: 'Lipo de Papada Enzimática', note: 'Procedimento minimamente invasivo com injeção de enzimas para eliminar gordura abaixo do queixo. Sem cirurgia, recuperação rápida. Em média, 4 sessões para resultado satisfatório.' },
        { title: 'Preenchimento de Bigode Chinês', note: 'Melhora o visual da linha entre nariz e lábios que evidencia aspecto cansado e envelhecido. Preenchimento com ácido hialurônico devolve jovialidade ao rosto.' },
        { title: 'Fios de Sustentação', note: 'Funcionam como bioestimuladores de colágeno. Efeito lifting imediato, sem cirurgia, com suspensão discreta da pele e reposicionamento dos tecidos.' },
      ]},
      { type: 'callout', text: 'ATENÇÃO: sua equipe comercial/secretária precisa CONHECER cada procedimento. Ela não faz indicações, mas conduz a negociação com segurança. Sempre que houver nova técnica, apresente detalhes sobre o procedimento e o pós-operatório.' },

      { type: 'section', number: 6, title: 'Exemplos de Conversas Completas' },
      { type: 'paragraph', text: 'Aqui estão 3 exemplos reais de conversas do início ao fechamento. Use como referência para treinar sua equipe.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'Olá Maria! 😊 Vi que você mandou mensagem. Como posso te ajudar?' },
        { speaker: 'Paciente', text: 'Oi! Eu queria saber sobre preenchimento labial' },
        { speaker: 'Você', text: 'Que legal! Para eu conseguir te orientar melhor, me conta: qual é o seu principal incômodo com os lábios hoje?' },
        { speaker: 'Paciente', text: 'Acho meus lábios muito finos, principalmente o de cima. Sempre uso batom mais escuro pra tentar disfarçar' },
        { speaker: 'Você', text: 'Entendo perfeitamente. E há quanto tempo isso te incomoda?' },
        { speaker: 'Paciente', text: 'Acho que desde sempre, mas nos últimos anos tem me incomodado mais' },
        { speaker: 'Você', text: 'E você já fez algum procedimento estético antes?' },
        { speaker: 'Paciente', text: 'Já fiz botox uma vez, mas nos lábios nunca' },
        { speaker: 'Você', text: 'Perfeito! Olha, conseguimos volumizar e definir o contorno, na medida certa e sem perder a naturalidade. Isso faz sentido pra você?' },
        { speaker: 'Paciente', text: 'Sim! Mas fica natural mesmo?' },
        { speaker: 'Você', text: 'Com certeza! Deixa eu te mostrar alguns casos 😍 [envia 4 antes/depois] Com qual desses você mais se identificou?' },
        { speaker: 'Paciente', text: 'Nossa, a foto 2 ficou perfeita! É exatamente o que eu quero' },
        { speaker: 'Você', text: 'Que ótimo! Então, posso tentar um encaixe para quarta-feira, período da tarde. Posso tentar? 🗓️' },
        { speaker: 'Paciente', text: 'Quarta à tarde eu consigo sim!' },
        { speaker: 'Você', text: 'Perfeito! Tenho uma vaga às 15h. Confirmado pra você, ok? 💙' },
      ]},
      { type: 'callout', text: 'CONVERSÃO: 8 mensagens / 12 minutos.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'Olá João! Bom dia! Eu me chamo Ana e faço parte da equipe da Dra. Carla. Como posso te ajudar?' },
        { speaker: 'Paciente', text: 'Bom dia! Queria saber quanto custa botox' },
        { speaker: 'Você', text: 'Entendi! O investimento varia dependendo da região e quantidade de unidades. Mas antes, me conta: qual é a sua principal preocupação hoje?' },
        { speaker: 'Paciente', text: 'Tenho umas rugas na testa que estão ficando bem marcadas' },
        { speaker: 'Você', text: 'Entendo. E há quanto tempo você percebeu isso?' },
        { speaker: 'Paciente', text: 'Uns 2 anos. Piorou bastante nos últimos meses' },
        { speaker: 'Você', text: 'Certo! Com a toxina botulínica conseguimos relaxar essa musculatura e suavizar essas linhas. O resultado fica bem natural e dura entre 4-6 meses. Faz sentido?' },
        { speaker: 'Paciente', text: 'Sim, mas quanto custa?' },
        { speaker: 'Você', text: 'O investimento fica entre R$800 e R$1.200, dependendo da quantidade de unidades. O valor te assustou?' },
        { speaker: 'Paciente', text: 'Um pouco... vi em outro lugar por R$600' },
        { speaker: 'Você', text: 'Entendo sua preocupação! A diferença geralmente está na qualidade do produto e na experiência da profissional. Aqui usamos toxina de primeira linha e a Dra. Carla tem mais de 8 anos de experiência. Posso te mostrar alguns casos?' },
        { speaker: 'Paciente', text: 'Ficou muito bom mesmo...' },
        { speaker: 'Você', text: 'Né? Olha, o que eu sugiro: vem fazer uma avaliação sem compromisso. Tenho uma vaga quinta às 16h. Posso agendar?' },
        { speaker: 'Paciente', text: 'Tá bom, vou fazer a avaliação' },
      ]},
      { type: 'callout', text: 'CONVERSÃO: 12 mensagens / 18 minutos / Objeção contornada.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'Oi Fernanda! Tudo bem? 😊 Aqui é a Ana da Clínica Dra. Carla. Vi que você tinha agendado uma avaliação conosco mas não conseguiu vir. Está tudo bem?' },
        { speaker: 'Paciente', text: 'Oi Ana! Desculpa, acabei ficando sem tempo' },
        { speaker: 'Você', text: 'Imagina! Acontece mesmo. Você ainda está interessada em resolver aquela questão que conversamos?' },
        { speaker: 'Paciente', text: 'Sim, mas a agenda está corrida demais' },
        { speaker: 'Você', text: 'Entendo perfeitamente. Tenho uma vaga na sexta às 18h30. É um horário que talvez funcione melhor pra você?' },
        { speaker: 'Paciente', text: 'Sexta à noite eu consigo!' },
        { speaker: 'Você', text: 'Perfeito! Então está confirmado: sexta, 18h30. Vou te mandar lembretes aqui, ok? 💙' },
      ]},
      { type: 'callout', text: 'RECUPERAÇÃO: 6 mensagens / 8 minutos / Lead reativado. INSIGHT: leads que somem geralmente NÃO desistiram. Eles apenas precisam de um empurrãozinho e de facilidade (ofereça horário diferente).' },

      { type: 'section', number: 7, title: 'Matriz de Erros Comuns e Como Evitá-los' },
      { type: 'paragraph', text: 'Estes são os erros mais frequentes que destroem conversões. Identifique se sua equipe comete algum deles:' },
      { type: 'table', headers: ['Erro comum', 'Por que é ruim', 'Como corrigir'], rows: [
        ["Responder 'Qual procedimento você quer?' quando paciente pergunta preço", 'Você perde o controle da conversa', "SEMPRE qualifique primeiro: 'Para eu te orientar melhor, me conta: qual é o seu principal incômodo?'"],
        ['Enviar tabela de preços antes de qualificar', 'Transforma consulta em negociação de preço. Você vira commodity.', "Nunca envie tabela. Diga: 'O investimento varia de acordo com o caso. Posso te avaliar [dia]?'"],
        ['Não fazer follow-up quando paciente some', 'Você assume que desistiu, mas ele só esqueceu ou ficou com dúvida', 'SEMPRE faça follow-up em 24-48h'],
        ["Perguntar 'Você quer agendar?' ao invés de oferecer horário", 'Pergunta fechada facilita o não', "Use afirmação + pergunta: 'Posso tentar um encaixe quinta às 15h?'"],
        ['Explicar procedimento de forma técnica demais', 'Paciente se perde, não entende, desiste', "Use linguagem comercial: 'Conseguimos [resultado]'"],
        ["Não perguntar 'Isso faz sentido pra você?' após explicar", 'Você não valida se ele entendeu', 'SEMPRE valide após explicação'],
        ['Agendar consulta muito longe (mais de 7 dias)', 'Lead esfria', 'Tente sempre agendar em até 48-72h'],
        ['Não enviar confirmação por escrito após agendar', 'Paciente esquece horário, não comparece', "SEMPRE envie: 'Confirmado: [dia], [horário], [endereço]'"],
      ]},
      { type: 'numbered-list', title: 'Como implementar este sistema na sua clínica', items: [
        'Treinamento da equipe (1-2h): leia este documento com sua equipe, faça role-play dos scripts, grave áudios praticando',
        'Organização de materiais (30min): crie pastas de antes/depois, salve scripts fixados no WhatsApp, imprima a matriz de erros',
        'Implementação gradual (semana 1): dias 1-2 WhatsApp, dias 3-4 Instagram DM, dias 5-7 telefone para reativação',
        'Revisão semanal (30min/semana): analise conversas, identifique erros recorrentes, ajuste scripts',
        'Métricas para acompanhar: taxa de conversão lead→agendamento (meta >40%), taxa de comparecimento (meta >70%), ticket médio, tempo médio até fechamento',
      ]},
      { type: 'callout', text: 'A diferença entre uma clínica que fatura R$50k e uma que fatura R$100k+ não está na técnica. Está no SISTEMA. Você acabou de receber o mesmo sistema que clínicas de sucesso usam. Agora é só implementar. © Método D.O.M. - Dom Azeredo' },
    ],
  },

  'arsenal-quebra-objecoes': {
    slug: 'arsenal-quebra-objecoes',
    title: 'Arsenal de Quebra de Objeções',
    subtitle: 'Método D.O.M. para Clínicas HOF — Scripts Testados para as 7 Objeções Mais Comuns',
    category: 'Vendas',
    blocks: [
      { type: 'section', number: 1, title: 'A Verdade Sobre Objeções' },
      { type: 'callout', text: 'MINDSET ESSENCIAL: Objeção NÃO é rejeição. Objeção é INTERESSE disfarçado. Quando alguém diz "tá caro" ou "vou pensar", ela está dizendo: "Eu quero, mas preciso de mais alguma coisa para decidir". Se ela não tivesse interesse, simplesmente ignoraria você.' },
      { type: 'pillar-grid', pillars: [
        { title: 'Objeção de Valor', description: "'Tá caro' / 'Não tenho dinheiro' / 'Tá mais barato no concorrente'" },
        { title: 'Objeção de Confiança', description: "'Vou pensar' / 'Preciso pesquisar mais' / 'Não conheço vocês'" },
        { title: 'Objeção de Timing', description: "'Não é o momento' / 'Daqui uns meses' / 'Vou fazer quando...'" },
      ]},
      { type: 'numbered-list', title: '5 Regras de Ouro para Quebrar Objeções', items: [
        'NUNCA discuta com o paciente. Valide primeiro: "Entendo perfeitamente..."',
        'NUNCA ofereça desconto antes de entender a REAL objeção',
        'SEMPRE faça perguntas para descobrir o que está por trás da objeção',
        'NUNCA menospreze a concorrência. Foque nos SEUS diferenciais.',
        'Se o paciente diz "NÃO" 3 vezes seguidas, PARE. Não insista. Agende follow-up.',
      ]},
      { type: 'callout', text: 'ATENÇÃO: se NINGUÉM te diz "tá caro", você está vendendo barato demais. Se MUITA GENTE diz "tá caro", revise seu posicionamento e público. O preço deve ser proporcional ao IMPACTO POSITIVO na vida do cliente, não ao quanto te custou.' },

      { type: 'section', number: 2, title: 'As 7 Objeções Que Você Vai Ouvir (E Como Responder)' },
      { type: 'paragraph', text: 'Estas são as 7 objeções que representam 95% dos casos. Domine-as e você dominará as vendas.' },

      { type: 'phase', title: 'Objeção #1 — "Preciso pensar um pouco"', body: 'Aparece em 60-70% dos casos. O que REALMENTE significa: "não estou convencida do valor", "tenho medo de me arrepender", "preciso de mais segurança", "não quero decidir agora sob pressão". O que NÃO significa: que o paciente não quer (se não quisesse, diria não direto).' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Vou pensar...' },
        { speaker: 'Você', text: 'Que bom, [nome]! Ouvi-la dizer que vai pensar significa que o que conversamos aqui faz sentido para você, certo?' },
        { speaker: 'Paciente', text: 'Sim, claro!' },
        { speaker: 'Você', text: 'Ótimo! E quanto tempo, aproximadamente, você precisa para pensar sobre o que conversamos?' },
        { speaker: 'Paciente', text: 'Me dê uma semana.' },
        { speaker: 'Você', text: 'Perfeito. Antes de finalizar, você poderia me lembrar rapidamente: qual o principal benefício que esse procedimento lhe traria? E o que você prefere: se sentir assim em uma semana ou agora mesmo?' },
      ]},
      { type: 'callout', text: 'Aqui ela vai revelar a real objeção ("é que não tenho dinheiro agora...", "é que preciso ver com meu marido...", "é que não sei se é o momento..."). Se responder positivamente: "Você prefere que fechemos à vista com 10% de desconto ou deseja que eu te apresente uma condição diferenciada de parcelamento?"' },
      { type: 'script', text: 'SCRIPT — Validação em 3 Perguntas\n\nPaciente: "Vou pensar..."\nVocê: "Certo, antes de finalizar posso só repassar alguns pontos com você? Você entendeu toda a explicação e os procedimentos atenderiam às suas expectativas? Isso faz sentido para sua necessidade e resolveria o que tanto te incomoda? O investimento está dentro do seu orçamento e você estaria disposta a iniciar o tratamento?"\n\nSe POSITIVO para todas: "Se faz sentido pra você e está dentro do seu orçamento, o que faz você precisar pensar?"\nSe NEGATIVO para alguma: "Entendo. Me conta: qual dessas três coisas é o que mais te deixa insegura?"' },
      { type: 'callout', text: 'ERRO FATAL: NUNCA diga "Ok, pode pensar" e deixe ela ir embora. 80% dos que saem "pra pensar" NUNCA voltam.' },

      { type: 'phase', title: 'Objeção #2 — "Não tenho dinheiro"', body: 'Segunda objeção mais comum (20-25% dos casos). O que pode significar: "não tenho dinheiro AGORA" (timing), "não tenho dinheiro PARA ISSO" (não enxerga valor), "não quero gastar MEU dinheiro com isso" (prioridade baixa), "estou sem limite no cartão" (operacional). Raramente significa que a pessoa é pobre — significa que você não mostrou valor suficiente.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Não tenho dinheiro...' },
        { speaker: 'Você', text: 'Compreendo, [nome]. Mas os procedimentos indicados fazem sentido para você?' },
        { speaker: 'Paciente', text: 'Sim, claro!' },
        { speaker: 'Você', text: 'E o plano de tratamento atenderia às suas expectativas e te faria feliz em fazer isso por você?' },
        { speaker: 'Paciente', text: 'Sim.' },
        { speaker: 'Você', text: 'Então é SOMENTE o valor que impede de fecharmos neste momento?' },
        { speaker: 'Paciente', text: 'É isso.' },
        { speaker: 'Você', text: 'Talvez você não tenha o valor à vista, mas para fecharmos eu posso fazer uma condição diferenciada neste momento. Consigo parcelar em até 10x sem juros no cartão. Isso resolveria pra você?' },
      ]},
      { type: 'script', text: 'SCRIPT — Criar Solução em Conjunto\n\nPaciente: "Não tenho dinheiro..."\nVocê: "Entendo, [nome]. E se a gente encontrasse JUNTOS uma solução com a qual você concorde, poderíamos fechar dessa maneira? Olha, normalmente eu não faço isso, mas pelo seu caso específico, posso te oferecer: [opção 1] entrada de 30% e o restante em 6x sem juros; [opção 2] você agenda para daqui 30 dias e ganha 15% de desconto à vista. Qual dessas duas faz mais sentido pra você?"\n\nTÉCNICA: sempre ofereça 2 opções. Isso tira o foco do "sim ou não" e coloca no "qual das duas?"' },
      { type: 'script', text: 'SCRIPT — Reforçar Investimento (Não Gasto)\n\n"Você acorda todos os dias se olhando no espelho e se incomodando com [problema dela], certo? E há quanto tempo você convive com isso te incomodando? Então há [X tempo] você deixa de se sentir bem consigo mesma todos os dias... E se eu te dissesse que por R$[valor] / 10 meses = R$[parcela], você pode resolver isso de uma vez? São R$[parcela] por mês para acordar TODOS OS DIAS se sentindo bem. Isso não é gasto, [nome]. É INVESTIMENTO em você mesma."\n\nTÉCNICA: dividir valor mensal faz parecer muito menor. "R$200/mês" soa menos que "R$2.000".' },

      { type: 'phase', title: 'Objeção #3 — "Tá caro!"', body: '15-20% dos casos. "Tá caro" é quase sempre um mecanismo de defesa para outra objeção: "não entendi o valor", "não confio o suficiente", "estou comparando com concorrente", "quero desconto". Raramente significa que está realmente caro — significa que o VALOR PERCEBIDO é menor que o PREÇO COBRADO.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Tá caro!' },
        { speaker: 'Você', text: 'Caro? Você acha?' },
        { speaker: 'Paciente', text: 'Achei um pouco acima do que eu esperava...' },
        { speaker: 'Você', text: '[Nome], posso te fazer uma pergunta? Quando você pesquisou, você comparou PREÇO ou comparou RESULTADO? Porque aqui você não está pagando só pelo procedimento. Você está pagando por: 8 anos de experiência da Dra. [nome], produto premium (não genérico), acompanhamento completo pós-procedimento, garantia de resultado. Isso faz sentido pra você?' },
      ]},
      { type: 'callout', text: 'NUNCA FAÇA: "Ah, mas está barato pelo que entregamos!" / "Nosso concorrente usa produto pior" / "Se não puder pagar, não tem problema". FAÇA: valide a preocupação, mostre diferencial (sem criticar concorrência), mantenha postura de autoridade.' },

      { type: 'phase', title: 'Objeção #4 — "Está mais barato no concorrente"', body: '10-15% dos casos. É sinal de que ela ESTÁ pesquisando — isso é bom! Significa: ela quer fechar com você mas precisa de justificativa, quer validação de que está fazendo a escolha certa, ou está testando se você dá desconto. NÃO significa que vai fechar com o concorrente.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Está mais barato no concorrente.' },
        { speaker: 'Você', text: 'Ótimo, [nome]! Faz muito bem em pesquisar. Mas me conta: se está mais barato lá e você ainda assim veio até aqui conhecer o que temos a oferecer... algo te deixou insegura para fechar lá, certo?' },
        { speaker: 'Paciente', text: 'É... eu não conhecia muito o trabalho deles.' },
        { speaker: 'Você', text: 'Exatamente! E você veio aqui porque além de um bom preço, você precisa também de segurança e qualidade, não é? Vou te apresentar nossos diferenciais: [X] anos de experiência, produtos premium certificados, acompanhamento pós-procedimento incluso, 98% de satisfação. Posso te mostrar alguns dos nossos casos?' },
      ]},
      { type: 'script', text: 'SCRIPT — Comparar Maçã com Maçã\n\n"Me ajuda a entender: quando você comparou, o que estava INCLUSO no preço deles?" [Era só o procedimento mesmo] "Perfeito. Aqui no nosso preço está incluso: consulta de avaliação completa, acompanhamento nos dias 3, 7 e 15 após procedimento, retoque se necessário (dentro de 30 dias), produto premium certificado pela Anvisa, atendimento exclusivo via WhatsApp. Se você somar tudo isso, na verdade nosso preço sai mais em conta. Faz sentido?"' },

      { type: 'phase', title: 'Objeção #5 — "Não é o momento"', body: '8-12% dos casos. A objeção mais "educada" — ela não quer te ofender. Pode significar: outras prioridades financeiras, está esperando bônus/13º, quer fazer perto de evento específico, ou na verdade tem medo e está adiando. Raramente é timing real.' },
      { type: 'script', text: 'SCRIPT — Entender o Timing\n\n"Entendo, [nome]. Me ajuda a entender: quando você diz que não é o momento, você quer dizer que tem algo ESPECÍFICO te impedindo agora, ou é mais uma sensação de que talvez mais pra frente?"\n\nSe específico ("estou esperando receber dinheiro em março"): "Perfeito! Então o procedimento em si faz sentido, é só questão de timing financeiro, certo? E se eu conseguisse uma condição pra você começar agora mas só pagar a primeira parcela em março, isso resolveria?"\n\nSe genérico: "Posso te fazer uma pergunta? Há quanto tempo você convive com [incômodo dela]? E daqui a 6 meses, se nada mudar... você ainda vai estar convivendo com isso te incomodando todos os dias. É isso que você quer? Ou você prefere resolver AGORA?"' },

      { type: 'phase', title: 'Objeção #6 — "Preciso falar com meu marido/mãe/amiga"', body: '10-15% dos casos, especialmente em procedimentos acima de R$2.000. Pode ser: decisão financeira conjunta real, desculpa para sair, medo da opinião de alguém, ou tempo para processar. Como identificar: se ela QUISER realmente, vai falar com naturalidade; se for desculpa, vai ficar desconfortável ao dizer.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Preciso falar com meu marido...' },
        { speaker: 'Você', text: 'Claro, [nome]! Entendo perfeitamente. Me conta: o que você acha do procedimento? Faz sentido pra você?' },
        { speaker: 'Paciente', text: 'Sim, eu adorei!' },
        { speaker: 'Você', text: 'Maravilha! E você acha que ele vai ter alguma preocupação específica que eu possa te ajudar a responder agora?' },
        { speaker: 'Paciente', text: 'Acho que vai perguntar sobre o preço e a segurança...' },
        { speaker: 'Você', text: 'Perfeito. Vou te armar com todas as respostas. Quando você pretende conversar com ele? Te ligo amanhã pra gente fechar os detalhes, ok?' },
      ]},
      { type: 'script', text: 'SCRIPT — Identificar Se É Desculpa\n\n"Claro! E me diz: se ele concordar, VOCÊ está decidida a fazer?" [Se ela hesitar = é desculpa] "Entendo. Olha, [nome], posso ser sincera com você? Parece que você ainda tem alguma dúvida além de falar com ele. Estou certa?" [Ela revela a real objeção, ex: medo]' },

      { type: 'phase', title: 'Objeção #7 — "Não conheço o trabalho de vocês"', body: '5-10% dos casos, especialmente com leads frios. Significa: falta de prova social, falta de autoridade, medo de arriscar com desconhecido, falta de validação. É a objeção mais fácil de quebrar — basta mostrar prova.' },
      { type: 'script', text: 'SCRIPT — Apresentar Autoridade\n\n"Entendo perfeitamente, [nome]. E você faz muito bem em querer conhecer antes! A Dra. [nome] atua há [X] anos na área de harmonização facial, já realizou mais de [X] mil procedimentos, é formada pela [faculdade] e avaliada com 4.9 estrelas no Google. Mas mais importante: posso te mostrar alguns dos nossos resultados reais? [5-8 casos antes/depois] E se você quiser conversar com alguma das nossas pacientes, posso te passar o contato de 2-3 que se ofereceram pra dar depoimento. Quer?"' },

      { type: 'section', number: 3, title: 'Variações por Perfil de Paciente' },
      { type: 'paragraph', text: 'A mesma objeção vinda de perfis diferentes exige abordagens diferentes.' },
      { type: 'table', headers: ['Perfil', 'Características', 'Como abordar'], rows: [
        ['Analítica (25-30%)', 'Faz muitas perguntas, quer detalhes técnicos, pesquisa tudo, demora pra decidir', 'Seja específico, mostre dados/números, apresente credenciais, use lógica'],
        ['Prática (30-35%)', 'Vai direto ao ponto, quer saber valor logo, decide rápido', 'Seja direto, apresente solução rápido, não enrole, feche rápido'],
        ['Emotiva (25-30%)', 'Conecta por história, compartilha muito, decide por emoção', 'Seja empático, ouça sua história, use cases emocionais, crie conexão'],
        ['Indecisa (10-15%)', 'Muda de ideia, precisa validação, insegura, medo de errar', 'Dê segurança, reforce garantias, mostre muita prova, conduza decisão'],
      ]},
      { type: 'paragraph', text: 'Exemplo prático: "Tá caro" em 4 perfis diferentes' },
      { type: 'script', text: 'ANALÍTICA: "Entendo sua preocupação. Deixa eu te mostrar a composição do valor: R$800 = produto premium certificado Anvisa, R$400 = honorários da Dra. (8 anos experiência), R$300 = acompanhamento completo pós-procedimento, R$200 = estrutura e equipamentos. Total: R$1.700. Faz sentido quando você vê o detalhamento?"' },
      { type: 'script', text: 'PRÁTICA: "Entendo. O valor é esse porque entregamos resultado. Posso te mostrar 3 casos iguais ao seu em 30 segundos? Pronto. Você quer esse resultado? Então é R$1.700 em 10x. Fechamos?"' },
      { type: 'script', text: 'EMOTIVA: "Eu entendo perfeitamente, [nome]. Você me contou que isso te incomoda há anos, né? Esse valor não é só pelo procedimento. É pelo que você vai SENTIR quando olhar no espelho e finalmente se ver do jeito que sempre quis. Isso não tem preço, né?"' },
      { type: 'script', text: 'INDECISA: "Eu sei que decidir investir em você pode gerar insegurança, [nome]. É super normal! Mas além dos nossos 8 anos de experiência, oferecemos garantia total. Se você não ficar satisfeita, a gente refaz. E posso te passar contato de 3 pacientes que fizeram exatamente o que você quer fazer. Quer conversar com elas antes?"' },

      { type: 'section', number: 4, title: 'Exemplos de Conversas Reais (Do Início ao Fechamento)' },
      { type: 'dialog', exchanges: [
        { speaker: 'Paciente', text: 'Adorei! Mas vou pensar um pouco...' },
        { speaker: 'Você', text: 'Que bom que você gostou! Quando você diz que vai pensar, é sobre alguma coisa específica que ficou em dúvida?' },
        { speaker: 'Paciente', text: 'Não, não... é que são R$1.800 e eu não esperava esse valor.' },
        { speaker: 'Você', text: 'Ah, entendo! Então você QUER fazer, mas o que te preocupa é o investimento agora, é isso? E se eu conseguisse dividir em 10x sem juros no cartão, você conseguiria agora?' },
        { speaker: 'Paciente', text: '10x daria R$180... dá sim!' },
        { speaker: 'Você', text: 'Ótimo! Então vamos agendar? Tenho uma vaga sexta às 14h.' },
        { speaker: 'Paciente', text: 'Fechado!' },
      ]},
      { type: 'callout', text: 'RESULTADO: conversão em 6 trocas de mensagem / objeção quebrada em 2 minutos.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'O investimento para tratar testa + glabela fica em R$1.200.' },
        { speaker: 'Paciente', text: 'Nossa, achei caro. Vi por R$800 em outro lugar.' },
        { speaker: 'Você', text: 'Que bom que você pesquisou! Mas me conta: se lá está mais barato, por que você ainda está conversando comigo?' },
        { speaker: 'Paciente', text: 'É que tenho medo de fazer com alguém que não conheço...' },
        { speaker: 'Você', text: 'Exatamente! Aqui usamos o Botox original Allergan, o mesmo usado em clínicas de SP e RJ. Posso te mostrar alguns resultados?' },
        { speaker: 'Paciente', text: 'Nossa, ficou muito bom mesmo!' },
        { speaker: 'Você', text: 'Né? Economizar não é pagar barato. É pagar o JUSTO por algo que vai te deixar segura e feliz. Vale economizar R$400 e correr o risco?' },
        { speaker: 'Paciente', text: 'Não, né... você tem razão.' },
        { speaker: 'Você', text: 'Então vamos agendar? Quinta às 16h funciona pra você?' },
        { speaker: 'Paciente', text: 'Funciona sim!' },
      ]},
      { type: 'callout', text: 'RESULTADO: objeção quebrada com autoridade + prova social / 8 mensagens.' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'O tratamento completo são 4 sessões, R$2.800 total.' },
        { speaker: 'Paciente', text: 'Ai que pena, não tenho esse dinheiro agora...' },
        { speaker: 'Você', text: 'Entendo, [nome]. Mas o tratamento em si faz sentido pra você? Resolveria o que te incomoda?' },
        { speaker: 'Paciente', text: 'Com certeza! É exatamente o que eu quero.' },
        { speaker: 'Você', text: 'Posso fazer assim: você dá uma entrada de R$500 hoje, faz a primeira sessão, e o restante você paga em 6x de R$383 no cartão. O que você acha?' },
        { speaker: 'Paciente', text: 'Ah sim! Isso eu consigo!' },
        { speaker: 'Você', text: 'Ótimo! Vamos fazer sua ficha e agendar a primeira sessão. Terça que vem às 10h funciona?' },
        { speaker: 'Paciente', text: 'Perfeito!' },
      ]},
      { type: 'callout', text: 'RESULTADO: condição flexível quebrou objeção / paciente feliz / clínica fechou venda.' },

      { type: 'section', number: 5, title: 'Matriz de Decisão: Qual Script Usar Quando' },
      { type: 'table', headers: ['Se ela disser...', 'Significa...', 'Objetivo'], rows: [
        ['"Vou pensar" (tom hesitante)', 'Tem dúvida mas não quer te ofender', 'Descobrir a real objeção (Script de Validação)'],
        ['"Vou pensar" (tom convicto)', 'Precisa processar ou consultar alguém', 'Dar tempo mas garantir follow-up'],
        ['"Não tenho dinheiro" (tom sincero)', 'Realmente está sem grana agora', 'Criar solução de pagamento'],
        ['"Não tenho dinheiro" (tom evasivo)', 'Não enxergou valor suficiente', 'Mostrar valor vs. tempo sofrendo'],
        ['"Tá caro"', 'Não entendeu o valor ou quer desconto', 'Reposicionar de preço para valor'],
        ['"Tá mais barato no concorrente"', 'Quer validação de escolha', 'Mostrar diferenciais'],
        ['"Não é o momento"', 'Medo disfarçado ou timing real', 'Identificar se é timing ou medo'],
        ['"Preciso falar com [pessoa]"', 'Decisão compartilhada ou desculpa', 'Perguntar: "Se ela concordar, VOCÊ decide?"'],
      ]},
      { type: 'numbered-list', title: 'Fluxograma Rápido de Decisão (4 passos)', items: [
        'Valide a objeção: "Entendo perfeitamente..." / "Faz sentido..."',
        'Faça pergunta para descobrir o real motivo: "Me ajuda a entender: [pergunta específica]"',
        'Apresente solução ou reposicione: use o script apropriado da matriz acima',
        'Peça o fechamento: "Então podemos agendar?" / "Isso resolve pra você?"',
      ]},
      { type: 'callout', text: 'SE ELA DISSER "NÃO" 3 VEZES SEGUIDAS: PARE. Não insista. Diga: "Sem problemas! Posso te ligar em [X dias] pra ver se mudou algo?"' },

      { type: 'section', number: 6, title: 'Erros Fatais ao Quebrar Objeções' },
      { type: 'table', headers: ['Erro fatal', 'Por que mata a venda', 'Faça isso ao invés'], rows: [
        ['Discutir com o paciente ("Não, você está errado")', 'Cria conflito. Paciente se fecha. Venda morre.', 'VALIDE primeiro: "Entendo sua preocupação..." Depois reposicione.'],
        ['Oferecer desconto imediatamente ("Ok, te dou 20% off")', 'Você perde margem e credibilidade. Parece desesperado.', 'Primeiro descubra a real objeção. Depois negocie SE necessário.'],
        ['Falar mal da concorrência ("Lá é ruim mesmo")', 'Você parece inseguro e antiético. Perde a confiança.', 'Reconheça concorrente mas foque nos SEUS diferenciais.'],
        ['Aceitar "vou pensar" e deixar ir ("Ok, pensa aí")', '80% dos que saem "pra pensar" NUNCA voltam.', 'Use scripts pra descobrir real objeção antes de liberar.'],
        ['Insistir após 3 "NÃOs" ("Mas espera...")', 'Paciente se sente pressionada. Vai falar mal de você depois.', 'Após 3 NÃOs, PARE. Agende follow-up educado e respeite.'],
        ['Não fazer perguntas ("Entendo. Tchau!")', 'Você não descobre real objeção. Perde a chance de recuperar.', 'SEMPRE faça perguntas: "Me ajuda a entender o que te deixa insegura?"'],
        ['Usar tom defensivo ("Mas aqui é melhor!")', 'Soa desesperado. Paciente perde confiança.', 'Tom consultivo: "Deixa eu te mostrar nossos diferenciais..."'],
      ]},
      { type: 'callout', text: 'ALERTA CRÍTICO: o erro #1 de quem quebra objeções é tentar CONVENCER ao invés de DESCOBRIR. Sua missão não é forçar a venda. É descobrir o que está travando e ajudar a destravar. Pense assim: você é um médico diagnosticando, não um vendedor empurrando.' },

      { type: 'section', number: 7, title: 'Guia de Implementação Rápida' },
      { type: 'numbered-list', title: 'Cronograma de Implementação (1 semana)', items: [
        'Dia 1 (Segunda) — Teoria (1h): leia este documento com sua equipe, explique os 3 tipos de objeções, mostre a matriz de decisão',
        'Dia 2 (Terça) — Prática Guiada (1h30): role-play das 3 objeções principais, corrija em tempo real, grave áudio',
        'Dia 3 (Quarta) — Prática Livre (1h): equipe pratica entre si, troquem de papel, sem você presente',
        'Dia 4 (Quinta) — Aplicação Real Supervisionada: equipe atende leads reais, você observa sem interferir, feedback no final do dia',
        'Dia 5 (Sexta) — Aplicação Real Autônoma: equipe atende sozinha, revisão dos casos no final do dia',
        'Semana 2 em diante: reunião semanal de 30min, compartilhar casos de sucesso, ajustar scripts, medir taxa de conversão',
      ]},
      { type: 'table', headers: ['Indicador', 'Meta'], rows: [
        ['Taxa de objeções quebradas', '>60% das objeções viram fechamento'],
        ['Taxa de conversão geral', 'Aumentar 30-50% em 30 dias'],
        ['Tempo médio de resposta', '<5 minutos (lead quente)'],
        ['Follow-up pós-objeção', '100% dos leads recebem follow-up em 24-48h'],
      ]},
      { type: 'callout', text: 'Objeção não é o FIM da venda. É o COMEÇO da verdadeira negociação. Cada "NÃO" é uma oportunidade de descobrir o que está travando e ajudar sua paciente a tomar a MELHOR decisão. Você não está vendendo procedimentos. Você está vendendo TRANSFORMAÇÃO. © Método D.O.M. - Dom Azeredo' },
    ],
  },

  'fluxo-followup-previsivel': {
    slug: 'fluxo-followup-previsivel',
    title: 'Fluxo de Follow-Up Previsível',
    subtitle: 'Método D.O.M. para Clínicas HOF — Sistema de 5 Toques nos Dias 0, 2, 5, 10 e 15',
    category: 'Follow-Up',
    blocks: [
      { type: 'section', number: 1, title: 'Por Que 80% dos Leads Somem (E Como Evitar Isso)' },
      { type: 'callout', text: 'ESTATÍSTICA BRUTAL: 48% dos vendedores NUNCA fazem um follow-up. 25% fazem apenas UM. 12% fazem dois. APENAS 10% fazem três ou mais. MAS: 80% das vendas acontecem DEPOIS do 5º contato. Tradução: você está perdendo 80% das suas vendas por falta de sistema.' },
      { type: 'paragraph', text: 'A Curva do Esquecimento (Curva de Ebbinghaus): 1 hora depois a pessoa esquece 50% da conversa; 24 horas depois, 70%; 7 dias depois, 90%.' },
      { type: 'callout', text: 'INSIGHT CRÍTICO: se você não fizer follow-up em até 48h, sua lead já esqueceu 70% do que vocês conversaram. Se você esperar 1 semana, ela esqueceu TUDO, inclusive que entrou em contato com você. Follow-up não é insistência. É lembrança estratégica.' },
      { type: 'pillar-grid', pillars: [
        { title: 'Motivo #1 — Esqueceu (60%)', description: 'Não é desinteresse. É vida corrida. Sua mensagem se perdeu no meio de 50 outras.' },
        { title: 'Motivo #2 — Em dúvida (30%)', description: 'Quer fazer, mas está insegura. Precisa de validação e reforço de que é a decisão certa.' },
        { title: 'Motivo #3 — Desistiu (10%)', description: 'Encontrou outra clínica, mudou de ideia, ou não era lead qualificado. É o único caso que follow-up não resolve.' },
      ]},
      { type: 'callout', text: 'CONCLUSÃO: 90% dos leads que somem NÃO desistiram. Eles só precisam de LEMBRANÇA + REFORÇO. É aí que entra o Sistema de 5 Toques.' },

      { type: 'section', number: 2, title: 'O Sistema de 5 Toques: Timing e Gatilhos Mentais' },
      { type: 'paragraph', text: 'Este é o sistema exato que clínicas de alto faturamento usam. Cada toque tem um objetivo e um gatilho mental específico.' },
      { type: 'table', headers: ['Dia', 'Objetivo', 'Gatilho mental', 'Tom'], rows: [
        ['Dia 0 (mesmo dia)', 'Confirmar recebimento, ancorar expectativa', 'Reciprocidade', 'Caloroso, receptivo, solícito'],
        ['Dia 2 (48h depois)', 'Reativar memória, reforçar valor', 'Curiosidade', 'Amigável, educado, não-invasivo'],
        ['Dia 5 (5 dias depois)', 'Criar urgência leve, validar interesse', 'Urgência leve', 'Profissional, direto, respeitoso'],
        ['Dia 10 (10 dias depois)', 'Escassez real, última chance suave', 'Escassez', 'Sério, direto, sem pressão'],
        ['Dia 15 (15 dias depois)', 'Ultimato gentil, limpeza de base', 'Encerramento', 'Respeitoso, final, sem rancor'],
      ]},
      { type: 'numbered-list', title: 'Regras de Ouro do Sistema', items: [
        'NUNCA pule um dia. O timing é estratégico.',
        'SEMPRE personalize minimamente (nome, procedimento desejado).',
        'NUNCA mande textão. Mensagens curtas têm 3x mais chance de resposta.',
        'SEMPRE tenha um CTA claro (call-to-action) em cada toque.',
        'APÓS o 5º toque sem resposta: PARE. Aguarde ela procurar você.',
        'SE ela responder em qualquer toque: REINICIE o processo de vendas.',
      ]},

      { type: 'section', number: 3, title: 'Templates de Mensagem por Etapa' },
      { type: 'script', text: 'DIA 0 — CONFIRMAÇÃO E ANCORAGEM (gatilho: reciprocidade)\n\nLead do Instagram/WhatsApp: "Olá [Nome]! 😊 [Bom dia/Boa tarde] Aqui é [Seu Nome], da equipe da Dra. [Nome]. Vi que você entrou em contato conosco! Que legal! 💙 Como posso te ajudar hoje? Me conta qual é o seu principal interesse!"\n\nLead que preencheu formulário: "Oi [Nome]! Tudo bem? Recebi aqui seu interesse em [procedimento]. Que ótimo! 😊 Para eu conseguir te orientar da melhor forma: qual é o seu principal incômodo hoje?"\n\nPor que funciona: resposta em até 5 minutos demonstra agilidade, tom caloroso sem ser invasivo, pergunta aberta faz ela contar o problema.' },
      { type: 'script', text: 'DIA 2 — REFORÇO DE VALOR (gatilho: curiosidade + prova social)\n\nCom casos antes/depois: "Oi [Nome]! 😊 Te mandei mensagem há 2 dias mas imagino que você ainda não tenha visto (a correria do dia a dia, né?) Só queria te dizer que eu NÃO desisti de você, tá? 😄 Inclusive, separei aqui 3 casos LINDÍSSIMOS que fizemos essa semana! [3-4 antes/depois] Dá uma olhadinha e me diz o que achou? 💙"\n\nCom reforço de benefício: "Oi [Nome]! Estava aqui lembrando da nossa conversa sobre [procedimento]... Será que ficou alguma dúvida? Olha só o que conseguimos com esse procedimento: [benefício 1, 2, 3] Me conta: isso faz sentido pro que você busca?"' },
      { type: 'script', text: 'DIA 5 — URGÊNCIA LEVE (gatilho: escassez leve)\n\nAgenda enchendo: "Oi [Nome]! Minha equipe conversou com você há alguns dias, mas percebi que ainda não agendou sua avaliação... Ainda tem interesse? A agenda da Dra. [Nome] está BEM cheia esse mês! 📅 Se quiser garantir um horário bom, posso tentar um encaixe. O que você acha?"\n\nCondição especial: "[Nome], oi! Este mês estamos com uma condição ESPECIAL e achei que você ia gostar de saber! 😊 Posso te passar os detalhes? Ou já passou o interesse?"' },
      { type: 'script', text: 'DIA 10 — ESCASSEZ REAL (gatilho: escassez)\n\nÚltima vaga: "[Nome], tudo bem? A agenda da Dra. [Nome] fechou quase completamente esse mês. Tenho apenas 2 vagas sobrando: Quinta 14h, Sexta 16h. Se ainda tiver interesse, preciso saber HOJE pra conseguir segurar uma vaga pra você. Depois disso, só mês que vem mesmo! 😕"\n\nCondição expirando: "Oi [Nome]! Só passando pra avisar: aquela condição especial que te falei encerra AMANHÃ! ⏰ Se ainda quiser aproveitar, me chama hoje mesmo. Se não tiver mais interesse, sem problemas! Só me avisa pra eu atualizar aqui 😊"' },
      { type: 'script', text: 'DIA 15 — ULTIMATO GENTIL (gatilho: encerramento)\n\n"Oi [Nome], tudo bem? Te enviei algumas mensagens nos últimos dias mas não tivemos retorno... Então só preciso confirmar: ainda existe interesse no [procedimento]? Se não houver mais, tudo bem! Me responde só com: ✅ SIM (ainda tenho interesse) ❌ NÃO (pode retirar meu contato). Quando você quiser voltar, é só me chamar! 😊"\n\nDespedida com brinde: "Antes de te dar tchau, queria deixar um PRESENTE: um mini-guia com dicas sobre o procedimento que você quer. Se um dia você decidir fazer, vai ter toda informação importante aqui! 😊"' },
      { type: 'callout', text: 'APÓS O DIA 15: se ela não responder, retire do fluxo ativo, marque como "lead frio", aguarde ela procurar, NÃO continue enviando mensagens. Se responder "NÃO": agradeça, pergunte "o que te fez desistir?" (feedback valioso), deixe porta aberta. Se responder "SIM": reinicie processo de vendas, agende consulta imediatamente.' },

      { type: 'section', number: 4, title: 'Variações por Situação do Lead' },
      { type: 'phase', title: 'Situação #1 — Lead Agendou Mas Não Confirmou', body: 'Follow-up 24h antes: "Oi [Nome]! 😊 Só passando pra confirmar: sua avaliação está agendada AMANHÃ às [horário], tudo certo? Vou te passar o endereço e orientações: 📍 [endereço] 🅿️ [estacionamento] ⏰ Chega uns 10min antes! Nos vemos amanhã 💙"\n\nSe não confirmar (12h antes): "[Nome], tentei confirmar sua consulta de HOJE às [horário] mas não tive retorno... Tá tudo ok? Se precisar remarcar, me avisa rapidinho pra eu liberar o horário! 😊"' },
      { type: 'phase', title: 'Situação #2 — Lead Disse "Vou Pensar" Após Orçamento', body: 'Dia 2: "Você me disse que ia pensar sobre o [procedimento]... Ficou alguma dúvida que eu possa esclarecer? Porque às vezes a gente fica pensando em algo que poderia ser resolvido numa conversa rápida! 💙"\n\nDia 5: "Como está a reflexão sobre o [procedimento]? Posso te passar o contato de 2 pacientes que fizeram exatamente o que você quer? Assim você tira dúvidas reais com quem já passou por isso!"' },
      { type: 'phase', title: 'Situação #3 — Lead Cancelou Consulta de Última Hora', body: 'Imediato (mesmo dia): "Vi que você precisou cancelar a consulta de hoje. Tudo bem por aí? Acontece mesmo! Quando você conseguir, me avisa que eu agendo outro horário pra você, ok?"\n\nDia 3: "Queria saber se já conseguiu organizar a agenda... Tenho algumas vagas essa semana ainda!"\n\nDia 7: "Notei que você não reagendou após o cancelamento... Aconteceu alguma coisa? Mudou de ideia?"' },
      { type: 'phase', title: 'Situação #4 — Fez Consulta Mas Não Fechou', body: 'Mesmo dia (2-3h depois): "Foi um prazer ENORME te receber hoje aqui na clínica! A Dra. [Nome] adorou te conhecer! 💙 Conseguiu pensar melhor sobre o que conversamos?"\n\nDia 2: "Estava pensando aqui: o que te deixou mais insegura no orçamento que apresentamos? É o valor? É o timing? Me conta que a gente encontra uma solução juntas! 😊"\n\nDia 5: "Sei que às vezes a gente precisa processar com calma... Mas queria te lembrar: você veio até aqui, tirou tempo do seu dia, conversou com a Dra... Isso mostra que VOCÊ QUER resolver o que te incomoda. O que está REALMENTE te impedindo de começar agora?"' },

      { type: 'section', number: 5, title: 'Follow-Up por Canal' },
      { type: 'table', headers: ['Aspecto', 'WhatsApp', 'Instagram DM', 'Telefone'], rows: [
        ['Timing ideal', 'Comercial: 9h-18h', 'Mais flexível: 8h-21h', 'Comercial: 10h-17h'],
        ['Tamanho da msg', '2-4 linhas', '1-3 linhas, mais curto', 'Script de 1-2min'],
        ['Uso de emoji', 'Sim, moderado (1-2)', 'Sim, liberal (2-3)', 'Não, apenas voz'],
        ['Frequência', 'Sistema normal: dias 0,2,5,10,15', 'Sistema normal', 'Apenas dias 5 e 10'],
        ['Taxa de resposta', '40-50%', '30-40%', '20-30%'],
      ]},
      { type: 'callout', text: 'REGRA DE OURO: comece sempre pelo canal que ela te procurou. Exceção: se após o Dia 5 no canal original ela não responder, mude de canal (ex: Instagram → WhatsApp no Dia 10).' },

      { type: 'section', number: 6, title: 'Sistema de Organização e Controle' },
      { type: 'paragraph', text: 'Sem organização, o melhor sistema do mundo não funciona.' },
      { type: 'checklist', id: 'planilha-colunas', items: [
        'Nome do lead',
        'Telefone/Instagram',
        'Procedimento de interesse',
        'Data do primeiro contato',
        'Status (Novo / Dia 2 / Dia 5 / Dia 10 / Dia 15 / Respondeu / Perdido)',
        'Próximo follow-up (data exata)',
        'Observações',
      ]},
      { type: 'paragraph', text: 'Ferramentas recomendadas: clínicas pequenas (até 100 leads/mês) — Notion, Trello, Google Sheets + Zapier. Clínicas médias (100-500 leads/mês) — RD Station CRM, Pipedrive, HubSpot. Clínicas grandes (500+ leads/mês) — Salesforce, Moskit CRM, consultoria especializada.' },
      { type: 'callout', text: 'MÉTODO EMERGENCIAL (sem ferramenta): use os lembretes do celular — crie 5 lembretes por lead (Dia 0, 2, 5, 10, 15). Quando tocar, envie o template do dia. Se ela responder, cancele os próximos. Funciona com até 20 leads/mês.' },

      { type: 'section', number: 7, title: 'Erros Fatais em Follow-Up' },
      { type: 'table', headers: ['Erro fatal', 'Por que mata', 'Faça isso'], rows: [
        ['Fazer follow-up sem sistema ("quando lembro, eu mando")', 'Você esquece 70% dos leads', 'Use planilha/CRM. Crie rotina diária.'],
        ['Enviar textão (8+ linhas)', 'Ninguém lê. Taxa de resposta cai 80%.', 'Mensagens de 2-4 linhas máx.'],
        ['Usar mesmo texto pra todos', 'Genérico = sem conexão. Parece spam.', 'Personalize: nome + procedimento + contexto.'],
        ['Follow-up imediato após não-resposta', 'Parece desespero. Afasta a pessoa.', 'Respeite os timings: dias 0, 2, 5, 10, 15.'],
        ['Insistir após o Dia 15', 'Vira spam. Ela vai bloquear você.', 'Após Dia 15 sem resposta: PARE.'],
        ['Não perguntar nada ("oi, lembrou de mim?")', 'Não gera engajamento. Sem CTA = sem resposta.', 'SEMPRE tenha pergunta/CTA claro.'],
        ['Follow-up fora do horário (23h)', 'Invasivo. Perde profissionalismo.', 'Horário comercial: 9h-18h.'],
        ['Começar com desculpa ("desculpa incomodar...")', 'Você parece inseguro. Perde autoridade.', 'Seja direto e confiante.'],
        ['Não registrar follow-ups', 'Você manda duplicado ou esquece.', 'SEMPRE registre data, mensagem, resposta.'],
      ]},
      { type: 'callout', text: 'O ERRO #1 MORTAL: não fazer follow-up nenhum. 48% dos vendedores nunca fazem porque "não quero incomodar" ou "se ela quisesse, ela voltava". VERDADE DURA: você não está incomodando, está lembrando. Quem não faz follow-up perde 80% das vendas que poderia ter feito.' },

      { type: 'section', number: 8, title: 'Guia de Implementação' },
      { type: 'numbered-list', title: 'Hoje (2 horas)', items: [
        'Organize sua base atual (30min): liste todos os leads que não responderam nos últimos 30 dias, separe por data, identifique em qual "dia" cada um está',
        'Escolha sua ferramenta (15min): planilha, CRM simples ou lembretes do celular',
        'Salve os templates (30min): copie os 10 templates deste documento, personalize com nome da clínica',
        'Envie primeiro lote (45min): pegue os 10 leads mais recentes, identifique o "dia" de cada um, envie o template correspondente',
      ]},
      { type: 'table', headers: ['Dia', 'Ação'], rows: [
        ['Segunda', 'Envie follow-ups do Dia 0 (leads novos de hoje)'],
        ['Terça', 'Envie follow-ups do Dia 2 (leads de segunda passada)'],
        ['Quarta', 'Envie follow-ups do Dia 5'],
        ['Quinta', 'Envie follow-ups do Dia 10'],
        ['Sexta', 'Envie follow-ups do Dia 15'],
      ]},
      { type: 'callout', text: 'Resultado esperado: semana 1, 20-30% de taxa de resposta; semana 2-3, 30-40%; mês 2+, 40-50%.' },
      { type: 'checklist', id: 'verificacao-semanal', items: [
        'Revisei todos os follow-ups da semana passada?',
        'Atualizei status dos leads que responderam?',
        'Removi do fluxo os que pediram para parar?',
        'Agendei os follow-ups da próxima semana?',
        'Calculei taxa de resposta da semana?',
      ]},
      { type: 'callout', text: '80% das vendas acontecem depois do 5º contato. Mas 90% dos vendedores desistem antes disso. A diferença entre você e sua concorrente não é técnica, não é preço, não é localização. É FOLLOW-UP. Disciplina vence talento quando o talento não é disciplinado. © Método D.O.M. - Dom Azeredo' },
    ],
  },

  'sistema-campanha-interna': {
    slug: 'sistema-campanha-interna',
    title: 'Sistema de Campanha Interna',
    subtitle: 'Método D.O.M. para Clínicas HOF — Reativando Sua Base com CAC Zero',
    category: 'Campanhas',
    blocks: [
      { type: 'section', number: 1, title: 'Por Que Sua Base Vale Ouro (E Você Não Está Usando)' },
      { type: 'callout', text: 'A MATEMÁTICA BRUTAL: custo para captar novo paciente (CAC): R$150-300. Custo para reativar paciente da base: R$0-5. Probabilidade de venda para lead novo: 5-15%. Probabilidade de venda para base: 30-60%. Tradução: sua base vale 10x MAIS que tráfego pago.' },
      { type: 'pillar-grid', pillars: [
        { title: 'CAC Zero (ou quase)', description: 'Você não paga NADA para entrar em contato. Todo faturamento é lucro puro.' },
        { title: 'Confiança Já Existe', description: 'Ela já comprou de você antes. Já conhece, já confia. Metade do trabalho está feito.' },
        { title: 'Lifetime Value Maior', description: 'Paciente que volta 2x tem 3x mais chance de voltar uma 3ª vez. Você cria recorrência.' },
      ]},
      { type: 'callout', text: 'CASO REAL: clínica no Rio de Janeiro com base de 800 pacientes inativos (6+ meses sem retorno). Campanha de 1 semana de reativação, investimento R$0 (só tempo da equipe). Resultado: 127 pacientes reagendaram, faturamento gerado R$68.400, ROI infinito. Enquanto gastava R$15k/mês em tráfego gerando R$45k, descobriu que tinha R$68k parados na base.' },
      { type: 'paragraph', text: 'Você está gastando fortunas em tráfego pago enquanto tem uma mina de ouro dormindo no WhatsApp. Campanha interna não substitui tráfego — complementa e potencializa.' },

      { type: 'section', number: 2, title: 'Segmentação Estratégica da Base' },
      { type: 'paragraph', text: 'Você não pode enviar a mesma mensagem para todo mundo. Segmente por temperatura e comportamento.' },
      { type: 'table', headers: ['Segmento', 'Definição', 'Potencial', 'Abordagem'], rows: [
        ['Base Quente 🔥', 'Comprou nos últimos 30 dias', 'Alto (60-70% conversão)', 'Oferta de manutenção, procedimentos complementares'],
        ['Base Morna 🟡', 'Comprou há 30-90 dias', 'Médio (40-50% conversão)', 'Lembrete gentil, novos procedimentos, promoção leve'],
        ['Base Fria ❄️', 'Comprou há 90+ dias', 'Baixo (20-30% conversão)', 'Reativação forte, oferta especial, reconquista'],
        ['Base VIP ⭐', 'Gastou R$3k+ total', 'Altíssimo (70-80% conversão)', 'Tratamento premium, condição exclusiva, acesso antecipado'],
        ['Dorminhoca 😴', 'Fez 1 consulta, nunca voltou', 'Médio (30-40% conversão)', 'Entender por que sumiu, ofertar solução, remover objeção'],
      ]},
      { type: 'paragraph', text: 'Como segmentar: exporte lista de pacientes, adicione coluna "Última Compra" (data), calcule dias desde última compra. Classifique: 0-30 dias = Quente, 31-90 = Morna, 91+ = Fria, total gasto >R$3k = VIP (independente do tempo), 1 consulta apenas = Dorminhoca. No Excel/Sheets use fórmula: =HOJE()-[célula da data]' },
      { type: 'numbered-list', title: 'Matriz de Priorização (Ordem de Ataque em Campanha)', items: [
        '1º — Base VIP (maior ticket, maior conversão)',
        '2º — Base Quente (momentum está a seu favor)',
        '3º — Base Dorminhoca (descobrir por que sumiu)',
        '4º — Base Morna (precisa de empurrãozinho)',
        '5º — Base Fria (maior desafio, oferta precisa ser forte)',
      ]},
      { type: 'table', headers: ['Segmento', 'Frequência de campanha'], rows: [
        ['VIP', 'A cada 30-45 dias (não cansa)'],
        ['Quente', 'A cada 60 dias (manutenção)'],
        ['Morna', 'A cada 90 dias (reativar)'],
        ['Fria', 'A cada 120 dias (reconquistar)'],
        ['Dorminhoca', 'Apenas 1x (se não voltar, desista)'],
      ]},

      { type: 'section', number: 3, title: 'Scripts de Reativação por Temperatura' },
      { type: 'phase', title: '🔥 Base Quente (0-30 dias) — Manter Momentum', body: 'Tom: caloroso, como continuar uma conversa.\n\nManutenção: "Oi [Nome]! 😊 Já faz [X] semanas desde seu [procedimento]! Como você está se sentindo com o resultado? Gostou? 💙 Inclusive, já está no momento ideal para [manutenção/retoque], se você quiser potencializar ainda mais o resultado! Quer agendar uma avaliação?"\n\nCross-sell: "Você ficou TÃO linda com o [procedimento que ela fez]! 💕 Você já pensou em fazer [procedimento complementar]? Porque combinaria PERFEITO com o resultado que você já tem! [enviar 2-3 antes/depois] O que você achou?"' },
      { type: 'phase', title: '🟡 Base Morna (30-90 dias) — Relembrar e Criar Desejo', body: 'Tom: amigável, com novidade.\n\nNovidade: "Oi [Nome]! Faz um tempinho que não nos vemos, né? Queria te contar uma novidade INCRÍVEL: agora estamos fazendo [novo procedimento]! Pensei logo em você... Posso te mostrar alguns resultados? São DE-SUS-SES! 😍"\n\nCondição especial: "[Nome], sumida, ein! 😊 Esse mês estamos com uma condição ESPECIAL para [procedimento]: [descrever]. Como você já é nossa paciente, queria te avisar ANTES de abrir pra todo mundo! Válido só até [data]..."' },
      { type: 'phase', title: '❄️ Base Fria (90+ dias) — Reconquistar com Oferta Forte', body: 'Tom: sério mas carinhoso, com oferta irresistível.\n\nSentimos sua falta: "Oi [Nome]... Faz MUITO tempo que não temos notícias suas! 😔 Confesso que bateu uma SAUDADE! Está tudo bem? Aconteceu algo que te afastou da gente? Queria te fazer um convite especial pra VOLTAR..."\n\nOferta de reconquista: "Preparamos uma condição EXCLUSIVA de retorno: [ex: 50% de desconto OU primeira consulta + protocolo grátis]. Válido apenas para pacientes antigas que não voltaram. Me responde até [data] que eu garanto pra você!"' },
      { type: 'phase', title: '⭐ Base VIP (gastou R$3k+) — Relacionamento Premium', body: 'Tom: exclusivo, privilegiado, consultivo.\n\nAcesso antecipado: "[Nome], como você está? 💎 Você é uma das nossas pacientes VIP, então queria te dar um ACESSO ANTECIPADO antes de abrir para todo mundo: [novo procedimento/promoção]. Você tem prioridade para agendar nos melhores horários!"\n\nConvite especial: "Como nossa paciente VIP, que tal a gente sentar e fazer um PLANO DE HARMONIZAÇÃO FACIAL completo pra você? Avaliamos tudo: o que já foi feito, resultados atuais, o que pode potencializar, protocolo para os próximos 6-12 meses. É uma consultoria completa e GRATUITA!"' },
      { type: 'phase', title: '😴 Base Dorminhoca (1 consulta, nunca voltou) — Descobrir o Motivo', body: 'Tom: curioso, empático, solução de problema.\n\nEntender o problema: "Você veio aqui há [X] tempo pra avaliar [procedimento], lembra? E percebi que a gente não seguiu em frente... Posso te fazer uma pergunta sincera? O que aconteceu? Foi o investimento? Foi insegurança?"\n\nResolver objeção: "Será que foi o preço que te assustou na época? Porque AGORA temos uma condição muito melhor: [oferta específica]. Vale a pena dar uma olhada de novo!"' },

      { type: 'section', number: 4, title: 'Campanhas Sazonais Prontas' },
      { type: 'paragraph', text: 'Use datas comemorativas e sazonais para criar ganchos de reativação.' },
      { type: 'procedure-grid', items: [
        { title: '🎂 Aniversário (individual, todo mês)', note: '"[Nome]! FELIZ ANIVERSÁRIO! 🎉 Como presente, preparamos uma condição EXCLUSIVA de aniversário pra você. Válido durante TODO o mês!" Alta taxa de conversão (40-50%).' },
        { title: '☀️ Verão (Dezembro-Fevereiro)', note: '"O VERÃO está chegando! ☀️ Separei procedimentos PERFEITOS pra deixar você impecável. Condição especial com até [X]x sem juros! A agenda está enchendo rápido!"' },
        { title: '👩‍👧 Dia das Mães (Abril-Maio)', note: 'Duplo gancho: presentear ela mesma ou a mãe. Vale-presente funciona muito bem nesta data.' },
        { title: '🛍️ Black Friday (Novembro)', note: 'As maiores condições do ano. Escassez precisa ser REAL — limite de vagas verdadeiro, deadline firme.' },
        { title: '🎄 Natal (Novembro-Dezembro)', note: 'Pacotes de festas + vale-presente + escassez real (recesso de fim de ano).' },
        { title: '🎒 Volta às Aulas (Janeiro-Fevereiro)', note: '"Ano novo, você nova!" Facilitar pagamento (1ª parcela só em março). Energia de renovação.' },
      ]},

      { type: 'section', number: 5, title: 'Como Criar Ofertas Irresistíveis (Sem Desvalorizar Seu Trabalho)' },
      { type: 'callout', text: 'Oferta boa não é só desconto. É VALOR PERCEBIDO maior que investimento.\n\nFórmula: [PROCEDIMENTO] + [BÔNUS 1] + [BÔNUS 2] + [FACILIDADE DE PAGAMENTO] + [ESCASSEZ]\n\nRuim: "Botox com 20% de desconto"\nBom: "Botox + Limpeza de Pele de brinde + Parcelamento em 6x sem juros + Apenas 10 vagas disponíveis"' },
      { type: 'numbered-list', title: 'Tipos de Bônus que Funcionam', items: [
        'Procedimento complementar grátis (ex: "Preenchimento + Limpeza de Pele grátis")',
        'Produto para casa (ex: "Botox + Sérum de ácido hialurônico")',
        'Sessão extra (ex: "Compre 3 sessões, ganhe a 4ª")',
        'Upgrade (ex: "Pague pelo básico, leve o premium")',
        'Garantia estendida (ex: "Retoque grátis em até 60 dias")',
      ]},
      { type: 'callout', text: 'CUIDADO COM ESCASSEZ FAKE: ❌ "Apenas hoje!" (você faz todo mês) / "Últimas vagas!" (agenda vazia) / "Somente 5 pessoas!" (aceita 50). ✅ Escassez real: "Apenas 10 vagas porque não temos agenda pra mais" / "Até dia X porque depois produto acaba". Se você mentir, perde credibilidade pra sempre.' },

      { type: 'section', number: 6, title: 'Sistema de Execução de Campanha' },
      { type: 'phase', title: 'Dia 1-2: Planejamento', body: 'Escolha o segmento (quente/morna/fria/VIP/dorminhoca), defina a oferta, escolha/adapte o script, separe casos antes/depois relevantes.' },
      { type: 'phase', title: 'Dia 3: Organização', body: 'Exporte lista de pacientes do segmento. Crie planilha de controle com: nome, telefone, último procedimento, data último contato, status (Enviado/Respondeu/Agendou/Perdeu).' },
      { type: 'phase', title: 'Dia 4-5: Execução', body: 'Envie mensagens (meta: 50-100 por dia). Personalize NOME + PROCEDIMENTO em cada mensagem. Registre na planilha. Responda quem retornar.' },
      { type: 'phase', title: 'Dia 6-7: Follow-Up', body: 'Quem não respondeu: envie lembrete leve. Quem disse "vou pensar": use script de objeções. Quem agendou: confirme 24h antes.' },
      { type: 'paragraph', text: 'Tempo necessário: planejamento 2-3h (uma vez), execução diária 1-2h, follow-up 30min/dia. Quem faz: recepcionista executa, você/gestora supervisiona e cuida dos casos difíceis.' },

      { type: 'section', number: 7, title: 'Métricas e ROI de Campanhas Internas' },
      { type: 'table', headers: ['KPI', 'Fórmula', 'Meta'], rows: [
        ['Taxa de resposta', '(Responderam ÷ Enviados) × 100', 'Quente 50-60% / Morna 30-40% / Fria 15-25% / VIP 60-70% / Dorminhoca 20-30%'],
        ['Taxa de conversão', '(Agendaram ÷ Responderam) × 100', '40-60%'],
        ['Taxa de comparecimento', '(Compareceram ÷ Agendaram) × 100', '70-80%'],
        ['Taxa de fechamento', '(Fecharam ÷ Compareceram) × 100', '50-70%'],
        ['ROI da campanha', '(Faturamento - Custo) ÷ Custo × 100', '>1000% (CAC quase zero)'],
      ]},
      { type: 'callout', text: 'EXEMPLO REAL: enviado 200 mensagens, responderam 80 (40%), agendaram 40 (50%), compareceram 32 (80%), fecharam 20 (62,5%), ticket médio R$1.200, faturamento R$24.000, custo R$0, ROI infinito.' },
      { type: 'table', headers: ['Segmento', 'Frequência de repetição'], rows: [
        ['Base Quente', 'A cada 30-45 dias — momentum a seu favor, não cansa porque valor é alto'],
        ['Base Morna', 'A cada 60-90 dias — mantém interesse sem saturar'],
        ['Base Fria', 'A cada 120 dias (trimestral) — oferta precisa ser diferente'],
        ['Base VIP', 'A cada 30-60 dias — relacionamento constante, alta LTV justifica frequência'],
        ['Dorminhoca', 'Apenas 1 tentativa — se não voltar, desista; força afasta definitivamente'],
      ]},
      { type: 'callout', text: 'REGRA: se a taxa de resposta cai abaixo de 20%, você está saturando a base. PARE e espere mais tempo.' },

      { type: 'section', number: 8, title: 'Calendário Anual de Campanhas' },
      { type: 'table', headers: ['Mês', 'Campanha principal', 'Segmento foco'], rows: [
        ['Janeiro', 'Volta às Aulas / Ano Novo', 'Base Morna + Fria'],
        ['Fevereiro', 'Verão (últimas semanas)', 'Base Quente'],
        ['Março', 'Outono (renovação)', 'Base VIP'],
        ['Abril', 'Pré Dia das Mães', 'Todas (vale-presente)'],
        ['Maio', 'Dia das Mães + Aniversários', 'Base Dorminhoca'],
        ['Junho', 'Inverno (cuidados)', 'Base Morna'],
        ['Julho', 'Férias de Inverno', 'Base Quente + VIP'],
        ['Agosto', 'Dia dos Pais (menos forte)', 'Base VIP homens'],
        ['Setembro', 'Primavera (renovação)', 'Base Fria'],
        ['Outubro', 'Pré-Verão', 'Todas'],
        ['Novembro', 'Black Friday', 'Base Fria + Dorminhoca'],
        ['Dezembro', 'Natal + Fim de Ano', 'Todas'],
      ]},
      { type: 'callout', text: 'ALÉM DAS SAZONAIS: continue rodando aniversários TODO MÊS (individual).' },
      { type: 'callout', text: 'Você está sentado em cima de uma MINA DE OURO e nem percebeu. Sua base é um ativo que gera receita recorrente com CAC zero. Enquanto você gasta R$10k-20k/mês em tráfego, tem R$30k-50k parados esperando um WhatsApp. 1 campanha por mês. 1 segmento por vez. 1-2h de execução. © Método D.O.M. - Dom Azeredo' },
    ],
  },

  'protocolo-consulta-que-vende': {
    slug: 'protocolo-consulta-que-vende',
    title: 'Protocolo de Consulta que Vende',
    subtitle: 'Método D.O.M. para Clínicas HOF — Da Abertura ao Fechamento: Roteiro Completo',
    category: 'Consultas',
    blocks: [
      { type: 'section', number: 1, title: 'Por Que 90% das Consultas Não Convertem' },
      { type: 'callout', text: 'A VERDADE BRUTAL: você investe R$150-300 para trazer um paciente até sua clínica. Ele chega, você explica TUDO sobre o procedimento. Ele diz "vou pensar" e nunca mais volta. Taxa de conversão média em consultas HOF: 15-30%. Taxa de conversão com PROTOCOLO: 60-80%. A diferença não está na sua técnica. Está no MÉTODO da consulta.' },
      { type: 'pillar-grid', pillars: [
        { title: 'Erro #1', description: 'Você explica o PROCEDIMENTO antes de entender o PROBLEMA. Resultado: paciente não vê valor, só vê preço.' },
        { title: 'Erro #2', description: 'Você não faz perguntas EMOCIONAIS, só técnicas. Resultado: não cria desejo, só passa informação.' },
        { title: 'Erro #3', description: 'Você não FECHA, fica esperando o paciente decidir. Resultado: paciente sai "pra pensar" e nunca volta.' },
      ]},
      { type: 'callout', text: 'A SOLUÇÃO: um protocolo estruturado que descobre a dor emocional real (não só o incômodo estético), gera desejo pela transformação (não só pelo procedimento) e conduz ao fechamento natural (sem pressão, com lógica). Este protocolo transforma consulta em EXPERIÊNCIA DE COMPRA.' },

      { type: 'section', number: 2, title: 'As 5 Etapas do Protocolo' },
      { type: 'paragraph', text: 'Cada consulta segue exatamente estas 5 etapas, nesta ordem:' },
      { type: 'table', headers: ['Etapa', 'Objetivo', 'Duração', 'Resultado esperado'], rows: [
        ['1. Abertura (Conexão)', 'Criar rapport, paciente se sentir ouvida', '5-7 min', 'Ela relaxa e se abre'],
        ['2. Diagnóstico (Emoção)', 'Descobrir dor real, entender motivação profunda', '10-15 min', 'Você sabe o que vender'],
        ['3. Educação (Valor)', 'Explicar solução, ancorar valor', '10-12 min', 'Ela quer a transformação'],
        ['4. Apresentação (Desejo)', 'Mostrar plano, gerar expectativa', '5-8 min', 'Ela se vê com o resultado'],
        ['5. Fechamento (Decisão)', 'Conduzir ao sim, remover objeções', '5-10 min', 'Ela agenda/fecha hoje'],
      ]},
      { type: 'callout', text: 'TIMING TOTAL: consulta ideal 40-50 minutos. Se passar de 1 hora: você está enrolando, não vendendo. Se for menos de 30 min: você está apressando, não conectando. O timing perfeito cria ritmo que conduz ao fechamento.' },

      { type: 'section', number: 3, title: 'Checklist Completo da Consulta' },
      { type: 'paragraph', text: 'Use este checklist ANTES, DURANTE e DEPOIS de cada consulta.' },
      { type: 'checklist', id: 'antes-consulta', items: [
        'Revisei ficha do paciente (nome, procedimento de interesse, histórico)?',
        'Separei 3-5 casos antes/depois relevantes no celular?',
        'Sala está limpa, organizada e acolhedora?',
        'Tenho à mão: tabela de preços, opções de pagamento, calendário?',
        'Desliguei notificações do celular (zero interrupções)?',
        'Estou mentalmente preparada e focada?',
        'Tenho 50-60 minutos livres (sem consultas coladas)?',
      ]},
      { type: 'checklist', id: 'durante-consulta', items: [
        'Etapa 1 — Cumprimentei calorosamente e ofereci água/café?',
        'Etapa 1 — Fiz quebra-gelo e perguntei "O que te trouxe aqui hoje?"',
        'Etapa 2 — Fiz perguntas emocionais (não só técnicas)?',
        'Etapa 2 — Entendi quanto tempo ela tem esse incômodo e como afeta a autoestima?',
        'Etapa 2 — Identifiquei a dor real (não só o sintoma) e anotei tudo?',
        'Etapa 3 — Expliquei solução de forma simples e mostrei 3-5 casos antes/depois?',
        'Etapa 3 — Perguntei "Isso faz sentido pra você?" e ancorei valor?',
        'Etapa 4 — Apresentei plano personalizado mostrando o resultado final?',
        'Etapa 4 — Ofereci opções (1 procedimento vs combo) e validei?',
        'Etapa 5 — Perguntei diretamente "Quer começar?" e apresentei opções de pagamento?',
        'Etapa 5 — Lidei com objeções e agendei procedimento HOJE (se fechou)?',
      ]},
      { type: 'checklist', id: 'depois-consulta', items: [
        'Registrei resultado na ficha (fechou/não fechou/objeção)?',
        'Se fechou: confirmei agendamento e enviei mensagem de boas-vindas?',
        'Se não fechou: marquei follow-up para 24-48h?',
        'Anotei objeção específica para trabalhar no follow-up?',
        'Analisei: o que funcionou bem? O que posso melhorar?',
      ]},

      { type: 'section', number: 4, title: 'Matriz de Perguntas Estratégicas' },
      { type: 'table', headers: ['Etapa', 'Tipo de pergunta', 'Exemplos'], rows: [
        ['Abertura (Conexão)', 'Perguntas abertas, não-invasivas', 'O que te trouxe aqui hoje? / Você já fez procedimento antes? / Como foi sua experiência?'],
        ['Diagnóstico (Emoção)', 'Perguntas emocionais, profundas', 'Há quanto tempo isso te incomoda? / Como isso afeta seu dia a dia? / Se pudesse mudar, o que mudaria?'],
        ['Educação (Validação)', 'Perguntas de confirmação', 'Isso faz sentido pra você? / É isso que você busca? / O que achou dos casos?'],
        ['Apresentação (Desejo)', 'Perguntas de preferência', 'Você prefere resultado natural ou marcado? / Quer fazer tudo de uma vez ou por etapas?'],
        ['Fechamento (Decisão)', 'Perguntas de comprometimento', 'Quer começar hoje ou prefere agendar? / O que te impede de fechar agora?'],
      ]},
      { type: 'numbered-list', title: 'As 10 Perguntas de Ouro (Use Sempre)', items: [
        '"O que te trouxe aqui hoje?" (abertura)',
        '"Há quanto tempo isso te incomoda?" (tempo = urgência)',
        '"Como isso afeta sua autoestima?" (emoção)',
        '"Você já tentou algo antes?" (histórico)',
        '"Se pudesse resolver isso hoje, o que mudaria na sua vida?" (visualização)',
        '"Isso faz sentido pra você?" (validação constante)',
        '"O que você achou dos casos que mostrei?" (engajamento)',
        '"Você prefere X ou Y?" (escolha guiada, não sim/não)',
        '"O que te impede de começar hoje?" (objeção direta)',
        '"Quer que eu agende para você agora?" (fechamento assertivo)',
      ]},
      { type: 'callout', text: 'REGRA: escute MAIS do que fala. Proporção ideal: 40% você / 60% paciente.' },

      { type: 'section', number: 5, title: 'Roteiro de Fechamento por Objeção' },
      { type: 'dialog', exchanges: [
        { speaker: 'Você', text: 'Então, [Nome], o plano que apresentei faz sentido pra você?' },
        { speaker: 'Paciente', text: 'Sim, faz!' },
        { speaker: 'Você', text: 'Perfeito! Você quer começar hoje ou prefere agendar para outra data?' },
      ]},
      { type: 'callout', text: 'Cenário 1 — Paciente decidida (sem objeção): se disser "hoje", ofereça horário daqui a X minutos/horas. Se preferir agendar, ofereça 2 opções de data (não pergunte "qual horário você quer?").' },
      { type: 'script', text: 'CENÁRIO 2 — "Preciso pensar"\n\nPaciente: "Vou pensar..."\nVocê: "Claro! Posso perguntar: quando você diz que vai pensar, é sobre alguma coisa específica que ficou em dúvida?" [ela revela a real objeção, ex: valor] "Entendo! Olha, o investimento faz sentido se pensarmos na transformação que você vai ter. Mas me diz: se o valor não fosse uma questão, você faria HOJE?" [Se sim:] "Então vamos encontrar uma forma! Posso parcelar em até [X]x sem juros, ou você prefere dar uma entrada e o restante dividir?"\n\nTÉCNICA: "preciso pensar" SEMPRE esconde outra objeção. Descubra qual.' },
      { type: 'script', text: 'CENÁRIO 3 — "Está caro"\n\nPaciente: "Achei caro..."\nVocê: "Entendo sua preocupação. Me ajuda a entender: quando você diz que está caro, é em comparação com o quê? Você pesquisou em outros lugares?" [Se sim:] "Ótimo que você pesquisou! Mas me diz: se lá está mais barato e você ainda assim veio até aqui, o que te deixou insegura pra fechar lá?" [Ela revela: qualidade, confiança, resultado] "Exatamente! Nosso preço reflete experiência + produto premium + acompanhamento. Você prefere economizar agora e correr risco, ou investir certo e ter certeza do resultado?"\n\nTÉCNICA: reposicione de preço para valor + divida mensalmente.' },
      { type: 'script', text: 'CENÁRIO 4 — "Preciso falar com meu marido/mãe"\n\nVocê: "Claro, entendo perfeitamente! Me diz: o que VOCÊ acha do tratamento? Faz sentido pra você?" [Sim, adorei!] "Que ótimo! E você acha que ele vai ter alguma preocupação específica? Tipo valor, segurança...?" [Ela conta] "Perfeito. Então vou te armar com TODAS as respostas pra quando você conversar com ele. Quando você pretende conversar? Te ligo amanhã pra gente fechar os detalhes, ok?"\n\nTÉCNICA: armá-la com argumentos + já agendar follow-up.' },
      { type: 'script', text: 'CENÁRIO 5 — Paciente Silenciosa (não dá pistas)\n\nVocê: "Então, [Nome], o que você achou de tudo que conversamos?" [Silêncio ou resposta vaga] "Posso ser sincera com você? Parece que você ainda tem alguma dúvida ALÉM do que conversamos. Estou certa?" [Ela revela, ex: "tenho medo de não ficar natural..."] "Ahhh! Entendi. Nosso foco é SEMPRE resultado natural. Dos casos que te mostrei, qual te agradou mais?" [Ela aponta um] "Então é ESSE o padrão que vamos seguir. Com essa segurança, quer começar?"\n\nTÉCNICA: silêncio = medo não-dito. Pergunte diretamente.' },

      { type: 'section', number: 6, title: 'Sistema de Registro e Anotações' },
      { type: 'paragraph', text: 'O que você não registra, você esquece. Use este sistema durante a consulta:' },
      { type: 'table', headers: ['Bloco', 'Itens a preencher'], rows: [
        ['Informações básicas', 'Nome completo, telefone, Instagram, como nos conheceu, data da consulta'],
        ['Diagnóstico', 'Incômodo principal, há quanto tempo, como afeta emocionalmente, procedimentos anteriores, expectativa de resultado'],
        ['Comercial', 'Procedimento(s) recomendado(s), valor apresentado, forma de pagamento oferecida, objeção (se houver)'],
        ['Resultado', 'Fechou hoje / Agendou (data) / Follow-up (data) / Perdeu (motivo)'],
      ]},
      { type: 'callout', text: 'DICAS: anote durante a consulta (não confie na memória), use palavras dela (não suas interpretações), marque detalhes emocionais (úteis no follow-up), se ela mencionar evento específico (casamento, formatura) anote a data, registre referências visuais que ela gosta, sempre anote a REAL objeção (não a superficial). Use Notion, Google Sheets ou CRM para centralizar tudo.' },

      { type: 'section', number: 7, title: 'Erros Fatais em Consulta' },
      { type: 'table', headers: ['Erro fatal', 'Por que mata', 'Faça isso'], rows: [
        ['Explicar procedimento ANTES de entender problema', 'Você vende solução sem saber qual a dor. Não gera valor.', 'SEMPRE faça diagnóstico antes de apresentar solução.'],
        ['Usar linguagem técnica demais', 'Paciente não entende, se perde, desiste.', 'Explique como se falasse pra sua avó. Simples e claro.'],
        ['Não fazer perguntas emocionais', 'Sem conexão emocional = sem desejo = sem venda.', 'Pergunte COMO isso afeta ela, não apenas O QUE incomoda.'],
        ['Mostrar casos antes de entender expectativa', 'Pode mostrar resultado que ela NÃO quer e assustar.', 'Primeiro entenda se ela quer natural ou marcado. Depois mostre.'],
        ["Aceitar 'vou pensar' e deixar ir", '80% dos que saem pra pensar NUNCA voltam.', 'Descubra a real objeção antes de deixar ela sair.'],
        ['Não fechar (ficar esperando ela decidir)', 'Transfere a decisão pra ela = ela foge.', 'VOCÊ deve conduzir ao fechamento. Pergunte diretamente.'],
        ['Consulta mais de 1 hora', 'Você está enrolando. Paciente cansa e desconecta.', 'Máximo 50-60 min. Seja eficiente, não prolixo.'],
        ['Não registrar nada', 'Você esquece detalhes essenciais pro follow-up.', 'Preencha a ficha DURANTE a consulta. Sempre.'],
      ]},
      { type: 'callout', text: 'O ERRO #1 MORTAL: não ter protocolo nenhum. Você improvisa cada consulta. Às vezes funciona, às vezes não. Resultado: conversão inconsistente, imprevisível. PROTOCOLO = PREVISIBILIDADE = ESCALA.' },

      { type: 'section', number: 8, title: 'Guia de Implementação' },
      { type: 'numbered-list', title: 'Hoje (1 hora)', items: [
        'Leia este protocolo completo',
        'Imprima checklist da consulta',
        'Salve as 10 perguntas de ouro no celular',
        'Separe 5-10 casos antes/depois por procedimento',
      ]},
      { type: 'numbered-list', title: 'Essa Semana (3-4 horas)', items: [
        'Pratique as 5 etapas sozinha (role-play mental)',
        'Memorize scripts de fechamento',
        'Crie ficha de registro (Google Sheets ou Notion)',
        'Aplique em 1-2 consultas reais (observe resultado)',
      ]},
      { type: 'numbered-list', title: 'Primeira Semana', items: [
        'Use protocolo em TODAS consultas',
        'Registre taxa de conversão',
        'Analise onde trava (qual etapa?)',
        'Ajuste conforme necessário',
      ]},
      { type: 'callout', text: 'Resultado esperado: semana 1, 40-50% conversão; semana 2-3, 50-60%; mês 2+, 60-80%. Tempo por consulta: antes ~1h-1h30 (sem protocolo), depois ~40-50min (com protocolo). ROI esperado: investimento R$0, aumento de faturamento 30-50% em 30 dias.' },
      { type: 'table', headers: ['KPI', 'Fórmula', 'Meta'], rows: [
        ['Taxa de conversão de consulta', '(Fecharam + Agendaram) ÷ Total de consultas × 100', '>60%'],
        ['Taxa de fechamento imediato', 'Fecharam HOJE ÷ Total de consultas × 100', '>40%'],
        ['Ticket médio por consulta', 'Faturamento total ÷ Nº de consultas', 'Aumentar 20-30% em 30 dias'],
        ['Tempo médio de consulta', 'Tempo total ÷ Nº de consultas', '40-50 minutos'],
        ['Taxa de "vou pensar" convertida', 'Voltaram ÷ Disseram "vou pensar" × 100', '>30%'],
      ]},
      { type: 'callout', text: 'A diferença entre converter 30% e converter 70% não está na sua técnica. Está no seu PROTOCOLO. Você pode ser a melhor profissional do mundo, mas se não souber conduzir a consulta, você perde vendas. Não improvise mais. Siga o protocolo. A cada consulta. Todos os dias. © Método D.O.M. - Dom Azeredo' },
    ],
  },
};
