export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'anamnesis_completed'
  | 'workout_started'
  | 'set_logged'
  | 'workout_completed'
  | 'ai_suggestion_generated'
  | 'ai_suggestion_accepted'
  | 'ai_suggestion_rejected'
  | 'ai_suggestion_dismissed'
  | 'critical_error_captured'
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
