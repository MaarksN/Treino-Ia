import React, { useMemo, useState } from 'react';
import { Activity, Camera, Droplets, Heart, Moon, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { loadWearableSessions } from '../services/bluetoothService';
import { loadPoseAnalyses } from '../services/poseService';
import {
  getAvgSleepDuration,
  getAvgSleepQuality,
  getSleepQualityColor,
  getTodayHydration,
  loadHydrationEntries,
  loadHydrationGoal,
  loadSleepEntries,
} from '../utils/biometricUtils';
import { getPhaseForDate, loadCycleEntries, PHASE_CONFIG } from '../utils/hormonalUtils';

interface Props {
  profile: UserProfile;
}

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function BiometricDashboard({ profile }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const data = useMemo(() => {
    const wearableSessions = loadWearableSessions();
    const hydrationEntries = loadHydrationEntries();
    const sleepEntries = loadSleepEntries();
    const cycleEntries = loadCycleEntries();
    const poseAnalyses = loadPoseAnalyses();
    const hydrationGoal = loadHydrationGoal();

    return {
      wearableSessions,
      hydrationEntries,
      sleepEntries,
      cycleEntries,
      poseAnalyses,
      hydrationGoal,
    };
  }, [refreshKey]);

  const todayHydration = getTodayHydration(data.hydrationEntries);
  const hydrationPct = Math.min((todayHydration / data.hydrationGoal.dailyMl) * 100, 100);
  const avgSleepQuality = getAvgSleepQuality(data.sleepEntries);
  const avgSleepDuration = getAvgSleepDuration(data.sleepEntries);
  const todayPhase = getPhaseForDate(today, data.cycleEntries);
  const phaseCfg = todayPhase ? PHASE_CONFIG[todayPhase.phase] : null;
  const lastSession = data.wearableSessions[data.wearableSessions.length - 1];
  const lastPose = data.poseAnalyses[data.poseAnalyses.length - 1];

  const bioScore = useMemo(() => {
    let score = 0;
    let factors = 0;

    score += hydrationPct;
    factors += 1;

    if (data.sleepEntries.length) {
      score += (avgSleepQuality / 5) * 100;
      score += Math.min((avgSleepDuration / 480) * 100, 100);
      factors += 2;
    }

    if (lastSession) {
      const hrScore = lastSession.avgHR < 60 ? 100 : lastSession.avgHR < 80 ? 80 : 60;
      score += hrScore;
      factors += 1;
    }

    if (lastPose) {
      score += lastPose.formScore;
      factors += 1;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }, [avgSleepDuration, avgSleepQuality, data.sleepEntries.length, hydrationPct, lastPose, lastSession]);

  const bioScoreColor = bioScore >= 80 ? '#a3e635' : bioScore >= 60 ? '#fbbf24' : '#ef4444';
  const bioScoreLabel = bioScore >= 80 ? 'Excelente' : bioScore >= 60 ? 'Bom' : 'Atenção';

  const cards = [
    {
      icon: <Droplets size={18} />,
      label: 'Hidratação hoje',
      value: `${(todayHydration / 1000).toFixed(1)}L`,
      sub: `${Math.round(hydrationPct)}% da meta`,
      color: hydrationPct >= 80 ? '#22d3ee' : hydrationPct >= 50 ? '#fbbf24' : '#ef4444',
    },
    {
      icon: <Moon size={18} />,
      label: 'Sono (média 7d)',
      value: `${(avgSleepDuration / 60).toFixed(1)}h`,
      sub: `Qualidade ${avgSleepQuality.toFixed(1)}/5`,
      color: getSleepQualityColor(Math.round(avgSleepQuality)),
    },
    {
      icon: <Heart size={18} />,
      label: 'FC média',
      value: lastSession ? `${lastSession.avgHR} bpm` : '—',
      sub: lastSession ? `Máx: ${lastSession.maxHR} bpm` : 'Sem dados',
      color: '#ef4444',
    },
    {
      icon: <Camera size={18} />,
      label: 'Forma',
      value: lastPose ? `${lastPose.formScore}/100` : '—',
      sub: lastPose ? lastPose.exerciseName : 'Sem análise',
      color: lastPose ? (lastPose.formScore >= 80 ? '#a3e635' : '#fbbf24') : '#6b7280',
    },
  ];

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Saúde Biométrica</h3>
          <p className="text-brand-muted text-xs">{profile.weight || 75}kg · {profile.age || 30} anos</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey(value => value + 1)}
          className="p-2 rounded-full text-brand-muted hover:text-brand-neon hover:bg-white/10"
          aria-label="Atualizar biometria"
          title="Atualizar biometria"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-5 p-4 bg-brand-dark rounded-xl border border-white/10">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={bioScoreColor}
              strokeWidth="12"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - bioScore / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-black text-xl tabular-nums" style={{ color: bioScoreColor }}>{bioScore}</p>
          </div>
        </div>
        <div>
          <p className="text-brand-muted text-xs uppercase tracking-widest">Score biométrico</p>
          <p className="text-white font-black text-2xl" style={{ color: bioScoreColor }}>{bioScoreLabel}</p>
          <p className="text-brand-muted text-xs mt-1">
            Baseado em hidratação, sono, frequência cardíaca e forma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map(card => (
          <div key={card.label} className="p-3 bg-brand-dark rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-1" style={{ color: card.color }}>
              {card.icon}
              <p className="text-xs">{card.label}</p>
            </div>
            <p className="text-white font-black text-lg tabular-nums">{card.value}</p>
            <p className="text-brand-muted text-xs mt-0.5 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {todayPhase && phaseCfg && (
        <div className="p-3 rounded-xl border flex items-center gap-3" style={{ background: phaseCfg.bg, borderColor: phaseCfg.border }}>
          <span className="text-3xl">{phaseCfg.emoji}</span>
          <div>
            <p className="text-xs" style={{ color: phaseCfg.color }}>Fase hormonal · Dia {todayPhase.dayOfCycle}</p>
            <p className="text-white font-bold">{phaseCfg.label}</p>
            <p className="text-white/70 text-xs mt-0.5 leading-tight">{truncate(todayPhase.trainingRecommendation, 88)}</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {hydrationPct < 50 && (
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-400 text-xs">Hidratação baixa hoje. Beba mais {((data.hydrationGoal.dailyMl - todayHydration) / 1000).toFixed(1)}L.</p>
          </div>
        )}
        {avgSleepDuration < 360 && data.sleepEntries.length >= 2 && (
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <p className="text-purple-400 text-xs">Sono abaixo de 6h em média. Isso compromete recovery e síntese proteica.</p>
          </div>
        )}
        {lastSession && lastSession.avgHR > 100 && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-xs">FC média acima de 100 bpm na última sessão. Considere recovery ativo.</p>
          </div>
        )}
        {bioScore >= 80 && (
          <div className="p-2.5 bg-brand-neon/10 border border-brand-neon/30 rounded-xl flex items-center gap-2">
            <Activity size={14} className="text-brand-neon" />
            <p className="text-brand-neon text-xs">Janela corporal favorável para treino de qualidade.</p>
          </div>
        )}
      </div>
    </div>
  );
}
