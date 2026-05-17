const CACHE_NAME = 'treino-app-shell-v1';
const DATA_CACHE_NAME = 'treino-app-data-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.map(key => {
            if (![CACHE_NAME, DATA_CACHE_NAME].includes(key)) {
              return caches.delete(key);
            }

            return null;
          }),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: 'APP_UPDATED' })),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.includes('/node_modules/.vite/')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener('push', event => {
  let data = {
    title: 'Treino App',
    body: 'Hora de evoluir no treino.',
    url: '/',
    type: 'DEFAULT',
  };

  try {
    data = event.data ? event.data.json() : data;
  } catch {
    data = {
      title: 'Treino App',
      body: event.data?.text() || 'Voce tem uma nova notificacao.',
      url: '/',
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      actions: data.type === 'HYDRATION_REMINDER'
        ? [
          { action: 'hydrate-250', title: '+250ml' },
          { action: 'hydrate-500', title: '+500ml' },
        ]
        : data.actions,
      data: {
        type: data.type || 'DEFAULT',
        url: data.url || '/',
      },
    }),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const quickHydration = getHydrationAmountFromAction(event.action);
  const url = quickHydration
    ? `/?view=nutrition&quickHydrationMl=${quickHydration}&source=notification`
    : event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        if (quickHydration && clientList.length) {
          clientList.forEach(client => {
            client.postMessage({ type: 'HYDRATION_QUICK_ADD', amountMl: quickHydration });
          });

          return undefined;
        }

        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        return clients.openWindow(url);
      }),
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'treino-app-sync') {
    event.waitUntil(notifyClients({ type: 'BACKGROUND_SYNC_REQUESTED' }));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DATA_CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);

    if (cached) return cached;

    return caches.match('/offline.html');
  }
}

function notifyClients(message) {
  return self.clients.matchAll({ includeUncontrolled: true })
    .then(clients => {
      clients.forEach(client => client.postMessage(message));
    });
}

function getHydrationAmountFromAction(action) {
  if (!action || !action.startsWith('hydrate-')) return null;

  const amount = Number(action.replace('hydrate-', ''));

  if (!Number.isFinite(amount) || amount < 50 || amount > 2000) return null;

  return amount;
}
