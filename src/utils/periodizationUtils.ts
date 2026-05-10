import {
  LoadSuggestion,
  MuscleGroup,
  MuscleVolumeLandmark,
  PeriodizationWeek,
  TrainingExercisePerformance,
  TwelveWeekPlan,
  VolumeStatus,
} from '../types';

export const DEFAULT_LANDMARKS: MuscleVolumeLandmark[] = [
  { muscle: 'Peito', mev: 8, mav: 14, mrv: 20, currentVolume: 0 },
  { muscle: 'Costas', mev: 10, mav: 16, mrv: 22, currentVolume: 0 },
  { muscle: 'Quadríceps', mev: 8, mav: 14, mrv: 20, currentVolume: 0 },
  { muscle: 'Posteriores', mev: 6, mav: 10, mrv: 16, currentVolume: 0 },
  { muscle: 'Glúteos', mev: 6, mav: 12, mrv: 18, currentVolume: 0 },
  { muscle: 'Ombros', mev: 8, mav: 14, mrv: 20, currentVolume: 0 },
  { muscle: 'Bíceps', mev: 6, mav: 10, mrv: 14, currentVolume: 0 },
  { muscle: 'Tríceps', mev: 6, mav: 10, mrv: 14, currentVolume: 0 },
  { muscle: 'Panturrilhas', mev: 6, mav: 12, mrv: 18, currentVolume: 0 },
  { muscle: 'Core', mev: 4, mav: 8, mrv: 12, currentVolume: 0 },
];

export function inferMuscleGroup(exerciseName: string): MuscleGroup {
  const name = exerciseName.toLowerCase();

  if (name.includes('supino') || name.includes('crucifixo') || name.includes('peito')) return 'Peito';
  if (name.includes('remada') || name.includes('puxada') || name.includes('barra') || name.includes('costas')) return 'Costas';
  if (name.includes('agachamento') || name.includes('leg') || name.includes('extensora')) return 'Quadríceps';
  if (name.includes('stiff') || name.includes('terra') || name.includes('flexora')) return 'Posteriores';
  if (name.includes('gluteo') || name.includes('glúteo') || name.includes('hip thrust')) return 'Glúteos';
  if (name.includes('desenvolvimento') || name.includes('elevação lateral') || name.includes('ombro')) return 'Ombros';
  if (name.includes('rosca') || name.includes('biceps') || name.includes('bíceps')) return 'Bíceps';
  if (name.includes('triceps') || name.includes('tríceps') || name.includes('francês') || name.includes('corda')) return 'Tríceps';
  if (name.includes('panturrilha')) return 'Panturrilhas';
  if (name.includes('prancha') || name.includes('abdominal') || name.includes('core')) return 'Core';

  return 'Peito';
}

export function classifyVolume(
  current: number,
  mev: number,
  mav: number,
  mrv: number,
): {
  status: VolumeStatus;
  label: string;
  className: string;
  recommendation: string;
} {
  if (current < mev) {
    return {
      status: 'below_mev',
      label: 'Abaixo do MEV',
      className: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      recommendation: 'Aumente séries semanais para gerar estímulo mínimo efetivo.',
    };
  }

  if (current <= mav) {
    return {
      status: 'optimal',
      label: 'Faixa ótima',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      recommendation: 'Volume bem posicionado. Mantenha e progrida carga com cautela.',
    };
  }

  if (current <= mrv) {
    return {
      status: 'high_tolerable',
      label: 'Alto, mas tolerável',
      className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      recommendation: 'Monitore fadiga. Evite adicionar mais séries sem necessidade.',
    };
  }

  return {
    status: 'above_mrv',
    label: 'Acima do MRV',
    className: 'bg-red-500/10 text-red-300 border-red-500/30',
    recommendation: 'Reduza volume. Alto risco de estagnação, dor ou recuperação insuficiente.',
  };
}

export function calculateWeeklyMuscleVolumes(
  performances: TrainingExercisePerformance[],
): MuscleVolumeLandmark[] {
  const rows = DEFAULT_LANDMARKS.map(item => ({ ...item, currentVolume: 0 }));

  for (const exercise of performances) {
    if (exercise.completed === false) continue;

    const muscle = exercise.muscle ?? inferMuscleGroup(exercise.exerciseName);
    const row = rows.find(item => item.muscle === muscle);

    if (!row) continue;

    const effectiveSets = exercise.rpe >= 6
      ? exercise.sets
      : Math.max(1, Math.round(exercise.sets * 0.5));
    row.currentVolume += effectiveSets;
  }

  return rows;
}

export function nextLoad(currentLoad: number, action: LoadSuggestion['action']): number {
  if (action === 'increase') return Number((currentLoad * 1.025).toFixed(1));
  if (action === 'decrease') return Number((currentLoad * 0.93).toFixed(1));
  return currentLoad;
}

