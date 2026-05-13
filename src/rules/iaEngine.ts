import type {
  ExercisePrescription,
  TrainingLevel,
  TrainingPlan,
  UserProfile,
  WorkoutSession,
} from '../services/database';

export type { TrainingPlan } from '../services/database';

type FocusKey = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';

interface Strategy {
  volume: string;
  frequency: string;
  focus: string;
  aiRecommendation: string;
}

const strategies: Record<TrainingLevel, Strategy> = {
  iniciante: {
    volume: 'Baixo (9 a 12 séries/músculo)',
    frequency: '3x na semana (Full body)',
    focus: 'Adaptação anatômica e execução',
    aiRecommendation: 'Priorize técnica, amplitude e consistência antes de subir carga.',
  },
  intermediario: {
    volume: 'Médio (14 a 18 séries/músculo)',
    frequency: '4x a 5x na semana (AB ou ABC)',
    focus: 'Progressão de carga',
    aiRecommendation: 'Registre carga e reps. A progressão deve ser pequena, constante e mensurável.',
  },
  avancado: {
    volume: 'Alto (18 a 22 séries/músculo)',
    frequency: '5x a 6x na semana (ABCDE/PPL)',
    focus: 'Periodização ondulatória',
    aiRecommendation: 'Use semanas de estímulo forte alternadas com controle de fadiga e deload planejado.',
  },
};

const splitByDays: Record<number, Array<{ focus: FocusKey; label: string }>> = {
  1: [{ focus: 'full', label: 'Full body estratégico' }],
  2: [
    { focus: 'upper', label: 'Superior' },
    { focus: 'lower', label: 'Inferior' },
  ],
  3: [
    { focus: 'full', label: 'Full body A' },
    { focus: 'full', label: 'Full body B' },
    { focus: 'full', label: 'Full body C' },
  ],
  4: [
    { focus: 'upper', label: 'Superior A' },
    { focus: 'lower', label: 'Inferior A' },
    { focus: 'upper', label: 'Superior B' },
    { focus: 'lower', label: 'Inferior B' },
  ],
  5: [
    { focus: 'push', label: 'Push' },
    { focus: 'pull', label: 'Pull' },
    { focus: 'legs', label: 'Legs' },
    { focus: 'upper', label: 'Upper volume' },
    { focus: 'lower', label: 'Lower performance' },
  ],
  6: [
    { focus: 'push', label: 'Push A' },
    { focus: 'pull', label: 'Pull A' },
    { focus: 'legs', label: 'Legs A' },
    { focus: 'push', label: 'Push B' },
    { focus: 'pull', label: 'Pull B' },
    { focus: 'legs', label: 'Legs B' },
  ],
};

const gymExercises: Record<FocusKey, Array<Omit<ExercisePrescription, 'id' | 'sets' | 'reps' | 'rest' | 'notes'>>> = {
  full: [
    { name: 'Agachamento livre', muscleGroup: 'Pernas' },
    { name: 'Supino reto', muscleGroup: 'Peito' },
    { name: 'Remada baixa', muscleGroup: 'Costas' },
    { name: 'Desenvolvimento com halteres', muscleGroup: 'Ombros' },
    { name: 'Prancha', muscleGroup: 'Core' },
  ],
  upper: [
    { name: 'Supino inclinado', muscleGroup: 'Peito' },
    { name: 'Puxada alta', muscleGroup: 'Costas' },
    { name: 'Remada curvada', muscleGroup: 'Costas' },
    { name: 'Elevação lateral', muscleGroup: 'Ombros' },
    { name: 'Tríceps corda', muscleGroup: 'Tríceps' },
  ],
  lower: [
    { name: 'Agachamento livre', muscleGroup: 'Quadríceps' },
    { name: 'Levantamento terra romeno', muscleGroup: 'Posteriores' },
    { name: 'Leg press', muscleGroup: 'Pernas' },
    { name: 'Mesa flexora', muscleGroup: 'Posteriores' },
    { name: 'Panturrilha em pé', muscleGroup: 'Panturrilhas' },
  ],
  push: [
    { name: 'Supino reto', muscleGroup: 'Peito' },
    { name: 'Supino inclinado com halteres', muscleGroup: 'Peito' },
    { name: 'Desenvolvimento militar', muscleGroup: 'Ombros' },
    { name: 'Elevação lateral', muscleGroup: 'Ombros' },
    { name: 'Tríceps testa', muscleGroup: 'Tríceps' },
  ],
  pull: [
    { name: 'Barra fixa ou puxada alta', muscleGroup: 'Costas' },
    { name: 'Remada curvada', muscleGroup: 'Costas' },
    { name: 'Remada unilateral', muscleGroup: 'Costas' },
    { name: 'Face pull', muscleGroup: 'Ombros posteriores' },
    { name: 'Rosca direta', muscleGroup: 'Bíceps' },
  ],
  legs: [
    { name: 'Agachamento livre', muscleGroup: 'Quadríceps' },
    { name: 'Leg press', muscleGroup: 'Pernas' },
    { name: 'Cadeira extensora', muscleGroup: 'Quadríceps' },
    { name: 'Stiff', muscleGroup: 'Posteriores' },
    { name: 'Panturrilha sentada', muscleGroup: 'Panturrilhas' },
  ],
};

