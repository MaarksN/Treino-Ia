import { redactSensitiveData } from './redact';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

interface CorsOptions {
  methods?: string;
  headers?: string;
}

const DEFAULT_CORS_METHODS = 'GET, POST, OPTIONS';
const DEFAULT_CORS_HEADERS = 'authorization, content-type, stripe-signature, x-csrf-token';

function splitOrigins(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function getApplicationOrigin(request?: Request): string | null {
  const configuredUrl = process.env.APP_URL;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Ignore invalid env values; request.url remains a safe same-origin fallback.
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      return null;
    }
  }

  return null;
}

function isLocalDevelopmentOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
      && (parsed.protocol === 'http:' || parsed.protocol === 'https:');
  } catch {
    return false;
  }
}

export function getAllowedApiOrigins(request?: Request): Set<string> {
  const origins = new Set<string>();

  const appOrigin = getApplicationOrigin(request);
  if (appOrigin) origins.add(appOrigin);

  splitOrigins(process.env.CORS_ALLOWED_ORIGINS).forEach(origin => origins.add(origin));
  splitOrigins(process.env.API_ALLOWED_ORIGINS).forEach(origin => origins.add(origin));
  splitOrigins(process.env.OAUTH_REDIRECT_ALLOWED_ORIGINS).forEach(origin => origins.add(origin));

  return origins;
}

export function resolveAllowedApiOrigin(request?: Request): string | null {
  const origin = request?.headers.get('origin')?.replace(/\/+$/, '');

  if (!origin) return getApplicationOrigin(request);
  if (getAllowedApiOrigins(request).has(origin)) return origin;
  if (isLocalDevelopmentOrigin(origin)) return origin;

  return null;
}

export function getTrustedRequestOrigin(request: Request): string {
  return resolveAllowedApiOrigin(request) ?? getApplicationOrigin(request) ?? new URL(request.url).origin;
}

function appendVary(headers: Headers, value: string) {
  const current = headers.get('vary');
  if (!current) {
    headers.set('vary', value);
    return;
  }

  const values = new Set(current.split(',').map(item => item.trim()).filter(Boolean));
  value.split(',').map(item => item.trim()).filter(Boolean).forEach(item => values.add(item));
  headers.set('vary', Array.from(values).join(', '));
}

export function applyCorsHeaders(
  response: Response,
  request?: Request,
  options: CorsOptions = {},
): Response {
  const origin = resolveAllowedApiOrigin(request);

  if (origin) {
    response.headers.set('access-control-allow-origin', origin);
  }

  response.headers.set('access-control-allow-methods', options.methods ?? DEFAULT_CORS_METHODS);
  response.headers.set('access-control-allow-headers', options.headers ?? DEFAULT_CORS_HEADERS);
  appendVary(response.headers, 'Origin, Authorization');

  return response;
}

export function json(
  body: unknown,
  status = 200,
  request?: Request,
  corsOptions?: CorsOptions,
) {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

  return applyCorsHeaders(response, request, corsOptions);
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new HttpError(500, `${name} is not configured`);
  }

  return value;
}

export function getBearerToken(request: Request): string {
  const header = request.headers.get('authorization');
  const match = header?.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new HttpError(401, 'Authorization bearer token is required');
  }

  return match[1];
}

interface ReadJsonObjectOptions {
  maxBytes?: number;
}

export async function readJsonObject(
  request: Request,
  options: ReadJsonObjectOptions = {},
): Promise<Record<string, unknown>> {
  let body: unknown;

  if (options.maxBytes) {
    const text = await request.text();
    const size = new TextEncoder().encode(text).byteLength;

    if (size > options.maxBytes) {
      throw new HttpError(413, 'Request body is too large');
    }

    try {
      body = JSON.parse(text || 'null');
    } catch {
      body = null;
    }
  } else {
    body = await request.json().catch(() => null);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  return body as Record<string, unknown>;
}

export function handleApiError(error: unknown, request?: Request) {
  if (error instanceof HttpError) {
    if (error.status === 500) {
      const requestId = crypto.randomUUID();
      console.error('API HttpError', {
        requestId,
        error: redactSensitiveData({
          name: error.name,
          message: error.message,
          stack: error.stack,
        }),
      });
      return json({ error: 'Internal server error', requestId }, 500, request);
    }

    return json({ error: error.message }, error.status, request);
  }

  const requestId = crypto.randomUUID();
  console.error('API unexpected error', {
    requestId,
    error: redactSensitiveData(error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error),
  });

  return json({ error: 'Internal server error', requestId }, 500, request);
}
