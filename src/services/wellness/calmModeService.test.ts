import { describe, it, expect } from 'vitest';
import {
  getInitialCalmModeState,
  activateCalmMode,
  deactivateCalmMode,
  advanceCalmModeStep,
} from './calmModeService';

describe('calmModeService', () => {
  it('should return initial state', () => {
    const state = getInitialCalmModeState();
    expect(state.isActive).toBe(false);
    expect(state.step).toBe('breathe');
  });

  it('should activate calm mode safely', () => {
    const state = activateCalmMode();
    expect(state.isActive).toBe(true);
    expect(state.step).toBe('breathe');
  });

  it('should deactivate calm mode', () => {
    const state = deactivateCalmMode();
    expect(state.isActive).toBe(false);
  });

  it('should advance steps incrementally', () => {
    let state = activateCalmMode();
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('sit');
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('water');
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('reduce_intensity');
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('seek_help');
    // Should not advance past seek_help
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('seek_help');
  });

  it('should not advance if inactive', () => {
    let state = getInitialCalmModeState();
    state = advanceCalmModeStep(state);
    expect(state.step).toBe('breathe');
  });
});
