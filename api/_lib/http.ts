import { redactSensitiveData } from './redact';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      vary: 'Authorization',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type, stripe-signature',
    },
  });
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

export function handleApiError(error: unknown) {
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
      return json({ error: 'Internal server error', requestId }, 500);
    }

    return json({ error: error.message }, error.status);
  }

  const requestId = crypto.randomUUID();
  console.error('API unexpected error', {
    requestId,
    error: redactSensitiveData(error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error),
  });

  return json({ error: 'Internal server error', requestId }, 500);
}
