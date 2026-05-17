import React from 'react';
import { Shield, Swords } from 'lucide-react';
import { validateBossFightCancellation } from '../../services/monetization/bossFightCancellationGuard';

export function BossFightCancellationPreview() {
  const guardResponse = validateBossFightCancellation('preview');

  return (
    <div className="rounded-[24px] border-2 border-brand-light/30 bg-brand-gray p-6 opacity-90 transition-opacity hover:opacity-100">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl uppercase text-brand-light line-through decoration-brand-magenta decoration-2">
          Boss Fight Cancellation
        </h3>
        <Shield className="h-6 w-6 text-brand-light/50" />
      </div>

      <p className="mb-4 font-mono text-sm text-brand-light/80">
        Conceito de gamificação extrema para retenção.
      </p>

      <div className="mb-6 flex items-center gap-4 rounded-[16px] bg-brand-dark p-4">
        <Swords className="h-8 w-8 text-brand-magenta" />
        <p className="font-mono text-xs leading-relaxed text-brand-light/60">
          "Para cancelar, você deve vencer o Boss Final do Treino."
        </p>
      </div>

      <div className="rounded-[16px] border-l-4 border-brand-neon bg-brand-neon/10 p-4">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-neon">
          Status de Implementação Ética:
        </p>
        <p className="mt-2 font-mono text-sm text-brand-light">
          {guardResponse.message}
        </p>
      </div>
    </div>
  );
}
