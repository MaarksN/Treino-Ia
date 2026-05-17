import { describe, expect, it } from 'vitest';
import { getDailyMissions } from './dailyMissions';

describe('dailyMissions', () => {
  it('returns deterministic missions', () => {
    const missions = getDailyMissions('2026-05-16', 3);
    expect(missions).toHaveLength(3);
    expect(missions[0]).toBeTruthy();
  });
});
