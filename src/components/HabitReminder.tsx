import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { ReminderConfig } from '../types';

const REMINDER_KEY = '@TreinoApp:reminder';
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function loadReminder(): ReminderConfig {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || JSON.stringify({
      enabled: false,
      days: [1, 3, 5],
      time: '07:00',
      message: 'Hora de treinar. Seu treino de hoje está esperando.',
      reactivationDays: 3,
    }));
  } catch {
    return {
      enabled: false,
      days: [1, 3, 5],
      time: '07:00',
      message: 'Hora de treinar. Seu treino de hoje está esperando.',
      reactivationDays: 3,
    };
  }
}

function saveReminder(config: ReminderConfig) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(config));
}

export function HabitReminder() {
  const [config, setConfig] = useState<ReminderConfig>(() => loadReminder());
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | 'idle'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'idle'
  );

  const update = (partial: Partial<ReminderConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    saveReminder(updated);
  };

  const toggleDay = (day: number) => {
    const days = config.days.includes(day)
      ? config.days.filter(item => item !== day)
      : [...config.days, day].sort();
    update({ days });
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotifStatus(permission);
    update({ enabled: permission === 'granted' });

    if (permission === 'granted') {
      new Notification('Treino App', {
        body: config.message,
        icon: '/favicon.ico',
      });
    }
  };

  const sendTestNotification = () => {
    if (notifStatus !== 'granted') return;
    new Notification('Treino App', { body: config.message });
  };

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Lembretes</h3>
        {config.enabled ? <Bell size={20} className="text-brand-neon" /> : <BellOff size={20} className="text-brand-muted" />}
      </div>

      {notifStatus !== 'granted' && (
        <button onClick={requestPermission} type="button" className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest mb-4">
          Ativar notificações
        </button>
      )}

      {notifStatus === 'denied' && <p className="text-red-400 text-sm mb-4">Notificações bloqueadas no navegador.</p>}

      <div className="mb-4">
        <p className="text-sm text-brand-muted mb-2">Dias para lembrete</p>
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(index)}
              className={`py-2 text-xs font-bold border-2 transition-colors ${
                config.days.includes(index)
                  ? 'bg-brand-neon text-brand-dark border-brand-neon'
                  : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm text-brand-muted mb-4">
        Horário
        <input
          type="time"
          value={config.time}
          onChange={event => update({ time: event.target.value })}
          className="mt-2 w-full bg-brand-dark border-2 border-brand-light/10 px-4 py-2 text-brand-light outline-none focus:border-brand-neon"
        />
      </label>

      <label className="block text-sm text-brand-muted mb-4">
        Mensagem personalizada
        <input
          value={config.message}
          onChange={event => update({ message: event.target.value })}
          className="mt-2 w-full bg-brand-dark border-2 border-brand-light/10 px-4 py-2 text-brand-light text-sm outline-none focus:border-brand-neon"
        />
      </label>

      <label className="block text-sm text-brand-muted mb-4">
        Alerta de inatividade
        <select
          value={config.reactivationDays}
          onChange={event => update({ reactivationDays: Number(event.target.value) })}
          className="mt-2 w-full bg-brand-dark border-2 border-brand-light/10 px-4 py-2 text-brand-light outline-none focus:border-brand-neon"
        >
          {[2, 3, 4, 5, 7, 10, 14].map(days => (
            <option key={days} value={days}>{days} dias sem treinar</option>
          ))}
        </select>
      </label>

      {notifStatus === 'granted' && (
        <button onClick={sendTestNotification} type="button" className="w-full bg-brand-dark border-2 border-brand-light/10 text-brand-light py-2 text-sm hover:border-brand-neon transition-colors">
          Enviar notificação de teste
        </button>
      )}
    </div>
  );
}
