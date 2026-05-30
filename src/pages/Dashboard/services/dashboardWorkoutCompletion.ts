import { calculateTrainingPlan } from '../../../rules/iaEngine';
import type {
  TrainingPlan,
  UserProfile,
  WorkoutDayPlan,
  WorkoutExerciseLog,
  WorkoutSession,
} from '../../../services/trainingTypes';
import type { ActiveExerciseDraft } from '../types';
import {
  buildWorkoutExerciseLog,
  calculateWorkoutTonnage,
} from './activeWorkoutEngine';
import { createDashboardSessionId } from './dashboardSession';

export interface BuildCompletedDashboardWorkoutInput {
  activeDayIndex: number;
  activeDraft: ActiveExerciseDraft[];
  activeFeedback: string;
  completedAt?: number;
  history: WorkoutSession[];
  plan: TrainingPlan;
  profile: UserProfile;
  sessionId?: string;
}

export interface CompletedDashboardWorkout {
  adjustedPlan: TrainingPlan;
  completedExercises: number;
  completedSession: WorkoutSession;
  day: WorkoutDayPlan;
  finalHistory: WorkoutSession[];
  logs: WorkoutExerciseLog[];
  totalExercises: number;
  totalVolume: number;
}

export function buildCompletedDashboardWorkout(
  input: BuildCompletedDashboardWorkoutInput,
): CompletedDashboardWorkout {
  const day = input.plan.days[input.activeDayIndex];

  if (!day) {
    throw new Error('Dia de treino ativo invalido.');
  }

  const logs = input.activeDraft.map((exercise) => buildWorkoutExerciseLog(exercise));
  const completedExercises = logs.filter((exercise) => exercise.completed).length;
  const totalVolume = calculateWorkoutTonnage(input.activeDraft).completedTonnage;
  const completedAt = input.completedAt ?? Date.now();
  const baseSession: WorkoutSession = {
    id: input.sessionId ?? createDashboardSessionId(),
    planId: input.plan.id,
    dayId: day.id,
    dayName: day.dayName,
    focus: day.focus,
    completedAt,
    durationMinutes: input.profile.timePerWorkout,
    totalVolume,
    completedExercises,
    totalExercises: logs.length,
    feedback: input.activeFeedback.trim(),
    nextRecommendation: '',
    exercises: logs,
  };
  const nextHistory = [baseSession, ...input.history.filter(item => item.id !== baseSession.id)].slice(0, 50);
  const adjustedPlan = calculateTrainingPlan(input.profile, nextHistory);
  const completedSession = {
    ...baseSession,
    nextRecommendation: adjustedPlan.nextRecommendation,
  };
  const finalHistory = [completedSession, ...input.history.filter(item => item.id !== completedSession.id)].slice(0, 50);

  return {
    adjustedPlan,
    completedExercises,
    completedSession,
    day,
    finalHistory,
    logs,
    totalExercises: logs.length,
    totalVolume,
  };
}
