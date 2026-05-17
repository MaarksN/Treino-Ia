import { CheckCircle2, Loader2 } from 'lucide-react';
import { type TrainingPlan, type UserProfile, type WorkoutSession } from '../../../services/database';
import {
  buildPlanGenerationProgress,
  getPlanGenerationProgressPercent,
} from '../../../utils/planGenerationProgress';

interface PlanGenerationProgressProps {
  profile: UserProfile;
  history: WorkoutSession[];
  plan: TrainingPlan;
}

export function PlanGenerationProgress({ profile, history, plan }: PlanGenerationProgressProps) {
  const steps = buildPlanGenerationProgress(profile, history, plan);
  const progress = getPlanGenerationProgressPercent(steps.length, steps.length);

  return (
    <section
      aria-live="polite"
      className="mb-8 rounded-[28px] border-2 border-brand-neon bg-brand-neon/10 p-5 shadow-brutal-neon animate-slide-up md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-neon">Geracao do plano</p>
          <h2 className="font-display text-4xl uppercase text-brand-light">Recalculando com dados reais</h2>
        </div>
        <Loader2 className="h-7 w-7 animate-spin text-brand-neon" />
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full border border-brand-neon/40 bg-brand-dark">
        <div
          className="h-full rounded-full bg-brand-neon plan-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map(step => (
          <article key={step.id} className="rounded-[20px] border border-brand-light/10 bg-brand-dark/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-neon" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-neon">{step.metric}</span>
            </div>
            <h3 className="font-display text-2xl uppercase text-brand-light">{step.label}</h3>
            <p className="mt-2 font-mono text-xs leading-5 text-brand-light/70">{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
