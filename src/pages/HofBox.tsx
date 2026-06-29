import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ArrowRight, Clock, Home, ChevronRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hofBoxCards } from '@/data/hofBoxData';

const categoryColors: Record<string, string> = {
  Vendas: 'bg-accent/40 text-foreground border-border',
};

const HofBox: React.FC = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    document.getElementById('hofbox-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const availableCount = hofBoxCards.filter((c) => c.available).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section
        className="relative h-[350px] md:h-[400px] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(/images/banner-secoes.png)` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />

        {/* Content */}
        <div className="relative z-10 container h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button
              onClick={() => navigate('/')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Início
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">HOF BOX</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Box className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">HOF BOX</h1>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Materiais exclusivos para membros. Scripts, sistemas e estratégias que funcionam na prática.
          </p>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={scrollToContent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Explorar Materiais
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {availableCount} materiais disponíveis
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div id="hofbox-content" className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hofBoxCards.map((card) =>
            card.available ? (
              <div
                key={card.id}
                className="group relative rounded-2xl border border-border bg-card hover:border-border-hover transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/hof-box/${card.slug}`)}
              >
                <div className="relative p-6 flex flex-col h-full min-h-[220px]">
                  {/* Number */}
                  <span className="text-xs font-bold tracking-widest mb-4 block text-muted-foreground">
                    #{String(card.id).padStart(2, '0')}
                  </span>

                  {/* Category */}
                  {card.category && (
                    <span
                      className={`inline-flex self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${
                        categoryColors[card.category] ?? 'bg-accent/40 text-muted-foreground border-border'
                      }`}
                    >
                      {card.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-foreground font-bold text-[17px] leading-snug mb-2">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>

                  {/* CTA */}
                  <button
                    className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hof-box/${card.slug}`);
                    }}
                  >
                    Acessar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={card.id}
                className="rounded-2xl flex flex-col items-center justify-center min-h-[220px] border border-dashed border-border bg-card/40"
              >
                <Clock className="w-6 h-6 text-muted-foreground mb-3" />
                <span className="text-muted-foreground text-sm font-medium">Em breve</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HofBox;
