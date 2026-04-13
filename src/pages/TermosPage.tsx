import { Separator } from "@/components/ui/separator";

const termos = [
  "A Mentoria HOF Circle possui duração estipulado no momento da contratação, incluindo encontros online em grupo, suporte contínuo via WhatsApp e acesso à área de membros com gravações e materiais exclusivos pelo período de vigência.",
  "As reuniões são previamente agendadas e comunicadas com antecedência. O não comparecimento não garante reposição, sendo a sessão considerada como realizada.",
  "A mentoria possui caráter educacional e estratégico, configurando-se como obrigação de meio. Isso significa que os resultados dependem exclusivamente da aplicação prática das estratégias por parte do mentorado.",
  "Ao realizar a contratação e/ou acessar qualquer recurso da mentoria (como grupo, plataforma ou conteúdos), considera-se iniciado o serviço, não sendo aplicável reembolso de valores pagos, em razão da natureza do serviço e da reserva de vaga.",
  "Em caso de desistência ou cancelamento antecipado, poderão ser aplicadas as condições previstas contratualmente, incluindo multa rescisória e cobrança proporcional pelos serviços disponibilizados.",
  "Todo o conteúdo disponibilizado (aulas, materiais, estratégias e encontros) é protegido por direitos autorais, sendo proibido compartilhar, reproduzir ou distribuir a terceiros sem autorização expressa.",
  "O participante autoriza o uso de sua imagem, voz e participação em gravações realizadas durante a mentoria, podendo estes conteúdos ser utilizados na área de membros e em materiais institucionais da marca.",
  "É de responsabilidade do participante respeitar as normas éticas e legais da sua profissão ao aplicar as estratégias ensinadas.",
  "Os dados pessoais fornecidos serão utilizados exclusivamente para fins de cadastro, execução dos serviços e comunicação, conforme a Lei Geral de Proteção de Dados (LGPD).",
  "Ao seguir com a participação, o usuário declara estar ciente e de acordo com todas as condições acima, incluindo o início imediato da prestação dos serviços.",
];

const TermosPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <img
            src="https://timedom.com.br/wp-content/uploads/2026/03/LOGO_TIME_DOM-Copia.png"
            alt="Time Dom"
            className="h-14 md:h-16 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center tracking-tight">
          Termos de Contratação – Mentoria HOF Circle
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center mt-4 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Leia atentamente as condições abaixo antes de prosseguir com sua participação na mentoria.
        </p>

        <Separator className="my-10 bg-border/50" />

        {/* Content */}
        <div className="space-y-6">
          {termos.map((paragrafo, index) => (
            <p
              key={index}
              className="text-foreground/90 text-sm md:text-base leading-7 md:leading-8"
            >
              {paragrafo}
            </p>
          ))}
        </div>

        {/* Highlight box */}
        <div className="mt-12 rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-6 md:p-8">
          <p className="text-foreground text-sm md:text-base font-medium text-center leading-7">
            Ao permanecer na mentoria e utilizar seus recursos, você declara concordância integral com estes termos.
          </p>
        </div>

        {/* Footer */}
        <p className="text-text-subtle text-xs text-center mt-12">
          © {new Date().getFullYear()} Time Dom. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default TermosPage;
