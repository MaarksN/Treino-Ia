import { useCallback, useState } from 'react';
import {
  getLandmarkScore,
  runLandmarkAudit,
  SCREEN_READER_DISCLAIMER,
  type LandmarkCheckItem,
} from '../../services/accessibility/screenReaderSupportService';
import { InlineNotice } from '../ui/InlineNotice';

export function ScreenReaderSupportPanel() {
  const [checks, setChecks] = useState<LandmarkCheckItem[] | null>(null);

  const runAudit = useCallback(() => {
    setChecks(runLandmarkAudit());
  }, []);

  const score = checks ? getLandmarkScore(checks) : null;

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="screen-reader-title"
    >
      <h3 id="screen-reader-title" className="font-display text-3xl uppercase text-brand-light">
        Leitor de tela
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Verifique a presença de landmarks e atributos de acessibilidade na página atual.
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={runAudit}
          className="rounded-full border-2 border-brand-neon bg-brand-neon px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-transparent hover:text-brand-neon focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-brand-dark"
        >
          Executar verificação
        </button>
      </div>

      {checks === null ? (
        <p className="mt-4 font-mono text-xs text-brand-muted">
          Clique no botão acima para verificar os landmarks da página.
        </p>
      ) : (
        <div className="mt-4">
          {score && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-brand-dark">
                  <div
                    className="h-full rounded-full bg-brand-neon transition-all duration-500"
                    style={{ width: `${score.percentage}%` }}
                  />
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-brand-neon">
                {score.passed}/{score.total}
              </span>
            </div>
          )}

          <ul className="space-y-2" role="list">
            {checks.map(check => (
              <li
                key={check.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  check.present
                    ? 'border-brand-neon/30 bg-brand-neon/5'
                    : 'border-brand-light/10 bg-brand-dark/30'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    check.present
                      ? 'bg-brand-neon text-brand-dark'
                      : 'bg-brand-light/10 text-brand-muted'
                  }`}
                  aria-hidden="true"
                >
                  {check.present ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <span className="font-mono text-sm font-bold text-brand-light">
                    {check.label}
                  </span>
                  <p className="font-mono text-[10px] text-brand-muted">{check.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InlineNotice type="warning" title="Limitação">
        {SCREEN_READER_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
