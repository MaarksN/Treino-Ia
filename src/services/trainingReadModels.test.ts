import { describe, expect, it } from 'vitest';
import { createDefaultProfile, type TrainingPlan, type WorkoutSession } from './database';
import {
  buildTrainingPlanUpsert,
  buildTrainingProfileUpsert,
  buildWorkoutHistoryUpsert,
  readTrainingPlanJson,
  readTrainingProfileJson,
  readWorkoutSessionJson,
} from './trainingReadModels';

describe('trainingReadModels', () => {
  it('maps profile JSONB rows without requiring schema changes', () => {
    const profile = createDefaultProfile();

    expect(buildTrainingProfileUpsert('user-1', profile)).toMatchObject({
      user_id: 'user-1',
      profile_goal: profile.goal,
      profile_name: profile.name,
      profile_json: profile,
    });
    expect(readTrainingProfileJson({ profile_json: profile })).toEqual(profile);
    expect(readTrainingProfileJson({ profile_json: null })).toBeNull();
  });

  it('maps current plan JSONB rows defensively', () => {
    const plan: TrainingPlan = {
      id: 'plan-1',
      createdAt: 123,
      planName: 'Plano',
      goalDescription: 'Objetivo',
      volume: 'Moderado',
      frequency: '3x',
      focus: 'Hipertrofia',
      weeklySplit: 'ABC',
      aiRecommendation: 'Progredir',
      nextRecommendation: 'Manter',
      days: [],
    };

    expect(buildTrainingPlanUpsert('user-1', plan)).toMatchObject({
      user_id: 'user-1',
      id: 'plan-1',
      is_current: true,
      plan_json: plan,
    });
    expect(readTrainingPlanJson({ plan_json: plan })).toEqual(plan);
    expect(readTrainingPlanJson({ plan_json: { ...plan, days: undefined } as unknown as TrainingPlan })).toBeNull();
  });

  it('maps workout history JSONB rows with relational summary fields', () => {
    const session: WorkoutSession = {
      id: 'session-1',
      planId: 'plan-1',
      dayId: 'day-1',
      dayName: 'Dia 1',
      focus: 'Full body',
      completedAt: 123,
      durationMinutes: 45,
      totalVolume: 1200,
      completedExercises: 4,
      totalExercises: 5,
      feedback: 'Bom',
      nextRecommendation: 'Subir carga',
      exercises: [],
    };

    expect(buildWorkoutHistoryUpsert('user-1', session)).toMatchObject({
      user_id: 'user-1',
      id: 'session-1',
      workout_date: new Date(123).toISOString(),
      record_json: session,
    });
    expect(readWorkoutSessionJson({ record_json: session })).toEqual(session);
    expect(readWorkoutSessionJson({ record_json: null })).toBeNull();
  });
});
