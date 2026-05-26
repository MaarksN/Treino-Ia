import { Activity, Brain, Dumbbell, History, Target, Timer } from 'lucide-react';
import { type TrainingPlan, type UserProfile } from '../../../services/database';
import { MetricCard, MetricPanel } from './MetricPanels';

interface CoreOverviewProps {
  profile: UserProfile;
  plan: TrainingPlan;
  historyCount: number;
  completionSummary: string;
  selectedDay: TrainingPlan['days'][number] | null;
  selectedDayIndex: number;
  primaryActionClass: string;
  onStartWorkout: (dayIndex: number) => void;
  profileTitle?: {
    level: number;
    title: string;
  };
}

export function CoreOverview({
  profile,
  plan,
  historyCount,
  completionSummary,
  selectedDay,
  selectedDayIndex,
  primaryActionClass,
  onStartWorkout,
  profileTitle,
}: CoreOverviewProps) {
  return (
    <>
      <section id="dashboard-overview" className="mb-8 grid gap-6 scroll-mt-24 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-10">
          <div className="relative z-10">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
              Treino de hoje
            </p>
            <h2 className="font-display text-6xl uppercase leading-none tracking-tight text-brand-light md:text-7xl">
              {selectedDay?.focus ?? 'Plano em ajuste'}
            </h2>
            {profileTitle && (
              <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 border-2 border-brand-neon bg-brand-neon px-3 py-2 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-neon">
                <span>Nivel {profileTitle.level}</span>
                <span className="h-1 w-1 rounded-full bg-brand-dark" />
                <span>{profileTitle.title}</span>
              </div>
            )}
            <p className="mt-5 max-w-3xl font-mono text-sm leading-7 text-brand-light/75">
              {selectedDay
                ? `${selectedDay.dayName} do plano ${plan.planName}. ${plan.goalDescription}`
                : plan.goalDescription}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricCard icon={<Dumbbell />} label="Exercícios" value={String(selectedDay?.exercises.length ?? 0).padStart(2, '0')} tone="neon" />
              <MetricCard icon={<Timer />} label="Minutos por treino" value={`${profile.timePerWorkout}`} tone="magenta" />
              <MetricCard icon={<History />} label="Histórico" value={String(historyCount).padStart(2, '0')} tone="light" />
            </div>

            {selectedDay && (
              <button
                type="button"
                data-testid="start-workout-button"
                onClick={() => onStartWorkout(selectedDayIndex)}
                className={`mt-8 rounded-[24px] border-2 px-6 py-4 font-mono text-xs uppercase tracking-widest shadow-brutal-neon transition-transform hover:scale-[1.02] active:scale-95 ${primaryActionClass}`}
              >
                Começar treino
              </button>
            )}
          </div>
        </div>

        <aside className="rounded-[28px] border-4 border-brand-neon bg-brand-dark p-6 shadow-brutal-neon">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Plano atual</p>
          <h3 className="font-display text-4xl uppercase text-brand-light">{plan.planName}</h3>
          <div className="mt-5 space-y-3 font-mono text-sm text-brand-light/80">
            <p><span className="text-brand-muted">Atleta:</span> {profile.name}</p>
            <p><span className="text-brand-muted">Divisão:</span> {plan.weeklySplit}</p>
            <p><span className="text-brand-muted">Nível:</span> {profile.level}</p>
            <p><span className="text-brand-muted">Equipamento:</span> {profile.equipment}</p>
            <p><span className="text-brand-muted">Resumo:</span> {completionSummary}</p>
          </div>
        </aside>
      </section>

      <section className="mb-8 grid gap-5 md:grid-cols-3">
        <MetricPanel icon={<Activity />} title="Volume" value={plan.volume} tone="neon" />
        <MetricPanel icon={<Target />} title="Frequência" value={plan.frequency} tone="magenta" />
        <MetricPanel icon={<Brain />} title="Foco" value={plan.focus} tone="light" />
      </section>

      <section className="mb-8 rounded-[28px] border-4 border-brand-magenta bg-brand-gray p-6 shadow-brutal-magenta md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="rounded-[24px] border-2 border-brand-magenta bg-brand-magenta p-4 text-brand-light shadow-brutal-magenta">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">Próxima recomendação</p>
            <h2 className="mt-2 font-display text-4xl uppercase text-brand-light md:text-5xl">
              Ajuste simples da IA
            </h2>
            <p className="mt-4 max-w-4xl font-mono text-sm leading-7 text-brand-light/80 md:text-base">
              {plan.nextRecommendation}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
