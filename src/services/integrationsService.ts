import { IntegrationConnection } from '../types/integrations';
import { estimateHeartRateZones } from '../utils/calculators';

export const INTEGRATION_CONNECTIONS: IntegrationConnection[] = [
  { provider: 'apple_health', label: 'Apple Health', status: 'needs_config', premium: true },
  { provider: 'google_fit', label: 'Google Fit / Health Connect', status: 'needs_config', premium: true },
  { provider: 'garmin', label: 'Garmin CSV/GPX', status: 'available', premium: false },
  { provider: 'fitbit', label: 'Fitbit OAuth2', status: 'needs_config', premium: true },
  { provider: 'ble_hr', label: 'Monitor cardiaco BLE', status: 'available', premium: false },
  { provider: 'strava', label: 'Strava export', status: 'needs_config', premium: true },
  { provider: 'calendar', label: 'Google Calendar', status: 'available', premium: false },
  { provider: 'webhook', label: 'Webhook n8n/Zapier', status: 'available', premium: false },
  { provider: 'notion', label: 'Notion', status: 'needs_config', premium: true },
  { provider: 'whatsapp', label: 'WhatsApp Business', status: 'needs_config', premium: true },
  { provider: 'supabase', label: 'Supabase sync', status: 'available', premium: false },
];

export function getHeartRateZoneRows(age: number) {
  const zones = estimateHeartRateZones(age);
  return Object.entries(zones).map(([zone, range], index) => ({
    zone: zone.toUpperCase(),
    range,
    label: ['Recuperacao', 'Base aerobica', 'Tempo', 'Limiar', 'Maximo'][index],
  }));
}

export function buildPlanQrPayload(planId: string, userName: string) {
  return JSON.stringify({
    type: 'treino-plan',
    planId,
    userName,
    generatedAt: new Date().toISOString(),
  });
}
