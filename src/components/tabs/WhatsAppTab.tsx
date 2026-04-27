"use client";

import { useState } from 'react';
import { MessageSquare, Send, ExternalLink, Phone } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';

interface Props { 
  result: AnalysisResult;
  patientInfo?: { whatsapp?: string };
}

export function WhatsAppTab({ result, patientInfo }: Props) {
  const [phone, setPhone] = useState(patientInfo?.whatsapp || '');
  const { analysis, clinics } = result;
  
  const topClinic = clinics && clinics.length > 0 ? clinics[0] : null;
  const kf = (analysis.keyFindings as Array<Record<string, string>>) || [];
  const ap = (analysis.actionPlan as Record<string, string[]>) || {};
  const dv = (analysis.doctorVisitGuide as Record<string, unknown>) || {};

  const message = `🏥 *HealthScan AI Report*
📅 Date: ${new Date().toLocaleDateString('en-IN')}

📊 *Health Score: ${analysis.healthScore}/10*
⚠️ *Urgency: ${analysis.urgency}*

📋 *Summary:*
${analysis.executiveSummary || ''}

🔍 *Key Findings:*
${kf.slice(0, 3).map(f => `• ${f.name}: ${f.what}`).join('\n')}

✅ *Action Plan:*
${(ap.today || []).slice(0, 3).map((a: string) => `• ${a}`).join('\n')}

👨‍⚕️ *See: ${dv.specialist}* (${dv.urgency})
${topClinic ? `\n🏥 Nearest: ${topClinic.name}\n📍 ${topClinic.address}` : ''}

🚨 *Emergency: Call 108 (Free Ambulance)*
⚠️ _AI-generated report. Always consult a doctor._`;

  const handleShare = () => {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, ''); // strip non-numeric characters
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}` 
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <MessageSquare className="text-[#25d366]" /> Share via WhatsApp
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="+91 Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-[#2a2d3e] rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#f1f5f9] placeholder-gray-500 focus:outline-none focus:border-[#25d366] transition-colors"
            />
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#25d366] hover:bg-[#25d366]/90 text-black font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#25d366]/20 whitespace-nowrap"
          >
            <Send size={16} /> Send Report
          </button>
        </div>
      </div>

      <div className="bg-[#25d366]/10 border border-[#25d366]/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#25d366]/20 flex items-center justify-center flex-shrink-0 mt-1">
          <ExternalLink size={20} className="text-[#25d366]" />
        </div>
        <div>
          <h3 className="font-bold text-[#f1f5f9] text-sm mb-1">Direct Sharing</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Clicking the button above will open WhatsApp (Web or Mobile) and allow you to select a contact to share this summary with. You don't need to configure any APIs.
          </p>
        </div>
      </div>

      {/* Message preview */}
      <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
          Message Preview
        </p>
        <div className="bg-[#25d366]/5 border border-[#25d366]/10 rounded-lg p-5 font-mono text-sm text-gray-300 whitespace-pre-line leading-relaxed selection:bg-[#25d366]/30">
          {message}
        </div>
      </div>
    </div>
  );
}
