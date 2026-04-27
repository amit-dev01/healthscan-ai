"use client";

import { AlertTriangle, FileText, Heart, Activity } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';

import { useLanguage } from '../LanguageContext';

interface Props { result: AnalysisResult }

const urgencyColor = (u: string) => {
  if (u === 'EMERGENCY' || u === 'URGENT') return { bg: 'bg-[#dc2626]/20', text: 'text-[#dc2626]', border: 'border-[#dc2626]/30' };
  if (u === 'CONSULT') return { bg: 'bg-[#d97706]/20', text: 'text-[#d97706]', border: 'border-[#d97706]/30' };
  if (u === 'MONITOR') return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
  return { bg: 'bg-[#16a34a]/20', text: 'text-[#16a34a]', border: 'border-[#16a34a]/30' };
};

const scoreColor = (s: number) => s > 7 ? '#16a34a' : s > 4 ? '#d97706' : '#dc2626';

const statusBadge = (status: string) => {
  if (status === 'CRITICAL') return 'bg-[#dc2626]/20 text-[#dc2626]';
  if (status === 'CONCERNING' || status === 'ABNORMAL') return 'bg-[#d97706]/20 text-[#d97706]';
  return 'bg-[#16a34a]/20 text-[#16a34a]';
};

export function OverviewTab({ result }: Props) {
  const { t } = useLanguage();
  const { analysis } = result;
  const uc = urgencyColor(analysis.urgency);
  const circ = 2 * Math.PI * 58;

  return (
    <div className="p-6 space-y-6">
      {/* Score + Urgency Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Health Score */}
        <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" strokeWidth="8" fill="none" stroke="#2a2d3e" />
              <circle
                cx="64" cy="64" r="58" strokeWidth="8" fill="none"
                stroke={scoreColor(analysis.healthScore)}
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - analysis.healthScore / 10)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-[#f1f5f9]">
              {analysis.healthScore}
            </span>
          </div>
          <p className="font-bold text-[#f1f5f9]">{t.healthScore}</p>
          <p className="text-xs text-gray-500">{t.outOf10}</p>
        </div>

        {/* Urgency */}
        <div className={`${uc.bg} border ${uc.border} rounded-xl p-6 flex flex-col items-center justify-center`}>
          <AlertTriangle size={40} className={`${uc.text} mb-3`} />
          <p className={`text-2xl font-black ${uc.text}`}>{analysis.urgency}</p>
          <p className="text-xs text-gray-400 mt-1">{t.urgencyLevel}</p>
          <p className="text-xs text-gray-500 mt-2 text-center">{t.seeSpecialist} <span className="font-semibold text-[#f1f5f9]">{analysis.specialistNeeded}</span></p>
        </div>
      </div>

      {/* Document type badge */}
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 px-3 py-1 rounded-full font-medium">
          {result.documentType}
        </span>
        {result.isImagingScan && (
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
            {t.imagingScan}
          </span>
        )}
      </div>

      {/* Executive Summary */}
      <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-5">
        <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[#2563eb]" /> {t.executiveSummary}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">{analysis.executiveSummary}</p>
      </div>

      {/* Key Findings */}
      {analysis.keyFindings?.length > 0 && (
        <div>
          <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2 mb-3">
            <Activity size={16} className="text-[#2563eb]" /> {t.keyFindings}
          </h3>
          <div className="space-y-2">
            {analysis.keyFindings.map((f, i) => (
              <div key={i} className="bg-black/20 border border-[#2a2d3e] rounded-lg p-4 flex items-start gap-3">
                <span className={`${statusBadge(f.status)} text-xs font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5`}>
                  {f.status}
                </span>
                <div>
                  <p className="font-semibold text-[#f1f5f9] text-sm">{f.name} — <span className="text-gray-300">{f.what}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{f.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {analysis.conditionsDetected?.length > 0 && (
        <div>
          <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2 mb-3">
            <Heart size={16} className="text-[#dc2626]" /> {t.conditionsDetected}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.conditionsDetected.map((c, i) => (
              <div key={i} className="bg-black/20 border border-[#2a2d3e] rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-[#f1f5f9] text-sm">{c.name}</p>
                  <span className="text-[10px] bg-[#d97706]/10 text-[#d97706] px-2 py-0.5 rounded font-bold">{c.confidence}</span>
                </div>
                <p className="text-gray-400 text-xs">{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Signs */}
      {analysis.warningSignsGoToER?.length > 0 && (
        <div className="bg-[#dc2626]/5 border border-[#dc2626]/20 rounded-xl p-5">
          <h3 className="font-bold text-[#dc2626] mb-3">{t.goToERIf}</h3>
          <ul className="space-y-1">
            {analysis.warningSignsGoToER.map((s, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-[#dc2626]">•</span> {s}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#dc2626] font-bold mt-3">{t.callFreeAmbulance}</p>
        </div>
      )}
    </div>
  );
}
