"use client";

import { MessageSquare, Send, ExternalLink } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';

interface Props { result: AnalysisResult }

export function WhatsAppTab({ result }: Props) {
  const { analysis, clinics } = result;
  
  const topClinic = clinics && clinics.length > 0 ? clinics[0] : null;
  const kf = (analysis.keyFindings as Array<Record<string, string>>) || [];
  const ap = (analysis.actionPlan as Record<string, string[]>) || {};
  const dv = (analysis.doctorVisitGuide as Record<string, string>) || {};

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
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
          <MessageSquare className="text-[#25d366]" /> Share via WhatsApp
        </h2>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-[#25d366] hover:bg-[#25d366]/90 text-black font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#25d366]/20"
        >
          <Send size={16} /> Send Report
        </button>
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
