"use client";

import React from 'react';
import { IndianRupee, FlaskConical, Pill, Stethoscope, Scissors, TrendingDown, ShieldCheck, AlertCircle } from 'lucide-react';
import type { AnalysisResult, CostItem } from '@/app/page';
import { useLanguage } from '@/components/LanguageContext';

interface Props { result: AnalysisResult }

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}

function CostRow({ item, color }: { item: CostItem; color: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#2a2d3e]/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#f1f5f9] text-sm">{item.name}</p>
        {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
        {item.duration && <p className="text-xs text-[#2563eb] mt-0.5">{t.duration} {item.duration}</p>}
        {item.urgency && (
          <span className="text-[10px] bg-[#d97706]/10 text-[#d97706] px-2 py-0.5 rounded mt-1 inline-block">
            {item.urgency}
          </span>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${color}`}>₹{fmt(item.minCost)} – ₹{fmt(item.maxCost)}</p>
        <p className="text-[10px] text-gray-600">min – max</p>
      </div>
    </div>
  );
}

type LucideIcon = React.ElementType;

function Section({
  title, icon: Icon, items, color, emptyMsg
}: {
  title: string;
  icon: LucideIcon;
  items: CostItem[];
  color: string;
  emptyMsg: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="bg-black/20 border border-[#2a2d3e] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2a2d3e] bg-black/20">
        <Icon size={15} className={color} />
        <h3 className="font-bold text-sm text-[#f1f5f9]">{title}</h3>
        <span className="ml-auto text-xs text-gray-500">{items.length} {items.length !== 1 ? t.items : t.item}</span>
      </div>
      <div className="px-5">
        {items.length === 0 ? (
          <p className="text-gray-500 text-xs py-4">{emptyMsg}</p>
        ) : (
          items.map((item, i) => <CostRow key={i} item={item} color={color} />)
        )}
      </div>
    </div>
  );
}

export function CostTab({ result }: Props) {
  const { t } = useLanguage();
  const cost = result.costEstimate;

  if (!cost) {
    return (
      <div className="p-12 text-center text-gray-500">
        <IndianRupee size={40} className="mx-auto mb-3 opacity-30" />
        <p>{t.costNotAvailable}</p>
      </div>
    );
  }

  const totalMin = cost.totalEstimateMin || 0;
  const totalMax = cost.totalEstimateMax || 0;

  // Build a visual breakdown bar
  const sections = [
    { label: t.consultations, items: cost.consultations || [], color: '#2563eb' },
    { label: t.diagnosticTests, items: cost.diagnosticTests || [], color: '#d97706' },
    { label: t.medicines, items: cost.medicines || [], color: '#16a34a' },
    { label: t.proceduresSurgeries, items: cost.procedures || [], color: '#dc2626' },
  ];

  const sectionTotals = sections.map(s => ({
    label: s.label,
    color: s.color,
    avg: s.items.reduce((sum, i) => sum + (i.minCost + i.maxCost) / 2, 0)
  }));
  const grandAvg = sectionTotals.reduce((sum, s) => sum + s.avg, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <IndianRupee className="text-[#16a34a]" /> {t.medicalCostEstimator}
        </h2>
        <span className="text-xs bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 px-3 py-1 rounded-full font-semibold">
          {t.indiaSpecific}
        </span>
      </div>

      {/* Total Banner */}
      <div className="bg-gradient-to-r from-[#16a34a]/10 to-[#2563eb]/10 border border-[#16a34a]/20 rounded-2xl p-6">
        <p className="text-sm text-gray-400 mb-1">{t.estimatedTotalCost}</p>
        <p className="text-4xl font-black text-[#f1f5f9]">
          ₹{fmt(totalMin)}
          <span className="text-2xl text-gray-400 mx-2">–</span>
          ₹{fmt(totalMax)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {t.basedOn} <span className="text-[#f1f5f9]">{result.analysis?.conditionsDetected?.map((c: {name: string}) => c.name).join(', ') || 'General evaluation'}</span>
        </p>
      </div>

      {/* Visual Breakdown Bar */}
      {grandAvg > 0 && (
        <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 mb-3">{t.costBreakdown}</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-3">
            {sectionTotals.filter(s => s.avg > 0).map((s, i) => (
              <div
                key={i}
                style={{ width: `${(s.avg / grandAvg) * 100}%`, backgroundColor: s.color }}
                className="h-full transition-all"
                title={`${s.label}: ₹${fmt(s.avg)}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {sectionTotals.filter(s => s.avg > 0).map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label} (₹{fmt(s.avg)} avg)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Ongoing */}
      {cost.monthlyOngoingCost && (
        <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl p-5">
          <p className="text-sm font-bold text-[#2563eb] mb-1 flex items-center gap-2">
            <TrendingDown size={14} /> {t.monthlyOngoingCost}
          </p>
          <p className="text-2xl font-bold text-[#f1f5f9]">
            ₹{fmt(cost.monthlyOngoingCost.min)} – ₹{fmt(cost.monthlyOngoingCost.max)}<span className="text-sm text-gray-400 font-normal">{t.perMonth}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{cost.monthlyOngoingCost.notes}</p>
        </div>
      )}

      {/* Detailed Sections */}
      <Section
        title={t.consultations}
        icon={Stethoscope}
        items={cost.consultations || []}
        color="text-[#2563eb]"
        emptyMsg={t.noConsultations}
      />
      <Section
        title={t.diagnosticTests}
        icon={FlaskConical}
        items={cost.diagnosticTests || []}
        color="text-[#d97706]"
        emptyMsg={t.noTests}
      />
      <Section
        title={t.medicines}
        icon={Pill}
        items={cost.medicines || []}
        color="text-[#16a34a]"
        emptyMsg={t.noMedicines}
      />
      {(cost.procedures || []).length > 0 && (
        <Section
          title={t.proceduresSurgeries}
          icon={Scissors}
          items={cost.procedures}
          color="text-[#dc2626]"
          emptyMsg={t.noProcedures}
        />
      )}

      {/* Money Saving Tips */}
      {(cost.savingTips || []).length > 0 && (
        <div className="bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-xl p-5">
          <h3 className="font-bold text-[#16a34a] flex items-center gap-2 mb-3">
            <TrendingDown size={14} /> {t.moneySavingTips}
          </h3>
          <ul className="space-y-2">
            {cost.savingTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#16a34a] flex-shrink-0 mt-0.5">✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insurance Tips */}
      {(cost.insuranceTips || []).length > 0 && (
        <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl p-5">
          <h3 className="font-bold text-[#2563eb] flex items-center gap-2 mb-3">
            <ShieldCheck size={14} /> {t.insuranceGovSchemes}
          </h3>
          <ul className="space-y-2">
            {cost.insuranceTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#2563eb] flex-shrink-0 mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-black/20 border border-[#2a2d3e] rounded-xl p-4">
        <AlertCircle size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          {cost.disclaimer || "These are estimated costs only. Actual costs depend on city, hospital type, insurance coverage, and doctor fees. Always confirm pricing with your hospital before treatment."}
        </p>
      </div>
    </div>
  );
}
