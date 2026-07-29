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
    <div className="flex items-center gap-2 p-1 border border-border bg-card font-mono text-xs">
      <span className="text-mutedForeground px-1 font-bold uppercase tracking-wider">{t.selectLanguage}:</span>
      <div className="flex items-center gap-1">
        {LANGS.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            title={code}
            className={`px-2.5 py-1.5 font-bold transition-colors duration-100 ${
              language === code
                ? 'bg-foreground text-background'
                : 'text-foreground hover:bg-muted border border-transparent'
            }`}
          >
            {flag} {label}
          </button>
        ))}
      </div>
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
    <main className="min-h-screen pb-32 bg-background text-foreground font-body">
      <Toaster position="top-right" />

      {/* Emergency Banner */}
      <AnimatePresence>
        {result?.analysis?.isEmergency && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-foreground text-background py-4 px-6 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-[100] border-b-4 border-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 texture-vertical-lines-inverted pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <AlertCircle size={28} strokeWidth={1.5} className="animate-pulse" />
              <div>
                <p className="font-display font-black text-xl uppercase tracking-wider">{t.emergencyTitle}</p>
                <p className="text-xs font-mono uppercase tracking-wide opacity-90">{result.analysis.emergencyReason || t.emergencyDefault}</p>
              </div>
            </div>
            <a href="tel:108" className="mt-4 sm:mt-0 relative z-10 bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-black transition-colors duration-100">
              {t.callAmbulance}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="py-24 px-6 text-center relative max-w-6xl mx-auto">
        {/* Language Switcher — top right */}
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-4 py-2 border border-foreground mb-8 bg-card">
          <Activity size={16} strokeWidth={1.5} />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">{t.poweredBy}</span>
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-none uppercase mb-6 selection:bg-foreground selection:text-background">
          {t.title} <span className="italic block md:inline font-light text-mutedForeground">AI</span>
        </h1>
        
        <p className="font-body text-lg md:text-xl text-mutedForeground max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* Hero Decorative Divider */}
        <div className="relative max-w-lg mx-auto mt-16 mb-20 flex justify-center items-center">
          <div className="w-full border-t-2 border-foreground" />
          <div className="absolute w-4 h-4 bg-foreground rotate-45 border-2 border-background" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-2 border-foreground p-8 space-y-6 bg-card relative">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight border-b border-borderLight pb-4 mb-2">{t.patientDetails}</h2>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-mutedForeground mb-1">{t.fullName}</label>
              <input type="text" className="w-full bg-background border-b-2 border-foreground py-3 px-1 text-base outline-none focus:border-b-[4px] transition-all" placeholder={t.fullNamePlaceholder}
                value={patientInfo.name} onChange={e => setPatientInfo({ ...patientInfo, name: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-mutedForeground mb-1">{t.age}</label>
                <input type="number" className="w-full bg-background border-b-2 border-foreground py-3 px-1 text-base outline-none focus:border-b-[4px] transition-all" placeholder={t.agePlaceholder}
                  value={patientInfo.age} onChange={e => setPatientInfo({ ...patientInfo, age: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-mutedForeground mb-1">{t.gender}</label>
                <select className="w-full bg-background border-b-2 border-foreground py-3 px-1 text-base outline-none focus:border-b-[4px] transition-all cursor-pointer" value={patientInfo.gender}
                  onChange={e => setPatientInfo({ ...patientInfo, gender: e.target.value })}>
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-mutedForeground mb-1">{t.city}</label>
              <input type="text" className="w-full bg-background border-b-2 border-foreground py-3 px-1 text-base outline-none focus:border-b-[4px] transition-all" placeholder={t.cityPlaceholder}
                value={patientInfo.city} onChange={e => setPatientInfo({ ...patientInfo, city: e.target.value })} />
            </div>
            
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-mutedForeground mb-1">{t.whatsapp}</label>
              <input type="text" className="w-full bg-background border-b-2 border-foreground py-3 px-1 text-base outline-none focus:border-b-[4px] transition-all" placeholder={t.whatsappPlaceholder}
                value={patientInfo.whatsapp} onChange={e => setPatientInfo({ ...patientInfo, whatsapp: e.target.value })} />
            </div>

            {/* Drop Zone */}
            <div {...getRootProps()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-100 ${isDragActive ? 'border-foreground bg-muted' : 'border-borderLight hover:border-foreground hover:bg-muted'} group`}>
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto object-contain" />
                  <div className="absolute inset-0 bg-foreground/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-100">
                    <p className="text-background text-xs font-mono uppercase tracking-wider font-bold">{t.clickToChange}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-14 h-14 border border-foreground flex items-center justify-center mx-auto group-hover:bg-foreground group-hover:text-background transition-colors duration-100">
                    <Upload size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{t.dropFile}</p>
                    <p className="text-xs text-mutedForeground mt-1 font-mono uppercase tracking-wider">{t.dropFileHint}</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleAnalyze} disabled={isAnalyzing || !file}
              className={`w-full py-5 border-2 border-foreground font-mono uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-3 transition-colors duration-100 cursor-pointer ${isAnalyzing || !file ? 'bg-muted border-borderLight text-mutedForeground cursor-not-allowed' : 'bg-foreground text-background hover:bg-background hover:text-foreground'}`}>
              {isAnalyzing ? <><Loader2 className="animate-spin" size={16} strokeWidth={1.5} /> {t.analyzing}</> : <><Activity size={16} strokeWidth={1.5} /> {t.runAnalysis} →</>}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7">
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
