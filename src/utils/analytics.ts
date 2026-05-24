import { env } from '../config/env';
import type { AnalyticsEventName, AnalyticsEventProperties } from '../config/analyticsEvents';

let posthogInitialized = false;

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
