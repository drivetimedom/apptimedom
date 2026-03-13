import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { useSwipeFileMaterials } from '@/hooks/useSwipeFile';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  materials?: { code: string; why: string }[];
}

const SUGGESTION_CHIPS = [
  "Minha agenda tá vazia",
  "Alto índice de no-show",
  "Paciente perguntou o preço logo",
  "Quero lançar o Clube do Botox",
  "Lead sumiu depois da consulta",
  "Preciso estruturar minha precificação",
];

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Oi! Sou a Maria. Me conta o que tá rolando na sua clínica agora que eu te indico o material certo pra resolver.',
};

const MariaWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setSearchParams] = useSearchParams();
  const { data: allMaterials } = useSwipeFileMaterials();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .filter(m => m !== INITIAL_MESSAGE)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const { data, error } = await supabase.functions.invoke('swipe-file-assistant', {
        body: { message: text, history },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Hmm, algo deu errado aqui. Tenta de novo?',
        materials: data.materials || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Maria error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Eita, deu um problema aqui. Tenta de novo daqui a pouco?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openMaterial = (code: string) => {
    if (!allMaterials) return;
    const material = allMaterials.find(m => m.code === code);
    if (material) {
      setSearchParams({ processo: material.id });
    }
  };

  const showChips = messages.length <= 1 && !isLoading;

  return (
    <>
      {/* Floating pill button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-12 px-4 rounded-full flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: '#4ade80' }}
          aria-label="Falar com a Maria"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: '#000000' }}
          >
            M
          </div>
          <span className="text-sm font-semibold pr-1" style={{ color: '#000000' }}>
            Falar com a Maria
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ backgroundColor: '#4ade80' }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#000' }}>Maria</h3>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>Consultora HOF Circle</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black/60 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto text-black'
                      : 'bg-secondary text-foreground'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#4ade80' } : undefined}
                >
                  {msg.content}
                </div>

                {/* Material cards */}
                {msg.materials && msg.materials.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {msg.materials.map((mat, j) => (
                      <button
                        key={j}
                        onClick={() => openMaterial(mat.code)}
                        className="w-full text-left rounded-lg border border-border bg-background hover:bg-accent p-2.5 transition-colors group"
                      >
                        <span className="text-xs font-mono font-bold" style={{ color: '#4ade80' }}>
                          {mat.code}
                        </span>
                        {allMaterials && (
                          <span className="text-xs font-medium text-foreground ml-2">
                            {allMaterials.find(m => m.code === mat.code)?.title}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{mat.why}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Suggestion chips */}
            {showChips && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-2.5 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: 'rgba(74,222,128,0.4)', color: '#4ade80' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(74,222,128,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Maria tá pensando...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Descreve sua situação..."
              className="text-sm"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default MariaWidget;
