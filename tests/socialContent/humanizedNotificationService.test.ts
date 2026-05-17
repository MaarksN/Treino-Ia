import { describe, it, expect } from 'vitest';
import { humanizedNotificationService } from '../../src/pages/Dashboard/services/socialContent/humanizedNotificationService';

describe('humanizedNotificationService', () => {
  it('returns reminder notification for low streak', () => {
    const notifs = humanizedNotificationService.getMockNotifications(2);
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe('reminder');
  });

  it('returns achievement and reminder for high streak', () => {
    const notifs = humanizedNotificationService.getMockNotifications(5);
    expect(notifs).toHaveLength(2);
    expect(notifs.some((n: any) => n.type === 'achievement')).toBe(true);
    expect(notifs.some((n: any) => n.type === 'reminder')).toBe(true);
  });
});
