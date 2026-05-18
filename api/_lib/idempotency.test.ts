import { describe, it, expect } from 'vitest';
import { buildIdempotencyKey, getDailyPeriod } from './idempotency';

describe('Idempotency', () => {
  it('builds a unique key without period', () => {
    const key = buildIdempotencyKey('user1', 'claim', 'mission1');
    expect(key).toBe('user1:claim:mission1');
  });

  it('builds a unique key with period', () => {
    const key = buildIdempotencyKey('user1', 'checkin', null, '2023-10-25');
    expect(key).toBe('user1:checkin:2023-10-25');
  });

  it('gets a daily period string based on UTC', () => {
    const date = new Date('2023-10-25T15:30:00Z');
    expect(getDailyPeriod(date)).toBe('2023-10-25');
  });
});
