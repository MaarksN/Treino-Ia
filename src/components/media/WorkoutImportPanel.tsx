import { useMemo } from 'react';
import { extractFileMetadata, IMPORT_DISCLAIMER, OCR_STATUS_MESSAGE } from '../../services/media/workoutImportService';
import { InlineNotice } from '../ui/InlineNotice';

/**
 * Compact panel showing workout import status and OCR guard.
 * Full import UI is in ImportWorkoutView.tsx — this panel summarizes status.
 */
export function WorkoutImportPanel() {
  const sampleFormats = useMemo(() => {
    const formats = [
      { name: 'foto.jpg', type: 'image/jpeg', size: 500 * 1024 },
      { name: 'ficha.pdf', type: 'application/pdf', size: 2 * 1024 * 1024 },
      { name: 'treino.png', type: 'image/png', size: 300 * 1024 },
    ];
    return formats.map(f => extractFileMetadata(f));
  }, []);

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="workout-import-title"
    >
      <h3 id="workout-import-title" className="font-display text-3xl uppercase text-brand-light">
        Importação de ficha
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Upload de imagem ou PDF com preview e crop local. Use o botão &quot;Importar ficha&quot; no topo do Dashboard.
      </p>

      <div className="mt-4">
        <h4 className="font-mono text-xs font-bold uppercase text-brand-light/80">Formatos aceitos</h4>
        <ul className="mt-2 space-y-1" role="list">
          {sampleFormats.map(meta => (
            <li
              key={meta.name}
              className="flex items-center justify-between rounded-lg border border-brand-light/10 bg-brand-dark/30 px-3 py-2"
            >
              <span className="font-mono text-sm text-brand-light">
                {meta.isPdf ? '📄' : '🖼️'} {meta.type}
              </span>
              <span className={`font-mono text-xs font-bold ${
                meta.guard.status === 'ready' ? 'text-brand-neon' : 'text-brand-magenta'
              }`}>
                {meta.guard.status === 'ready' ? '✓ Aceito' : '✗ Bloqueado'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-brand-magenta/20 bg-brand-magenta/5 p-3">
        <p className="font-mono text-xs font-bold uppercase text-brand-magenta">Status OCR</p>
        <p className="mt-1 font-mono text-[10px] text-brand-light/70">{OCR_STATUS_MESSAGE}</p>
      </div>

      <InlineNotice type="warning" title="Limitação">
        {IMPORT_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
