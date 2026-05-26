import { env } from '../config/env';
import type { AnalyticsEventName, AnalyticsEventProperties } from '../config/analyticsEvents';

let posthogInitialized = false;
const TRACKED_ONCE_EVENTS_KEY = '@TreinoApp:analytics-once';
const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;

function hasStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readTrackedOnceEvents(): string[] {
  if (!hasStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(TRACKED_ONCE_EVENTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeTrackedOnceEvents(events: string[]) {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(TRACKED_ONCE_EVENTS_KEY, JSON.stringify([...new Set(events)]));
  } catch {}
}

// Stub de inicialização
export function initAnalytics() {
  if (posthogInitialized || !env.isProduction) return;
  // Initialize PostHog here if config is present
  // posthog.init(env.posthogKey, { api_host: env.posthogHost });
  posthogInitialized = true;
}

export function trackEvent(eventName: AnalyticsEventName, properties?: AnalyticsEventProperties) {
  if (!env.isProduction) {
    // No-op em dev
    console.debug(`[Analytics No-Op] ${eventName}`, properties);
    return;
  }

  try {
    // posthog.capture(eventName, properties);
  } catch (error) {
    console.warn(`[Analytics Error] Failed to track ${eventName}`, error);
  }
}

export function trackEventOnce(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
): boolean {
  const tracked = readTrackedOnceEvents();
  if (tracked.includes(eventName)) return false;

  trackEvent(eventName, properties);
  writeTrackedOnceEvents([...tracked, eventName]);
  return true;
}

export function trackDay7Return(
  activatedAt: number | null | undefined,
  properties?: AnalyticsEventProperties,
  now = Date.now(),
): boolean {
  if (!activatedAt || now - activatedAt < SEVEN_DAYS_MS) return false;

  return trackEventOnce('day_7_return_detected', {
    ...properties,
    daysSinceActivation: Math.floor((now - activatedAt) / DAY_MS),
  });
}
