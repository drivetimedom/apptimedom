import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, Check } from 'lucide-react';
import { ebooks, EbookBlock } from '@/data/hofBoxData';

// ─── Checklist state (persisted per ebook) ───────────────────────────────────

function useChecklist(ebookSlug: string, listId: string, items: string[]) {
  const storageKey = `hofbox_checklist_${ebookSlug}_${listId}`;
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: boolean[] = JSON.parse(stored);
        if (parsed.length === items.length) return parsed;
      }
    } catch {}
    return items.map(() => false);
  });

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { checked, toggle };
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function SectionBlock({ block }: { block: Extract<EbookBlock, { type: 'section' }> }) {
  return (
    <div className="mt-12 mb-6 flex items-start gap-4">
      <span
        className="text-5xl font-black leading-none select-none text-muted-foreground/30"
        style={{ minWidth: '56px' }}
      >
        {String(block.number).padStart(2, '0')}
      </span>
      <h2 className="text-2xl font-bold text-foreground leading-snug pt-1">{block.title}</h2>
    </div>
  );
}

function ParagraphBlock({ block }: { block: Extract<EbookBlock, { type: 'paragraph' }> }) {
  return <p className="text-muted-foreground leading-relaxed mb-5">{block.text}</p>;
}

function CalloutBlock({ block }: { block: Extract<EbookBlock, { type: 'callout' }> }) {
  return (
    <div className="my-6 pl-5 py-4 pr-5 rounded-r-xl border-l-4 border-primary bg-accent/40">
      <p className="text-foreground font-medium leading-relaxed">{block.text}</p>
    </div>
  );
}

