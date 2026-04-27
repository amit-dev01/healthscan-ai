"use client";

import { CheckCircle2, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
import type { AnalysisResult } from '@/app/page';

interface Props { result: AnalysisResult }

export function WhatsAppTab({ result }: Props) {
  const statuses = result.whatsappStatus || [];
  const sent = statuses.filter(s => s.sent).length;
  const failed = statuses.filter(s => !s.sent).length;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
        <MessageSquare className="text-[#16a34a]" /> WhatsApp Delivery
      </h2>

      {statuses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No WhatsApp numbers were provided.</p>
          <p className="text-xs mt-1">Enter number(s) in the patient form and re-run analysis.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-[#16a34a]">{sent}</p>
              <p className="text-sm text-gray-400 mt-1">Sent Successfully</p>
            </div>
            <div className="bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-[#dc2626]">{failed}</p>
              <p className="text-sm text-gray-400 mt-1">Failed</p>
            </div>
          </div>

          {/* Per-number status */}
          <div className="space-y-3">
            {statuses.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${s.sent ? 'border-[#16a34a]/20 bg-[#16a34a]/5' : 'border-[#dc2626]/20 bg-[#dc2626]/5'}`}>
                {s.sent
                  ? <CheckCircle2 size={20} className="text-[#16a34a] flex-shrink-0" />
                  : <XCircle size={20} className="text-[#dc2626] flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="font-semibold text-[#f1f5f9] text-sm">{s.number}</p>
                  {s.error && <p className="text-xs text-[#dc2626] mt-0.5">{s.error}</p>}
                </div>
                <span className={`text-xs font-bold ${s.sent ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                  {s.sent ? 'DELIVERED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>

          {failed > 0 && (
            <div className="text-xs text-gray-400 bg-black/20 border border-[#2a2d3e] rounded-lg p-4">
              <p className="font-semibold text-[#f1f5f9] mb-1">Troubleshooting WhatsApp delivery:</p>
              <ul className="space-y-1 list-disc ml-4">
                <li>Ensure the number has joined your Twilio Sandbox (send &quot;join &lt;sandbox&gt;&quot; to +1 415 523 8886)</li>
                <li>Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct in .env.local</li>
                <li>Check that TWILIO_WHATSAPP_FROM is set to your sandbox number</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Message preview */}
      <div className="bg-black/20 border border-[#2a2d3e] rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <RefreshCw size={12} /> Message Preview
        </p>
        <div className="bg-[#16a34a]/5 border border-[#16a34a]/10 rounded-lg p-4 font-mono text-xs text-gray-300 whitespace-pre-line leading-relaxed">
{`🏥 HealthScan AI Report
Health Score: ${result.analysis?.healthScore}/10
Urgency: ${result.analysis?.urgency}

${result.analysis?.executiveSummary?.substring(0, 200) || ''}...

👨‍⚕️ See: ${result.analysis?.specialistNeeded}
🚨 Emergency: Call 108
⚠️ AI-generated. Consult a doctor.`}
        </div>
      </div>
    </div>
  );
}
