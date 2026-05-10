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

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  return body as Record<string, unknown>;
}

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return json({ error: error.message }, error.status);
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  return json({ error: message }, 500);
}

