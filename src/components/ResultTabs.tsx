"use client";

import { useState } from 'react';
import { LayoutDashboard, FileText, Image as ImageIcon, MapPin, MessageSquare, IndianRupee } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';
import { OverviewTab } from './tabs/OverviewTab';
import { ReportTab } from './tabs/ReportTab';
import { ImagesTab } from './tabs/ImagesTab';
import { ClinicsTab } from './tabs/ClinicsTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import { CostTab } from './tabs/CostTab';
import { useLanguage } from './LanguageContext';

interface Props {
  result: AnalysisResult;
  preview: string | null;
  patientInfo: { name: string; age: string; gender: string; city: string; whatsapp?: string };
}

export function ResultTabs({ result, preview, patientInfo }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const TABS = [
    { id: 'overview', label: t.tabOverview,   Icon: LayoutDashboard },
    { id: 'report',   label: t.tabReport,     Icon: FileText },
    { id: 'images',   label: t.tabImages,     Icon: ImageIcon },
    { id: 'cost',     label: t.tabCost,       Icon: IndianRupee },
    { id: 'clinics',  label: t.tabClinics,    Icon: MapPin },
    { id: 'whatsapp', label: t.tabWhatsApp,   Icon: MessageSquare },
  ];

  return (
    <div className="border-2 border-foreground bg-card overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-foreground bg-muted overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-100 border-r border-borderLight flex-shrink-0 ${
              activeTab === id
                ? 'bg-foreground text-background border-r-foreground'
                : 'text-foreground hover:bg-background'
            }`}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px] bg-background">
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'report'   && <ReportTab result={result} patientInfo={patientInfo} />}
        {activeTab === 'images'   && <ImagesTab result={result} preview={preview} />}
        {activeTab === 'cost'     && <CostTab result={result} />}
        {activeTab === 'clinics'  && <ClinicsTab result={result} city={patientInfo.city} />}
        {activeTab === 'whatsapp' && <WhatsAppTab result={result} patientInfo={patientInfo} />}
      </div>
    </div>
  );
}

