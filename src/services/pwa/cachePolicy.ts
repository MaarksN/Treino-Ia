export type ServiceWorkerCacheStrategy = 'network-only' | 'network-first' | 'cache-first';

export interface CachePolicyRequest {
  url: string;
  method?: string;
  mode?: RequestMode;
  headers?: Headers | Record<string, string> | [string, string][];
}

function getHeader(headers: CachePolicyRequest['headers'], name: string): string | null {
  if (!headers) return null;

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (Array.isArray(headers)) {
    const match = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return match?.[1] ?? null;
  }

  const match = Object.entries(headers)
    .find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1] ?? null;
}

export function getServiceWorkerCacheStrategy(
  request: CachePolicyRequest,
  appOrigin: string,
): ServiceWorkerCacheStrategy {
  const method = request.method ?? 'GET';

  if (method.toUpperCase() !== 'GET') {
    return 'network-only';
  }

  if (getHeader(request.headers, 'authorization')) {
    return 'network-only';
  }

  const url = new URL(request.url, appOrigin);

  if (url.origin !== appOrigin) {
    return 'network-first';
  }

  if (url.pathname.startsWith('/api/')) {
    return 'network-only';
  }

  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.includes('/node_modules/.vite/')
  ) {
    return 'network-first';
  }

  if (request.mode === 'navigate') {
    return 'network-first';
  }

  return 'cache-first';
}
