import { memo, useEffect, useState } from 'react';
import { humanizedNotificationService, type HumanizedNotification } from '../../services/socialContent/humanizedNotificationService';
import { Bell, X } from 'lucide-react';

interface HumanizedNotificationCenterProps {
  streakCount?: number;
}

export const HumanizedNotificationCenter = memo(function HumanizedNotificationCenter({ streakCount = 0 }: HumanizedNotificationCenterProps) {
  const [notifications, setNotifications] = useState<HumanizedNotification[]>([]);

  useEffect(() => {
    // Local preview implementation without real push APIs
    setNotifications(humanizedNotificationService.getMockNotifications(streakCount));
  }, [streakCount]);

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-3">
      {notifications.map(notif => (
        <div key={notif.id} className="relative rounded-[20px] border-2 border-brand-neon bg-brand-neon/10 p-4 pl-12 font-mono text-sm text-brand-light shadow-brutal-neon">
          <Bell className="absolute left-4 top-4 h-5 w-5 text-brand-neon" />
          <p className="pr-6">{notif.message}</p>
          <p className="mt-1 text-[9px] text-brand-neon uppercase tracking-widest">(Preview Local - Modo Seguro)</p>
          <button
            type="button"
            onClick={() => dismiss(notif.id)}
            className="absolute right-4 top-4 text-brand-light/50 hover:text-brand-light transition-colors"
            title="Ignorar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
});
