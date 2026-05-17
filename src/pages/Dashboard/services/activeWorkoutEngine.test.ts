import { describe, expect, it } from 'vitest';
import {
  buildActiveWorkoutSummary,
  calculateExerciseVolume,
  calculateWorkoutProgress,
  detectSimplePlateau,
  getRpeGuidance,
  parseRestSeconds,
  suggestInitialExerciseDraft,
  buildWorkoutExerciseLog,
  calculateRpeFromRir,
  calculateRirFromRpe,
  getRpeCalculatorOptions,
} from './activeWorkoutEngine';
import { type ActiveExerciseDraft } from '../types';
import { type WorkoutSession } from '../../../services/database';

const sampleDraft: ActiveExerciseDraft[] = [{
  exerciseId: 'ex-1',
  name: 'Supino',
  targetSets: 3,
  targetReps: '8-10',
  targetRest: '90s',
  completed: true,
  exerciseNote: 'Manter escápulas encaixadas.',
  intensityTechnique: 'dropset',
  sets: [{ weight: '100', reps: '10', rpe: '8', completed: true }],
}];

describe('activeWorkoutEngine', () => {
  it('calcula tonelagem com peso e reps válidos', () => {
    expect(calculateExerciseVolume([{ weight: '100', reps: '10' }])).toBe(1000);
  });

  it('retorna 0 com dados inválidos', () => {
    expect(calculateExerciseVolume([{ weight: '', reps: '-2' }])).toBe(0);
  });

  it('calcula progresso de exercícios concluídos', () => {
    expect(calculateWorkoutProgress(sampleDraft).percent).toBe(100);
  });

  it('retorna orientação correta de RPE', () => {
    expect(getRpeGuidance('9').label).toBe('RPE 9');
  });

  it('calcula RPE a partir de RIR', () => {
    expect(calculateRpeFromRir(0)).toBe(10);
    expect(calculateRpeFromRir(1)).toBe(9);
    expect(calculateRpeFromRir(2)).toBe(8);
    expect(calculateRpeFromRir(4)).toBe(6);
    expect(calculateRpeFromRir(-1)).toBe(10);
    expect(calculateRpeFromRir(10)).toBe(6);
    expect(calculateRpeFromRir('invalid')).toBe(0);
  });

  it('calcula RIR a partir de RPE', () => {
    expect(calculateRirFromRpe(10)).toBe(0);
    expect(calculateRirFromRpe(9)).toBe(1);
    expect(calculateRirFromRpe(8)).toBe(2);
    expect(calculateRirFromRpe(6)).toBe(4);
    expect(calculateRirFromRpe(5)).toBeNull();
    expect(calculateRirFromRpe(12)).toBe(0);
    expect(calculateRirFromRpe('invalid')).toBeNull();
  });

  it('gera opções de calculadora RPE', () => {
    const options = getRpeCalculatorOptions();
    expect(options.length).toBe(5);
    expect(options[0].rirLabel).toBe('0');
    expect(options[0].rpe).toBe('10');
  });

  it('detecta platô simples com histórico suficiente', () => {
    const history = createHistory([900, 900, 900]);
    expect(detectSimplePlateau('ex-1', history).isPlateau).toBe(true);
  });

  it('não detecta platô sem histórico suficiente', () => {
    const history = createHistory([900, 900]);
    expect(detectSimplePlateau('ex-1', history).isPlateau).toBe(false);
  });

  it('sugere autofill com último exercício', () => {
    const history = createHistory([900]);
    expect(suggestInitialExerciseDraft('ex-1', history).hasSuggestion).toBe(true);
  });

  it('não sugere autofill sem histórico', () => {
    expect(suggestInitialExerciseDraft('none', []).hasSuggestion).toBe(false);
  });

  it('gera resumo de treino ativo em tempo real', () => {
    const summary = buildActiveWorkoutSummary(sampleDraft);
    expect(summary.tonnage.totalTonnage).toBe(1000);
    expect(summary.averageRpe).toBe(8);
  });

  it('parseia descanso textual para segundos', () => {
    expect(parseRestSeconds('2 min')).toBe(120);
    expect(parseRestSeconds('90s')).toBe(90);
    expect(parseRestSeconds('sem pausa')).toBe(60);
  });

  it('usa validacao granular ao converter draft em log', () => {
    const log = buildWorkoutExerciseLog({
      ...sampleDraft[0],
      sets: [{ weight: '100,5', reps: '8.6', rpe: '12', completed: true }],
    });

    expect(log.sets?.[0]).toEqual({ weight: 100.5, reps: 9, rpe: 10 });
    expect(log.exerciseNote).toBe('Manter escápulas encaixadas.');
    expect(log.intensityTechnique).toBe('dropset');
  });
});

function createHistory(volumes: number[]): WorkoutSession[] {
  return volumes.map((volume, i) => ({
    id: `s-${i}`,
    planId: 'p1',
    dayId: 'd1',
    dayName: 'A',
    focus: 'Peito',
    completedAt: Date.now() - i,
    durationMinutes: 60,
    totalVolume: volume,
    completedExercises: 1,
    totalExercises: 1,
    feedback: '',
    nextRecommendation: '',
    exercises: [{
      exerciseId: 'ex-1',
      name: 'Supino',
      targetSets: 3,
      targetReps: '8-10',
      targetRest: '90s',
      completed: true,
      actualWeight: 90,
      actualReps: 10,
      rpe: 8,
      sets: [{ weight: volume / 10, reps: 10, rpe: 8 }],
    }],
  }));
}
