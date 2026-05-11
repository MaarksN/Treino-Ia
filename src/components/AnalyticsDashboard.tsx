import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { UserProfile, WorkoutHistoryEntry, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import {
  getAdherenceRate,
  getAvgSessionDuration,
  getGoalProgressIndicators,
  getMuscleGroupVolume,
  getTopWeeklyMuscleGroups,
  getTotalVolumeLifted,
  getWeekOverWeekComparison,
  getWeeklyAverageRpe,
  getWeeklyMuscleGroupVolume,
  getWeeklyStats,
} from '../utils/analyticsUtils';

interface Props {
  history: WorkoutHistoryEntry[];
  plans: WorkoutPlan[];
  workoutHistory?: WorkoutHistoryRecord[];
  profile?: UserProfile | null;
}

type AnalyticsTab = 'kpis' | 'volume' | 'musculos' | 'evolucao' | 'radar' | 'relatorio';

const NEON = '#a3e635';
const BLUE = '#60a5fa';
const ORANGE = '#fb923c';
const MAGENTA = '#e879f9';
const RED = '#ef4444';
const GROUP_COLORS = ['#a3e635', '#60a5fa', '#fb923c', '#e879f9', '#22d3ee'];

function formatVolume(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}t` : `${Math.round(value)}kg`;
}

function toneClass(tone: 'good' | 'warning' | 'danger' | 'info') {
  if (tone === 'good') return 'text-brand-neon';
  if (tone === 'warning') return 'text-orange-400';
  if (tone === 'danger') return 'text-red-400';
  return 'text-blue-400';
}

export function AnalyticsDashboard({ history, plans, workoutHistory = [], profile }: Props) {
  const [tab, setTab] = useState<AnalyticsTab>('kpis');
  const weeklyStats = useMemo(() => getWeeklyStats(history), [history]);
  const muscleVolume = useMemo(() => getMuscleGroupVolume(history, plans).slice(0, 8), [history, plans]);
  const weeklyMuscle = useMemo(() => getWeeklyMuscleGroupVolume(workoutHistory), [workoutHistory]);
  const topWeeklyGroups = useMemo(() => getTopWeeklyMuscleGroups(weeklyMuscle), [weeklyMuscle]);
  const weeklyRpe = useMemo(() => getWeeklyAverageRpe(workoutHistory), [workoutHistory]);
  const comparison = useMemo(
    () => getWeekOverWeekComparison(history, workoutHistory, profile?.daysPerWeek || 3),
    [history, profile?.daysPerWeek, workoutHistory],
  );
  const indicators = useMemo(
    () => getGoalProgressIndicators(profile, history, workoutHistory),
    [history, profile, workoutHistory],
  );
  const adherence = useMemo(() => getAdherenceRate(history), [history]);
  const totalVolume = useMemo(() => getTotalVolumeLifted(history), [history]);
  const avgDuration = useMemo(() => getAvgSessionDuration(history), [history]);
  const volumeData = weeklyStats.map(week => ({ name: week.weekLabel, volume: Math.round(week.totalVolume) }));
  const weeklyMuscleChartData = weeklyMuscle.map(point => ({
    name: point.weekLabel,
    ...topWeeklyGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group] = Math.round(point.groups[group] || 0);
      return acc;
    }, {}),
  }));
  const radarData = muscleVolume.slice(0, 6).map(item => ({
    subject: item.group.replace('Posterior de Coxa', 'Posterior').replace('Panturrilha', 'Pant.'),
    volume: item.volume,
  }));

  const tabs: Array<{ id: AnalyticsTab; label: string }> = [
    { id: 'kpis', label: 'KPIs' },
    { id: 'volume', label: 'Volume' },
    { id: 'musculos', label: 'Músculos' },
    { id: 'evolucao', label: 'Evolução' },
    { id: 'radar', label: 'Radar' },
    { id: 'relatorio', label: 'Semanas' },
  ];

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Analytics de treino</h3>
        <span className="text-[10px] text-brand-muted uppercase tracking-widest font-mono">Dados reais das sessões salvas</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
              tab === item.id
                ? 'bg-brand-neon text-brand-dark border-brand-neon'
                : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'kpis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Treinos totais', value: history.length, color: 'text-brand-neon' },
              { label: 'Aderência 30d', value: `${Math.round(adherence)}%`, color: 'text-blue-400' },
              { label: 'Volume total', value: formatVolume(totalVolume), color: 'text-orange-400' },
              { label: 'Duração média', value: avgDuration ? `${avgDuration}min` : '-', color: 'text-brand-magenta' },
            ].map(item => (
              <div key={item.label} className="bg-brand-dark border-2 border-brand-light/10 p-4">
                <p className={`text-2xl font-black tabular-nums ${item.color}`}>{item.value}</p>
                <p className="text-xs text-brand-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {indicators.map(item => (
              <div key={item.label} className="p-4 bg-brand-dark border-2 border-brand-light/10">
                <p className={`text-2xl font-black tabular-nums ${toneClass(item.tone)}`}>{item.value}</p>
                <p className="text-sm text-brand-light font-semibold">{item.label}</p>
                <p className="text-xs text-brand-muted mt-1">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-brand-dark border-2 border-brand-light/10">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-brand-light">Aderência nos últimos 30 dias</p>
              <p className="text-brand-neon font-bold text-sm">{Math.round(adherence)}%</p>
            </div>
            <div className="h-3 bg-white/10 overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${adherence}%`, background: adherence >= 80 ? NEON : adherence >= 50 ? ORANGE : RED }}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">Últimas sessões</p>
            <div className="space-y-2">
              {[...history].reverse().slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-brand-dark border-2 border-brand-light/10">
                  <div>
                    <p className="text-brand-light text-sm font-semibold">{entry.dayFocus || entry.planName}</p>
                    <p className="text-brand-muted text-xs">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-neon text-sm font-bold">{entry.completedCount}/{entry.exerciseCount}</p>
                    <p className="text-brand-muted text-xs">{entry.totalVolume > 0 ? formatVolume(entry.totalVolume) : '-'}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-brand-muted text-sm text-center py-4">Nenhum treino registrado ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'volume' && (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">Evolução da carga total movimentada por semana</p>
          {volumeData.some(item => item.volume > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={NEON} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: NEON }} />
                  <Area type="monotone" dataKey="volume" stroke={NEON} strokeWidth={3} fill="url(#volGrad)" dot={{ fill: NEON, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-8">Registre treinos com carga para ver o gráfico.</p>
          )}

          <p className="text-sm text-brand-muted">Frequência de treinos por semana</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats.map(week => ({ name: week.weekLabel, sessoes: week.sessions }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca9bb" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: BLUE }} />
                <Bar dataKey="sessoes" fill={BLUE} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'musculos' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-brand-muted mb-2">Volume semanal por grupo muscular</p>
            {topWeeklyGroups.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyMuscleChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} />
                    {topWeeklyGroups.map((group, index) => (
                      <Bar key={group} dataKey={group} stackId="volume" fill={GROUP_COLORS[index % GROUP_COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-brand-muted text-sm text-center py-6 bg-brand-dark border-2 border-brand-light/10">Registre treinos finalizados para ver volume semanal por músculo.</p>
            )}
          </div>

          <div>
            <p className="text-sm text-brand-muted mb-2">Volume acumulado por grupo muscular</p>
            {muscleVolume.length > 0 ? (
              <div className="space-y-2">
                {muscleVolume.map((item, index) => {
                  const pct = muscleVolume[0].volume ? (item.volume / muscleVolume[0].volume) * 100 : 0;
                  return (
                    <div key={item.group}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-brand-light">{item.group}</span>
                        <span className="text-brand-muted tabular-nums">{Math.round(item.volume).toLocaleString()}kg</span>
                      </div>
                      <div className="h-2 bg-white/10 overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, background: GROUP_COLORS[index % GROUP_COLORS.length], transition: 'width 0.5s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-brand-muted text-sm text-center py-8">Registre exercícios com grupo muscular para ver.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'evolucao' && (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">Evolução de RPE médio por semana</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyRpe.map(week => ({ name: week.weekLabel, rpe: week.avgRpe }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca9bb" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: MAGENTA }} />
                <Line type="monotone" dataKey="rpe" stroke={MAGENTA} strokeWidth={3} dot={{ fill: MAGENTA, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-brand-muted">Prontidão média por semana</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats.map(week => ({ name: week.weekLabel, readiness: Math.round(week.avgReadiness) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca9bb" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: ORANGE }} />
                <Line type="monotone" dataKey="readiness" stroke={ORANGE} strokeWidth={3} dot={{ fill: ORANGE, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-brand-muted">Aderência ao plano por semana</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats.map(week => ({ name: week.weekLabel, aderencia: Math.round(week.adherence * 100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca9bb" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: NEON }} />
                <Bar dataKey="aderencia">
                  {weeklyStats.map((week, index) => (
                    <Cell key={index} fill={week.adherence >= 0.8 ? NEON : week.adherence >= 0.5 ? ORANGE : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'radar' && (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">Equilíbrio muscular por volume acumulado</p>
          {radarData.length >= 3 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10 }} />
                  <Radar name="Volume" dataKey="volume" stroke={NEON} fill={NEON} fillOpacity={0.2} />
                  <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: NEON }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-8">Registre treinos com grupo muscular para ver o radar.</p>
          )}
        </div>
      )}

      {tab === 'relatorio' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-brand-dark border-2 border-brand-light/10 p-4">
              <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">{comparison.previousWeekLabel}</p>
              <p className="text-brand-light text-sm">Sessões: <strong>{comparison.previous.sessions}</strong></p>
              <p className="text-brand-light text-sm">Volume: <strong>{formatVolume(comparison.previous.totalVolume)}</strong></p>
              <p className="text-brand-light text-sm">Aderência: <strong>{Math.round(comparison.previous.adherence * 100)}%</strong></p>
              <p className="text-brand-light text-sm">RPE médio: <strong>{comparison.previous.avgRpe || '-'}</strong></p>
            </div>
            <div className="bg-brand-dark border-2 border-brand-light/10 p-4">
              <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">{comparison.currentWeekLabel}</p>
              <p className="text-brand-light text-sm">Sessões: <strong>{comparison.current.sessions}</strong></p>
              <p className="text-brand-light text-sm">Volume: <strong>{formatVolume(comparison.current.totalVolume)}</strong></p>
              <p className="text-brand-light text-sm">Aderência: <strong>{Math.round(comparison.current.adherence * 100)}%</strong></p>
              <p className="text-brand-light text-sm">RPE médio: <strong>{comparison.current.avgRpe || '-'}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Sessões', value: comparison.sessionsDelta >= 0 ? `+${comparison.sessionsDelta}` : comparison.sessionsDelta, color: comparison.sessionsDelta >= 0 ? 'text-brand-neon' : 'text-orange-400' },
              { label: 'Volume', value: `${comparison.volumeDelta >= 0 ? '+' : ''}${formatVolume(comparison.volumeDelta)}`, color: comparison.volumeDelta >= 0 ? 'text-brand-neon' : 'text-orange-400' },
              { label: 'Aderência', value: `${comparison.adherenceDelta >= 0 ? '+' : ''}${comparison.adherenceDelta}%`, color: comparison.adherenceDelta >= 0 ? 'text-brand-neon' : 'text-orange-400' },
              { label: 'RPE', value: `${comparison.rpeDelta >= 0 ? '+' : ''}${comparison.rpeDelta}`, color: comparison.rpeDelta <= 0.5 ? 'text-blue-400' : 'text-orange-400' },
            ].map(item => (
              <div key={item.label} className="bg-brand-dark border-2 border-brand-light/10 p-3">
                <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-brand-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-brand-light/80 bg-brand-dark border-2 border-brand-light/10 p-4">
            {history.length === 0
              ? 'Ainda não há semanas suficientes para comparar.'
              : 'Comparação calculada a partir das sessões finalizadas, volume movimentado, aderência esperada e RPE registrado.'}
          </p>
        </div>
      )}
    </div>
  );
}
