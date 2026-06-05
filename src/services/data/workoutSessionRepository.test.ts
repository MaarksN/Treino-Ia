import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkoutSession } from '../database';
import {
  buildRelationalSession,
  calculateSetVolume,
  isPersonalRecord,
  workoutSessionRepository,
} from './workoutSessionRepository';
import { supabase } from '../supabaseClient';

const single = vi.fn();
const maybeSingle = vi.fn();
const limit = vi.fn();
const order = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const insert = vi.fn();
const upsert = vi.fn();
const deleteRows = vi.fn();

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
  getCurrentUserId: vi.fn().mockResolvedValue('user-id-123'),
}));

function chain(overrides: Record<string, unknown> = {}) {
  const query = {
    insert,
    upsert,
    delete: deleteRows,
    select,
    single,
    maybeSingle,
    eq,
    order,
    limit,
    ...overrides,
  };

  insert.mockReturnValue(query);
  upsert.mockReturnValue(query);
  deleteRows.mockReturnValue(query);
  select.mockReturnValue(query);
  eq.mockReturnValue(query);
  order.mockReturnValue(query);
  limit.mockReturnValue(query);

  return query;
}

function makeSession(): WorkoutSession {
  return {
    id: 'legacy-session-1',
    planId: 'plan-1',
    dayId: 'day-1',
    dayName: 'Dia 1',
    focus: 'Superior',
    completedAt: Date.UTC(2026, 4, 25, 12),
    durationMinutes: 45,
    totalVolume: 1000,
    completedExercises: 1,
    totalExercises: 1,
    feedback: 'Boa sessao',
    nextRecommendation: 'Sugestao pendente',
    exercises: [
      {
        exerciseId: 'supino',
        name: 'Supino reto',
        targetSets: 2,
        targetReps: '8-12',
        targetRest: '90s',
        completed: true,
        sets: [
          { weight: 50, reps: 10, rpe: 7 },
          { weight: 55, reps: 8, rpe: 8 },
        ],
      },
    ],
  };
}

describe('workoutSessionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chain();
    vi.mocked(supabase.from).mockReturnValue(chain() as never);
    single.mockResolvedValue({ data: { id: 'generated-id' }, error: null });
    maybeSingle.mockResolvedValue({ data: { value: 400 }, error: null });
  });

  it('creates a workout session', async () => {
    const sessionId = await workoutSessionRepository.createSession({
      plan_id: 'plan-1',
      started_at: new Date().toISOString(),
      status: 'completed',
      total_volume: 1000,
    });

    expect(sessionId).toBe('generated-id');
    expect(supabase.from).toHaveBeenCalledWith('workout_sessions');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-id-123',
        plan_id: 'plan-1',
      }),
    );
  });

  it('registers an exercise log', async () => {
    const logId = await workoutSessionRepository.addExerciseLog({
      session_id: 'session-1',
      exercise_id: 'ex-1',
      exercise_name: 'Squat',
      order_index: 0,
      target_sets: 3,
      target_reps: '8-10',
    });

    expect(logId).toBe('generated-id');
    expect(supabase.from).toHaveBeenCalledWith('exercise_logs');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-id-123',
        exercise_id: 'ex-1',
      }),
    );
  });

  it('registers set logs', async () => {
    await workoutSessionRepository.addSetLogs([
      {
        exercise_log_id: 'log-1',
        session_id: 'session-1',
        set_index: 0,
        weight: 100,
        reps: 10,
        completed: true,
        is_personal_record: false,
      },
    ]);

    expect(supabase.from).toHaveBeenCalledWith('set_logs');
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user-id-123',
        weight: 100,
        reps: 10,
      }),
    ]);
  });

  it('calculates set volume and detects basic personal records', () => {
    expect(calculateSetVolume({ weight: 80, reps: 5 })).toBe(400);
    expect(isPersonalRecord(401, 400)).toBe(true);
    expect(isPersonalRecord(400, 400)).toBe(false);
    expect(isPersonalRecord(0, 400)).toBe(false);
  });

  it('builds relational session metadata from a completed legacy session', () => {
    expect(buildRelationalSession(makeSession())).toMatchObject({
      legacy_session_id: 'legacy-session-1',
      plan_id: 'plan-1',
      day_id: 'day-1',
      status: 'completed',
      total_volume: 1000,
      duration_seconds: 2700,
      metadata_json: {
        completedExercises: 1,
        totalExercises: 1,
        feedback: 'Boa sessao',
        nextRecommendation: 'Sugestao pendente',
      },
    });
  });

  it('dual-writes a completed workout session with exercise, set and PR records', async () => {
    await workoutSessionRepository.saveCompletedSession(makeSession());

    expect(supabase.from).toHaveBeenCalledWith('workout_sessions');
    expect(supabase.from).toHaveBeenCalledWith('exercise_logs');
    expect(supabase.from).toHaveBeenCalledWith('set_logs');
    expect(supabase.from).toHaveBeenCalledWith('personal_records');
    expect(deleteRows).toHaveBeenCalled();
  });

  it('retries completed session saves without duplicating relational details', async () => {
    await workoutSessionRepository.saveCompletedSession(makeSession());

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-id-123',
        legacy_session_id: 'legacy-session-1',
      }),
      { onConflict: 'user_id,legacy_session_id' },
    );
    expect(deleteRows).toHaveBeenCalledTimes(2);
    expect(deleteRows.mock.invocationCallOrder[1]).toBeLessThan(insert.mock.invocationCallOrder[0]);
  });
});
