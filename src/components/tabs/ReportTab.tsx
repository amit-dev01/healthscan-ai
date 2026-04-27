"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckSquare } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';
import { useLanguage } from '../LanguageContext';

interface Props {
  result: AnalysisResult;
  patientInfo: { name: string; age: string; gender: string; city: string };
}

export function ReportTab({ result }: Props) {
  const { t } = useLanguage();
  const { analysis } = result;

  const handleDownload = () => {
    const blob = new Blob([result.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'healthscan-report.md';
    a.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#f1f5f9]">{t.fullMedicalReport}</h2>
        <button onClick={handleDownload}
          className="text-sm bg-[#2563eb] hover:bg-[#2563eb]/80 text-white px-4 py-2 rounded-lg transition-all">
          {t.download}
        </button>
      </div>

      {/* Full Markdown Report */}
      <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-6 prose prose-invert prose-sm max-w-none
        prose-headings:text-[#f1f5f9] prose-headings:border-b prose-headings:border-[#2a2d3e] prose-headings:pb-2
        prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-[#f1f5f9]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.report}</ReactMarkdown>
      </div>

      {/* Action Plan */}
      {analysis.actionPlan && (
        <div>
          <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2 mb-4">
            <CheckSquare size={16} className="text-[#2563eb]" /> {t.actionPlan}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t.doToday, items: analysis.actionPlan.today, color: 'text-[#dc2626]', bg: 'border-[#dc2626]/20' },
              { label: t.thisWeek, items: analysis.actionPlan.thisWeek, color: 'text-[#d97706]', bg: 'border-[#d97706]/20' },
              { label: t.thisMonth, items: analysis.actionPlan.thisMonth, color: 'text-[#16a34a]', bg: 'border-[#16a34a]/20' },
            ].map(({ label, items, color, bg }) => (
              <div key={label} className={`bg-black/20 border ${bg} rounded-xl p-5`}>
                <p className={`text-xs font-black tracking-wider mb-4 ${color}`}>{label}</p>
                <ul className="space-y-2">
                  {(items || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className={`mt-0.5 ${color} flex-shrink-0`}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Visit Guide */}
      {analysis.doctorVisitGuide && (
        <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-6">
          <h3 className="font-bold text-[#f1f5f9] mb-4">{t.doctorVisitGuide}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">{t.see} <span className="font-bold text-[#f1f5f9]">{analysis.doctorVisitGuide.specialist}</span> ({analysis.doctorVisitGuide.urgency})</p>
              <p className="text-xs font-semibold text-gray-400 mb-2">{t.bringToAppointment}</p>
              <ul className="space-y-1">
                {analysis.doctorVisitGuide.bringToAppointment?.map((item, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-center gap-1"><span className="text-[#2563eb]">•</span> {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">{t.questionsToAsk}</p>
              <ul className="space-y-1">
                {analysis.doctorVisitGuide.questionsToAsk?.map((q, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-1"><span className="text-[#2563eb] flex-shrink-0">?</span> {q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
