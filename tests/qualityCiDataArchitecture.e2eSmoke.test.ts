import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseAppRoute } from '../src/navigation/appRouter';
import {
  createDefaultProfile,
  DatabaseService,
  type TrainingPlan,
  type WorkoutSession,
} from '../src/services/database';

vi.mock('../src/services/supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  },
}));

describe('quality and data architecture E2E smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('deep links to nutrition and persists a local training cycle without external services', async () => {
    window.history.replaceState({}, '', '/?view=nutrition');
    expect(parseAppRoute(window.location).id).toBe('nutrition');

    const profile = {
      ...createDefaultProfile(),
      id: 'profile-smoke',
      name: 'Atleta Smoke',
    };
    const plan: TrainingPlan = {
      id: 'plan-smoke',
      createdAt: 123,
      planName: 'Plano Smoke',
      goalDescription: 'Fluxo local completo.',
      volume: 'Moderado',
      frequency: '3x semana',
      focus: 'Hipertrofia',
      weeklySplit: 'ABC',
      aiRecommendation: 'Progredir com controle.',
      nextRecommendation: 'Manter consistencia.',
      days: [
        {
          id: 'day-smoke',
          dayName: 'Dia 1',
          focus: 'Full body',
          exercises: [],
        },
      ],
    };
    const session: WorkoutSession = {
      id: 'session-smoke',
      planId: plan.id,
      dayId: plan.days[0].id,
      dayName: plan.days[0].dayName,
      focus: plan.days[0].focus,
      completedAt: 456,
      durationMinutes: 45,
      totalVolume: 1000,
      completedExercises: 1,
      totalExercises: 1,
      feedback: 'Sem dor.',
      nextRecommendation: 'Subir carga com prudencia.',
      exercises: [],
    };

    await DatabaseService.saveProfile(profile);
    await DatabaseService.saveCurrentPlan(plan);
    await DatabaseService.saveWorkoutSession(session);

    await expect(DatabaseService.getProfile()).resolves.toMatchObject({
      id: profile.id,
      name: profile.name,
    });
    await expect(DatabaseService.getCurrentPlan()).resolves.toMatchObject({
      id: plan.id,
      planName: plan.planName,
    });
    await expect(DatabaseService.getWorkoutHistory()).resolves.toEqual([session]);
  });
});
