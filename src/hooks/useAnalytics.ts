import { useCallback } from 'react';
import { trackEvent } from '../utils/analytics';
import type { AnalyticsEventName, AnalyticsEventProperties } from '../config/analyticsEvents';

export function useAnalytics() {
  const track = useCallback(
    (eventName: AnalyticsEventName, properties?: AnalyticsEventProperties) => {
      trackEvent(eventName, properties);
    },
    [],
  );

  return { track };
}
