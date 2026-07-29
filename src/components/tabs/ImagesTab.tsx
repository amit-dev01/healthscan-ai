"use client";

import { useRef, useEffect, useMemo, useState } from 'react';
import { Download, ZoomIn } from 'lucide-react';
import type { AnalysisResult, ImagingRegion } from '@/app/page';

interface Props {
  result: AnalysisResult;
  preview: string | null;
}

const SEVERITY_STYLES: Record<string, { color: string; dash: number[]; width: number }> = {
  CRITICAL: { color: '#000000', dash: [], width: 4 },
  ABNORMAL: { color: '#000000', dash: [], width: 2 },
  MONITOR: { color: '#525252', dash: [6, 4], width: 2 },
  NORMAL:  { color: '#A3A3A3', dash: [4, 4], width: 1 },
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

      // Draw original grayscale on canvas
      ctx.drawImage(img, 0, 0);

      // Draw regions
      regions.forEach(region => {
        const x = (region.xPercent / 100) * img.width;
        const y = (region.yPercent / 100) * img.height;
        const w = (region.widthPercent / 100) * img.width;
        const h = (region.heightPercent / 100) * img.height;
        const style = SEVERITY_STYLES[region.severity] || { color: '#000000', dash: [], width: 2 };

        ctx.shadowBlur = 0;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.setLineDash(style.dash);

        // Box outline
        ctx.strokeRect(x, y, w, h);

        // Fill subtle pattern or overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(x, y, w, h);

        // Reset dash for labels
        ctx.setLineDash([]);

        // Label background
        const label = `${region.severity}: ${region.region}`;
        ctx.font = 'bold 12px monospace';
        const textW = ctx.measureText(label).width;

        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y - 20, textW + 12, 20);

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 6, y - 6);
      });

      // Non-imaging findings overlay
      if (!result.isImagingScan) {
        (result.analysis.keyFindings || []).forEach((finding, idx) => {
          if (finding.status === 'NORMAL') return;
          const yPos = (idx * 60) + 20;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = finding.status === 'CRITICAL' ? 3 : 1.5;
          ctx.setLineDash(finding.status === 'CRITICAL' ? [] : [5, 3]);
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
    <div className="p-8 space-y-10 bg-background text-foreground font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderLight pb-4">
        <h2 className="text-xl font-display font-bold uppercase tracking-tight text-foreground">
          {result.isImagingScan ? '🔬 Imaging Analysis — AI Annotations' : '📄 Document Analysis Overlay'}
        </h2>
        {annotatedUrl && (
          <button onClick={handleDownload}
            className="flex items-center gap-2 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground font-mono text-[10px] uppercase tracking-widest font-bold px-4 py-2 transition-colors duration-100">
            <Download size={12} strokeWidth={1.5} /> Download Annotated
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original with scale/grayscale transitions */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-mutedForeground">Original View (Hover to color)</p>
          <div className="border-2 border-foreground transition-all duration-300 hover:border-[4px] relative overflow-hidden bg-card flex items-center justify-center min-h-[400px] group">
            {preview && (
              <img src={preview} alt="Original" 
                className="max-h-[450px] object-contain w-full grayscale transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0" />
            )}
          </div>
        </div>

        {/* Annotated */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-mutedForeground">AI Annotations View</p>
          <div className="border-2 border-foreground transition-all duration-300 hover:border-[4px] relative overflow-hidden bg-card flex items-center justify-center min-h-[400px] group">
            <canvas ref={canvasRef} className="max-h-[450px] object-contain w-full transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute top-4 right-4 bg-foreground text-background p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              <ZoomIn size={14} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Region Legend */}
      {regions.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h3 className="font-display font-bold text-sm uppercase tracking-tight">Annotated Regions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((r, i) => {
              const active = selectedRegion === r;
              return (
                <button key={i} onClick={() => setSelectedRegion(r)}
                  className={`text-left p-4 border transition-colors duration-100 ${
                    active ? 'border-foreground bg-foreground text-background font-bold' : 'border-borderLight bg-card hover:border-foreground text-foreground'
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 border flex-shrink-0 ${active ? 'bg-background border-background' : 'bg-foreground border-foreground'}`} />
                    <p className="font-display text-sm uppercase tracking-tight">{r.region}</p>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${active ? 'text-background/80 font-normal font-body' : 'text-mutedForeground font-body'}`}>{r.finding}</p>
                </button>
              );
            })}
          </div>

          {selectedRegion && (
            <div className="border-2 border-foreground p-6 bg-card">
              <p className="font-mono text-[10px] uppercase tracking-widest text-mutedForeground">Selected Finding</p>
              <p className="font-display font-bold text-base uppercase tracking-tight mt-1 text-foreground">
                {selectedRegion.severity}: {selectedRegion.region}
              </p>
              <p className="text-foreground/90 font-body text-sm mt-3 leading-relaxed">{selectedRegion.finding}</p>
            </div>
          )}
        </div>
      )}

      {/* Severity Legend */}
      <div className="flex flex-wrap gap-6 pt-4 border-t border-borderLight">
        {Object.entries(SEVERITY_STYLES).map(([s, val]) => (
          <div key={s} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-mutedForeground">
            <div className="w-4 h-4 border flex items-center justify-center bg-card" style={{ borderColor: val.color }}>
              <div className="w-1.5 h-1.5 bg-foreground" style={{ opacity: s === 'CRITICAL' ? 1 : s === 'ABNORMAL' ? 0.6 : s === 'MONITOR' ? 0.3 : 0 }} />
            </div>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

