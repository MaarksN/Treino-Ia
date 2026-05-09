import React from 'react';
import { RecoveryCheckin } from '../types';
import { calculateReadiness } from '../utils/personalization';

interface Props {
  checkin: RecoveryCheckin | null;
}

export function ReadinessCard({ checkin }: Props) {
  if (!checkin) {
    return (
      <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-2">Prontidão</h3>
        <p className="text-brand-muted text-sm font-mono">
          Faça seu check-in de recuperação para habilitar ajustes inteligentes.
        </p>
      </div>
    );
  }

  const readiness = calculateReadiness(checkin);

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light h-full">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-2">Prontidão do dia</h3>
      <p className="text-4xl font-black font-display text-brand-neon text-shadow-neon">{readiness.label}</p>
      <p className="text-brand-muted text-sm mt-2 font-mono">Score: {readiness.score}</p>
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-brand-light/70 font-mono">
        <div>Sono: {checkin.sleepHours}h</div>
        <div>Estresse: {checkin.stressLevel}/10</div>
        <div>Dor muscular: {checkin.sorenessLevel}/10</div>
        <div>Energia: {checkin.energyLevel}/10</div>
      </div>
    </div>
  );
}
