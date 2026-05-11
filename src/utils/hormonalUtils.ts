import { CycleDay, CycleEntry, MenstrualPhase } from '../types';

export function getPhaseForDate(date: string, cycles: CycleEntry[]): CycleDay | null {
  if (!cycles.length) return null;

  const last = cycles[cycles.length - 1];
  const start = new Date(`${last.startDate}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  const dayOfCycle = Math.floor((target.getTime() - start.getTime()) / 86400000) + 1;
  if (dayOfCycle < 1) return null;

  const cycleMod = ((dayOfCycle - 1) % last.cycleLengthDays) + 1;

  let phase: MenstrualPhase;
  let energyExpected: CycleDay['energyExpected'];
  let trainingRecommendation: string;
  let nutritionTip: string;

  if (cycleMod <= last.periodLengthDays) {
    phase = 'menstrual';
    energyExpected = 'baixa';
    trainingRecommendation = 'Atividade leve: mobilidade, caminhada e treino de baixa intensidade. Evite esforço máximo.';
    nutritionTip = 'Aumente ferro, magnésio e ômega-3 para apoiar energia e conforto.';
  } else if (cycleMod <= 13) {
    phase = 'folicular';
    energyExpected = 'moderada';
    trainingRecommendation = 'Fase boa para construir: treine força com progressão de carga e boa técnica.';
    nutritionTip = 'Aumente carboidratos complexos para sustentar treinos mais intensos.';
  } else if (cycleMod <= 16) {
    phase = 'ovulação';
    energyExpected = 'máxima';
    trainingRecommendation = 'Pico de performance: boa janela para PRs, HIIT e alta intensidade, mantendo técnica sólida.';
    nutritionTip = 'Priorize proteína e hidratação para aproveitar a fase de maior potência.';
  } else {
    phase = 'lútea';
    energyExpected = cycleMod <= last.cycleLengthDays - 4 ? 'moderada' : 'baixa';
    trainingRecommendation = 'Fase lútea: fadiga pode subir. Priorize treinos moderados, técnica e recovery.';
    nutritionTip = 'Vontade de carboidrato pode aumentar. Prefira aveia, batata-doce e reduza excesso de sal.';
  }

  return { date, phase, dayOfCycle: cycleMod, energyExpected, trainingRecommendation, nutritionTip };
}

export const PHASE_CONFIG: Record<MenstrualPhase, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  menstrual: {
    label: 'Menstrual',
    emoji: '🌑',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
  },
  folicular: {
    label: 'Folicular',
    emoji: '🌱',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.3)',
  },
  ovulação: {
    label: 'Ovulação',
    emoji: '🌕',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.3)',
  },
  lútea: {
    label: 'Lútea',
    emoji: '🌘',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.3)',
  },
};
