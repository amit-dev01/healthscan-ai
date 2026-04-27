"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2, Stethoscope, XCircle } from 'lucide-react';
import type { ToolStep } from '@/app/page';
import { useLanguage } from './LanguageContext';

interface Props {
  steps: ToolStep[];
  isAnalyzing: boolean;
}

export function AgentThinkingPanel({ steps, isAnalyzing }: Props) {
  const { t } = useLanguage();
  const hasStarted = steps.some(s => s.status !== 'pending');

  if (!hasStarted && !isAnalyzing) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center glass-card text-center p-12">
        <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
          <Stethoscope size={48} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">{t.readyToAnalyze}</h3>
        <p className="text-gray-500 max-w-xs">{t.readyHint}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#f1f5f9]">
        <Stethoscope className="text-[#2563eb]" />
        {t.thinkingTitle}
      </h2>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-[#2a2d3e]/70 overflow-hidden"
          >
            {step.status === 'running' && (
              <motion.div
                className="absolute inset-0 bg-[#2563eb]/5"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.status === 'complete' ? 'bg-[#16a34a]/20 text-[#16a34a]' :
              step.status === 'running'  ? 'bg-[#2563eb]/20 text-[#2563eb]' :
              step.status === 'failed'   ? 'bg-[#dc2626]/20 text-[#dc2626]' :
              'bg-gray-800 text-gray-600'
            }`}>
              {step.status === 'complete' && <CheckCircle2 size={20} />}
              {step.status === 'running'  && <Loader2 size={20} className="animate-spin" />}
              {step.status === 'failed'   && <XCircle size={20} />}
              {step.status === 'pending'  && <Clock size={20} />}
            </div>

            <div className="z-10 flex-1">
              <p className={`font-semibold ${step.status === 'pending' ? 'text-gray-500' : 'text-[#f1f5f9]'}`}>
                {step.displayName}
              </p>
              <p className="text-xs uppercase tracking-wider mt-0.5 text-gray-500">
                {step.status === 'running'  ? t.processing :
                 step.status === 'complete' ? t.done :
                 step.status === 'failed'   ? t.failed : t.waiting}
              </p>
            </div>

            {step.status === 'complete' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="z-10 text-[#16a34a]">
                <CheckCircle2 size={18} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {isAnalyzing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          {t.geminiReading}
        </motion.p>
      )}
    </div>
  );
}