export function createLoadSuggestion(
  performance: TrainingExercisePerformance,
  fatigueScore: number,
): LoadSuggestion {
  const rir =
    performance.rir ??
    Math.max(0, Math.round(10 - performance.rpe));

  if (performance.pain) {
    return {
      exerciseName: performance.exerciseName,
      currentLoad: performance.currentLoad,
      suggestedLoad: nextLoad(performance.currentLoad, 'swap'),
      action: 'swap',
      reason: 'Dor reportada. Recomendada troca por variação mais segura.',
      confidence: 92,
    };
  }

  if (fatigueScore >= 70 || performance.rpe >= 9.5) {
    return {
      exerciseName: performance.exerciseName,
      currentLoad: performance.currentLoad,
      suggestedLoad: nextLoad(performance.currentLoad, 'decrease'),
      action: 'decrease',
      reason: 'Fadiga alta ou RPE excessivo. Reduzir carga protege recuperação.',
      confidence: 88,
    };
  }

  if (performance.actualReps >= performance.targetReps + 2 && rir >= 2 && fatigueScore < 55) {
    return {
      exerciseName: performance.exerciseName,
      currentLoad: performance.currentLoad,
      suggestedLoad: nextLoad(performance.currentLoad, 'increase'),
      action: 'increase',
      reason: 'Reps acima da meta com reserva. Aplicar progressão conservadora.',
      confidence: 84,
    };
  }

  if (performance.actualReps < performance.targetReps - 2 || performance.rpe >= 9) {
    return {
      exerciseName: performance.exerciseName,
      currentLoad: performance.currentLoad,
      suggestedLoad: nextLoad(performance.currentLoad, 'decrease'),
      action: 'decrease',
      reason: 'Performance abaixo da meta ou esforço alto demais.',
      confidence: 80,
    };
  }

  return {
    exerciseName: performance.exerciseName,
    currentLoad: performance.currentLoad,
    suggestedLoad: performance.currentLoad,
    action: 'keep',
    reason: 'Carga adequada para a sessão atual.',
    confidence: 76,
  };
}

export function shouldSuggestExerciseSwap(performance: TrainingExercisePerformance): boolean {
  return Boolean(
    performance.pain ||
    performance.rpe >= 9.5 ||
    performance.actualReps <= Math.max(1, performance.targetReps - 4),
  );
}

export function buildTwelveWeekPlan(): TwelveWeekPlan {
  const weeks: PeriodizationWeek[] = [
    {
      week: 1,
      phase: 'resistance',
      title: 'Base de resistência',
      volumeMultiplier: 0.85,
      intensityMultiplier: 0.75,
      targetRpe: '6-7',
      focus: 'Técnica, tolerância de volume e consistência.',
      notes: 'Evitar falha. Construir base articular e cardiorrespiratória.',
    },
    {
      week: 2,
      phase: 'hypertrophy',
      title: 'Hipertrofia inicial',
      volumeMultiplier: 1,
      intensityMultiplier: 0.8,
      targetRpe: '7',
      focus: 'Volume moderado e progressão leve.',
      notes: 'Aumentar séries se recuperação estiver boa.',
    },
    {
      week: 3,
      phase: 'hypertrophy',
      title: 'Hipertrofia progressiva',
      volumeMultiplier: 1.08,
      intensityMultiplier: 0.82,
      targetRpe: '7-8',
      focus: 'Mais séries efetivas por músculo.',
      notes: 'Manter execução controlada.',
    },
    {
      week: 4,
      phase: 'hypertrophy',
      title: 'Hipertrofia alta',
      volumeMultiplier: 1.15,
      intensityMultiplier: 0.84,
      targetRpe: '8',
      focus: 'Volume próximo do MAV.',
      notes: 'Monitorar dor muscular e sono.',
    },
    {
      week: 5,
      phase: 'hypertrophy',
      title: 'Overreach controlado',
      volumeMultiplier: 1.2,
      intensityMultiplier: 0.86,
      targetRpe: '8-9',
      focus: 'Semana mais pesada do bloco.',
      notes: 'Não ultrapassar MRV.',
    },
    {
      week: 6,
      phase: 'deload',
      title: 'Deload',
      volumeMultiplier: 0.55,
      intensityMultiplier: 0.7,
      targetRpe: '5-6',
      focus: 'Redução de fadiga acumulada.',
      notes: 'Cortar 40-50% do volume.',
    },
    {
      week: 7,
      phase: 'strength',
      title: 'Força inicial',
      volumeMultiplier: 0.85,
      intensityMultiplier: 0.9,
      targetRpe: '7-8',
      focus: 'Cargas mais altas, menos reps.',
      notes: 'Foco nos compostos.',
    },
    {
      week: 8,
      phase: 'strength',
      title: 'Força progressiva',
      volumeMultiplier: 0.8,
      intensityMultiplier: 0.94,
      targetRpe: '8',
      focus: 'Progressão em exercícios principais.',
      notes: 'Descanso maior entre séries.',
    },
    {
      week: 9,
      phase: 'strength',
      title: 'Força pesada',
      volumeMultiplier: 0.75,
      intensityMultiplier: 0.97,
      targetRpe: '8-9',
      focus: 'Intensidade alta com controle.',
      notes: 'Evitar falha técnica.',
    },
    {
      week: 10,
      phase: 'peak',
      title: 'Bloco de pico',
      volumeMultiplier: 0.65,
      intensityMultiplier: 1,
      targetRpe: '8-9',
      focus: 'Pico de performance.',
      notes: 'Poucas séries, alta qualidade.',
    },
    {
      week: 11,
      phase: 'taper',
      title: 'Taper',
      volumeMultiplier: 0.45,
      intensityMultiplier: 0.88,
      targetRpe: '6-7',
      focus: 'Dissipar fadiga sem perder performance.',
      notes: 'Redução forte de volume.',
    },
    {
      week: 12,
      phase: 'transition',
      title: 'Teste e transição',
      volumeMultiplier: 0.7,
      intensityMultiplier: 0.92,
      targetRpe: '7-8',
      focus: 'Avaliar PRs, técnica e novo ciclo.',
      notes: 'Registrar resultados para o próximo macrociclo.',
    },
  ];

  return {
    title: 'Macrociclo Automatizado de 12 Semanas',
    createdAt: new Date().toISOString(),
    weeks,
  };
}