const homeExercises: Record<FocusKey, Array<Omit<ExercisePrescription, 'id' | 'sets' | 'reps' | 'rest' | 'notes'>>> = {
  full: [
    { name: 'Agachamento com peso corporal', muscleGroup: 'Pernas' },
    { name: 'Flexão de braço', muscleGroup: 'Peito' },
    { name: 'Remada com elástico ou mochila', muscleGroup: 'Costas' },
    { name: 'Afundo alternado', muscleGroup: 'Pernas' },
    { name: 'Prancha', muscleGroup: 'Core' },
  ],
  upper: [
    { name: 'Flexão de braço', muscleGroup: 'Peito' },
    { name: 'Remada com mochila', muscleGroup: 'Costas' },
    { name: 'Pike push-up', muscleGroup: 'Ombros' },
    { name: 'Rosca com elástico', muscleGroup: 'Bíceps' },
    { name: 'Tríceps banco', muscleGroup: 'Tríceps' },
  ],
  lower: [
    { name: 'Agachamento pausado', muscleGroup: 'Quadríceps' },
    { name: 'Afundo búlgaro', muscleGroup: 'Glúteos' },
    { name: 'Elevação pélvica unilateral', muscleGroup: 'Glúteos' },
    { name: 'Mesa flexora no pano', muscleGroup: 'Posteriores' },
    { name: 'Panturrilha unilateral', muscleGroup: 'Panturrilhas' },
  ],
  push: [
    { name: 'Flexão declinada', muscleGroup: 'Peito' },
    { name: 'Flexão diamante', muscleGroup: 'Tríceps' },
    { name: 'Pike push-up', muscleGroup: 'Ombros' },
    { name: 'Elevação lateral com elástico', muscleGroup: 'Ombros' },
    { name: 'Tríceps banco', muscleGroup: 'Tríceps' },
  ],
  pull: [
    { name: 'Remada com mochila', muscleGroup: 'Costas' },
    { name: 'Remada com elástico', muscleGroup: 'Costas' },
    { name: 'Face pull com elástico', muscleGroup: 'Ombros posteriores' },
    { name: 'Rosca com elástico', muscleGroup: 'Bíceps' },
    { name: 'Prancha com puxada', muscleGroup: 'Core' },
  ],
  legs: [
    { name: 'Agachamento unilateral assistido', muscleGroup: 'Quadríceps' },
    { name: 'Afundo caminhando', muscleGroup: 'Pernas' },
    { name: 'Elevação pélvica', muscleGroup: 'Glúteos' },
    { name: 'Stiff com mochila', muscleGroup: 'Posteriores' },
    { name: 'Panturrilha unilateral', muscleGroup: 'Panturrilhas' },
  ],
};

function isHomeEquipment(equipment: string) {
  return /casa|sem equipamento|peso corporal|elastico|elástico|mochila|halter/i.test(equipment);
}

function getSets(level: TrainingLevel, goal: string) {
  if (/for[cç]a/i.test(goal)) return level === 'iniciante' ? 3 : 5;
  if (/condicionamento|defini/i.test(goal)) return level === 'avancado' ? 4 : 3;
  return level === 'iniciante' ? 3 : level === 'intermediario' ? 4 : 5;
}

function getReps(goal: string) {
  if (/for[cç]a/i.test(goal)) return '4-6';
  if (/condicionamento/i.test(goal)) return '12-20';
  if (/defini/i.test(goal)) return '10-15';
  return '8-12';
}

function getRest(goal: string, level: TrainingLevel) {
  if (/for[cç]a/i.test(goal)) return level === 'avancado' ? '150s' : '120s';
  if (/condicionamento|defini/i.test(goal)) return '45-60s';
  return level === 'iniciante' ? '60-75s' : '75-90s';
}

