import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Monitor, MessageCircle, Headphones, CalendarCheck } from 'lucide-react';

const pillars = [
  { title: 'Demanda Previsível', text: 'Estrutura múltiplos motores de captação pra parar de depender de indicação, sorte ou algoritmo.' },
  { title: 'Oferta Sem Frescura', text: 'Posicionamento claro, pacotes que justificam preço premium, comunicação que te tira da commodity.' },
  { title: 'Máquina de Vendas', text: 'Processo comercial estruturado com qualificação, quebra de objeções e follow-up. Sem improviso no WhatsApp.' },
];

const cadencia = [
  { label: 'Segunda A (19h) — Sessão de Mentorados', desc: 'Aula ao vivo em grupo com conteúdo prático e aplicável direto no consultório. Foco em estratégia, posicionamento e execução do método.' },
  { label: 'Segunda B (14h) — Treinamento de Vendas', desc: 'Encontro com foco em comercial e técnicas de venda para os times. Foco em conversão, quebra de objeções e processo de vendas.' },
  { label: 'Durante a semana', desc: 'Execução do seu plano de ação + suporte pelo grupo oficial no WhatsApp.' },
  { label: 'Sob demanda', desc: 'Reuniões individuais com o Dom agendadas conforme sua evolução e necessidade.' },
];

const ferramentas = [
  { icon: Monitor, title: 'Plataforma exclusiva', desc: 'Cursos, gravações de todos os encontros, repositórios de processos e materiais de apoio, plano de ação e acompanhamento.' },
  { icon: MessageCircle, title: 'Grupos no WhatsApp', desc: 'Grupo geral com outras alunas para trocas e avisos, grupo individual para dúvidas, grupo do time comercial.' },
  { icon: Headphones, title: 'Suporte com o Time DOM', desc: 'Canal direto para enviar materiais, tirar dúvidas e pedir feedback. Atendimento ativo de segunda a sexta, das 8h às 17h30 (horário de Brasília).' },
  { icon: CalendarCheck, title: 'Reunião de Plano de Ação', desc: 'Encontro individual com o Dom para montar seu plano inicial personalizado.' },
];

const faq = [
  { q: 'As aulas ficam gravadas?', a: 'Sim, disponíveis na plataforma em até 48h úteis após a transmissão.' },
  { q: 'Tem suporte 1:1?', a: 'Sim — no plano de ação inicial e em reuniões agendadas conforme sua evolução.' },
  { q: 'Preciso estar toda segunda ao vivo?', a: 'Recomendado, mas não obrigatório.' },
  { q: 'Quantas reuniões individuais tenho?', a: 'Não há número fixo — os encontros são agendados conforme sua necessidade e evolução dentro do programa.' },
  { q: 'Qual o canal oficial de comunicação?', a: 'O grupo de acompanhamento no WhatsApp. Toda dúvida passa por lá.' },
];

const passos = [
  'Assine o contrato para liberar o acesso à plataforma e aos materiais.',
  'Aguarde o contato da equipe de suporte para agendar sua Reunião de Plano de Ação Individual com o Dom.',
  'Acesse a plataforma em alunos.timedom.com.br e explore os materiais disponíveis.',
  'Participe da próxima aula ao vivo na segunda-feira às 19h. O link será enviado no grupo.',
];

const BoasVindasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header sticky */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-center">
          <img
            src="http://timedom.com.br/wp-content/uploads/2026/03/LOGO_TIME_DOM-Copia.png"
            alt="Time DOM"
            className="h-10 object-contain"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Seja bem-vinda ao HOF Circle
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Você entrou em um programa de aceleração, não em um curso.
          </p>
        </section>

        {/* Vídeo */}
        <section className="flex justify-center">
          <div className="w-full max-w-[800px]">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1190089776?h=0&badge=0&autopause=0&player_id=0"
                className="absolute inset-0 w-full h-full rounded-xl"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Boas-vindas HOF Circle"
              />
            </div>
          </div>
        </section>

        {/* O que é */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Um programa estruturado</h2>
          <p className="text-gray-600 leading-relaxed">
            Aqui não tem conteúdo solto esperando você assistir quando der vontade. O HOF Circle é um processo estruturado — com plano, acompanhamento e direcionamento próximo — pensado pra realidade de quem vive da harmonização facial. Seu crescimento aqui é proporcional à sua execução.
          </p>
        </section>

        {/* 3 Pilares */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">O que você vai desenvolver</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="border border-gray-200 rounded-xl p-6 space-y-3 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-800">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cadência */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">A cadência da mentoria</h2>
          <div className="space-y-4">
            {cadencia.map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">{item.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ferramentas */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">O que você tem acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ferramentas.map((f) => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">{f.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Informações importantes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-gray-200">
                <AccordionTrigger className="text-gray-700 hover:no-underline text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Primeiros Passos */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Por onde começar agora</h2>
          <div className="space-y-4">
            {passos.map((passo, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                  {i + 1}
                </span>
                <p className="text-gray-600 pt-1">{passo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center space-y-4 pb-8">
          <a href="https://alunos.timedom.com.br" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="px-10 py-6 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              Acessar Plataforma
            </Button>
          </a>
          <p className="text-sm text-gray-400">
            Dúvidas? Entre em contato: (44) 99879-2925
          </p>
        </section>
      </main>
    </div>
  );
};

export default BoasVindasPage;
