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
  patientInfo: { name: string; age: string; gender: string; city: string };
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
    <div className="glass-card overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-[#2a2d3e] overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
              activeTab === id
                ? 'border-[#2563eb] text-[#2563eb] bg-[#2563eb]/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'report'   && <ReportTab result={result} patientInfo={patientInfo} />}
        {activeTab === 'images'   && <ImagesTab result={result} preview={preview} />}
        {activeTab === 'cost'     && <CostTab result={result} />}
        {activeTab === 'clinics'  && <ClinicsTab result={result} city={patientInfo.city} />}
        {activeTab === 'whatsapp' && <WhatsAppTab result={result} />}
      </div>
    </div>
  );
}
