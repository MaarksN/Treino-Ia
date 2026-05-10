export type IntegrationProvider =
  | 'apple_health'
  | 'google_fit'
  | 'garmin'
  | 'fitbit'
  | 'ble_hr'
  | 'strava'
  | 'calendar'
  | 'webhook'
  | 'notion'
  | 'whatsapp'
  | 'supabase';

export interface IntegrationConnection {
  provider: IntegrationProvider;
  label: string;
  status: 'available' | 'connected' | 'needs_config' | 'roadmap';
  premium: boolean;
  lastSyncAt?: string;
}

export interface HeartRateZones {
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
}
