"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Activity, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { AgentThinkingPanel } from '@/components/AgentThinkingPanel';
import { ResultTabs } from '@/components/ResultTabs';
import { AskAIChat } from '@/components/AskAIChat';
import { LanguageProvider, useLanguage, type Language } from '@/components/LanguageContext';

export interface ToolStep {
  id: string;
  displayName: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
}

export interface Clinic {
  name: string;
  address: string;
  rating: number;
  phone: string;
  open_now: boolean | null;
  place_id: string;
  mapsUrl: string;
}

export interface ImagingRegion {
  region: string;
  finding: string;
  severity: 'CRITICAL' | 'ABNORMAL' | 'MONITOR' | 'NORMAL';
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface CostItem {
  name: string;
  minCost: number;
  maxCost: number;
  notes?: string;
  urgency?: string;
  duration?: string;
}

export interface CostEstimate {
  totalEstimateMin: number;
  totalEstimateMax: number;
  currency: string;
  disclaimer: string;
  consultations: CostItem[];
  diagnosticTests: CostItem[];
  medicines: CostItem[];
  procedures: CostItem[];
  monthlyOngoingCost: { min: number; max: number; notes: string };
  insuranceTips: string[];
  savingTips: string[];
}

export interface AnalysisResult {
  documentType: string;
  isImagingScan: boolean;
  imagingRegions: ImagingRegion[];
  analysis: {
    healthScore: number;
    urgency: 'NORMAL' | 'MONITOR' | 'CONSULT' | 'URGENT' | 'EMERGENCY';
    isEmergency: boolean;
    emergencyReason?: string;
    specialistNeeded: string;
    executiveSummary: string;
    keyFindings: { name: string; what: string; status: string; explanation: string }[];
    conditionsDetected: { name: string; confidence: string; explanation: string }[];
    actionPlan: { today: string[]; thisWeek: string[]; thisMonth: string[] };
    doctorVisitGuide: { specialist: string; urgency: string; bringToAppointment: string[]; questionsToAsk: string[] };
    dietAndLifestyle: { eatMore: string[]; avoid: string[]; lifestyleChanges: string[] };
    warningSignsGoToER: string[];
  };
  report: string;
  costEstimate: CostEstimate;
  clinics: Clinic[];
  pharmacy: Clinic | null;
  whatsappStatus: { number: string; sent: boolean; error?: string }[];
  originalImage: string;
}

// Language Switcher Component
function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const LANGS: { code: Language; flag: string; label: string }[] = [
    { code: 'English', flag: '🇬🇧', label: 'EN' },
    { code: 'Hindi',   flag: '🇮🇳', label: 'हि' },
    { code: 'Bengali', flag: '🇧🇩', label: 'বাং' },
  ];
  return (
    <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 border border-[#2a2d3e]">
      <span className="text-xs text-gray-500 mr-1">{t.selectLanguage}:</span>
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          title={code}
          className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
            language === code
              ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}

// Inner page that consumes context
function HealthScanInner() {
  const { language, t } = useLanguage();

  const STEPS = [
    { id: 'read',      displayName: t.stepRead,      status: 'pending' as const },
    { id: 'analyze',   displayName: t.stepAnalyze,   status: 'pending' as const },
    { id: 'emergency', displayName: t.stepEmergency, status: 'pending' as const },
    { id: 'clinics',   displayName: t.stepClinics,   status: 'pending' as const },
    { id: 'report',    displayName: t.stepReport,    status: 'pending' as const },
  ];

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState({ name: '', age: '', gender: 'Male', city: '', whatsapp: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<ToolStep[]>(STEPS);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset steps when language changes
  React.useEffect(() => {
    if (!isAnalyzing) {
      setSteps(STEPS.map(s => ({ ...s, status: 'pending' })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false
  });

  const startFakeStepProgression = (currentSteps: ToolStep[]) => {
    const delays = [0, 4000, 9000, 14000, 19000];
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = delays.map((delay, i) =>
      setTimeout(() => {
        setSteps(prev => prev.map((s, idx) => {
          if (idx === i) return { ...s, status: 'running' };
          if (idx < i) return { ...s, status: 'complete' };
          return s;
        }));
      }, delay)
    );
    return currentSteps;
  };

  const handleAnalyze = async () => {
    if (!file || !patientInfo.name || !patientInfo.city) {
      toast.error(t.fillRequired);
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    const freshSteps = STEPS.map(s => ({ ...s, status: 'pending' as const }));
    setSteps(freshSteps);
    startFakeStepProgression(freshSteps);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', patientInfo.name);
      fd.append('age', patientInfo.age);
      fd.append('gender', patientInfo.gender);
      fd.append('city', patientInfo.city);
      fd.append('whatsapp', patientInfo.whatsapp);
      fd.append('language', language);

      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t.analysisFailed);

      stepTimers.current.forEach(clearTimeout);
      setSteps(STEPS.map(s => ({ ...s, status: 'complete' })));

      setResult({ ...data, originalImage: preview || '' });
      toast.success(t.analysisComplete);
    } catch (err: unknown) {
      stepTimers.current.forEach(clearTimeout);
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'failed' } : s));
      const msg = err instanceof Error ? err.message : t.analysisFailed;
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <Toaster position="top-right" />

      {/* Emergency Banner */}
      <AnimatePresence>
        {result?.analysis?.isEmergency && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-[#dc2626] text-white py-3 px-6 flex items-center justify-between sticky top-0 z-[100] shadow-xl"
          >
            <div className="flex items-center gap-4">
              <AlertCircle size={28} className="animate-pulse" />
              <div>
                <p className="font-black text-lg uppercase">{t.emergencyTitle}</p>
                <p className="text-sm opacity-90">{result.analysis.emergencyReason || t.emergencyDefault}</p>
              </div>
            </div>
            <a href="tel:108" className="bg-white text-[#dc2626] px-6 py-2 rounded-full font-black hover:scale-105 transition-all">
              {t.callAmbulance}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="py-10 px-6 text-center relative">
        {/* Language Switcher — top right */}
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 mb-4">
          <Activity size={18} />
          <span className="text-sm font-semibold tracking-wide uppercase">{t.poweredBy}</span>
        </motion.div>
        <h1 className="text-5xl font-black mb-4 tracking-tight text-[#f1f5f9]">
          {t.title} <span className="text-[#2563eb]">AI</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          {t.subtitle}
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-bold border-b border-[#2a2d3e] pb-4">{t.patientDetails}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t.fullName}</label>
              <input type="text" className="w-full p-3 outline-none" placeholder={t.fullNamePlaceholder}
                value={patientInfo.name} onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t.age}</label>
                <input type="number" className="w-full p-3 outline-none" placeholder={t.agePlaceholder}
                  value={patientInfo.age} onChange={e => setPatientInfo({ ...patientInfo, age: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t.gender}</label>
                <select className="w-full p-3 outline-none" value={patientInfo.gender}
                  onChange={e => setPatientInfo({ ...patientInfo, gender: e.target.value })}>
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t.city}</label>
              <input type="text" className="w-full p-3 outline-none" placeholder={t.cityPlaceholder}
                value={patientInfo.city} onChange={e => setPatientInfo({ ...patientInfo, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t.whatsapp}</label>
              <input type="text" className="w-full p-3 outline-none" placeholder={t.whatsappPlaceholder}
                value={patientInfo.whatsapp} onChange={e => setPatientInfo({ ...patientInfo, whatsapp: e.target.value })} />
            </div>

            {/* Drop Zone */}
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-[#2563eb] bg-[#2563eb]/5' : 'border-[#2a2d3e] hover:border-[#2563eb]/40'}`}>
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-all">
                    <p className="text-white text-sm font-semibold">{t.clickToChange}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-[#2563eb]/10 text-[#2563eb] rounded-full flex items-center justify-center mx-auto">
                    <Upload size={28} />
                  </div>
                  <p className="font-semibold text-[#f1f5f9]">{t.dropFile}</p>
                  <p className="text-xs text-gray-500">{t.dropFileHint}</p>
                </div>
              )}
            </div>

            <button onClick={handleAnalyze} disabled={isAnalyzing || !file}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isAnalyzing || !file ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-[#2563eb] hover:bg-[#2563eb]/90 shadow-lg shadow-[#2563eb]/20 text-white'}`}>
              {isAnalyzing ? <><Loader2 className="animate-spin" size={20} /> {t.analyzing}</> : <><Activity size={20} /> {t.runAnalysis}</>}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AgentThinkingPanel steps={steps} isAnalyzing={isAnalyzing} />
              </motion.div>
            )}
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ResultTabs result={result} preview={preview} patientInfo={patientInfo} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating AI Chat — appears when results are ready */}
      {result && <AskAIChat result={result} />}
    </main>
  );
}

export default function HealthScanAI() {
  return (
    <LanguageProvider>
      <HealthScanInner />
    </LanguageProvider>
  );
}
