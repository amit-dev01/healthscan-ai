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
    <div className="flex items-start justify-between gap-4 py-4 border-b border-borderLight last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold uppercase tracking-tight text-foreground text-sm">{item.name}</p>
        {item.notes && <p className="text-xs text-mutedForeground mt-1 font-body">{item.notes}</p>}
        {item.duration && <p className="text-xs font-mono uppercase tracking-widest text-foreground mt-1">{t.duration} {item.duration}</p>}
        {item.urgency && (
          <span className="text-[9px] font-mono uppercase tracking-wider bg-muted border border-borderLight text-foreground px-2 py-0.5 mt-2 inline-block">
            {item.urgency}
          </span>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono font-bold text-sm text-foreground">₹{fmt(item.minCost)} – ₹{fmt(item.maxCost)}</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-mutedForeground">min – max</p>
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
    <div className="border-2 border-foreground bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground bg-muted">
        <Icon size={16} strokeWidth={1.5} className="text-foreground" />
        <h3 className="font-display font-bold uppercase tracking-tight text-sm text-foreground">{title}</h3>
        <span className="ml-auto font-mono text-xs text-mutedForeground">{items.length} {items.length !== 1 ? t.items : t.item}</span>
      </div>
      <div className="px-5">
        {items.length === 0 ? (
          <p className="text-mutedForeground text-xs py-6 font-body italic">{emptyMsg}</p>
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
      <div className="p-16 text-center text-mutedForeground bg-card border-2 border-foreground">
        <IndianRupee size={36} strokeWidth={1.5} className="mx-auto mb-4 opacity-30 text-foreground" />
        <p className="font-body italic text-sm">{t.costNotAvailable}</p>
      </div>
    );
  }

  const totalMin = cost.totalEstimateMin || 0;
  const totalMax = cost.totalEstimateMax || 0;

  // Monochrome colors mapped to treatments
  const sections = [
    { label: t.consultations, items: cost.consultations || [], color: '#000000' }, // Pure black
    { label: t.diagnosticTests, items: cost.diagnosticTests || [], color: '#525252' }, // Dark gray
    { label: t.medicines, items: cost.medicines || [], color: '#A3A3A3' }, // Medium gray
    { label: t.proceduresSurgeries, items: cost.procedures || [], color: '#E5E5E5' }, // Light gray
  ];

  const sectionTotals = sections.map(s => ({
    label: s.label,
    color: s.color,
    avg: s.items.reduce((sum, i) => sum + (i.minCost + i.maxCost) / 2, 0)
  }));
  const grandAvg = sectionTotals.reduce((sum, s) => sum + s.avg, 0) || 1;

  return (
    <div className="p-8 space-y-10 bg-background text-foreground font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-borderLight pb-4">
        <h2 className="text-xl font-display font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
          <IndianRupee size={22} strokeWidth={1.5} className="text-foreground" /> {t.medicalCostEstimator}
        </h2>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-foreground text-background px-3 py-1.5 border border-foreground">
          {t.indiaSpecific}
        </span>
      </div>

      {/* Total Banner */}
      <div className="border-2 border-foreground p-8 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 texture-vertical-lines-inverted opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/80 mb-1">{t.estimatedTotalCost}</p>
          <p className="text-4xl md:text-5xl font-display font-black text-background">
            ₹{fmt(totalMin)}
            <span className="text-2xl text-background/60 mx-2">–</span>
            ₹{fmt(totalMax)}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-background/70 mt-3 pt-3 border-t border-background/20">
            {t.basedOn} <span className="underline font-bold text-background">{result.analysis?.conditionsDetected?.map((c: {name: string}) => c.name).join(', ') || 'General evaluation'}</span>
          </p>
        </div>
      </div>

      {/* Visual Breakdown Bar (Monochrome) */}
      {grandAvg > 0 && (
        <div className="border-2 border-foreground p-6 bg-card">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-mutedForeground mb-4">{t.costBreakdown}</p>
          <div className="flex h-5 border border-foreground overflow-hidden mb-4">
            {sectionTotals.filter(s => s.avg > 0).map((s, i) => (
              <div
                key={i}
                style={{ width: `${(s.avg / grandAvg) * 100}%`, backgroundColor: s.color }}
                className="h-full transition-all"
                title={`${s.label}: ₹${fmt(s.avg)}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {sectionTotals.filter(s => s.avg > 0).map((s, i) => (
              <div key={i} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-mutedForeground">
                <div className="w-3 h-3 border border-foreground" style={{ backgroundColor: s.color }} />
                <span>{s.label} (₹{fmt(s.avg)} avg)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Ongoing - Elevated Pricing Tier layout */}
      {cost.monthlyOngoingCost && (
        <div className="border-4 border-foreground bg-foreground text-background p-8 relative my-8 md:scale-105 z-10 transition-transform duration-100 hover:scale-105 select-none">
          <div className="absolute inset-0 texture-vertical-lines-inverted opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <p className="font-mono text-xs font-black uppercase tracking-widest text-background/90 mb-2 flex items-center gap-2 border-b border-background/25 pb-2">
              <TrendingDown size={14} strokeWidth={1.5} /> {t.monthlyOngoingCost}
            </p>
            <p className="text-4xl font-display font-black text-background">
              ₹{fmt(cost.monthlyOngoingCost.min)} – ₹{fmt(cost.monthlyOngoingCost.max)}
              <span className="text-sm font-mono uppercase tracking-widest font-normal text-background/70 ml-2">{t.perMonth}</span>
            </p>
            <p className="text-xs font-body text-background/80 mt-3 leading-relaxed">{cost.monthlyOngoingCost.notes}</p>
          </div>
        </div>
      )}

      {/* Detailed Sections */}
      <div className="space-y-6">
        <Section
          title={t.consultations}
          icon={Stethoscope}
          items={cost.consultations || []}
          color="text-foreground"
          emptyMsg={t.noConsultations}
        />
        <Section
          title={t.diagnosticTests}
          icon={FlaskConical}
          items={cost.diagnosticTests || []}
          color="text-foreground"
          emptyMsg={t.noTests}
        />
        <Section
          title={t.medicines}
          icon={Pill}
          items={cost.medicines || []}
          color="text-foreground"
          emptyMsg={t.noMedicines}
        />
        {(cost.procedures || []).length > 0 && (
          <Section
            title={t.proceduresSurgeries}
            icon={Scissors}
            items={cost.procedures}
            color="text-foreground"
            emptyMsg={t.noProcedures}
          />
        )}
      </div>

      {/* Saving and Insurance side-by-side columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-borderLight pt-8">
        {/* Money Saving Tips */}
        {(cost.savingTips || []).length > 0 && (
          <div className="border border-borderLight p-6 bg-card">
            <h3 className="font-display font-bold text-sm uppercase tracking-tight flex items-center gap-2 text-foreground mb-4">
              <TrendingDown size={16} strokeWidth={1.5} className="text-foreground" /> {t.moneySavingTips}
            </h3>
            <ul className="space-y-3 font-body text-xs text-foreground/90 leading-relaxed">
              {cost.savingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0 mt-0.5">✓</span> <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insurance Tips */}
        {(cost.insuranceTips || []).length > 0 && (
          <div className="border border-borderLight p-6 bg-card">
            <h3 className="font-display font-bold text-sm uppercase tracking-tight flex items-center gap-2 text-foreground mb-4">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-foreground" /> {t.insuranceGovSchemes}
            </h3>
            <ul className="space-y-3 font-body text-xs text-foreground/90 leading-relaxed">
              {cost.insuranceTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0 mt-0.5">•</span> <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 border border-borderLight bg-muted p-4">
        <AlertCircle size={16} strokeWidth={1.5} className="text-mutedForeground flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[9px] uppercase tracking-wider text-mutedForeground">
          {cost.disclaimer || "These are estimated costs only. Actual costs depend on city, hospital type, insurance coverage, and doctor fees. Always confirm pricing with your hospital before treatment."}
        </p>
      </div>
    </div>
  );
}

