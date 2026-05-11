import { describe, expect, it } from 'vitest';
import {
  validateCycleEntry,
  validateHydrationEntry,
  validateHydrationGoal,
  validatePoseAnalysis,
  validateSleepEntry,
  validateWearableSession,
} from './biometricService';
import { HydrationEntry, PoseAnalysis, SleepEntry, WearableSession } from '../types';

describe('biometricService validation', () => {
  it('accepts a valid hydration entry and normalizes amount/time', () => {
    const entry: HydrationEntry = {
      id: '77b31e14-f225-49e9-9ca6-8a01dbd54f98',
      date: '2026-05-11',
      time: '09:45',
      amountMl: 349.6,
      type: 'água',
    };

    expect(validateHydrationEntry(entry)).toMatchObject({
      amountMl: 350,
      time: '09:45',
    });
  });

  it('rejects unsafe hydration values', () => {
    expect(() =>
      validateHydrationEntry({
        id: '77b31e14-f225-49e9-9ca6-8a01dbd54f98',
        date: '2026-05-11',
        time: '09:45',
        amountMl: 0,
        type: 'água',
      }),
    ).toThrow(/Volume/);

    expect(() => validateHydrationGoal({ dailyMl: 9000, remindEveryMinutes: 60 })).toThrow(/Meta/);
  });

  it('validates sleep duration, quality and note length', () => {
    const entry: SleepEntry = {
      id: '9ad2a59d-1d29-4ef0-9b4f-2c4d8d13c7a4',
      date: '2026-05-11',
      bedtime: '22:30',
      wakeTime: '06:15',
      durationMinutes: 465,
      quality: 4,
      notes: ` ${'boa '.repeat(200)}`,
    };

    const valid = validateSleepEntry(entry);

    expect(valid.notes?.length).toBeLessThanOrEqual(500);
    expect(() => validateSleepEntry({ ...entry, durationMinutes: 0 })).toThrow(/sono/);
    expect(() => validateSleepEntry({ ...entry, quality: 6 as SleepEntry['quality'] })).toThrow(/Qualidade/);
  });

  it('validates cycle boundaries', () => {
    expect(
      validateCycleEntry({
        id: '6f820c71-c921-4de5-96cf-3b4a2e5b8185',
        startDate: '2026-05-01',
        cycleLengthDays: 28,
        periodLengthDays: 5,
      }),
    ).toMatchObject({ cycleLengthDays: 28 });

    expect(() =>
      validateCycleEntry({
        id: '6f820c71-c921-4de5-96cf-3b4a2e5b8185',
        startDate: '2026-05-01',
        cycleLengthDays: 20,
        periodLengthDays: 5,
      }),
    ).toThrow(/ciclo/);
  });

  it('filters invalid BLE readings and rejects empty sessions', () => {
    const session: WearableSession = {
      id: '9281b9d9-7486-43b4-9d59-7112655a8c4a',
      startedAt: Date.now() - 60_000,
      endedAt: Date.now(),
      avgHR: 122,
      maxHR: 150,
      minHR: 90,
      deviceName: 'Polar H10',
      readings: [
        { bpm: 122, timestamp: Date.now() - 1000 },
        { bpm: 400, timestamp: Date.now() },
      ],
      hrZones: { zone1: 0, zone2: 1, zone3: 0, zone4: 0, zone5: 0 },
    };

    expect(validateWearableSession(session).readings).toHaveLength(1);
    expect(() => validateWearableSession({ ...session, readings: [{ bpm: 400, timestamp: Date.now() }] })).toThrow(/BPM/);
  });

  it('removes pose thumbnails before persistence', () => {
    const analysis: PoseAnalysis = {
      id: '0c38c90d-bd82-40ee-8b9b-e25052b5ea37',
      exerciseName: 'Agachamento',
      date: '2026-05-11',
      repCount: 12,
      formScore: 88,
      issues: [],
      tips: [],
      keyAngles: { Joelho: 92 },
      thumbnail: 'data:image/jpeg;base64,abc',
    };

    expect(validatePoseAnalysis(analysis).thumbnail).toBeUndefined();
  });
});
