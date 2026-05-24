export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'workout_started'
  | 'workout_completed'
  | 'progression_suggested'
  | 'progression_accepted'
  | 'progression_rejected'
  | 'progression_suggestion_viewed'
  | 'progression_suggestion_hidden_insufficient_data'
  | 'paywall_viewed'
  | 'upgrade_clicked'
  | 'billing_opened';

export interface AnalyticsEventProperties {
  [key: string]: unknown;
}
