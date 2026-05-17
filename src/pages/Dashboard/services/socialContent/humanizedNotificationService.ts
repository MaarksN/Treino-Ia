export interface HumanizedNotification {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'achievement';
}

class HumanizedNotificationService {
  public getMockNotifications(streakCount: number): HumanizedNotification[] {
    const list: HumanizedNotification[] = [];

    if (streakCount > 3) {
      list.push({
        id: '1',
        message: 'Incrível! Você já treinou mais de 3 vezes nesta semana. Seu corpo já está agradecendo. Continue assim! 🔥',
        type: 'achievement'
      });
    }

    list.push({
      id: '2',
      message: 'Não se esqueça: o descanso também faz parte do treino. Como você está se sentindo hoje? 💤',
      type: 'reminder'
    });

    return list;
  }
}

export const humanizedNotificationService = new HumanizedNotificationService();
