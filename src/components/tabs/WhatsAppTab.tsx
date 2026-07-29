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
    <div className="p-8 space-y-8 bg-background text-foreground font-body">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-borderLight pb-4">
        <h2 className="text-xl font-display font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
          <MessageSquare className="text-foreground" size={20} strokeWidth={1.5} /> Share via WhatsApp
        </h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Phone size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" />
            <input
              type="text"
              placeholder="+91 Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-background border border-foreground py-2.5 pl-9 pr-4 text-xs font-mono text-foreground placeholder-mutedForeground focus:outline-none focus:border-b-[4px] focus:border-b-foreground transition-all"
            />
          </div>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground font-mono text-xs uppercase tracking-widest font-black px-6 py-3 transition-colors duration-100 whitespace-nowrap"
          >
            <Send size={12} strokeWidth={1.5} /> Send Report
          </button>
        </div>
      </div>

      <div className="border border-borderLight p-6 bg-card flex items-start gap-4">
        <div className="w-10 h-10 border border-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-foreground bg-muted">
          <ExternalLink size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm uppercase tracking-tight mb-1 text-foreground">Direct Sharing</h3>
          <p className="text-xs text-mutedForeground leading-relaxed font-body">
            Clicking the button above will open WhatsApp (Web or Mobile) and allow you to select a contact to share this summary with. No complex API integration is required.
          </p>
        </div>
      </div>

      {/* Message preview */}
      <div className="border-2 border-foreground p-6 bg-card">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-mutedForeground mb-4">
          Message Plaintext Preview
        </p>
        <div className="border border-borderLight p-5 font-mono text-xs text-foreground bg-muted whitespace-pre-line leading-relaxed selection:bg-foreground selection:text-background">
          {message}
        </div>
      </div>
    </div>
  );
}

