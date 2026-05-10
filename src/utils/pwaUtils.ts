export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'APP_UPDATED') {
      window.dispatchEvent(new CustomEvent('app:update-available'));
    }

    if (event.data?.type === 'BACKGROUND_SYNC_REQUESTED') {
      window.dispatchEvent(new CustomEvent('app:background-sync'));
    }
  });

  return registration;
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  return Notification.requestPermission();
}

export async function showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options,
    });
    return;
  }

  new Notification(title, {
    icon: '/icons/icon-192.png',
    ...options,
  });
}

export async function registerBackgroundSync(tag = 'treino-app-sync'): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const syncManager = (registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> };
  }).sync;

  if (!syncManager) {
    return false;
  }

  await syncManager.register(tag);
  return true;
}

export function listenForAppUpdate(callback: () => void): () => void {
  const handler = () => callback();

  window.addEventListener('app:update-available', handler);

  return () => {
    window.removeEventListener('app:update-available', handler);
  };
}

export function reloadForUpdate(): void {
  window.location.reload();
}
