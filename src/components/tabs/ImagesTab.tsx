"use client";

import { useRef, useEffect, useMemo, useState } from 'react';
import { Download, ZoomIn } from 'lucide-react';
import type { AnalysisResult, ImagingRegion } from '@/app/page';

interface Props {
  result: AnalysisResult;
  preview: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  ABNORMAL: '#d97706',
  MONITOR: '#2563eb',
  NORMAL:  '#16a34a',
};

export function ImagesTab({ result, preview }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<ImagingRegion | null>(null);
  const [annotatedUrl, setAnnotatedUrl] = useState<string | null>(null);

  const regions = useMemo(() => result.imagingRegions || [], [result.imagingRegions]);

  useEffect(() => {
    if (!preview || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      // Draw regions
      regions.forEach(region => {
        const x = (region.xPercent / 100) * img.width;
        const y = (region.yPercent / 100) * img.height;
        const w = (region.widthPercent / 100) * img.width;
        const h = (region.heightPercent / 100) * img.height;
        const color = SEVERITY_COLORS[region.severity] || '#2563eb';

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Fill overlay
        ctx.fillStyle = color + '33';
        ctx.fillRect(x, y, w, h);

        // Label background
        ctx.shadowBlur = 0;
        const label = `${region.severity}: ${region.region}`;
        ctx.font = 'bold 14px Inter, sans-serif';
        const textW = ctx.measureText(label).width;

        ctx.fillStyle = color;
        ctx.fillRect(x, y - 22, textW + 12, 22);

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 6, y - 6);
      });

      // For blood reports / non-imaging: draw value boxes around anomalies
      if (!result.isImagingScan) {
        // Highlight critical findings as colored overlay boxes (simplified)
        (result.analysis.keyFindings || []).forEach((finding, idx) => {
          if (finding.status === 'NORMAL') return;
          const color = finding.status === 'CRITICAL' ? '#dc2626' : '#d97706';
          const yPos = (idx * 60) + 20;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(10, yPos, img.width - 20, 50);
          ctx.setLineDash([]);
        });
      }

      setAnnotatedUrl(canvas.toDataURL('image/png'));
    };
    img.src = preview;
  }, [preview, regions, result.isImagingScan, result.analysis.keyFindings]);

  const handleDownload = () => {
    if (!annotatedUrl) return;
    const a = document.createElement('a');
    a.href = annotatedUrl;
    a.download = 'healthscan-annotated.png';
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#f1f5f9]">
          {result.isImagingScan ? '🔬 Imaging Analysis with AI Annotations' : '📄 Document Analysis'}
        </h2>
        {annotatedUrl && (
          <button onClick={handleDownload}
            className="flex items-center gap-2 text-sm bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 px-3 py-1.5 rounded-lg hover:bg-[#2563eb]/20 transition-all">
            <Download size={14} /> Download Annotated
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400">Original</p>
          <div className="bg-black/30 border border-[#2a2d3e] rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
            {preview && <img src={preview} alt="Original" className="max-h-[450px] object-contain w-full" />}
          </div>
        </div>

        {/* Annotated Canvas */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400">AI Annotated</p>
          <div className="bg-black/30 border border-[#2a2d3e] rounded-xl overflow-hidden flex items-center justify-center min-h-[400px] relative group">
            <canvas ref={canvasRef} className="max-h-[450px] object-contain w-full" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
              <ZoomIn size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Region Legend */}
      {regions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-[#f1f5f9] text-sm">Annotated Regions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {regions.map((r, i) => (
              <button key={i} onClick={() => setSelectedRegion(r)}
                className={`text-left p-3 rounded-lg border transition-all ${selectedRegion === r ? 'border-[#2563eb] bg-[#2563eb]/10' : 'border-[#2a2d3e] bg-black/20 hover:border-[#2563eb]/40'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[r.severity] }} />
                  <p className="text-xs font-semibold text-[#f1f5f9]">{r.region}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{r.finding}</p>
              </button>
            ))}
          </div>

          {selectedRegion && (
            <div className="bg-black/30 border rounded-xl p-4" style={{ borderColor: SEVERITY_COLORS[selectedRegion.severity] + '40' }}>
              <p className="font-bold text-sm" style={{ color: SEVERITY_COLORS[selectedRegion.severity] }}>
                {selectedRegion.severity}: {selectedRegion.region}
              </p>
              <p className="text-gray-300 text-sm mt-1">{selectedRegion.finding}</p>
            </div>
          )}
        </div>
      )}

      {/* Severity Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(SEVERITY_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
