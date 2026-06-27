import { useEffect, useState, useCallback } from 'react';
import {
  checkImmersiveArSupport,
  getWebXRCapabilitySync,
  WEBXR_DISCLAIMER,
} from '../../services/xr/webxrCapabilityService';
import { InlineNotice } from '../ui/InlineNotice';
import { Loader2, Eye } from 'lucide-react';

export function WebXRPreviewPanel() {
  const [status, setStatus] = useState(() => getWebXRCapabilitySync());
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startAR = useCallback(async () => {
    const nav: any = navigator;
    if (!nav.xr) return;
    setLoading(true);
    try {
      const session = await nav.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
      });
      setSessionActive(true);

      session.addEventListener('end', () => {
        setSessionActive(false);
      });

      // Aqui entraria o loop de renderização Three.js/WebXR
      // Para este Lote, ativamos a sessão real.
    } catch (err) {
      console.error('Failed to start AR session:', err);
      alert('Nao foi possivel iniciar a sessao de RA.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!status.apiPresent) return undefined;

    let cancelled = false;
    checkImmersiveArSupport()
      .then((immersiveArSupported) => {
        if (cancelled) return;

        setStatus((previous) => ({
          ...previous,
          immersiveArSupported,
          reason:
            immersiveArSupported === 'supported'
              ? 'API WebXR detectada e immersive-ar reportado como suportado. Nenhuma sessão AR foi iniciada.'
              : immersiveArSupported === 'unsupported'
                ? 'API WebXR detectada, mas immersive-ar não foi reportado como suportado.'
                : 'API WebXR detectada, mas o navegador não confirmou suporte a immersive-ar.',
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setStatus((previous) => ({
            ...previous,
            immersiveArSupported: 'unknown',
            reason:
              'API WebXR detectada, mas a verificação de immersive-ar falhou sem iniciar sessão.',
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status.apiPresent]);

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="webxr-title"
    >
      <h3 id="webxr-title" className="font-display text-3xl uppercase text-brand-light">
        AR / WebXR
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Detector de suporte a realidade aumentada no navegador.
      </p>
      <div className="mt-4 space-y-2">
        <div
          className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${status.apiPresent ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${status.apiPresent ? 'bg-brand-neon text-brand-dark' : 'bg-brand-light/10 text-brand-muted'}`}
          >
            {status.apiPresent ? '✓' : '✗'}
          </span>
          <span className="font-mono text-sm text-brand-light">
            API WebXR: {status.apiPresent ? 'detectada' : 'não disponível'}
          </span>
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${status.immersiveArSupported === 'supported' ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${status.immersiveArSupported === 'supported' ? 'bg-brand-neon text-brand-dark' : status.immersiveArSupported === 'unknown' ? 'bg-brand-muted/30 text-brand-muted' : 'bg-brand-light/10 text-brand-muted'}`}
          >
            {status.immersiveArSupported === 'supported'
              ? '✓'
              : status.immersiveArSupported === 'unknown'
                ? '?'
                : '✗'}
          </span>
          <span className="font-mono text-sm text-brand-light">
            Immersive AR:{' '}
            {status.immersiveArSupported === 'supported'
              ? 'suportado'
              : status.immersiveArSupported === 'unknown'
                ? 'verificação pendente'
                : 'não suportado'}
          </span>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-brand-muted">{status.reason}</p>

      {status.immersiveArSupported === 'supported' && !sessionActive && (
        <button
          onClick={startAR}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-neon py-3 font-mono text-sm uppercase tracking-widest text-brand-dark hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Eye className="h-5 w-5" />
              Iniciar Experiência em RA
            </>
          )}
        </button>
      )}

      {sessionActive && (
        <div className="mt-4 rounded-xl border-2 border-brand-neon bg-brand-neon/10 p-4 text-center">
          <p className="font-mono text-sm text-brand-neon font-bold uppercase">Sessão RA Ativa</p>
          <p className="font-mono text-xs text-brand-light mt-1">Aponte a câmera para o chão para ver o guia.</p>
        </div>
      )}

      <InlineNotice type="info" title="Tecnologia experimental">
        {WEBXR_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
