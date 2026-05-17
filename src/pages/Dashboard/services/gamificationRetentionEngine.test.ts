import { describe, expect, it } from 'vitest';
import { type UserProfile, type WorkoutSession } from '../../../services/database';
import {
  buildConsistencyLeaderboard,
  buildGamificationRetentionState,
  buildHiddenDailyMissions,
  buildLifestyleBadges,
  buildProfileTitle,
  buildStreakFreezeState,
} from './gamificationRetentionEngine';

const profile: UserProfile = {
  id: 'profile-1',
  name: 'Atleta Teste',
  level: 'intermediario',
  goal: 'Hipertrofia',
  daysPerWeek: 4,
  timePerWorkout: 50,
  injuries: 'Nenhuma',
  equipment: 'Academia',
  updatedAt: dateMs(2026, 5, 17),
};

describe('gamificationRetentionEngine', () => {
  it('rankeia semanas por consistencia local, nao por volume bruto', () => {
    const today = date(2026, 5, 17);
    const consistentWeek = [
      session('c1', 2026, 5, 11, 1000),
      session('c2', 2026, 5, 12, 1000),
      session('c3', 2026, 5, 14, 1000),
      session('c4', 2026, 5, 16, 1000),
    ];
    const highVolumeSingleDay = [session('v1', 2026, 5, 6, 50_000)];

    const leaderboard = buildConsistencyLeaderboard(profile, [...consistentWeek, ...highVolumeSingleDay], today);

    expect(leaderboard[0].workouts).toBe(4);
    expect(leaderboard[0].score).toBeGreaterThan(leaderboard[1].score);
    expect(leaderboard[0].totalVolume).toBeLessThan(leaderboard[1].totalVolume);
  });

  it('gera badges conquistados e em progresso com base no historico local', () => {
    const today = date(2026, 5, 17);
    const history = [
      session('s1', 2026, 5, 11, 1000, true, 'bom'),
      session('s2', 2026, 5, 12, 1000, true, 'ok'),
      session('s3', 2026, 5, 14, 1000, true),
      session('s4', 2026, 5, 16, 1000, true),
    ];

    const badges = buildLifestyleBadges(profile, history, today);

    expect(badges.find(badge => badge.id === 'first_workout_local')?.achieved).toBe(true);
    expect(badges.find(badge => badge.id === 'weekly_lifestyle_target')?.achieved).toBe(true);
    expect(badges.find(badge => badge.id === 'ten_workouts_no_gap')?.achieved).toBe(false);
  });

  it('preserva ofensiva local com freeze quando hoje e descanso legitimo', () => {
    const today = date(2026, 5, 17);
    const history = [
      session('s1', 2026, 5, 16),
      session('s2', 2026, 5, 15),
      session('s3', 2026, 5, 14),
    ];

    const freeze = buildStreakFreezeState(profile, history, today);

    expect(freeze.isProtectedToday).toBe(true);
    expect(freeze.protectedDailyStreak).toBeGreaterThan(freeze.rawDailyStreak);
    expect(freeze.freezesRemaining).toBeGreaterThanOrEqual(0);
  });

  it('libera titulos de perfil por nivel local', () => {
    const history = Array.from({ length: 23 }).map((_, index) => (
      session(`s${index}`, 2026, 5, Math.max(1, 16 - index), 1000, true)
    ));

    const title = buildProfileTitle(history);

    expect(title.level).toBeGreaterThanOrEqual(20);
    expect(title.title).toBe('Guardiao da Forja');
  });

  it('cria missoes escondidas diarias deterministicas com progresso real', () => {
    const today = date(2026, 5, 17);
    const missions = buildHiddenDailyMissions(profile, [
      session('today', 2026, 5, 17, 1000, true, 'feito'),
    ], today);

    expect(missions).toHaveLength(3);
    expect(missions.some(mission => mission.revealed)).toBe(true);
    expect(missions.every(mission => mission.id.endsWith('2026-05-17'))).toBe(true);
  });

  it('monta estado consolidado para a secao do Dashboard', () => {
    const state = buildGamificationRetentionState(profile, [
      session('s1', 2026, 5, 17, 1000, true, 'feito'),
    ], date(2026, 5, 17));

    expect(state.summary.totalWorkouts).toBe(1);
    expect(state.leaderboard.length).toBeGreaterThan(0);
    expect(state.badges.length).toBeGreaterThan(0);
    expect(state.hiddenMissions.length).toBe(3);
  });
});

function session(
  id: string,
  year: number,
  month: number,
  day: number,
  totalVolume = 1000,
  complete = true,
  feedback = '',
): WorkoutSession {
  return {
    id,
    planId: 'plan-1',
    dayId: `day-${day}`,
    dayName: 'Treino A',
    focus: 'Forca',
    completedAt: dateMs(year, month, day),
    durationMinutes: 50,
    totalVolume,
    completedExercises: complete ? 3 : 2,
    totalExercises: 3,
    feedback,
    nextRecommendation: '',
    exercises: [{
      exerciseId: 'ex-1',
      name: 'Supino',
      targetSets: 3,
      targetReps: '8-10',
      targetRest: '90s',
      completed: complete,
      sets: [
        { weight: totalVolume / 30, reps: 10, rpe: 8 },
        { weight: totalVolume / 30, reps: 10, rpe: 8 },
        { weight: totalVolume / 30, reps: 10, rpe: 8 },
      ],
    }],
  };
}

function date(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0);
}

function dateMs(year: number, month: number, day: number) {
  return date(year, month, day).getTime();
}
