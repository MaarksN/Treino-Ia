import type { DailyCheckin, HydrationEntry, HydrationGoal } from '../types';

export const mockDailyCheckin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-24',
  sleepHours: 7.5,
  sleepQuality: 4,
  stressLevel: 3,
  sorenessMap: { Pernas: 2 },
  energyLevel: 8,
  hydrationGlasses: 9,
  sleepGoalHours: 8,
  notes: 'Treino leve',
  timestamp: 1779600000000,
};

export const mockHydrationEntry: HydrationEntry = {
  id: 'hydro-1',
  date: '2026-05-24',
  time: '14:30',
  amountMl: 500,
  type: 'água',
};

export const mockHydrationGoal: HydrationGoal = {
  dailyMl: 3000,
  remindEveryMinutes: 45,
};
