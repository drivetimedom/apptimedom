import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Box } from 'lucide-react';
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

const ORANGE = '#E8813A';

function SectionBlock({ block }: { block: Extract<EbookBlock, { type: 'section' }> }) {
  return (
    <div className="mt-12 mb-6 flex items-start gap-4">
      <span
        className="text-5xl font-black leading-none select-none"
        style={{ color: ORANGE, opacity: 0.25, minWidth: '56px' }}
      >
        {String(block.number).padStart(2, '0')}
      </span>
      <h2 className="text-2xl font-bold text-gray-900 leading-snug pt-1">{block.title}</h2>
    </div>
  );
}

function ParagraphBlock({ block }: { block: Extract<EbookBlock, { type: 'paragraph' }> }) {
  return <p className="text-gray-700 leading-relaxed mb-5">{block.text}</p>;
}

function CalloutBlock({ block }: { block: Extract<EbookBlock, { type: 'callout' }> }) {
  return (
    <div
      className="my-6 pl-5 py-4 pr-5 rounded-r-xl"
      style={{
        borderLeft: `4px solid ${ORANGE}`,
        backgroundColor: '#FFF7F2',
      }}
    >
      <p className="text-gray-800 font-medium leading-relaxed">{block.text}</p>
    </div>
  );
}

function PillarGrid({ block }: { block: Extract<EbookBlock, { type: 'pillar-grid' }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      {block.pillars.map((p, i) => (
        <div
          key={i}
          className="rounded-xl p-5 border"
          style={{ borderColor: '#E8813A20', backgroundColor: '#FFF9F6' }}
        >
          <div
            className="text-xs font-bold tracking-widest mb-2"
            style={{ color: ORANGE }}
          >
            PILAR {i + 1}
          </div>
          <h4 className="font-bold text-gray-900 mb-2">{p.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
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
    <div
      className="my-6 rounded-xl border overflow-hidden"
      style={{ borderColor: '#E8813A20' }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#E8813A', color: '#fff' }}
      >
        <span className="text-sm font-bold tracking-wide">Checklist</span>
        <span className="text-xs font-semibold opacity-80">
          {doneCount}/{block.items.length} concluídos
        </span>
      </div>
      <ul className="divide-y divide-gray-100">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3 bg-white hover:bg-gray-50 transition-colors">
            <button
              onClick={() => toggle(i)}
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: checked[i] ? ORANGE : '#CBD5E1',
                backgroundColor: checked[i] ? ORANGE : 'transparent',
              }}
              aria-label={checked[i] ? 'Desmarcar item' : 'Marcar item'}
            >
              {checked[i] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span
              className="text-sm leading-relaxed transition-colors"
              style={{ color: checked[i] ? '#9CA3AF' : '#374151', textDecoration: checked[i] ? 'line-through' : 'none' }}
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
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: '#1C1C1F' }}>
            {block.headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-white font-semibold text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {block.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-gray-700 leading-snug">
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
    <div className="my-4 rounded-xl overflow-hidden border border-gray-200">
      <div className="px-5 py-3" style={{ backgroundColor: '#1C1C1F' }}>
        <span className="text-sm font-bold text-white">{block.title}</span>
      </div>
      <div className="px-5 py-4 bg-white">
        <p className="text-sm text-gray-700 leading-relaxed">{block.body}</p>
      </div>
    </div>
  );
}

function ScriptBlock({ block }: { block: Extract<EbookBlock, { type: 'script' }> }) {
  return (
    <div
      className="my-4 px-5 py-4 rounded-xl border"
      style={{ backgroundColor: '#F9F6F3', borderColor: '#E8813A30' }}
    >
      <p className="text-gray-800 italic leading-relaxed text-sm">{block.text}</p>
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
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: isYou ? ORANGE : '#3B82F6' }}
            >
              {isYou ? 'V' : 'P'}
            </div>
            <div className="max-w-[80%]">
              <div
                className="text-[10px] font-semibold mb-1"
                style={{ color: isYou ? ORANGE : '#3B82F6' }}
              >
                {ex.speaker}
              </div>
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed text-gray-800"
                style={{
                  backgroundColor: isYou ? '#FFF3EB' : '#EFF6FF',
                  borderBottomLeftRadius: isYou ? undefined : '4px',
                  borderBottomRightRadius: isYou ? '4px' : undefined,
                }}
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
        <div key={i} className="rounded-xl p-4 bg-white border border-gray-100">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function NumberedList({ block }: { block: Extract<EbookBlock, { type: 'numbered-list' }> }) {
  return (
    <div className="my-4">
      {block.title && (
        <h4 className="font-bold text-gray-900 mb-3">{block.title}</h4>
      )}
      <ol className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: ORANGE }}
            >
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{item}</span>
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0B0B0C' }}>
        <p className="text-white/40">Material não encontrado.</p>
        <button
          onClick={() => navigate('/hof-box')}
          className="text-sm font-semibold"
          style={{ color: '#E8813A' }}
        >
          ← Voltar ao HOF BOX
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F4F2' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 border-b border-white/5 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: '#0B0B0C' }}
      >
        <button
          onClick={() => navigate('/hof-box')}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          HOF BOX
        </button>
        <span className="text-white/15 select-none">/</span>
        <span className="text-white/60 text-sm truncate">{ebook.title}</span>
      </div>

      {/* Hero */}
      <div style={{ backgroundColor: '#0B0B0C' }} className="px-4 pt-10 pb-12 md:px-8">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Box className="w-4 h-4" style={{ color: '#E8813A' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8813A' }}>
              {ebook.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
            {ebook.title}
          </h1>
          <p className="text-white/50 text-base leading-relaxed">{ebook.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-10 md:px-8">
        <div
          className="max-w-[720px] mx-auto bg-white rounded-2xl shadow-sm px-6 py-8 md:px-10 md:py-12"
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
            className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: '#E8813A' }}
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
