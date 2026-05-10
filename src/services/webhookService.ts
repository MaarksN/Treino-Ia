export interface WebhookDelivery {
  url: string;
  event: string;
  payload: unknown;
  createdAt: string;
}

const WEBHOOK_KEY = '@TreinoApp:webhook-deliveries';

export function recordWebhookDelivery(delivery: Omit<WebhookDelivery, 'createdAt'>) {
  const next: WebhookDelivery = {
    ...delivery,
    createdAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem(WEBHOOK_KEY);
  const deliveries = raw ? JSON.parse(raw) as WebhookDelivery[] : [];
  localStorage.setItem(WEBHOOK_KEY, JSON.stringify([next, ...deliveries].slice(0, 50)));
  return next;
}

export function loadWebhookDeliveries(): WebhookDelivery[] {
  try {
    return JSON.parse(localStorage.getItem(WEBHOOK_KEY) || '[]') as WebhookDelivery[];
  } catch {
    return [];
  }
}
