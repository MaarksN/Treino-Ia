import { memo, useMemo } from 'react';
import { getCurrentWeeklyChallenge, calculateLocalChallengeProgress } from '../../services/socialContent/weeklyChallengeService';
import { WorkoutSession } from '../../../../services/database';
import { Target, Info } from 'lucide-react';

interface WeeklyChallengePanelProps {
  history: WorkoutSession[];
}

export const WeeklyChallengePanel = memo(function WeeklyChallengePanel({ history }: WeeklyChallengePanelProps) {
  const challenge = useMemo(() => getCurrentWeeklyChallenge(), []);
  const progress = useMemo(() => calculateLocalChallengeProgress(challenge, history), [challenge, history]);
  const progressPercent = Math.min(Math.round((progress / challenge.target) * 100), 100);

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-brand-neon/20 p-2 text-brand-neon">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="font-display text-2xl uppercase text-brand-light">Desafio da Semana</h3>
        </div>

        <div>
          <h4 className="font-mono text-lg font-bold text-brand-light">{challenge.title}</h4>
          <p className="mt-1 font-mono text-sm text-brand-light/70">{challenge.description}</p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between font-mono text-xs text-brand-light/80">
            <span>Progresso Pessoal</span>
            <span>{Math.round(progress)} / {challenge.target} {challenge.unit}</span>
          </div>
          <div className="h-4 w-full rounded-full bg-brand-dark overflow-hidden">
            <div
              className="h-full bg-brand-neon transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-[16px] bg-brand-dark/50 p-3 text-brand-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wider">
            Desafio semanal da comunidade — modo preview/local. Seus dados não são compartilhados.
          </p>
        </div>
      </div>
    </section>
  );
});
