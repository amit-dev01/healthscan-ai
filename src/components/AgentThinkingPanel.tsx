"use client";

import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
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
      <div className="h-[500px] flex flex-col items-center justify-center border-2 border-foreground text-center p-12 bg-card relative">
        <div className="w-20 h-20 border-2 border-foreground flex items-center justify-center mb-6 bg-background">
          <Stethoscope size={36} strokeWidth={1.5} className="text-foreground" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground uppercase tracking-tight mb-2">{t.readyToAnalyze}</h3>
        <p className="text-mutedForeground font-body max-w-xs">{t.readyHint}</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground p-8 bg-card">
      <h2 className="text-2xl font-display font-black uppercase tracking-tight mb-8 flex items-center gap-3 border-b border-borderLight pb-4 text-foreground">
        <Stethoscope size={24} strokeWidth={1.5} className="text-foreground" />
        {t.thinkingTitle}
      </h2>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.1 }}
            className={`relative flex items-center gap-4 p-4 border transition-colors duration-100 overflow-hidden ${
              step.status === 'running' ? 'border-foreground bg-muted' : 'border-borderLight bg-card'
            }`}
          >
            {step.status === 'running' && (
              <div className="absolute inset-0 texture-diagonal-lines opacity-10 pointer-events-none" />
            )}

            {/* Square badge indicators */}
            <div className={`relative z-10 w-8 h-8 border flex items-center justify-center font-mono text-xs font-bold transition-colors duration-100 ${
              step.status === 'complete' ? 'bg-foreground text-background border-foreground' :
              step.status === 'running'  ? 'bg-card text-foreground border-foreground animate-pulse' :
              step.status === 'failed'   ? 'bg-foreground text-background border-foreground' :
              'bg-card text-mutedForeground border-borderLight'
            }`}>
              {step.status === 'complete' && '✓'}
              {step.status === 'running'  && '...'}
              {step.status === 'failed'   && '✗'}
              {step.status === 'pending'  && '-'}
            </div>

            <div className="z-10 flex-1">
              <p className={`font-display font-bold uppercase tracking-tight text-sm ${step.status === 'pending' ? 'text-mutedForeground' : 'text-foreground'}`}>
                {step.displayName}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5 text-mutedForeground">
                {step.status === 'running'  ? t.processing :
                 step.status === 'complete' ? t.done :
                 step.status === 'failed'   ? t.failed : t.waiting}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {isAnalyzing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center font-mono text-xs uppercase tracking-widest text-mutedForeground mt-8"
        >
          {t.geminiReading}
        </motion.p>
      )}
    </div>
  );
}
