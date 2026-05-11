import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyCheckin } from '../types';
import {
  createInjuryRecord,
  createSymptomRecord,
  loadDailyCheckins,
  loadNutritionState,
  saveDailyCheckin,
  saveMealEntry,
} from './healthService';

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

describe('healthService mock_dev_only persistence and validation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists daily check-ins with explicit mock_dev_only metadata when Supabase is unavailable', async () => {
    const checkin: DailyCheckin = {
      id: 'c93c0f39-9a43-48dd-9d7d-33fb45fa6d5b',
      date: '2026-05-11',
      sleepHours: 7.5,
      sleepQuality: 4,
      stressLevel: 5,
      sorenessMap: { Peito: 3, Costas: 6 },
      energyLevel: 7,
      hydrationGlasses: 8,
      sleepGoalHours: 8,
      timestamp: Date.now(),
    };

    await expect(saveDailyCheckin(checkin)).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      data: { date: '2026-05-11' },
    });

    await expect(loadDailyCheckins()).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      data: [expect.objectContaining({ sorenessMap: { Peito: 3, Costas: 6 } })],
    });
  });

  it('rejects unsafe check-in ranges before persistence', async () => {
    await expect(saveDailyCheckin({
      id: 'bad',
      date: '2026-05-11',
      sleepHours: 22,
      sleepQuality: 4,
      stressLevel: 5,
      sorenessMap: {},
      energyLevel: 7,
      hydrationGlasses: 8,
      sleepGoalHours: 8,
      timestamp: Date.now(),
    })).rejects.toThrow(/Horas de sono/);
  });

  it('validates injury and symptom required fields', async () => {
    await expect(createInjuryRecord({ region: 'Joelho', severity: 'leve' })).rejects.toThrow(/Descrição/);
    await expect(createSymptomRecord({ region: 'Lombar', intensity: 5 })).rejects.toThrow(/Sintoma/);
  });

  it('does not persist plate-photo base64 in meal entries', async () => {
    await saveMealEntry({
      mealType: 'Almoço',
      description: 'Arroz, feijão e frango',
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 71,
      estimatedFat: 14,
      photoBase64: 'base64-image-content',
      aiAnalysis: 'Estimativa por IA.',
    });

    const state = await loadNutritionState();
    expect(state.data.meals[0]).not.toHaveProperty('photoBase64');
    expect(window.localStorage.getItem('@TreinoApp:meals:mock_dev_only')).not.toContain('base64-image-content');
  });
});
