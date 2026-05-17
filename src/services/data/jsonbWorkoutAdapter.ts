/**
 * Item 08 — JSONB Workout Adapter
 *
 * Typed adapter for workout session JSONB data from Supabase or localStorage.
 * Normalizes, validates and provides safe fallbacks for corrupted/absent data.
 * Does NOT create or alter Supabase schema or migrations.
 */

import { type WorkoutSession, type WorkoutExerciseLog } from '../database';

export interface RawWorkoutSessionRow {
  record_json?: unknown;
  id?: string;
  workout_date?: string;
  volume_load?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeExerciseLog(raw: unknown): WorkoutExerciseLog | null {
  if (!isRecord(raw)) return null;
  return {
    exerciseId: safeString(raw.exerciseId, ''),
    name: safeString(raw.name, 'Exercício'),
    targetSets: safeNumber(raw.targetSets, 0),
    targetReps: safeString(raw.targetReps, '0'),
    targetRest: safeString(raw.targetRest, '60s'),
    completed: Boolean(raw.completed),
    sets: Array.isArray(raw.sets) ? raw.sets : undefined,
    exerciseNote: typeof raw.exerciseNote === 'string' ? raw.exerciseNote : undefined,
    intensityTechnique: raw.intensityTechnique === 'superset' || raw.intensityTechnique === 'dropset'
      ? raw.intensityTechnique
      : 'normal',
    supersetGroupId: typeof raw.supersetGroupId === 'string' ? raw.supersetGroupId : undefined,
    actualWeight: typeof raw.actualWeight === 'number' ? raw.actualWeight : undefined,
    actualReps: typeof raw.actualReps === 'number' ? raw.actualReps : undefined,
    rpe: typeof raw.rpe === 'number' ? raw.rpe : undefined,
  };
}

export function adaptWorkoutSession(row: RawWorkoutSessionRow | null | undefined): WorkoutSession | null {
  if (!row) return null;

  const json = row.record_json;
  if (!isRecord(json)) return null;
  if (typeof json.id !== 'string' || !json.id) return null;

  const exercises = Array.isArray(json.exercises)
    ? json.exercises.map(normalizeExerciseLog).filter((e): e is WorkoutExerciseLog => e !== null)
    : [];

  return {
    id: json.id as string,
    planId: safeString(json.planId, ''),
    dayId: safeString(json.dayId, ''),
    dayName: safeString(json.dayName, 'Dia'),
    focus: safeString(json.focus, ''),
    completedAt: safeNumber(json.completedAt, 0),
    durationMinutes: safeNumber(json.durationMinutes, 0),
    totalVolume: safeNumber(json.totalVolume, row.volume_load ?? 0),
    completedExercises: safeNumber(json.completedExercises, exercises.filter(e => e.completed).length),
    totalExercises: safeNumber(json.totalExercises, exercises.length),
    feedback: safeString(json.feedback, ''),
    nextRecommendation: safeString(json.nextRecommendation, ''),
    exercises,
  };
}

export function adaptWorkoutSessionList(rows: RawWorkoutSessionRow[]): WorkoutSession[] {
  return rows
    .map(row => adaptWorkoutSession(row))
    .filter((s): s is WorkoutSession => s !== null);
}
