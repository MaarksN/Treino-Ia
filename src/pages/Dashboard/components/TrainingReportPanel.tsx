import { type ReactNode, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Gauge, Trophy } from 'lucide-react';
import { type WorkoutSession } from '../../../services/database';
import {
  buildTrainingPeriodReport,
  type TrainingReportPeriod,
} from '../../../services/reports/monthlyTrainingReport';

interface TrainingReportPanelProps {
  history: WorkoutSession[];
}

export function TrainingReportPanel({ history }: TrainingReportPanelProps) {
  const [period, setPeriod] = useState<TrainingReportPeriod>('month');
  const report = useMemo(() => buildTrainingPeriodReport(period, history), [history, period]);

  return (
    <section id="dashboard-reports" className="rounded-[28px] border-2 border-brand-neon bg-brand-gray/80 p-6 shadow-brutal-neon md:p-8 scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-brand-neon" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Relatorio mensal/anual</p>
            <h2 className="font-display text-4xl uppercase text-brand-light">{report.label}</h2>
          </div>
        </div>
        <div className="inline-grid grid-cols-2 rounded-full border border-brand-light/15 bg-brand-dark p-1">
          {(['month', 'year'] as TrainingReportPeriod[]).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-all ${
                period === option
                  ? 'bg-brand-neon text-brand-dark'
                  : 'text-brand-light/70 hover:text-brand-neon'
              }`}
            >
              {option === 'month' ? 'Mes' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ReportMetric icon={<CalendarDays />} label="Sessoes" value={String(report.sessions).padStart(2, '0')} />
        <ReportMetric icon={<BarChart3 />} label="Volume" value={`${Math.round(report.totalVolume).toLocaleString('pt-BR')} kg`} />
        <ReportMetric icon={<Gauge />} label="Aderencia" value={`${report.completionRate}%`} />
        <ReportMetric icon={<Trophy />} label="Foco" value={report.topFocus} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[22px] border border-brand-light/10 bg-brand-dark p-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Tempo ativo</p>
          <p className="mt-2 font-display text-5xl uppercase text-brand-light">{report.totalDurationMinutes} min</p>
          <p className="mt-2 font-mono text-xs leading-6 text-brand-light/65">
            Media de {report.averageDurationMinutes} min por treino em {report.activeDays} dia(s) ativo(s).
          </p>
        </article>

        <article className="rounded-[22px] border border-brand-light/10 bg-brand-dark p-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Destaques</p>
          <ul className="mt-3 space-y-2 font-mono text-xs leading-6 text-brand-light/75">
            {report.highlights.map(highlight => (
              <li key={highlight} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-neon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function ReportMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-[22px] border border-brand-light/10 bg-brand-dark p-4 transition-transform hover:-translate-y-0.5">
      <div className="mb-3 h-6 w-6 text-brand-neon">{icon}</div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{label}</p>
      <p className="mt-2 break-words font-display text-3xl uppercase leading-none text-brand-light">{value}</p>
    </article>
  );
}
