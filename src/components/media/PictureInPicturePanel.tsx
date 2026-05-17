import { useCallback, useState } from 'react';
import { getPipStatus, PIP_DISCLAIMER, type PipStatus } from '../../services/media/pictureInPictureService';
import { InlineNotice } from '../ui/InlineNotice';

export function PictureInPicturePanel() {
  const [status, setStatus] = useState<PipStatus | null>(null);

  const checkStatus = useCallback(() => {
    setStatus(getPipStatus());
  }, []);

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="pip-title"
    >
      <h3 id="pip-title" className="font-display text-3xl uppercase text-brand-light">
        Picture-in-Picture
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Reproduza vídeo em janela flutuante enquanto treina. Disponível apenas com mídia real.
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={checkStatus}
          className="rounded-full border-2 border-brand-neon bg-brand-neon px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-transparent hover:text-brand-neon focus:outline-none focus:ring-2 focus:ring-brand-neon"
        >
          Verificar disponibilidade
        </button>
      </div>

      {status === null ? (
        <p className="mt-4 font-mono text-xs text-brand-muted">
          Clique para verificar se PiP está disponível no seu navegador.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
            status.availability === 'available'
              ? 'border-brand-neon/30 bg-brand-neon/5'
              : 'border-brand-light/10 bg-brand-dark/30'
          }`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              status.browserSupported
                ? 'bg-brand-neon text-brand-dark'
                : 'bg-brand-light/10 text-brand-muted'
            }`}>
              {status.browserSupported ? '✓' : '✗'}
            </span>
            <span className="font-mono text-sm text-brand-light">
              Navegador: {status.browserSupported ? 'suporta PiP' : 'sem suporte PiP'}
            </span>
          </div>

          <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
            status.hasRealMedia
              ? 'border-brand-neon/30 bg-brand-neon/5'
              : 'border-brand-light/10 bg-brand-dark/30'
          }`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              status.hasRealMedia
                ? 'bg-brand-neon text-brand-dark'
                : 'bg-brand-light/10 text-brand-muted'
            }`}>
              {status.hasRealMedia ? '✓' : '✗'}
            </span>
            <span className="font-mono text-sm text-brand-light">
              Mídia: {status.hasRealMedia ? 'vídeo real detectado' : 'sem vídeo na página'}
            </span>
          </div>

          <p className="font-mono text-xs text-brand-muted">{status.message}</p>
        </div>
      )}

      <InlineNotice type="info" title="Sem simulação">
        {PIP_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
