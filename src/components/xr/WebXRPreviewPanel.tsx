import { useEffect, useState } from 'react';
import { checkImmersiveArSupport, getWebXRCapabilitySync, WEBXR_DISCLAIMER } from '../../services/xr/webxrCapabilityService';
import { InlineNotice } from '../ui/InlineNotice';

export function WebXRPreviewPanel() {
  const [status, setStatus] = useState(() => getWebXRCapabilitySync());

  useEffect(() => {
    if (!status.apiPresent) return undefined;

    let cancelled = false;
    checkImmersiveArSupport().then(immersiveArSupported => {
      if (cancelled) return;

      setStatus(previous => ({
        ...previous,
        immersiveArSupported,
        reason: immersiveArSupported === 'supported'
          ? 'API WebXR detectada e immersive-ar reportado como suportado. Nenhuma sessão AR foi iniciada.'
          : immersiveArSupported === 'unsupported'
            ? 'API WebXR detectada, mas immersive-ar não foi reportado como suportado.'
            : 'API WebXR detectada, mas o navegador não confirmou suporte a immersive-ar.',
      }));
    }).catch(() => {
      if (!cancelled) {
        setStatus(previous => ({
          ...previous,
          immersiveArSupported: 'unknown',
          reason: 'API WebXR detectada, mas a verificação de immersive-ar falhou sem iniciar sessão.',
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status.apiPresent]);

  return (
    <article className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6" aria-labelledby="webxr-title">
      <h3 id="webxr-title" className="font-display text-3xl uppercase text-brand-light">AR / WebXR</h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">Detector de suporte a realidade aumentada no navegador.</p>
      <div className="mt-4 space-y-2">
        <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${status.apiPresent ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${status.apiPresent ? 'bg-brand-neon text-brand-dark' : 'bg-brand-light/10 text-brand-muted'}`}>{status.apiPresent ? '✓' : '✗'}</span>
          <span className="font-mono text-sm text-brand-light">API WebXR: {status.apiPresent ? 'detectada' : 'não disponível'}</span>
        </div>
        <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${status.immersiveArSupported === 'supported' ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${status.immersiveArSupported === 'supported' ? 'bg-brand-neon text-brand-dark' : status.immersiveArSupported === 'unknown' ? 'bg-brand-muted/30 text-brand-muted' : 'bg-brand-light/10 text-brand-muted'}`}>
            {status.immersiveArSupported === 'supported' ? '✓' : status.immersiveArSupported === 'unknown' ? '?' : '✗'}
          </span>
          <span className="font-mono text-sm text-brand-light">Immersive AR: {status.immersiveArSupported === 'supported' ? 'suportado' : status.immersiveArSupported === 'unknown' ? 'verificação pendente' : 'não suportado'}</span>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-brand-muted">{status.reason}</p>
      <InlineNotice type="info" title="Tecnologia experimental">{WEBXR_DISCLAIMER}</InlineNotice>
    </article>
  );
}
