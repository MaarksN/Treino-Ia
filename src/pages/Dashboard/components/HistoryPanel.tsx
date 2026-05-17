import { History } from 'lucide-react';
import { type WorkoutSession } from '../../../services/database';
import { EmptyState } from '../../../components/ui/EmptyState';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryPanel({ history }: { history: WorkoutSession[] }) {
  return (
    <section id="dashboard-history" className="mb-8 rounded-[28px] border-2 border-brand-light/15 bg-brand-gray/80 p-6 shadow-brutal-light md:p-8 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3">
        <History className="h-6 w-6 text-brand-neon" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Histórico</p>
          <h2 className="font-display text-4xl uppercase text-brand-light">Sessões finalizadas</h2>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<History className="h-10 w-10" />}
          title="Nenhum treino finalizado"
          description="Inicie um dia do plano para alimentar o motor adaptativo e começar a preencher seu histórico."
        />
      ) : (
        <div className="space-y-3">
          {history.slice(0, 5).map(session => (
            <article key={session.id} className="rounded-[22px] border-2 border-brand-light/10 bg-brand-dark p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-neon/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-3xl uppercase text-brand-light">{session.focus}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    {formatDate(session.completedAt)} | {session.completedExercises}/{session.totalExercises} exercícios | {Math.round(session.totalVolume)} kg
                  </p>
                </div>
                <span className="rounded-full border-2 border-brand-neon px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                  {session.durationMinutes} min
                </span>
              </div>
              {session.nextRecommendation && (
                <p className="mt-3 font-mono text-xs leading-6 text-brand-light/65">{session.nextRecommendation}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