function PillarGrid({ block }: { block: Extract<EbookBlock, { type: 'pillar-grid' }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      {block.pillars.map((p, i) => (
        <div
          key={i}
          className="rounded-xl p-5 border border-border bg-card shadow-elegant"
        >
          <div className="text-xs font-bold tracking-widest mb-2 text-muted-foreground">
            PILAR {i + 1}
          </div>
          <h4 className="font-bold text-foreground mb-2">{p.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
        </div>
      ))}
    </div>
  );
}

function ChecklistBlock({
  block,
  ebookSlug,
}: {
  block: Extract<EbookBlock, { type: 'checklist' }>;
  ebookSlug: string;
}) {
  const { checked, toggle } = useChecklist(ebookSlug, block.id, block.items);
  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="px-5 py-3 flex items-center justify-between bg-accent border-b border-border">
        <span className="text-sm font-bold tracking-wide text-foreground">Checklist</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {doneCount}/{block.items.length} concluídos
        </span>
      </div>
      <ul className="divide-y divide-border">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-hover transition-colors">
            <button
              onClick={() => toggle(i)}
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                checked[i]
                  ? 'border-primary bg-primary'
                  : 'border-border bg-transparent'
              }`}
              aria-label={checked[i] ? 'Desmarcar item' : 'Marcar item'}
            >
              {checked[i] && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </button>
            <span
              className={`text-sm leading-relaxed transition-colors ${
                checked[i] ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TableBlock({ block }: { block: Extract<EbookBlock, { type: 'table' }> }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-accent">
            {block.headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-foreground font-semibold text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {block.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-card' : 'bg-surface-elevated'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-muted-foreground leading-snug">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhaseBlock({ block }: { block: Extract<EbookBlock, { type: 'phase' }> }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border">
      <div className="px-5 py-3 bg-accent border-b border-border">
        <span className="text-sm font-bold text-foreground">{block.title}</span>
      </div>
      <div className="px-5 py-4 bg-card">
        <p className="text-sm text-muted-foreground leading-relaxed">{block.body}</p>
      </div>
    </div>
  );
}

function ScriptBlock({ block }: { block: Extract<EbookBlock, { type: 'script' }> }) {
  return (
    <div className="my-4 px-5 py-4 rounded-xl border border-border bg-surface-elevated">
      <p className="text-foreground italic leading-relaxed text-sm">{block.text}</p>
    </div>
  );
}

function DialogBlock({ block }: { block: Extract<EbookBlock, { type: 'dialog' }> }) {
  return (
    <div className="my-6 space-y-3">
      {block.exchanges.map((ex, i) => {
        const isYou = ex.speaker === 'Você';
        return (
          <div key={i} className={`flex gap-3 ${isYou ? 'flex-row' : 'flex-row-reverse'}`}>
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isYou
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-foreground border border-border'
              }`}
            >
              {isYou ? 'V' : 'P'}
            </div>
            <div className="max-w-[80%]">
              <div className={`text-[10px] font-semibold mb-1 ${isYou ? 'text-foreground' : 'text-muted-foreground'}`}>
                {ex.speaker}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed text-foreground border border-border ${
                  isYou ? 'bg-accent rounded-br-sm' : 'bg-surface-elevated rounded-bl-sm'
                }`}
              >
                {ex.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProcedureGrid({ block }: { block: Extract<EbookBlock, { type: 'procedure-grid' }> }) {
  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {block.items.map((item, i) => (
        <div key={i} className="rounded-xl p-4 bg-card border border-border">
          <h4 className="font-bold text-foreground text-sm mb-1">{item.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function NumberedList({ block }: { block: Extract<EbookBlock, { type: 'numbered-list' }> }) {
  return (
    <div className="my-4">
      {block.title && (
        <h4 className="font-bold text-foreground mb-3">{block.title}</h4>
      )}
      <ol className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-primary text-primary-foreground">
              {i + 1}
            </span>
            <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function renderBlock(block: EbookBlock, index: number, ebookSlug: string) {
  switch (block.type) {
    case 'section':
      return <SectionBlock key={index} block={block} />;
    case 'paragraph':
      return <ParagraphBlock key={index} block={block} />;
    case 'callout':
      return <CalloutBlock key={index} block={block} />;
    case 'pillar-grid':
      return <PillarGrid key={index} block={block} />;
    case 'checklist':
      return <ChecklistBlock key={index} block={block} ebookSlug={ebookSlug} />;
    case 'table':
      return <TableBlock key={index} block={block} />;
    case 'phase':
      return <PhaseBlock key={index} block={block} />;
    case 'script':
      return <ScriptBlock key={index} block={block} />;
    case 'dialog':
      return <DialogBlock key={index} block={block} />;
    case 'procedure-grid':
      return <ProcedureGrid key={index} block={block} />;
    case 'numbered-list':
      return <NumberedList key={index} block={block} />;
    default:
      return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const HofBoxEbook: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const ebook = slug ? ebooks[slug] : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!ebook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Material não encontrado.</p>
        <button
          onClick={() => navigate('/hof-box')}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          ← Voltar ao HOF BOX
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/hof-box')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          HOF BOX
        </button>
        <span className="text-muted-foreground/40 select-none">/</span>
        <span className="text-foreground text-sm truncate">{ebook.title}</span>
      </div>

      {/* Hero */}
      <section
        className="relative w-full bg-cover bg-center"
        style={{ backgroundImage: `url(/images/banner-secoes.png)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative z-10 container px-4 pt-12 pb-14 md:px-8">
          <div className="max-w-[720px] mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Box className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                {ebook.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
              {ebook.title}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">{ebook.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 py-10 md:px-8">
        <div
          className="max-w-[720px] mx-auto bg-card border border-border rounded-2xl shadow-elegant px-6 py-8 md:px-10 md:py-12"
          style={{ minHeight: '60vh' }}
        >
          {ebook.blocks.map((block, i) => renderBlock(block, i, ebook.slug))}
        </div>
      </div>

      {/* Footer nav */}
      <div className="px-4 pb-16 md:px-8">
        <div className="max-w-[720px] mx-auto">
          <button
            onClick={() => navigate('/hof-box')}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao HOF BOX
          </button>
        </div>
      </div>
    </div>
  );
};

export default HofBoxEbook;
