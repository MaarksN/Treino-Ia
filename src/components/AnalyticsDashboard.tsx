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
import { WorkoutHistoryEntry, WorkoutPlan } from '../types';
import {
  getAdherenceRate,
  getAvgSessionDuration,
  getMuscleGroupVolume,
  getTotalVolumeLifted,
  getWeeklyStats,
} from '../utils/analyticsUtils';

interface Props {
  history: WorkoutHistoryEntry[];
  plans: WorkoutPlan[];
}

type AnalyticsTab = 'kpis' | 'volume' | 'musculos' | 'evolucao' | 'radar';

const NEON = '#a3e635';
const BLUE = '#60a5fa';
const ORANGE = '#fb923c';

export function AnalyticsDashboard({ history, plans }: Props) {
  const [tab, setTab] = useState<AnalyticsTab>('kpis');
  const weeklyStats = useMemo(() => getWeeklyStats(history), [history]);
  const muscleVolume = useMemo(() => getMuscleGroupVolume(history, plans).slice(0, 8), [history, plans]);
  const adherence = useMemo(() => getAdherenceRate(history), [history]);
  const totalVolume = useMemo(() => getTotalVolumeLifted(history), [history]);
  const avgDuration = useMemo(() => getAvgSessionDuration(history), [history]);
  const volumeData = weeklyStats.map(week => ({ name: week.weekLabel, volume: Math.round(week.totalVolume) }));
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
  ];

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-4">Analytics de treino</h3>

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
              { label: 'Volume total', value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`, color: 'text-orange-400' },
              { label: 'Duração média', value: avgDuration ? `${avgDuration}min` : '-', color: 'text-brand-magenta' },
            ].map(item => (
              <div key={item.label} className="bg-brand-dark border-2 border-brand-light/10 p-4">
                <p className={`text-2xl font-black tabular-nums ${item.color}`}>{item.value}</p>
                <p className="text-xs text-brand-muted mt-1">{item.label}</p>
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
                style={{ width: `${adherence}%`, background: adherence >= 80 ? NEON : adherence >= 50 ? ORANGE : '#ef4444' }}
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
                    <p className="text-brand-muted text-xs">{entry.totalVolume > 0 ? `${entry.totalVolume}kg` : '-'}</p>
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
          <p className="text-sm text-brand-muted">Volume total levantado por semana</p>
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

          <p className="text-sm text-brand-muted">Sessões por semana</p>
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
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">Volume acumulado por grupo muscular</p>
          {muscleVolume.length > 0 ? (
            <div className="space-y-2">
              {muscleVolume.map((item, index) => {
                const pct = muscleVolume[0].volume ? (item.volume / muscleVolume[0].volume) * 100 : 0;
                return (
                  <div key={item.group}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-light">{item.group}</span>
                      <span className="text-brand-muted tabular-nums">{item.volume.toLocaleString()}kg</span>
                    </div>
                    <div className="h-2 bg-white/10 overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${pct}%`, background: `hsl(${80 - index * 8}, 70%, ${55 - index * 2}%)`, transition: 'width 0.5s ease' }}
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
      )}

      {tab === 'evolucao' && (
        <div className="space-y-4">
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

          <p className="text-sm text-brand-muted">Aderência semanal</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats.map(week => ({ name: week.weekLabel, aderencia: Math.round(week.adherence * 100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca9bb" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1c1b19', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: NEON }} />
                <Bar dataKey="aderencia">
                  {weeklyStats.map((week, index) => (
                    <Cell key={index} fill={week.adherence >= 0.8 ? NEON : week.adherence >= 0.5 ? ORANGE : '#ef4444'} />
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
    </div>
  );
}
