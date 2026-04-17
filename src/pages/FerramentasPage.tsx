import React from 'react';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tool {
  name: string;
  description: string;
  link: string;
  tag: string;
  icon: React.ElementType;
}

const tools: Tool[] = [
  {
    name: 'Planejadora de Campanha',
    description: 'Monte sua campanha de paciente modelo com orientação passo a passo',
    link: 'https://planejador.timedom.com.br',
    tag: 'Campanha Paciente Modelo',
    icon: Megaphone,
  },
];

const FerramentasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 border border-border mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Powered by AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
            Ferramentas IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Recursos inteligentes para acelerar sua clínica
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/20 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/50 border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-accent/50 border border-border px-2 py-1 rounded-full">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    {tool.description}
                  </p>

                  <Button
                    asChild
                    className="w-full justify-center group/btn"
                  >
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Acessar
                      <ExternalLink className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Coming soon placeholder */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-6 min-h-[280px]">
            <Sparkles className="w-6 h-6 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Mais ferramentas em breve</p>
            <p className="text-xs text-muted-foreground/70 mt-1 text-center">
              Novos recursos de IA chegando
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FerramentasPage;
