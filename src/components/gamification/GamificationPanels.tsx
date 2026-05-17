import { type WorkoutSession } from '../../services/database';
import { getLifestyleBadges, canApplyStreakFreeze } from '../../services/gamification/badgeRules';
import { getProfileTitle } from '../../services/gamification/profileTitles';
import { getDailyMissions } from '../../services/gamification/dailyMissions';
import { buildMonthlyTrainingReport } from '../../services/reports/monthlyTrainingReport';
export function GamificationPanels({ history }: { history: WorkoutSession[] }) {
  const badges = getLifestyleBadges({ hydrationStreakDays: Math.min(10, history.length), workoutsCompleted: history.length, personalRecords: history.length ? 1 : 0 });
  const freeze = canApplyStreakFreeze(Math.max(0, history.length - 1), 1, history.length > 0 ? 1 : 2);
  const title = getProfileTitle(history.length, Math.min(30, history.length));
  const missions = getDailyMissions(new Date().toISOString().slice(0, 10));
  const report = buildMonthlyTrainingReport(new Date().toISOString().slice(0, 7), history.slice(0, 20));
  return <section className="mb-8 grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Título do perfil</h3><p className="font-mono">{title}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Badges</h3><p className="font-mono text-xs">{badges.length ? badges.join(', ') : 'Sem badges ainda'}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Streak freeze</h3><p className="font-mono text-xs">{freeze ? 'Freeze disponível para hoje.' : 'Sem freeze aplicável hoje.'}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Missões diárias</h3><ul className="font-mono text-xs list-disc pl-4">{missions.map(m => <li key={m}>{m}</li>)}</ul></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4 md:col-span-2"><h3 className="font-display text-2xl">Relatório mensal</h3><p className="font-mono text-xs">Sessões: {report.sessions} | Volume: {Math.round(report.totalVolume)} kg | Duração média: {report.averageDurationMinutes} min.</p></article></section>;
}
