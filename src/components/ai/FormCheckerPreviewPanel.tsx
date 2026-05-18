import { useState } from 'react';
import { getFormCheckerStatus, FORM_CHECKER_DISCLAIMER } from '../../services/ai/formCheckerCapabilityService';
import { InlineNotice } from '../ui/InlineNotice';

export function FormCheckerPreviewPanel() {
  const [status] = useState(() => getFormCheckerStatus());
  return (
    <article className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6" aria-labelledby="form-checker-title">
      <h3 id="form-checker-title" className="font-display text-3xl uppercase text-brand-light">Análise de forma</h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">Checklist de capabilities para análise de postura por câmera.</p>
      <ul className="mt-4 space-y-2" role="list">
        {status.capabilities.map(cap => (
          <li key={cap.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${cap.status === 'available' ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${cap.status === 'available' ? 'bg-brand-neon text-brand-dark' : cap.status === 'unknown' ? 'bg-brand-muted/30 text-brand-muted' : 'bg-brand-light/10 text-brand-muted'}`}>{cap.status === 'available' ? '✓' : cap.status === 'unknown' ? '?' : '✗'}</span>
            <div className="flex-1"><span className="font-mono text-sm font-bold text-brand-light">{cap.label}</span><p className="font-mono text-[10px] text-brand-muted">{cap.description}</p></div>
          </li>
        ))}
      </ul>
      {!status.canAnalyze && <p className="mt-3 font-mono text-xs text-brand-magenta">{status.reason}</p>}
      <InlineNotice type="warning" title="Sem engine real">{FORM_CHECKER_DISCLAIMER}</InlineNotice>
    </article>
  );
}
