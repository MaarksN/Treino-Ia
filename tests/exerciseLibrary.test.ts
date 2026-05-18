import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchExercises,
  loadCustomExercises,
  saveCustomExercise,
  getExerciseLibrary,
  findExerciseLibraryEntry,
  LibraryExercise
} from '../src/data/exerciseLibrary';

const mockLibrary: LibraryExercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    movementPattern: 'Horizontal Push',
    tags: ['barbell', 'strength'],
    aliases: ['BP', 'supino']
  },
  {
    id: '2',
    name: 'Squat',
    muscleGroup: 'Legs',
    movementPattern: 'Squat',
    tags: ['barbell', 'compound'],
    aliases: ['back squat']
  },
  {
    id: '3',
    name: 'Push Up',
    muscleGroup: 'Chest',
    movementPattern: 'Horizontal Push',
    tags: ['bodyweight', 'endurance'],
  }
];

describe('exerciseLibrary - searchExercises', () => {
  it('searches by name (case insensitive)', () => {
    const results = searchExercises('bench', mockLibrary);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');

    const resultsUpper = searchExercises('SQUAT', mockLibrary);
    expect(resultsUpper).toHaveLength(1);
    expect(resultsUpper[0].id).toBe('2');
  });

  it('searches by muscle group', () => {
    const results = searchExercises('chest', mockLibrary);
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id).sort()).toEqual(['1', '3']);
  });

  it('searches by movement pattern', () => {
    const results = searchExercises('horizontal push', mockLibrary);
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id).sort()).toEqual(['1', '3']);
  });

  it('searches by tags', () => {
    const results = searchExercises('barbell', mockLibrary);
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id).sort()).toEqual(['1', '2']);
  });

  it('searches by aliases', () => {
    const results = searchExercises('supino', mockLibrary);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('returns empty array when no matches are found', () => {
    const results = searchExercises('deadlift', mockLibrary);
    expect(results).toHaveLength(0);
  });
});

describe('exerciseLibrary - custom exercises', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadCustomExercises returns empty array initially', () => {
    expect(loadCustomExercises()).toEqual([]);
  });

  it('saveCustomExercise adds to localStorage and generates id', () => {
    const newExercise = saveCustomExercise({
      name: 'My Custom Deadlift',
      muscleGroup: 'Posterior',
      movementPattern: 'Hinge',
      tags: ['custom', 'deadlift']
    });

    expect(newExercise.id).toBeDefined();
    expect(newExercise.isCustom).toBe(true);
    expect(newExercise.name).toBe('My Custom Deadlift');

    const saved = loadCustomExercises();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual(newExercise);
  });

  it('loadCustomExercises handles invalid JSON', () => {
    localStorage.setItem('@TreinoApp:customExercises', 'invalid json');
    expect(loadCustomExercises()).toEqual([]);
  });

  it('getExerciseLibrary combines default library and custom exercises', () => {
    // Should return at least 25 default exercises (from EXERCISE_LIBRARY)
    const initialLibrary = getExerciseLibrary();
    expect(initialLibrary.length).toBeGreaterThanOrEqual(25);

    saveCustomExercise({
      name: 'Another Custom Exercise',
      muscleGroup: 'Any',
      movementPattern: 'Any',
      tags: []
    });

    const newLibrary = getExerciseLibrary();
    expect(newLibrary).toHaveLength(initialLibrary.length + 1);
    expect(newLibrary.find(e => e.name === 'Another Custom Exercise')).toBeDefined();
  });

  it('findExerciseLibraryEntry finds exercises by name or alias', () => {
    // Test with default exercise
    const found1 = findExerciseLibraryEntry('supino reto com barra');
    expect(found1).toBeDefined();
    expect(found1?.id).toBe('e001');

    // Test with alias
    const found2 = findExerciseLibraryEntry('bench press');
    expect(found2).toBeDefined();
    expect(found2?.id).toBe('e001');

    // Test with custom exercise
    saveCustomExercise({
      name: 'Special Custom Lift',
      muscleGroup: 'Any',
      movementPattern: 'Any',
      tags: [],
      aliases: ['special']
    });

    const foundCustom = findExerciseLibraryEntry('special custom lift');
    expect(foundCustom).toBeDefined();
    expect(foundCustom?.name).toBe('Special Custom Lift');

    const foundCustomAlias = findExerciseLibraryEntry('special');
    expect(foundCustomAlias).toBeDefined();
    expect(foundCustomAlias?.name).toBe('Special Custom Lift');
  });
});
