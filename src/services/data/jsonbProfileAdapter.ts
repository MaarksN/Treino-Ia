/**
 * Item 08 — JSONB Profile Adapter
 *
 * Typed adapter for user profile JSONB data from Supabase or localStorage.
 * Normalizes, validates and provides safe defaults for corrupted/absent data.
 * Does NOT create or alter Supabase schema or migrations.
 */

import { type UserProfile, type TrainingLevel, normalizeProfile } from '../database';

export interface RawProfileRow {
  profile_json?: unknown;
  profile_name?: string;
  profile_goal?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

const VALID_LEVELS: TrainingLevel[] = ['iniciante', 'intermediario', 'avancado'];

export function adaptProfile(row: RawProfileRow | null | undefined): UserProfile | null {
  if (!row) return null;

  const json = row.profile_json;

  // Try to build from JSON
  if (isRecord(json)) {
    return normalizeProfile(json as Partial<UserProfile>);
  }

  // Fallback: try relational columns
  if (row.profile_name || row.profile_goal) {
    return normalizeProfile({
      name: typeof row.profile_name === 'string' ? row.profile_name : undefined,
      goal: typeof row.profile_goal === 'string' ? row.profile_goal : undefined,
    });
  }

  return null;
}

export function extractProfileLevel(raw: unknown): TrainingLevel {
  if (typeof raw === 'string' && VALID_LEVELS.includes(raw as TrainingLevel)) {
    return raw as TrainingLevel;
  }
  return 'intermediario';
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.name.trim() &&
    profile.goal.trim() &&
    profile.daysPerWeek >= 1 &&
    profile.timePerWorkout >= 20,
  );
}
