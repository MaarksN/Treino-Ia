/**
 * Item 60 - Longevity Signal Service
 *
 * Educational consistency/habit indicator.
 * Does NOT calculate biological age or make medical claims.
 */

import { type WorkoutSession } from '../database';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface LongevitySignal {
  consistencyScore: number;
  level: 'baixo' | 'moderado' | 'bom' | 'excelente';
  label: string;
  factors: LongevityFactor[];
  disclaimer: string;
}

export interface LongevityFactor {
  id: 'training_consistency' | 'sleep' | 'hydration' | 'recovery' | 'rpe_balance';
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface LongevitySleepEntry {
  date: string;
  durationMinutes: number;
  quality?: number;
}

export interface LongevityHydrationEntry {
  date: string;
  amountMl: number;
}

export interface LongevitySignalInput {
  history: WorkoutSession[];
  sleepEntries?: LongevitySleepEntry[];
  hydrationEntries?: LongevityHydrationEntry[];
  hydrationGoalMl?: number;
  now?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeInput(input: WorkoutSession[] | LongevitySignalInput): Required<LongevitySignalInput> {
  if (Array.isArray(input)) {
    return {
      history: input,
      sleepEntries: [],
      hydrationEntries: [],
      hydrationGoalMl: 2500,
      now: Date.now(),
    };
  }

  return {
    history: input.history,
    sleepEntries: input.sleepEntries ?? [],
    hydrationEntries: input.hydrationEntries ?? [],
    hydrationGoalMl: input.hydrationGoalMl ?? 2500,
    now: input.now ?? Date.now(),
  };
}

function getTrainingConsistency(history: WorkoutSession[], recentWeeks: number, now: number): number {
  if (history.length === 0) return 0;
  const windowMs = recentWeeks * 7 * DAY_MS;
  const recent = history.filter(session => now - session.completedAt < windowMs);
  const expectedSessions = recentWeeks * 3;
  return clamp((recent.length / expectedSessions) * 100, 0, 100);
}

function getSleepScore(entries: LongevitySleepEntry[]): number {
  if (entries.length === 0) return 50;
  const recent = [...entries]
    .filter(entry => entry.durationMinutes > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  if (recent.length === 0) return 50;

  const avgDuration = recent.reduce((sum, entry) => sum + entry.durationMinutes, 0) / recent.length;
  const durationScore = clamp((avgDuration / 420) * 100, 0, 100);
  const qualityEntries = recent.filter(entry => typeof entry.quality === 'number');
  const qualityScore = qualityEntries.length
    ? clamp((qualityEntries.reduce((sum, entry) => sum + (entry.quality ?? 0), 0) / qualityEntries.length / 5) * 100, 0, 100)
    : 70;

  return clamp(durationScore * 0.7 + qualityScore * 0.3, 0, 100);
}

function getHydrationScore(entries: LongevityHydrationEntry[], hydrationGoalMl: number, now: number): number {
  if (entries.length === 0) return 40;
  const today = new Date(now).toISOString().slice(0, 10);
  const todayMl = entries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.amountMl, 0);

  if (todayMl <= 0) return 40;
  return clamp((todayMl / Math.max(hydrationGoalMl, 1)) * 100, 0, 100);
}

function getRecoveryBalance(history: WorkoutSession[]): number {
  if (history.length < 2) return 50;
  const sorted = [...history].sort((a, b) => b.completedAt - a.completedAt);
  const gaps: number[] = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 10); i += 1) {
    gaps.push(sorted[i].completedAt - sorted[i + 1].completedAt);
  }
  const avgGapH = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / 3600000;
  if (avgGapH >= 24 && avgGapH <= 72) return 90;
  if (avgGapH >= 12 && avgGapH <= 96) return 70;
  return 40;
}

function extractRpeValues(session: WorkoutSession): number[] {
  return session.exercises.flatMap(exercise => {
    const setRpes = exercise.sets
      ?.map(set => set.rpe)
      .filter(rpe => Number.isFinite(rpe) && rpe > 0 && rpe <= 10) ?? [];

    if (setRpes.length) return setRpes;
    return Number.isFinite(exercise.rpe) && (exercise.rpe ?? 0) > 0 && (exercise.rpe ?? 0) <= 10
      ? [exercise.rpe as number]
      : [];
  });
}

function getRpeBalance(history: WorkoutSession[], now: number): number {
  const recent = history.filter(session => now - session.completedAt <= 14 * DAY_MS);
  const rpeValues = recent.flatMap(extractRpeValues);
  if (rpeValues.length === 0) return 60;

  const avgRpe = rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length;
  const veryHighShare = rpeValues.filter(rpe => rpe >= 9).length / rpeValues.length;

  if (avgRpe >= 9 || veryHighShare >= 0.5) return 25;
  if (avgRpe >= 8) return 45;
  if (avgRpe >= 7) return 70;
  return 95;
}

export function calculateLongevitySignal(input: WorkoutSession[] | LongevitySignalInput): LongevitySignal {
  const normalized = normalizeInput(input);
  const factors: LongevityFactor[] = [
    {
      id: 'training_consistency',
      name: 'Consistência de treino',
      score: getTrainingConsistency(normalized.history, 4, normalized.now),
      maxScore: 100,
      description: 'Frequência registrada nas últimas 4 semanas.',
    },
    {
      id: 'sleep',
      name: 'Sono',
      score: getSleepScore(normalized.sleepEntries),
      maxScore: 100,
      description: normalized.sleepEntries.length
        ? 'Média recente de duração e qualidade do sono.'
        : 'Sem registros recentes de sono; usando base neutra.',
    },
    {
      id: 'hydration',
      name: 'Hidratação',
      score: getHydrationScore(normalized.hydrationEntries, normalized.hydrationGoalMl, normalized.now),
      maxScore: 100,
      description: 'Progresso de hoje frente à meta local de hidratação.',
    },
    {
      id: 'recovery',
      name: 'Recuperação',
      score: getRecoveryBalance(normalized.history),
      maxScore: 100,
      description: 'Intervalo médio entre sessões; 24-72h tende a ser mais sustentável.',
    },
    {
      id: 'rpe_balance',
      name: 'RPE excessivo',
      score: getRpeBalance(normalized.history, normalized.now),
      maxScore: 100,
      description: 'Penaliza concentração recente de treinos com esforço percebido muito alto.',
    },
  ];

  const consistencyScore = Math.round(factors.reduce((sum, factor) => sum + factor.score, 0) / factors.length);
  let level: LongevitySignal['level'];
  let label: string;

  if (consistencyScore >= 80) {
    level = 'excelente';
    label = 'Tendência de hábitos excelente';
  } else if (consistencyScore >= 60) {
    level = 'bom';
    label = 'Tendência de hábitos boa';
  } else if (consistencyScore >= 40) {
    level = 'moderado';
    label = 'Tendência de hábitos moderada';
  } else {
    level = 'baixo';
    label = 'Tendência de hábitos em construção';
  }

  return { consistencyScore, level, label, factors, disclaimer: LONGEVITY_DISCLAIMER };
}

export const LONGEVITY_DISCLAIMER =
  'Este é um indicador educativo de consistência de hábitos baseado em dados locais de treino, sono, hidratação, recuperação e RPE. Não representa idade biológica, projeção médica de longevidade ou diagnóstico de saúde. Consulte profissionais de saúde para avaliações reais.';
