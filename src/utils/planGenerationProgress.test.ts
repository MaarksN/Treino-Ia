import { describe, expect, it } from 'vitest';
import { buildPlanGenerationProgress, getPlanGenerationProgressPercent } from './planGenerationProgress';
import { type TrainingPlan, type UserProfile, type WorkoutSession } from '../services/database';

const profile: UserProfile = {
  id: 'profile_1',
  name: 'Atleta',
  level: 'intermediario',
  goal: 'Hipertrofia',
  daysPerWeek: 4,
  timePerWorkout: 45,
  injuries: 'Nenhuma',
  equipment: 'Academia completa',
};

const plan: TrainingPlan = {
  id: 'plan_1',
  createdAt: 1,
  planName: 'Plano',
  goalDescription: 'Plano teste',
  volume: 'Medio',
  frequency: '4x',
  focus: 'Progressao',
  weeklySplit: 'Superior / Inferior',
  aiRecommendation: 'Registre cargas.',
  nextRecommendation: 'Mantenha progressao.',
  days: [
    {
      id: 'day_1',
      dayName: 'Dia 1',
      focus: 'Superior',
      exercises: [
        { id: 'e1', name: 'Supino', muscleGroup: 'Peito', sets: 4, reps: '8-12', rest: '90s', notes: '' },
        { id: 'e2', name: 'Remada', muscleGroup: 'Costas', sets: 4, reps: '8-12', rest: '90s', notes: '' },
      ],
    },
  ],
};

const session: WorkoutSession = {
  id: 's1',
  planId: 'plan_1',
  dayId: 'day_1',
  dayName: 'Dia 1',
  focus: 'Superior',
  completedAt: 1,
  durationMinutes: 45,
  totalVolume: 1200,
  completedExercises: 2,
  totalExercises: 3,
  feedback: '',
  nextRecommendation: '',
  exercises: [],
};

describe('plan generation progress', () => {
  it('builds deterministic progress steps from profile, history and plan', () => {
    const steps = buildPlanGenerationProgress(profile, [session], plan);

    expect(steps).toHaveLength(4);
    expect(steps[0].detail).toContain('Hipertrofia');
    expect(steps[1].detail).toContain('2/3');
    expect(steps[3].metric).toBe('2 exercicios');
  });

  it('clamps progress percentages', () => {
    expect(getPlanGenerationProgressPercent(2, 4)).toBe(50);
    expect(getPlanGenerationProgressPercent(9, 4)).toBe(100);
    expect(getPlanGenerationProgressPercent(-1, 4)).toBe(0);
    expect(getPlanGenerationProgressPercent(1, 0)).toBe(0);
  });
});
