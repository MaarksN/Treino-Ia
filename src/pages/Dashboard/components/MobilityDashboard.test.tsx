import { describe, expect, it } from 'vitest';
import {
  createMobilityLog,
  DEFAULT_MOBILITY_JOINT,
  DEFAULT_MOBILITY_SCORE,
  MOBILITY_CAMERA_GUARD_MESSAGE,
} from './MobilityDashboard.logic';

describe('MobilityDashboard', () => {
  it('creates a stable manual mobility log', () => {
    const loggedAt = new Date('2026-05-17T12:00:00.000Z');
    const log = createMobilityLog(
      {
        joint: 'Ombro',
        score: 8,
        notes: 'Melhorou muito',
      },
      loggedAt,
    );

    expect(log).toEqual({
      id: '1779019200000',
      date: '2026-05-17T12:00:00.000Z',
      joint: 'Ombro',
      score: 8,
      notes: 'Melhorou muito',
    });
  });

  it('keeps the manual fallback defaults and camera guard copy', () => {
    expect(DEFAULT_MOBILITY_JOINT).toBe('Ombro');
    expect(DEFAULT_MOBILITY_SCORE).toBe(5);
    expect(MOBILITY_CAMERA_GUARD_MESSAGE).toContain('Item 88 Guard');
    expect(MOBILITY_CAMERA_GUARD_MESSAGE).toContain('Faça o registro manual');
  });
});
