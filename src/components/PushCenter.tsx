import React, { useMemo, useState } from 'react';
import { Bell, BellRing, Clock, Dumbbell, Flame, Moon } from 'lucide-react';
import { requestNotificationPermission, showLocalNotification } from '../utils/pwaUtils';

export interface PushPreferences {
  workoutReminder: boolean;
  streakReminder: boolean;
  recoveryReminder: boolean;
  weeklyReport: boolean;
  preferredHour: number;
}

const PUSH_PREFS_KEY = '@TreinoApp:pushPreferences';

function loadPushPreferences(): PushPreferences {
  try {
    return JSON.parse(localStorage.getItem(PUSH_PREFS_KEY) || '') as PushPreferences;
  } catch {
    return {
      workoutReminder: true,
      streakReminder: true,
      recoveryReminder: true,
      weeklyReport: true,
      preferredHour: 19,
    };
  }
}

function savePushPreferences(preferences: PushPreferences): void {
  localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(preferences));
}

export function PushCenter() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );

  const [preferences, setPreferences] = useState(loadPushPreferences);

  const enabledCount = useMemo(() => {
    return [
      preferences.workoutReminder,
      preferences.streakReminder,
      preferences.recoveryReminder,
      preferences.weeklyReport,
    ].filter(Boolean).length;
  }, [preferences]);

  const update = <K extends keyof PushPreferences>(key: K, value: PushPreferences[K]) => {
    const next = {
      ...preferences,
      [key]: value,
    };

    setPreferences(next);
    savePushPreferences(next);
  };

  const enable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const testNotification = async () => {
    await showLocalNotification('Treino App', {
      body: 'Voce treinou segunda e quarta. Hoje e um bom dia para manter a sequencia.',
      data: {
        url: '/?view=workout',
      },
    });
    setPermission('Notification' in window ? Notification.permission : 'denied');
  };

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
            Push Center
          </p>

          <h2 className="text-2xl font-black text-white mt-2">
            Preferencias de notificacao
          </h2>

          <p className="text-brand-muted mt-1">
            Configure lembretes inteligentes de treino, streak, recovery e relatorio semanal.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
          <BellRing className="text-brand-neon mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{enabledCount}</p>
          <p className="text-xs text-brand-muted">ativos</p>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark border border-white/10 p-4 mb-5">
        <p className="text-sm text-brand-muted">Permissao atual</p>
        <p className="text-xl font-black text-white">{permission}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={enable}
            className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2"
          >
            <Bell size={16} />
            Ativar push
          </button>

          <button
            type="button"
            onClick={testNotification}
            className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold"
          >
            Testar notificacao
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <PreferenceRow
          icon={<Dumbbell />}
          title="Lembrete de treino"
          description="Avisar quando chegar o horario preferido de treino."
          checked={preferences.workoutReminder}
          onChange={value => update('workoutReminder', value)}
        />

        <PreferenceRow
          icon={<Flame />}
          title="Lembrete de streak"
          description="Avisar quando o usuario estiver perto de perder sequencia."
          checked={preferences.streakReminder}
          onChange={value => update('streakReminder', value)}
        />

        <PreferenceRow
          icon={<Moon />}
          title="Recovery"
          description="Avisar sobre descanso, sono e recuperacao pos-treino."
          checked={preferences.recoveryReminder}
          onChange={value => update('recoveryReminder', value)}
        />

        <PreferenceRow
          icon={<BellRing />}
          title="Relatorio semanal"
          description="Avisar quando o relatorio semanal estiver pronto."
          checked={preferences.weeklyReport}
          onChange={value => update('weeklyReport', value)}
        />
      </div>

      <label className="block mt-5">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={16} className="text-brand-neon" />
          Horario preferido
        </span>

        <input
          type="range"
          min={5}
          max={23}
          value={preferences.preferredHour}
          onChange={event => update('preferredHour', Number(event.target.value))}
          className="w-full mt-3"
        />

        <p className="text-brand-neon text-sm mt-2">
          {String(preferences.preferredHour).padStart(2, '0')}:00
        </p>
      </label>
    </section>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-2xl bg-brand-dark border border-white/10 p-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="text-brand-neon mt-1">{icon}</div>

        <div>
          <p className="font-black text-white">{title}</p>
          <p className="text-sm text-brand-muted">{description}</p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full p-1 transition ${
          checked ? 'bg-brand-neon' : 'bg-white/10'
        }`}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-brand-dark transition ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
