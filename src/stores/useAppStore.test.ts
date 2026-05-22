import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './useAppStore';

// Mock utils that are called on initialization to prevent real side effects
vi.mock('../utils/analyticsUtils', () => ({
  loadHistory: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/streakUtils', () => ({
  loadStreak: vi.fn().mockReturnValue({ current: 0, best: 0, lastCheckin: 0 })
}));

const initialState = useAppStore.getState();

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset Zustand store completely
    useAppStore.setState(initialState, true);
    // Clear localStorage for settings tests
    localStorage.clear();
  });

  it('has expected initial state', () => {
    const state = useAppStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isPremium).toBe(false);
    expect(state.plans).toEqual([]);
    expect(state.darkMode).toBe(true);
    expect(state.language).toBe('PT');
  });

  it('updates simple state values correctly', () => {
    const state = useAppStore.getState();
    
    // Act
    state.setIsPremium(true);
    state.setLanguage('EN');
    state.setDarkMode(false);
    
    // Assert
    const updated = useAppStore.getState();
    expect(updated.isPremium).toBe(true);
    expect(updated.language).toBe('EN');
    expect(updated.darkMode).toBe(false);
  });

  it('updates objects and arrays correctly', () => {
    const state = useAppStore.getState();
    
    const mockProfile = { id: 'test-profile' } as any;
    const mockPlans = [{ id: 'plan-1' }] as any[];
    
    // Act
    state.setProfile(mockProfile);
    state.setPlans(mockPlans);
    
    // Assert
    const updated = useAppStore.getState();
    expect(updated.profile).toEqual(mockProfile);
    expect(updated.plans).toEqual(mockPlans);
  });
});
