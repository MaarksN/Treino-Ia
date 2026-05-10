const CSRF_KEY = '@TreinoApp:csrf-token';

export function getCsrfToken() {
  if (typeof window === 'undefined') return 'server-token';

  const existing = localStorage.getItem(CSRF_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  localStorage.setItem(CSRF_KEY, token);
  return token;
}

export function verifyCsrfToken(token: string) {
  return token === getCsrfToken();
}
