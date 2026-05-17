import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HYDRATION_COLOR_LEVEL,
  getHydrationColorMessage,
  HYDRATION_CAMERA_GUARD_MESSAGE,
} from './HydrationManualScanner.logic';

describe('HydrationManualScanner', () => {
  it('keeps the default ideal hydration message', () => {
    expect(DEFAULT_HYDRATION_COLOR_LEVEL).toBe(3);
    expect(getHydrationColorMessage(DEFAULT_HYDRATION_COLOR_LEVEL)).toContain('amarela clara');
    expect(getHydrationColorMessage(DEFAULT_HYDRATION_COLOR_LEVEL)).toContain('ideal');
  });

  it('returns warning copy for darker manual levels', () => {
    expect(getHydrationColorMessage(6)).toContain('Corrente escura');
    expect(getHydrationColorMessage(6)).toContain('Alerta');
  });

  it('keeps the camera guard as a manual fallback', () => {
    expect(HYDRATION_CAMERA_GUARD_MESSAGE).toContain('Item 89 Guard');
    expect(HYDRATION_CAMERA_GUARD_MESSAGE).toContain('Faça o registro manual');
  });
});
