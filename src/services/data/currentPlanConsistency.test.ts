import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrentPlanConsistencyHelper } from './currentPlanConsistency';
import { DatabaseService } from '../database';
import { TrainingPlan } from '../database';

vi.mock('../database', () => ({
  DatabaseService: {
    getPersistenceStatus: vi.fn(),
    saveCurrentPlan: vi.fn(),
  },
}));

describe('CurrentPlanConsistencyHelper', () => {
  const mockPlan = { id: 'plan1', planName: 'Test Plan' } as TrainingPlan;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when remote save succeeds', async () => {
    vi.mocked(DatabaseService.getPersistenceStatus).mockResolvedValue({ mode: 'supabase' } as any);
    vi.mocked(DatabaseService.saveCurrentPlan).mockResolvedValue(true);

    const result = await CurrentPlanConsistencyHelper.setCurrentPlan(mockPlan);
    expect(result).toEqual({ status: 'success', plan: mockPlan });
  });

  it('returns local_fallback when local save succeeds', async () => {
    vi.mocked(DatabaseService.getPersistenceStatus).mockResolvedValue({ mode: 'local' } as any);
    vi.mocked(DatabaseService.saveCurrentPlan).mockResolvedValue(true);

    const result = await CurrentPlanConsistencyHelper.setCurrentPlan(mockPlan);
    expect(result).toEqual({ status: 'local_fallback', plan: mockPlan });
  });

  it('returns failed when save returns false', async () => {
    vi.mocked(DatabaseService.saveCurrentPlan).mockResolvedValue(false);

    const result = await CurrentPlanConsistencyHelper.setCurrentPlan(mockPlan);
    expect(result.status).toBe('failed');
  });
});
