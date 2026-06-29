import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ArrowRight, Clock } from 'lucide-react';
import { hofBoxCards } from '@/data/hofBoxData';

const categoryColors: Record<string, string> = {
  Vendas: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const HofBox: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0B0C' }}>
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-10 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: '#E8813A1A', border: '1px solid #E8813A33' }}
            >
              <Box className="w-5 h-5" style={{ color: '#E8813A' }} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-white/40">
              HOF CIRCLE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            HOF BOX
          </h1>
          <p className="text-white/50 text-base max-w-xl leading-relaxed">
            Materiais exclusivos para membros. Scripts, sistemas e estratégias que funcionam na prática.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-10 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hofBoxCards.map((card) =>
            card.available ? (
              <div
                key={card.id}
                className="group relative rounded-2xl border transition-all duration-300 cursor-pointer hover:border-white/15"
                style={{
                  backgroundColor: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={() => navigate(`/hof-box/${card.slug}`)}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(232,129,58,0.06) 0%, transparent 70%)',
                  }}
                />

                <div className="relative p-6 flex flex-col h-full min-h-[220px]">
                  {/* Number */}
                  <span
                    className="text-xs font-bold tracking-widest mb-4 block"
                    style={{ color: '#E8813A60' }}
                  >
                    #{String(card.id).padStart(2, '0')}
                  </span>

                  {/* Category */}
                  {card.category && (
                    <span
                      className={`inline-flex self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${
                        categoryColors[card.category] ?? 'bg-white/5 text-white/40 border-white/10'
                      }`}
                    >
                      {card.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-white font-bold text-[17px] leading-snug mb-2">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/40 text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>

                  {/* CTA */}
                  <button
                    className="mt-5 flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: '#E8813A' }}
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
                className="rounded-2xl flex flex-col items-center justify-center min-h-[220px] border"
                style={{
                  backgroundColor: '#0E0E10',
                  border: '1px dashed rgba(255,255,255,0.07)',
                }}
              >
                <Clock className="w-6 h-6 text-white/15 mb-3" />
                <span className="text-white/20 text-sm font-medium">Em breve</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HofBox;
