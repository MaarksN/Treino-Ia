import React from 'react';
import { Activity, AlertTriangle, Battery, Droplets, Moon, Zap } from 'lucide-react';
import { DailyCheckin } from '../types';
import { calculateReadiness, checkHydrationGoal, checkSleepGoal, getOvertrainingRisk } from '../utils/readinessUtils';

interface Props {
  checkin: DailyCheckin | null;
  allCheckins: DailyCheckin[];
}

export function ReadinessIndex({ checkin, allCheckins }: Props) {
  if (!checkin) {
    return (
      <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-2">Prontidão do dia</h3>
        <p className="text-brand-muted text-sm">Faça o check-in diário para calcular seu índice de prontidão.</p>
      </div>
    );
  }

  const readiness = calculateReadiness(checkin);
  const risk = getOvertrainingRisk(allCheckins);
  const sleepGoalHit = checkSleepGoal(checkin);
  const hydrationGoalHit = checkHydrationGoal(checkin);
  const riskClass = {
    baixo: 'border-green-500/30 bg-green-500/10 text-green-400',
    médio: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    alto: 'border-red-500/30 bg-red-500/10 text-red-400',
  }[risk];

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-brand-neon" />
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Prontidão do dia</h3>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={readiness.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - readiness.score / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-brand-light">{readiness.score}</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-3xl font-black" style={{ color: readiness.color }}>{readiness.label}</p>
          <p className="text-brand-muted text-sm mt-1">{readiness.recommendation}</p>
          <p className="text-brand-muted text-xs mt-1">Intensidade: {readiness.adjustedIntensity}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Sono', value: `${checkin.sleepHours}h`, Icon: Moon, ok: sleepGoalHit },
          { label: 'Energia', value: `${checkin.energyLevel}/10`, Icon: Zap, ok: checkin.energyLevel >= 6 },
          { label: 'Estresse', value: `${checkin.stressLevel}/10`, Icon: Battery, ok: checkin.stressLevel <= 6 },
          { label: 'Água', value: `${checkin.hydrationGlasses}`, Icon: Droplets, ok: hydrationGoalHit },
        ].map(({ label, value, Icon, ok }) => (
          <div key={label} className="bg-brand-dark border-2 border-brand-light/10 p-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${ok ? 'text-brand-neon' : 'text-orange-400'}`} />
            <p className="text-xs text-brand-muted">{label}</p>
            <p className="text-sm font-bold text-brand-light">{value}</p>
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 p-3 border-2 text-sm ${riskClass}`}>
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Risco de overtraining: <strong>{risk}</strong></span>
      </div>
    </div>
  );
}
