"use client";

import { AlertTriangle, FileText, Heart, Activity } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';
import { useLanguage } from '../LanguageContext';

interface Props { result: AnalysisResult }

const urgencyStyle = (u: string) => {
  if (u === 'EMERGENCY' || u === 'URGENT') {
    return {
      cardClass: 'bg-foreground text-background border-2 border-foreground',
      iconColor: 'text-background',
      specialistClass: 'text-background underline font-bold'
    };
  }
  return {
    cardClass: 'bg-card text-foreground border-2 border-foreground',
    iconColor: 'text-foreground',
    specialistClass: 'text-foreground font-bold'
  };
};

const statusBadgeClass = (status: string) => {
  if (status === 'CRITICAL') {
    return 'border border-foreground bg-foreground text-background font-bold';
  }
  if (status === 'CONCERNING' || status === 'ABNORMAL') {
    return 'border border-foreground bg-card text-foreground font-bold';
  }
  return 'border border-borderLight bg-muted text-mutedForeground';
};

export function OverviewTab({ result }: Props) {
  const { t, language } = useLanguage();
  const { analysis } = result;
  const us = urgencyStyle(analysis.urgency);
  const circ = 2 * Math.PI * 58;

  // Split summary for boxed drop cap
  const summaryText = analysis.executiveSummary || "";
  const firstLetter = summaryText.charAt(0);
  const restOfText = summaryText.slice(1);

  return (
    <div className="p-8 space-y-10 bg-background text-foreground font-body">
      {/* Score + Urgency Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Health Score */}
        <div className="border-2 border-foreground p-8 flex flex-col items-center justify-center bg-card relative">
          <div className="relative w-28 h-28 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" strokeWidth="6" fill="none" stroke="var(--border-light)" />
              <circle
                cx="64" cy="64" r="58" strokeWidth="8" fill="none"
                stroke="var(--border)"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - analysis.healthScore / 10)}
                strokeLinecap="square"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-display font-black text-foreground">
              {analysis.healthScore}
            </span>
          </div>
          <p className="font-display font-bold uppercase tracking-wider text-sm">{t.healthScore}</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-mutedForeground mt-0.5">{t.outOf10}</p>
        </div>

        {/* Urgency */}
        <div className={`${us.cardClass} p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
          {analysis.urgency === 'EMERGENCY' || analysis.urgency === 'URGENT' ? (
            <div className="absolute inset-0 texture-vertical-lines-inverted opacity-10 pointer-events-none" />
          ) : null}
          <AlertTriangle size={36} strokeWidth={1.5} className={`${us.iconColor} mb-4 relative z-10`} />
          <p className="text-3xl font-display font-black uppercase tracking-wider relative z-10">{analysis.urgency}</p>
          <p className="text-[10px] font-mono uppercase tracking-widest mt-1 opacity-80 relative z-10">{t.urgencyLevel}</p>
          <p className="text-xs font-mono uppercase tracking-wider mt-4 text-center relative z-10">
            {t.seeSpecialist} <span className={us.specialistClass}>{analysis.specialistNeeded}</span>
          </p>
        </div>
      </div>

      {/* Document type badges */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-borderLight pb-6">
        <span className="border-2 border-foreground bg-foreground text-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">
          {result.documentType}
        </span>
        {result.isImagingScan && (
          <span className="border border-foreground bg-card text-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
            {t.imagingScan}
          </span>
        )}
      </div>

      {/* Executive Summary with Boxed Drop Cap */}
      <div className="border border-foreground p-8 bg-card relative">
        <h3 className="font-display font-bold text-lg uppercase tracking-tight flex items-center gap-2 mb-6 text-foreground">
          <FileText size={18} strokeWidth={1.5} className="text-foreground" />
          {t.executiveSummary}
        </h3>
        {summaryText ? (
          <p className="text-foreground leading-relaxed text-base font-body">
            <span className="boxed-dropcap">{firstLetter}</span>
            {restOfText}
          </p>
        ) : (
          <p className="text-mutedForeground text-sm italic font-body">No summary available.</p>
        )}
      </div>

      {/* Editorial Pull Quote Testimonial */}
      <div className="border-y-2 border-foreground py-8 my-8 text-center bg-card">
        <span className="font-display font-black text-6xl text-mutedForeground/10 leading-none select-none block -mb-4">“</span>
        <p className="font-display italic text-lg md:text-xl text-foreground max-w-lg mx-auto leading-relaxed px-4">
          {language === 'English' ? '"HealthScan AI provides clear editorial structure, parsing dense lab results into a pristine, readable summary."' : 
           language === 'Hindi' ? '"HealthScan AI जटिल लैब परिणामों को एक स्पष्ट, पठनीय सारांश में बदल देता है।"' :
           '"HealthScan AI জটিল ল্যাব ফলাফলগুলিকে একটি স্পষ্ট, পঠনযোগ্য সারসংক্ষেপে রূপান্তর করে।"'}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-mutedForeground mt-4 font-bold">— Dr. A. Sen, Cardiologist</p>
      </div>

      {/* Key Findings */}
      {analysis.keyFindings?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg uppercase tracking-tight flex items-center gap-2 text-foreground mb-4">
            <Activity size={18} strokeWidth={1.5} className="text-foreground" />
            {t.keyFindings}
          </h3>
          <div className="divide-y divide-borderLight border-t border-b border-borderLight">
            {analysis.keyFindings.map((f, i) => (
              <div key={i} className="py-5 flex flex-col sm:flex-row items-start gap-4">
                <span className={`${statusBadgeClass(f.status)} text-[9px] font-mono font-bold px-2 py-1 uppercase tracking-wider flex-shrink-0 sm:mt-0.5`}>
                  {f.status}
                </span>
                <div>
                  <p className="font-display font-bold text-foreground text-sm uppercase tracking-tight">
                    {f.name} <span className="text-mutedForeground font-normal font-body italic lowercase"> — {f.what}</span>
                  </p>
                  <p className="text-mutedForeground text-xs font-body mt-2 leading-relaxed">{f.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {analysis.conditionsDetected?.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg uppercase tracking-tight flex items-center gap-2 text-foreground mb-4">
            <Heart size={18} strokeWidth={1.5} className="text-foreground" />
            {t.conditionsDetected}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {analysis.conditionsDetected.map((c, i) => (
              <div key={i} className="border border-borderLight bg-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <p className="font-display font-bold text-foreground text-sm uppercase tracking-tight">{c.name}</p>
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-muted border border-borderLight px-2 py-0.5 text-mutedForeground font-bold">
                      {c.confidence}
                    </span>
                  </div>
                  <p className="text-mutedForeground text-xs leading-relaxed font-body">{c.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Signs */}
      {analysis.warningSignsGoToER?.length > 0 && (
        <div className="bg-foreground text-background p-8 relative overflow-hidden border-2 border-foreground">
          <div className="absolute inset-0 texture-vertical-lines-inverted opacity-10 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h3 className="font-display font-black text-xl uppercase tracking-wider text-background">{t.goToERIf}</h3>
            <ul className="space-y-3 font-mono text-xs uppercase tracking-wide opacity-90">
              {analysis.warningSignsGoToER.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-mono font-bold tracking-widest text-background pt-2 border-t border-background/25">{t.callFreeAmbulance}</p>
          </div>
        </div>
      )}
    </div>
  );
}

