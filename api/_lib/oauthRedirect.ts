export function getAllowedRedirectOrigins(baseUrl: string): string[] {
  const configured = (process.env.OAUTH_REDIRECT_ALLOWLIST || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  return Array.from(new Set([baseUrl, ...configured]));
}

export function sanitizeRedirectTarget(raw: unknown, baseUrl: string): string {
  if (typeof raw !== 'string' || !raw.trim()) return `${baseUrl}/`;

  const candidate = raw.trim();
  if (/\s/.test(candidate)) return `${baseUrl}/`;
  if (candidate.includes('://') && !/^https?:\/\//i.test(candidate)) return `${baseUrl}/`;

  try {
    const target = new URL(candidate, `${baseUrl}/`);
    const allowedOrigins = getAllowedRedirectOrigins(baseUrl);

    if (!allowedOrigins.includes(target.origin)) {
      return `${baseUrl}/`;
    }

    if (!['http:', 'https:'].includes(target.protocol)) {
      return `${baseUrl}/`;
    }

    return target.toString();
  } catch {
    return `${baseUrl}/`;
  }
}
