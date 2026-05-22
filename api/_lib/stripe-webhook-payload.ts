import Stripe from 'stripe';

export interface MinimizedStripeWebhookObject {
  id?: string;
  object?: string;
  customer?: string | null;
  subscription?: string | null;
  status?: string | null;
  priceId?: string | null;
  productId?: string | null;
  amount?: number | null;
  currency?: string | null;
}

export interface MinimizedStripeWebhookPayload {
  id: string;
  type: string;
  apiVersion?: string | null;
  created?: number | null;
  livemode: boolean;
  pendingWebhooks?: number | null;
  requestId?: string | null;
  object: MinimizedStripeWebhookObject;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getStripeId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (isRecord(value)) return getString(value.id);
  return null;
}

function getRequestId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (isRecord(value)) return getString(value.id);
  return null;
}

function getAmount(object: JsonRecord): number | null {
  return getNumber(object.amount_total) ??
    getNumber(object.amount_paid) ??
    getNumber(object.amount_due) ??
    getNumber(object.amount);
}

function getPriceRecord(value: unknown): JsonRecord | null {
  if (!isRecord(value)) return null;

  const directPrice = isRecord(value.price) ? value.price : null;
  if (directPrice) return directPrice;

  const directPlan = isRecord(value.plan) ? value.plan : null;
  if (directPlan) return directPlan;

  return null;
}

function getFirstExpandedPrice(object: JsonRecord): JsonRecord | null {
  const directPrice = getPriceRecord(object.price) ?? getPriceRecord(object);
  if (directPrice) return directPrice;

  const items = isRecord(object.items) ? object.items : null;
  const itemData = Array.isArray(items?.data) ? items.data : [];
  const firstItemPrice = getPriceRecord(itemData.find(isRecord));
  if (firstItemPrice) return firstItemPrice;

  const lines = isRecord(object.lines) ? object.lines : null;
  const lineData = Array.isArray(lines?.data) ? lines.data : [];
  return getPriceRecord(lineData.find(isRecord));
}

function buildMinimizedObject(value: unknown): MinimizedStripeWebhookObject {
  const object = isRecord(value) ? value : {};
  const price = getFirstExpandedPrice(object);
  const minimized: MinimizedStripeWebhookObject = {};
  const id = getString(object.id);
  const objectType = getString(object.object);
  const customer = getStripeId(object.customer);
  const subscription = getStripeId(object.subscription);
  const status = getString(object.status) ?? getString(object.payment_status);
  const priceId = getStripeId(price);
  const productId = price ? getStripeId(price.product) : null;
  const amount = getAmount(object);
  const currency = getString(object.currency);

  if (id) minimized.id = id;
  if (objectType) minimized.object = objectType;
  if ('customer' in object) minimized.customer = customer;
  if ('subscription' in object) minimized.subscription = subscription;
  if (status) minimized.status = status;
  if (priceId) minimized.priceId = priceId;
  if (productId) minimized.productId = productId;
  if (amount !== null) minimized.amount = amount;
  if (currency) minimized.currency = currency;

  return minimized;
}

export function minimizeStripeWebhookPayload(event: Stripe.Event): MinimizedStripeWebhookPayload {
  const apiVersion = getString((event as Stripe.Event & { api_version?: unknown }).api_version);
  const pendingWebhooks = getNumber((event as Stripe.Event & { pending_webhooks?: unknown }).pending_webhooks);
  const requestId = getRequestId((event as Stripe.Event & { request?: unknown }).request);

  const minimized: MinimizedStripeWebhookPayload = {
    id: event.id,
    type: event.type,
    created: getNumber(event.created),
    livemode: Boolean(event.livemode),
    object: buildMinimizedObject(event.data?.object),
  };

  if (apiVersion) minimized.apiVersion = apiVersion;
  if (pendingWebhooks !== null) minimized.pendingWebhooks = pendingWebhooks;
  if (requestId) minimized.requestId = requestId;

  return minimized;
}
