import { describe, it, expect } from 'vitest';
import { toggleBinauralBeat, getBinauralDisclaimer } from './binauralBeatsService';

describe('Binaural Beats Service', () => {
  it('should activate a new session', () => {
    const session = toggleBinauralBeat(null, 'focus');
    expect(session.isActive).toBe(true);
    expect(session.type).toBe('focus');
    expect(session.hz).toBe(14);
  });

  it('should deactivate an active session of the same type', () => {
    const activeSession = toggleBinauralBeat(null, 'focus');
    const toggledSession = toggleBinauralBeat(activeSession, 'focus');
    expect(toggledSession.isActive).toBe(false);
  });

  it('should switch to a new type if different', () => {
    const activeSession = toggleBinauralBeat(null, 'focus');
    const newSession = toggleBinauralBeat(activeSession, 'recovery');
    expect(newSession.isActive).toBe(true);
    expect(newSession.type).toBe('recovery');
    expect(newSession.hz).toBe(2);
  });

  it('should provide a non-medical disclaimer', () => {
    expect(getBinauralDisclaimer()).toContain('não têm eficácia médica comprovada');
  });
});
