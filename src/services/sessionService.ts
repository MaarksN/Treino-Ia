import { ActiveSessionRecord } from '../types/security';

export function getActiveSessions(): ActiveSessionRecord[] {
  return [
    {
      id: 'current',
      device: 'Navegador atual',
      location: 'Local',
      lastSeenAt: new Date().toISOString(),
      current: true,
    },
    {
      id: 'mobile-demo',
      device: 'PWA Mobile',
      location: 'Demo',
      lastSeenAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      current: false,
    },
  ];
}
