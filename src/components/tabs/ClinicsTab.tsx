"use client";

import { MapPin, Star, Phone, Navigation, Sparkles, Building2, Pill } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';

interface Props { result: AnalysisResult; city: string }

interface ClinicData {
  name: string;
  address: string;
  area?: string;
  rating?: number;
  phone?: string;
  open_now?: boolean | null;
  mapsUrl?: string;
  type?: string;
  geminiSuggested?: boolean;
}

function ClinicCard({ clinic, isPharmacy = false }: { clinic: ClinicData; isPharmacy?: boolean }) {
  return (
    <div className="border-2 border-foreground p-6 bg-card flex flex-col gap-4 transition-colors duration-100 hover:bg-foreground hover:text-background group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-foreground group-hover:text-background text-base transition-colors duration-100 uppercase tracking-tight">{clinic.name}</p>
            {isPharmacy && (
              <span className="text-[9px] font-mono uppercase tracking-widest bg-background border border-foreground text-foreground px-2 py-0.5 flex items-center gap-1 group-hover:bg-background group-hover:text-foreground transition-colors duration-100">
                <Pill size={8} /> Pharmacy
              </span>
            )}
            {clinic.type && !isPharmacy && (
              <span className="text-[9px] font-mono uppercase tracking-widest bg-muted border border-borderLight text-mutedForeground px-2 py-0.5 group-hover:bg-background group-hover:text-foreground group-hover:border-background transition-colors duration-100">
                {clinic.type}
              </span>
            )}
          </div>
          {clinic.area && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground group-hover:text-background/80 mt-1 transition-colors duration-100">{clinic.area}</p>
          )}
          <p className="text-xs font-body text-mutedForeground group-hover:text-background/70 mt-2 flex items-center gap-1.5 transition-colors duration-100">
            <MapPin size={11} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="truncate">{clinic.address}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-foreground group-hover:text-background flex-shrink-0 ml-2 font-mono text-xs font-bold transition-colors duration-100">
          <Star size={12} strokeWidth={1.5} className="fill-current text-foreground group-hover:text-background" />
          <span>{clinic.rating?.toFixed(1) || '4.0'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-mutedForeground group-hover:text-background/70 transition-colors duration-100">
        {clinic.open_now !== null && clinic.open_now !== undefined && (
          <span className={clinic.open_now ? 'font-bold text-foreground group-hover:text-background' : 'line-through'}>
            {clinic.open_now ? 'Open Now' : 'Closed'}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Phone size={10} strokeWidth={1.5} /> {clinic.phone || 'G-Maps Search'}
        </span>
        {clinic.geminiSuggested && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-foreground group-hover:text-background">
            <Sparkles size={9} strokeWidth={1.5} /> AI Suggested
          </span>
        )}
      </div>

      <a
        href={clinic.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 py-3 border border-foreground bg-background text-foreground font-mono text-xs uppercase tracking-widest font-black transition-colors duration-100 group-hover:bg-background group-hover:text-foreground group-hover:border-background"
      >
        <Navigation size={12} strokeWidth={1.5} /> Directions on Maps
      </a>
    </div>
  );
}

export function ClinicsTab({ result, city }: Props) {
  const hasGeminiClinics = (result.clinics as ClinicData[])?.some((c) => c.geminiSuggested);

  return (
    <div className="p-8 space-y-8 bg-background text-foreground font-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-borderLight pb-4">
        <div>
          <h2 className="text-xl font-display font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Building2 size={20} strokeWidth={1.5} className="text-foreground" /> Hospitals & Clinics in {city}
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-mutedForeground mt-1">
            Recommended Specialist: <span className="font-bold underline text-foreground">{result.analysis?.specialistNeeded}</span>
          </p>
        </div>
        {hasGeminiClinics && (
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest bg-foreground text-background px-3 py-1.5 border border-foreground flex-shrink-0">
            <Sparkles size={12} strokeWidth={1.5} /> Powered by Gemini
          </span>
        )}
      </div>

      {(result.clinics as ClinicData[])?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(result.clinics as ClinicData[]).map((clinic, i) => (
            <ClinicCard key={i} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-mutedForeground border-2 border-foreground bg-card">
          <MapPin size={36} strokeWidth={1.5} className="mx-auto mb-4 opacity-30 text-foreground" />
          <p className="font-body italic text-sm">No clinics found for this city.</p>
        </div>
      )}

      {result.pharmacy && (
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h3 className="font-display font-bold text-sm uppercase tracking-tight flex items-center gap-2 text-foreground">
            <Pill size={16} strokeWidth={1.5} className="text-foreground" /> Nearest Pharmacy
          </h3>
          <ClinicCard clinic={result.pharmacy as ClinicData} isPharmacy />
        </div>
      )}

      {/* Disclaimer */}
      <div className="border border-borderLight bg-muted p-4">
        <p className="font-mono text-[9px] uppercase tracking-wider text-mutedForeground flex items-start gap-2">
          <Sparkles size={12} strokeWidth={1.5} className="text-foreground flex-shrink-0 mt-0.5" />
          Clinic suggestions are generated by Gemini AI based on well-known hospitals in {city}. 
          Always verify clinic details and availability before visiting. Click &quot;Directions on Maps&quot; to confirm location.
        </p>
      </div>
    </div>
  );
}

