import {
  Award,
  BadgeCheck,
  Eye,
  Flame,
  LockKeyhole,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { type GamificationRetentionState } from '../services/gamificationRetentionEngine';

interface Props {
  state: GamificationRetentionState;
}

export function GamificationRetentionPanel({ state }: Props) {
  const achievedBadges = state.badges.filter(badge => badge.achieved);
  const inProgressBadges = state.badges.filter(badge => !badge.achieved);

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
            Gamificacao & Retencao
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase leading-none text-brand-light md:text-5xl">
            Consistencia local, sem ranking falso
          </h2>
        </div>
        <div className="border-2 border-brand-light bg-brand-dark px-4 py-3 font-mono text-xs uppercase tracking-widest text-brand-light shadow-brutal-light">
          Nivel {state.profileTitle.level} · {state.profileTitle.xp} XP
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-brand-neon" />
              <div>
                <h3 className="font-display text-3xl uppercase text-brand-light">Leaderboard pessoal</h3>
                <p className="font-mono text-xs text-brand-muted">
                  Semanas ranqueadas por dias ativos e conclusao, nao por carga bruta.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {state.leaderboard.map(entry => (
                <div key={entry.id} className="grid gap-3 border border-brand-light/10 bg-brand-gray p-3 sm:grid-cols-[48px_1fr_auto] sm:items-center">
                  <div className="font-display text-4xl text-brand-neon">#{entry.rank}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-bold uppercase tracking-wider text-brand-light">
                        {entry.label}
                      </p>
                      {entry.isCurrentWeek && (
                        <span className="border border-brand-neon px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                          atual
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-brand-muted">
                      {entry.rangeLabel} · {entry.workouts}/{entry.target} dias · {Math.round(entry.completionRate * 100)}% conclusao
                    </p>
                    <ProgressBar percent={entry.score} tone="neon" />
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-display text-4xl text-brand-light">{entry.score}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">score</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="border-2 border-brand-magenta/60 bg-brand-dark p-5 shadow-brutal-magenta">
            <div className="mb-4 flex items-center gap-3">
              <Flame className="h-6 w-6 text-brand-magenta" />
              <div>
                <h3 className="font-display text-3xl uppercase text-brand-light">Streak freeze</h3>
                <p className="font-mono text-xs text-brand-muted">{state.freeze.statusLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Streak bruto" value={`${state.freeze.rawDailyStreak}d`} />
              <MiniStat label="Com freeze" value={`${state.freeze.protectedDailyStreak}d`} />
              <MiniStat label="Freezes livres" value={state.freeze.freezesRemaining} />
            </div>
            <p className="mt-4 font-mono text-sm leading-6 text-brand-light/75">
              {state.freeze.explanation}
            </p>
          </article>
        </div>

        <div className="space-y-5">
          <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
            <div className="mb-4 flex items-center gap-3">
              <Award className="h-6 w-6 text-brand-neon" />
              <div>
                <h3 className="font-display text-3xl uppercase text-brand-light">Titulo de perfil</h3>
                <p className="font-mono text-xs text-brand-muted">
                  {state.profileTitle.nextTitle
                    ? `${state.profileTitle.xpToNextTitle} XP ate ${state.profileTitle.nextTitle}`
                    : 'Titulo maximo local alcancado'}
                </p>
              </div>
            </div>
            <div className="border-2 border-brand-neon bg-brand-neon px-4 py-3 text-brand-dark shadow-brutal-neon">
              <p className="font-display text-4xl uppercase leading-none">{state.profileTitle.title}</p>
            </div>
            <ProgressBar percent={state.profileTitle.progressPercent} tone="neon" />
          </article>

          <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
            <div className="mb-4 flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 text-brand-neon" />
              <div>
                <h3 className="font-display text-3xl uppercase text-brand-light">Badges de estilo</h3>
                <p className="font-mono text-xs text-brand-muted">
                  {achievedBadges.length} conquistados · {inProgressBadges.length} em progresso
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {state.badges.map(badge => (
                <div key={badge.id} className="border border-brand-light/10 bg-brand-gray p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold uppercase tracking-wider text-brand-light">
                        {badge.title}
                      </p>
                      <p className="mt-1 font-mono text-xs leading-5 text-brand-muted">
                        {badge.description}
                      </p>
                    </div>
                    {badge.achieved ? (
                      <ShieldCheck className="h-5 w-5 shrink-0 text-brand-neon" />
                    ) : (
                      <LockKeyhole className="h-5 w-5 shrink-0 text-brand-muted" />
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 font-mono text-xs text-brand-muted">
                    <span>{badge.progress}/{badge.target} {badge.unit}</span>
                    <span>{badge.percent}%</span>
                  </div>
                  <ProgressBar percent={badge.percent} tone={badge.achieved ? 'neon' : 'magenta'} compact />
                </div>
              ))}
            </div>
          </article>

          <article className="border-2 border-brand-light/20 bg-brand-dark p-5">
            <div className="mb-4 flex items-center gap-3">
              <Eye className="h-6 w-6 text-brand-magenta" />
              <div>
                <h3 className="font-display text-3xl uppercase text-brand-light">Missoes escondidas</h3>
                <p className="font-mono text-xs text-brand-muted">Geradas pela data e pelo historico local.</p>
              </div>
            </div>

            <div className="space-y-3">
              {state.hiddenMissions.map(mission => (
                <div key={mission.id} className="border border-brand-light/10 bg-brand-gray p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold uppercase tracking-wider text-brand-light">
                        {mission.revealed ? mission.title : mission.hiddenTitle}
                      </p>
                      <p className="mt-1 font-mono text-xs leading-5 text-brand-muted">{mission.hint}</p>
                    </div>
                    <span className="border border-brand-magenta px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-magenta">
                      {mission.completed ? 'ok' : mission.revealed ? 'vista' : 'oculta'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 font-mono text-xs text-brand-muted">
                    <span>{mission.progress}/{mission.target} {mission.unit}</span>
                    <span>{mission.rewardLabel}</span>
                  </div>
                  <ProgressBar percent={mission.percent} tone={mission.completed ? 'neon' : 'magenta'} compact />
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-brand-light/10 bg-brand-gray p-3">
      <p className="font-display text-3xl text-brand-light">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{label}</p>
    </div>
  );
}

function ProgressBar({
  percent,
  tone,
  compact = false,
}: {
  percent: number;
  tone: 'neon' | 'magenta';
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? 'mt-2 h-2' : 'mt-4 h-3'} w-full border border-brand-light/10 bg-brand-dark`}>
      <div
        className={`h-full ${tone === 'neon' ? 'bg-brand-neon' : 'bg-brand-magenta'}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
