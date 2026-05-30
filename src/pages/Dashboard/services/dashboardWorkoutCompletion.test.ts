import { describe, expect, it } from 'vitest';
import type { TrainingPlan, UserProfile } from '../../../services/trainingTypes';
import type { ActiveExerciseDraft } from '../types';
import { buildCompletedDashboardWorkout } from './dashboardWorkoutCompletion';

const profile: UserProfile = {
  id: 'profile-1',
  name: 'Ana',
  level: 'intermediario',
  goal: 'Hipertrofia',
  daysPerWeek: 4,
  timePerWorkout: 45,
  injuries: 'Nenhuma',
  equipment: 'Academia completa',
};

const plan: TrainingPlan = {
  id: 'plan-1',
  createdAt: 1779667200000,
  planName: 'Plano A',
  goalDescription: 'Hipertrofia',
  volume: 'moderado',
  frequency: '4x',
  focus: 'Peito',
  weeklySplit: 'ABCD',
  aiRecommendation: 'Comece leve.',
  nextRecommendation: 'Progrida carga.',
  days: [
    {
      id: 'day-1',
      dayName: 'Upper',
      focus: 'Peito',
      exercises: [],
    },
  ],
};

const activeDraft: ActiveExerciseDraft[] = [
  {
    exerciseId: 'exercise-1',
    name: 'Supino',
    targetSets: 2,
    targetReps: '8',
    targetRest: '90s',
    completed: true,
    sets: [
      { weight: '80', reps: '8', rpe: '8', completed: true },
      { weight: '82.5', reps: '8', rpe: '9', completed: true },
    ],
  },
];

describe('buildCompletedDashboardWorkout', () => {
  it('builds a completed session, adjusted plan and bounded history', () => {
    const result = buildCompletedDashboardWorkout({
      activeDayIndex: 0,
      activeDraft,
      activeFeedback: '  Treino bom  ',
      completedAt: 1779667200000,
      history: [],
      plan,
      profile,
      sessionId: 'session-1',
    });

    expect(result.day.id).toBe('day-1');
    expect(result.completedExercises).toBe(1);
    expect(result.totalExercises).toBe(1);
    expect(result.totalVolume).toBe(1300);
    expect(result.completedSession).toEqual(expect.objectContaining({
      id: 'session-1',
      feedback: 'Treino bom',
      nextRecommendation: result.adjustedPlan.nextRecommendation,
    }));
    expect(result.finalHistory).toEqual([result.completedSession]);
  });

  it('rejects invalid active day indexes', () => {
    expect(() =>
      buildCompletedDashboardWorkout({
        activeDayIndex: 9,
        activeDraft,
        activeFeedback: '',
        history: [],
        plan,
        profile,
      }),
    ).toThrow('Dia de treino ativo invalido.');
  });
});
