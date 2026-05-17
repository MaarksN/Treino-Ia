import { type HydrationEntry } from '../types';
import { saveHydrationEntry } from './biometricUtils';

export const HYDRATION_QUICK_ADD_PARAM = 'quickHydrationMl';
export const HYDRATION_QUICK_ADD_EVENT = 'hydration:quick-add';
export const HYDRATION_QUICK_ADD_REQUEST_EVENT = 'hydration:quick-add-request';

export interface HydrationQuickAddDetail {
  amountMl: number;
  source?: string;
}

function clampAmount(amountMl: number) {
  if (!Number.isFinite(amountMl)) return null;
  const rounded = Math.round(amountMl);
  if (rounded < 50 || rounded > 2000) return null;
  return rounded;
}

export function parseHydrationQuickAddUrl(url: string): HydrationQuickAddDetail | null {
  try {
    const parsed = new URL(url, 'https://treino.local');
    const amount = clampAmount(Number(parsed.searchParams.get(HYDRATION_QUICK_ADD_PARAM)));

    if (!amount) return null;

    return {
      amountMl: amount,
      source: parsed.searchParams.get('source') || undefined,
    };
  } catch {
    return null;
  }
}

export function buildHydrationQuickAddUrl(amountMl: number, source = 'pwa-shortcut') {
  const amount = clampAmount(amountMl) ?? 250;
  const params = new URLSearchParams({
    view: 'nutrition',
    [HYDRATION_QUICK_ADD_PARAM]: String(amount),
    source,
  });

  return `/?${params.toString()}`;
}

export function createQuickHydrationEntry(detail: HydrationQuickAddDetail): HydrationEntry {
  const today = new Date().toISOString().slice(0, 10);
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `hydration_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return {
    id,
    date: today,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    amountMl: detail.amountMl,
    type: 'água',
  };
}

export function persistQuickHydration(detail: HydrationQuickAddDetail): HydrationEntry | null {
  const amount = clampAmount(detail.amountMl);

  if (!amount) return null;

  const entry = createQuickHydrationEntry({ ...detail, amountMl: amount });
  saveHydrationEntry(entry);

  window.dispatchEvent(new CustomEvent(HYDRATION_QUICK_ADD_EVENT, {
    detail: { entry, source: detail.source },
  }));

  return entry;
}

export function consumeHydrationQuickAddFromCurrentUrl(): HydrationEntry | null {
  const detail = parseHydrationQuickAddUrl(window.location.href);

  if (!detail) return null;

  const entry = persistQuickHydration(detail);
  const url = new URL(window.location.href);
  url.searchParams.delete(HYDRATION_QUICK_ADD_PARAM);
  url.searchParams.delete('source');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

  return entry;
}

export function installHydrationQuickActionBridge(): () => void {
  consumeHydrationQuickAddFromCurrentUrl();

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<HydrationQuickAddDetail>).detail;

    if (detail?.amountMl) {
      persistQuickHydration(detail);
    }
  };

  window.addEventListener(HYDRATION_QUICK_ADD_REQUEST_EVENT, handler);

  return () => {
    window.removeEventListener(HYDRATION_QUICK_ADD_REQUEST_EVENT, handler);
  };
}
