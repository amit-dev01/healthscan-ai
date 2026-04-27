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
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-[#2563eb]/40 font-bold text-sm"
          >
            <MessageCircle size={18} className="animate-pulse" />
            {t.askAI}
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute top-2 right-2" />
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
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-[#2a2d3e]"
            style={{ background: 'linear-gradient(145deg, #0f1117 0%, #12151f 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#2563eb]/20 to-[#7c3aed]/20 border-b border-[#2a2d3e] flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#f1f5f9] text-sm leading-tight">{t.askAITitle}</p>
                <p className="text-[10px] text-gray-400 truncate">{t.askAISubtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-white flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="space-y-3">
                  {/* Greeting */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm text-[#f1f5f9] leading-relaxed">
                        👋 Hi! I&apos;ve analyzed your <span className="text-[#2563eb] font-semibold">{result.documentType}</span>. Ask me anything about your results!
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="pt-1 space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl bg-[#1e2130] hover:bg-[#2563eb]/10 border border-[#2a2d3e] hover:border-[#2563eb]/40 text-xs text-gray-300 hover:text-[#f1f5f9] transition-all group"
                      >
                        <ChevronRight size={12} className="text-[#2563eb] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-[#2563eb]'
                      : 'bg-gradient-to-br from-[#2563eb] to-[#7c3aed]'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={12} className="text-white" />
                      : <Sparkles size={12} className="text-white" />
                    }
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2563eb] text-white rounded-tr-sm'
                      : 'bg-[#1e2130] border border-[#2a2d3e] text-[#f1f5f9] rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-gray-500 ml-1">{t.askThinking}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Disclaimer */}
            <p className="px-4 pt-1 pb-0 text-[10px] text-gray-600 text-center flex-shrink-0">
              {t.askDisclaimer}
            </p>

            {/* Input */}
            <div className="px-3 py-3 border-t border-[#2a2d3e] flex-shrink-0">
              <div className="flex items-center gap-2 bg-[#1e2130] border border-[#2a2d3e] rounded-xl px-3 py-2 focus-within:border-[#2563eb]/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t.askPlaceholder}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-[#f1f5f9] placeholder-gray-600 outline-none min-w-0"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#2563eb]/80 transition-all"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
