import { describe, expect, it } from 'vitest';
import { calculateRpeLoad } from './rpeLoadService';

const mk = (rpe: number) => ({ id:'1',planId:'1',dayId:'1',dayName:'A',focus:'B',completedAt:1,durationMinutes:40,totalVolume:1,completedExercises:1,totalExercises:1,feedback:'',nextRecommendation:'',exercises:[{exerciseId:'e',name:'n',targetSets:1,targetReps:'8',targetRest:'60',completed:true,sets:[{weight:10,reps:8,rpe}]}]});

describe('rpeLoadService', () => {
  it('fallback for empty history', () => {
    expect(calculateRpeLoad([]).message).toContain('insuficientes');
  });
  it('classifies moderate/high loads', () => {
    expect(calculateRpeLoad([mk(8), mk(8), mk(8)] as never).level).toBe('leve');
    expect(calculateRpeLoad(Array.from({length:7},()=>mk(10)) as never).level).toBe('muito alta');
  });
});
