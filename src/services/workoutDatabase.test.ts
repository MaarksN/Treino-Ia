import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WorkoutDatabase, WorkoutSession } from './workoutDatabase';

describe('WorkoutDatabase', () => {
  const mockSession: WorkoutSession = {
    id: 'test-session-1',
    date: '2024-05-18',
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: 3,
        reps: '10',
        weight: 100,
        completed: true,
      },
    ],
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Spy on console.error to keep test output clean during error tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHistory', () => {
    it('should return an empty array if localStorage is empty', async () => {
      const history = await WorkoutDatabase.getHistory();
      expect(history).toEqual([]);
    });

    it('should return parsed data if localStorage contains valid JSON', async () => {
      const storedData = [mockSession];
      localStorage.setItem('@TreinoIA:history', JSON.stringify(storedData));

      const history = await WorkoutDatabase.getHistory();
      expect(history).toEqual(storedData);
    });

    it('should return an empty array if localStorage contains invalid JSON', async () => {
      localStorage.setItem('@TreinoIA:history', 'invalid-json');

      const history = await WorkoutDatabase.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('saveSession', () => {
    it('should append a new session to an empty history', async () => {
      const result = await WorkoutDatabase.saveSession(mockSession);

      expect(result).toBe(true);
      const storedData = localStorage.getItem('@TreinoIA:history');
      expect(storedData).toBe(JSON.stringify([mockSession]));
    });

    it('should append a new session to an existing history', async () => {
      // Setup initial history
      const initialSession: WorkoutSession = {
        ...mockSession,
        id: 'initial-session',
      };
      localStorage.setItem('@TreinoIA:history', JSON.stringify([initialSession]));

      // Save a new session
      const result = await WorkoutDatabase.saveSession(mockSession);

      expect(result).toBe(true);
      const storedData = localStorage.getItem('@TreinoIA:history');
      expect(storedData).toBe(JSON.stringify([initialSession, mockSession]));
    });

    it('should handle errors gracefully and return false', async () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota Exceeded');
      });

      const result = await WorkoutDatabase.saveSession(mockSession);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Erro ao salvar treino:', expect.any(Error));

      setItemSpy.mockRestore();
    });
  });
});
