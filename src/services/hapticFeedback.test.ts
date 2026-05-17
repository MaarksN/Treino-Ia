import { describe, expect, it, vi } from 'vitest';
import { getHapticFeedbackAvailability, triggerHapticFeedback } from './hapticFeedback';

function createWindowMock(overrides: Partial<Window> = {}) {
  const storage = new Map<string, string>();

  return {
    localStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
    },
    navigator: {
      vibrate: vi.fn(() => true),
    },
    ...overrides,
  } as unknown as Window;
}

describe('hapticFeedback', () => {
  it('usa Capacitor Haptics quando o plugin esta disponivel', async () => {
    const selectionChanged = vi.fn();
    const win = createWindowMock({
      Capacitor: {
        Plugins: {
          Haptics: { selectionChanged },
        },
      },
    } as unknown as Partial<Window>);

    const result = await triggerHapticFeedback('selection', { win });

    expect(result).toEqual({ triggered: true, channel: 'capacitor' });
    expect(selectionChanged).toHaveBeenCalledTimes(1);
  });

  it('cai para navigator.vibrate sem Capacitor', async () => {
    const win = createWindowMock();
    const result = await triggerHapticFeedback('success', { win });

    expect(result.channel).toBe('vibration');
    expect(result.triggered).toBe(true);
    expect(win.navigator.vibrate).toHaveBeenCalledWith([20, 35, 20]);
  });

  it('respeita configuracao local para desativar haptics', async () => {
    const win = createWindowMock();
    win.localStorage.getItem = vi.fn(() => JSON.stringify({ hapticEnabled: false }));

    const result = await triggerHapticFeedback('impact', { win });

    expect(result).toEqual({ triggered: false, channel: 'none', reason: 'disabled' });
    expect(win.navigator.vibrate).not.toHaveBeenCalled();
  });

  it('expõe disponibilidade sem disparar feedback', () => {
    const win = createWindowMock();

    expect(getHapticFeedbackAvailability(win)).toEqual({
      capacitor: false,
      vibration: true,
    });
  });
});
