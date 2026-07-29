"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import type { AnalysisResult } from '@/app/page';

interface Props {
  result: AnalysisResult;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AskAIChat({ result }: Props) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = [t.askSuggestion1, t.askSuggestion2, t.askSuggestion3];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const context = {
        documentType: result.documentType,
        healthScore: result.analysis?.healthScore,
        urgency: result.analysis?.urgency,
        specialistNeeded: result.analysis?.specialistNeeded,
        executiveSummary: result.analysis?.executiveSummary,
        keyFindings: result.analysis?.keyFindings,
        conditionsDetected: result.analysis?.conditionsDetected,
        actionPlan: result.analysis?.actionPlan,
        doctorVisitGuide: result.analysis?.doctorVisitGuide,
        dietAndLifestyle: result.analysis?.dietAndLifestyle,
        warningSignsGoToER: result.analysis?.warningSignsGoToER,
        costEstimate: {
          totalEstimateMin: result.costEstimate?.totalEstimateMin,
          totalEstimateMax: result.costEstimate?.totalEstimateMax,
        },
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, context, language }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || 'Sorry, I could not answer that. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-foreground text-background border-2 border-foreground px-5 py-3.5 font-mono text-xs uppercase tracking-widest font-black"
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            {t.askAI}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[560px] flex flex-col bg-card border-2 border-foreground"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-muted border-b border-foreground flex-shrink-0">
              <div className="w-8 h-8 border border-foreground flex items-center justify-center flex-shrink-0 bg-background text-foreground">
                <Bot size={16} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground text-sm uppercase tracking-tight leading-tight">{t.askAITitle}</p>
                <p className="font-mono text-[9px] text-mutedForeground uppercase tracking-wider truncate">{t.askAISubtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 border border-borderLight hover:bg-foreground hover:text-background flex items-center justify-center transition-colors duration-100 text-foreground flex-shrink-0"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 bg-background">
              {messages.length === 0 && (
                <div className="space-y-4">
                  {/* Greeting */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 border border-borderLight flex items-center justify-center bg-muted flex-shrink-0 mt-0.5 text-foreground">
                      <Sparkles size={12} strokeWidth={1.5} />
                    </div>
                    <div className="bg-muted border border-borderLight px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm text-foreground leading-relaxed">
                        👋 Hi! I&apos;ve analyzed your <span className="font-bold underline">{result.documentType}</span>. Ask me anything about your results!
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="pt-2 space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="w-full flex items-center justify-between text-left px-4 py-3 border border-borderLight bg-card hover:bg-foreground hover:text-background transition-colors duration-100 font-mono text-[11px] text-foreground tracking-tight group"
                      >
                        <span>{s}</span>
                        <ChevronRight size={12} strokeWidth={1.5} className="flex-shrink-0 group-hover:translate-x-1 transition-transform duration-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-muted text-foreground border-borderLight'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={12} strokeWidth={1.5} />
                      : <Sparkles size={12} strokeWidth={1.5} />
                    }
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-muted border-borderLight text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 border border-borderLight flex items-center justify-center bg-muted flex-shrink-0">
                    <Sparkles size={12} strokeWidth={1.5} />
                  </div>
                  <div className="bg-muted border border-borderLight px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-mutedForeground uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1">{t.askThinking}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Disclaimer */}
            <p className="px-4 pt-2 pb-1 font-mono text-[9px] uppercase tracking-wider text-mutedForeground text-center flex-shrink-0 bg-background">
              {t.askDisclaimer}
            </p>

            {/* Input */}
            <div className="px-3 py-3 border-t border-foreground bg-card flex-shrink-0">
              <div className="flex items-center gap-2 border border-foreground bg-background px-3 py-2 focus-within:border-b-4 focus-within:border-b-foreground transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t.askPlaceholder}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-mutedForeground outline-none min-w-0 border-0 p-0 focus:border-0 focus:border-bottom-0 focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors duration-100"
                >
                  <Send size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

