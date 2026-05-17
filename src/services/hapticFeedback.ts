export type HapticFeedbackKind = 'selection' | 'impact' | 'success' | 'warning';

export type HapticFeedbackChannel = 'capacitor' | 'vibration' | 'none';

export interface HapticFeedbackResult {
  triggered: boolean;
  channel: HapticFeedbackChannel;
  reason?: 'disabled' | 'unavailable' | 'failed';
}

interface HapticsPlugin {
  impact?: (options?: { style?: string }) => Promise<void> | void;
  notification?: (options?: { type?: string }) => Promise<void> | void;
  selectionChanged?: () => Promise<void> | void;
  vibrate?: (options?: { duration?: number }) => Promise<void> | void;
}

interface HapticWindow extends Window {
  Capacitor?: {
    Plugins?: {
      Haptics?: HapticsPlugin;
    };
  };
}

const SETTINGS_KEY = '@TreinoApp:settings';

const vibrationPatterns: Record<HapticFeedbackKind, number | number[]> = {
  selection: 12,
  impact: 18,
  success: [20, 35, 20],
  warning: [30, 45, 30],
};

function readHapticSetting(win: Window): boolean {
  try {
    const raw = win.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as { hapticEnabled?: boolean };
    return parsed.hapticEnabled !== false;
  } catch {
    return true;
  }
}

function getCapacitorHaptics(win: Window): HapticsPlugin | null {
  return (win as HapticWindow).Capacitor?.Plugins?.Haptics ?? null;
}

async function triggerCapacitorHaptic(plugin: HapticsPlugin, kind: HapticFeedbackKind): Promise<boolean> {
  if (kind === 'success' && plugin.notification) {
    await plugin.notification({ type: 'SUCCESS' });
    return true;
  }

  if (kind === 'warning' && plugin.notification) {
    await plugin.notification({ type: 'WARNING' });
    return true;
  }

  if (kind === 'selection' && plugin.selectionChanged) {
    await plugin.selectionChanged();
    return true;
  }

  if (plugin.impact) {
    await plugin.impact({ style: kind === 'impact' ? 'MEDIUM' : 'LIGHT' });
    return true;
  }

  if (plugin.vibrate) {
    await plugin.vibrate({ duration: 20 });
    return true;
  }

  return false;
}

export function getHapticFeedbackAvailability(win: Window = window) {
  return {
    capacitor: Boolean(getCapacitorHaptics(win)),
    vibration: typeof win.navigator.vibrate === 'function',
  };
}

export async function triggerHapticFeedback(
  kind: HapticFeedbackKind,
  options: { enabled?: boolean; win?: Window } = {},
): Promise<HapticFeedbackResult> {
  const win = options.win ?? window;
  const enabled = options.enabled ?? readHapticSetting(win);

  if (!enabled) {
    return { triggered: false, channel: 'none', reason: 'disabled' };
  }

  const plugin = getCapacitorHaptics(win);

  if (plugin) {
    try {
      const triggered = await triggerCapacitorHaptic(plugin, kind);
      if (triggered) {
        return { triggered: true, channel: 'capacitor' };
      }
    } catch {
      return { triggered: false, channel: 'capacitor', reason: 'failed' };
    }
  }

  if (typeof win.navigator.vibrate === 'function') {
    const accepted = win.navigator.vibrate(vibrationPatterns[kind]);
    return accepted
      ? { triggered: true, channel: 'vibration' }
      : { triggered: false, channel: 'vibration', reason: 'failed' };
  }

  return { triggered: false, channel: 'none', reason: 'unavailable' };
}