function exerciseCountForTime(timePerWorkout: number) {
  if (timePerWorkout <= 30) return 3;
  if (timePerWorkout <= 45) return 4;
  return 5;
}

function buildExerciseId(dayIndex: number, exerciseIndex: number, name: string) {
  return `d${dayIndex + 1}_e${exerciseIndex + 1}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

function buildNotes(profile: UserProfile) {
  const injury = profile.injuries.trim().toLowerCase();
  if (injury && injury !== 'nenhuma' && injury !== 'nao' && injury !== 'não') {
    return `Ajuste amplitude e carga considerando: ${profile.injuries}. Dor articular encerra a série.`;
  }

  if (/for[cç]a/i.test(profile.goal)) {
    return 'Priorize técnica, pausa curta antes da fase concêntrica e descanso completo.';
  }

  if (/condicionamento|defini/i.test(profile.goal)) {
    return 'Mantenha ritmo constante e controle respiratório sem sacrificar execução.';
  }

  return 'Busque falhar tecnicamente com 1 a 2 repetições em reserva.';
}

function buildDays(profile: UserProfile): TrainingPlan['days'] {
  const daysPerWeek = Math.min(6, Math.max(1, profile.daysPerWeek));
  const split = splitByDays[daysPerWeek];
  const bank = isHomeEquipment(profile.equipment) ? homeExercises : gymExercises;
  const sets = getSets(profile.level, profile.goal);
  const reps = getReps(profile.goal);
  const rest = getRest(profile.goal, profile.level);
  const maxExercises = exerciseCountForTime(profile.timePerWorkout);

  return split.map((day, dayIndex) => ({
    id: `day_${dayIndex + 1}_${day.focus}`,
    dayName: `Dia ${dayIndex + 1}`,
    focus: day.label,
    exercises: bank[day.focus].slice(0, maxExercises).map((exercise, exerciseIndex) => ({
      ...exercise,
      id: buildExerciseId(dayIndex, exerciseIndex, exercise.name),
      sets,
      reps,
      rest,
      notes: buildNotes(profile),
    })),
  }));
}

function buildWeeklySplit(daysPerWeek: number) {
  const split = splitByDays[Math.min(6, Math.max(1, daysPerWeek))];
  return split.map(day => day.label).join(' / ');
}

function buildAdaptiveRecommendation(profile: UserProfile, history: WorkoutSession[]) {
  const last = history[0];
  if (!last) {
    return `Primeira semana: execute ${profile.daysPerWeek} treinos, registre carga/reps e termine cada série com técnica limpa.`;
  }

  const completionRate = last.totalExercises > 0 ? last.completedExercises / last.totalExercises : 0;
  const completedLogs = last.exercises.filter(exercise => exercise.completed);
  const avgRpe = completedLogs.length
    ? completedLogs.reduce((sum, exercise) => sum + exercise.rpe, 0) / completedLogs.length
    : 0;

  if (completionRate < 0.75) {
    return 'Ajuste automático: reduza 1 exercício do próximo treino ou mantenha a carga até completar pelo menos 75% do plano.';
  }

  if (avgRpe >= 9) {
    return 'Ajuste automático: fadiga alta. Mantenha cargas, aumente descanso e reduza 1 série nos exercícios principais.';
  }

  if (completionRate >= 0.9 && avgRpe > 0 && avgRpe <= 7) {
    return 'Ajuste automático: sessão sólida. Suba 2% a 5% de carga nos exercícios concluídos com boa técnica.';
  }

  return 'Ajuste automático: mantenha o plano e tente melhorar uma variável pequena no próximo treino: carga, reps ou controle.';
}

export function calculateTrainingPlan(profile: UserProfile, history: WorkoutSession[] = []): TrainingPlan {
  const strategy = strategies[profile.level] ?? strategies.intermediario;
  const days = buildDays(profile);
  const weeklySplit = buildWeeklySplit(profile.daysPerWeek);
  const planName = `${profile.goal} ${profile.level}`.toUpperCase();

  return {
    id: `plan_${profile.id}_${profile.updatedAt ?? Date.now()}`,
    createdAt: Date.now(),
    planName,
    goalDescription: `${profile.daysPerWeek} dias/semana, ${profile.timePerWorkout} min por treino, equipamento: ${profile.equipment}.`,
    volume: strategy.volume,
    frequency: `${profile.daysPerWeek}x por semana`,
    focus: strategy.focus,
    weeklySplit,
    aiRecommendation: strategy.aiRecommendation,
    nextRecommendation: buildAdaptiveRecommendation(profile, history),
    days,
  };
}
