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
    <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-5 flex flex-col gap-3 hover:border-[#2563eb]/40 transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#f1f5f9] group-hover:text-[#2563eb] transition-colors">{clinic.name}</p>
            {isPharmacy && (
              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pill size={8} /> Pharmacy
              </span>
            )}
            {clinic.type && !isPharmacy && (
              <span className="text-[10px] bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 px-2 py-0.5 rounded-full">
                {clinic.type}
              </span>
            )}
          </div>
          {clinic.area && (
            <p className="text-xs text-[#2563eb]/70 font-medium mt-0.5">{clinic.area}</p>
          )}
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{clinic.address}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-[#d97706] flex-shrink-0 ml-2">
          <Star size={12} fill="currentColor" />
          <span className="text-xs font-bold">{clinic.rating?.toFixed(1) || '4.0'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {clinic.open_now !== null && clinic.open_now !== undefined && (
          <span className={clinic.open_now ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
            {clinic.open_now ? '● Open Now' : '● Closed'}
          </span>
        )}
        <span className="flex items-center gap-1 text-gray-400">
          <Phone size={10} /> {clinic.phone || 'Search on Google Maps'}
        </span>
        {clinic.geminiSuggested && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-purple-400">
            <Sparkles size={9} /> AI Suggested
          </span>
        )}
      </div>

      <a
        href={clinic.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#2a2d3e] text-sm text-gray-300 hover:bg-[#2563eb]/10 hover:border-[#2563eb]/40 hover:text-white transition-all"
      >
        <Navigation size={14} /> Get Directions on Google Maps
      </a>
    </div>
  );
}

export function ClinicsTab({ result, city }: Props) {
  const hasGeminiClinics = (result.clinics as ClinicData[])?.some((c) => c.geminiSuggested);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Building2 className="text-[#2563eb]" /> Hospitals & Clinics in {city}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Recommended Specialist: <span className="text-[#f1f5f9] font-semibold">{result.analysis?.specialistNeeded}</span>
          </p>
        </div>
        {hasGeminiClinics && (
          <span className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full flex-shrink-0">
            <Sparkles size={12} /> Powered by Gemini AI
          </span>
        )}
      </div>

      {(result.clinics as ClinicData[])?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(result.clinics as ClinicData[]).map((clinic, i) => (
            <ClinicCard key={i} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p>No clinics found for this city.</p>
        </div>
      )}

      {result.pharmacy && (
        <div>
          <h3 className="font-bold text-[#f1f5f9] mb-3 flex items-center gap-2">
            <Pill size={16} className="text-green-400" /> Nearest Pharmacy
          </h3>
          <ClinicCard clinic={result.pharmacy as ClinicData} isPharmacy />
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-4">
        <p className="text-xs text-gray-500 flex items-start gap-2">
          <Sparkles size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
          Clinic suggestions are generated by Gemini AI based on well-known hospitals in {city}. 
          Always verify clinic details and availability before visiting. Click "Get Directions" to confirm the exact location on Google Maps.
        </p>
      </div>
    </div>
  );
}
