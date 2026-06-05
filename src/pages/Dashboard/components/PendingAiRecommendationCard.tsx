import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { type AiRecommendationRecord } from '../../../services/data/aiRecommendationRepository';

interface PendingAiRecommendationCardProps {
  recommendation: AiRecommendationRecord;
  saving: boolean;
  onAccept: () => void;
  onReject: () => void;
  onDismiss: () => void;
}

export function PendingAiRecommendationCard({
  recommendation,
  saving,
  onAccept,
  onReject,
  onDismiss,
}: PendingAiRecommendationCardProps) {
  return (
    <section
      data-testid="pending-ai-recommendation-card"
      className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-dark p-6 shadow-brutal-neon md:p-8"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
            Sugestao pendente da IA
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase text-brand-light md:text-5xl">
            Revisar antes de aplicar
          </h2>
          <p className="mt-4 font-mono text-sm leading-7 text-brand-light/80">
            {recommendation.reason}
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-brand-muted">
            Plano atual: {recommendation.payload.currentPlan.planName} | Sugerido:{' '}
            {recommendation.payload.proposedPlan.planName}
          </p>
        </div>

        <div className="grid min-w-56 gap-3">
          <button
            type="button"
            data-testid="ai-recommendation-accept"
            disabled={saving}
            onClick={onAccept}
            className="rounded-[22px] border-2 border-brand-neon bg-brand-neon px-5 py-3 font-mono text-xs font-black uppercase tracking-widest text-brand-dark transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            Aceitar sugestao
          </button>
          <button
            type="button"
            data-testid="ai-recommendation-reject"
            disabled={saving}
            onClick={onReject}
            className="rounded-[22px] border-2 border-brand-magenta bg-brand-magenta/15 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-brand-light transition-colors hover:bg-brand-magenta/25 disabled:opacity-60"
          >
            <XCircle className="mr-2 inline h-4 w-4" />
            Rejeitar
          </button>
          <button
            type="button"
            data-testid="ai-recommendation-dismiss"
            disabled={saving}
            onClick={onDismiss}
            className="rounded-[22px] border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-brand-light transition-colors hover:border-brand-light/50 disabled:opacity-60"
          >
            <MinusCircle className="mr-2 inline h-4 w-4" />
            Manter atual
          </button>
        </div>
      </div>
    </section>
  );
}
