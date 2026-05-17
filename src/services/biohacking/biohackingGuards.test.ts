import { describe, it, expect } from 'vitest';
import { getFlirCapability, getHrvCapability } from './biohackingGuards';

describe('Biohacking Guards', () => {
  it('should block FLIR capability as external dependency', () => {
    const capability = getFlirCapability();
    expect(capability.isHardwareAvailable).toBe(false);
    expect(capability.status).toBe('blocked_external_dependency');
    expect(capability.lastReading).toBeNull();
  });

  it('should block HRV capability and enforce research guard', () => {
    const capability = getHrvCapability();
    expect(capability.isHardwareAvailable).toBe(false);
    expect(capability.status).toBe('blocked_external_dependency');
    expect(capability.isResearchGuardActive).toBe(true);
    expect(capability.lastReading).toBeNull();
  });
});
