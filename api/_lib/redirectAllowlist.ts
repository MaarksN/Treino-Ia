const DEFAULT_FALLBACK_PATH = '/dashboard';

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '').toLowerCase();
}

export function getAllowedRedirectOrigins(baseUrl?: string): Set<string> {
  const configured = (process.env.OAUTH_REDIRECT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  const origins = new Set(configured);

  if (baseUrl) {
    try {
      origins.add(new URL(baseUrl).origin.toLowerCase());
    } catch {
      // ignore invalid base url
    }
  }

  return origins;
}

export function normalizeRedirectTo(
  candidate: unknown,
  options: { baseUrl: string; fallbackPath?: string } 
): string {
  const fallbackPath = options.fallbackPath ?? DEFAULT_FALLBACK_PATH;
  const safeFallback = new URL(fallbackPath, options.baseUrl).toString();

  if (typeof candidate !== 'string' || !candidate.trim()) return safeFallback;

  const input = candidate.trim();
  if (/^(javascript|data):/i.test(input) || input.startsWith('//')) {
    return safeFallback;
  }

  if (input.startsWith('/')) {
    return new URL(input, options.baseUrl).toString();
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return safeFallback;
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    return safeFallback;
  }

  const allowedOrigins = getAllowedRedirectOrigins(options.baseUrl);
  if (!allowedOrigins.has(parsed.origin.toLowerCase())) {
    return safeFallback;
  }

  return parsed.toString();
}
