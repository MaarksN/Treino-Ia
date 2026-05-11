import React, { useState } from 'react';
import {
  Database,
  Eye,
  Globe,
  Palette,
  Scale,
  Settings,
  Timer,
  Trophy,
  User,
  Vibrate,
  Volume2,
} from 'lucide-react';
import { AppSettings, StreakData, WorkoutHistoryEntry, WorkoutPlan } from '../types';
import { ExportPanel } from './ExportPanel';
import { ThemeSelector } from './ThemeSelector';

const SETTINGS_KEY = '@TreinoApp:settings';

const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'dark',
  language: 'pt-BR',
  weightUnit: 'kg',
  voiceEnabled: false,
  hapticEnabled: true,
  defaultRestSeconds: 90,
  autoStartTimer: true,
  showRPE: true,
  showPRBadge: true,
  publicProfile: false,
  username: '',
};

function loadSettings(): AppSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getStorageSizeKb() {
  let total = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    total += key.length + (localStorage.getItem(key)?.length || 0);
  }
  return (total / 1024).toFixed(1);
}

interface Props {
  plans: WorkoutPlan[];
  history: WorkoutHistoryEntry[];
  streak: StreakData;
  isPremium?: boolean;
  onSettingsChange?: (settings: AppSettings) => void;
}

type SettingsTab = 'geral' | 'treino' | 'visual' | 'dados' | 'perfil';

const toggleClass = (on: boolean) =>
  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${on ? 'bg-brand-neon' : 'bg-white/20'}`;

const thumbClass = (on: boolean) =>
  `inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`;

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className={toggleClass(on)} aria-pressed={on}>
      <span className={thumbClass(on)} />
    </button>
  );
}

export function SettingsPanel({ plans, history, streak, isPremium = false, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [tab, setTab] = useState<SettingsTab>('geral');

  const update = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'geral', label: 'Geral', icon: <Settings size={16} /> },
    { id: 'treino', label: 'Treino', icon: <Timer size={16} /> },
    { id: 'visual', label: 'Visual', icon: <Palette size={16} /> },
    { id: 'dados', label: 'Dados', icon: <Database size={16} /> },
    { id: 'perfil', label: 'Perfil', icon: <User size={16} /> },
  ];

  const SettingRow = ({ icon, label, description, children }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-brand-muted shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">{label}</p>
          {description && <p className="text-brand-muted text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <h3 className="text-white font-bold text-lg mb-4">Configurações</h3>

      <div className="flex gap-1 bg-brand-dark rounded-xl p-1 mb-5 overflow-x-auto">
        {tabs.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all min-w-[46px] ${
              tab === item.id ? 'bg-brand-surface text-white shadow' : 'text-brand-muted hover:text-white'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div>
          <SettingRow icon={<Volume2 size={16} />} label="Guia por voz" description="Anuncia exercícios e timers">
            <Toggle on={settings.voiceEnabled} onChange={value => update({ voiceEnabled: value })} />
          </SettingRow>
          <SettingRow icon={<Vibrate size={16} />} label="Vibração háptica" description="Feedback tátil em ações">
            <Toggle on={settings.hapticEnabled} onChange={value => update({ hapticEnabled: value })} />
          </SettingRow>
          <SettingRow icon={<Scale size={16} />} label="Unidade de peso">
            <select
              value={settings.weightUnit}
              onChange={event => update({ weightUnit: event.target.value as 'kg' | 'lb' })}
              className="bg-brand-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </SettingRow>
        </div>
      )}

      {tab === 'treino' && (
        <div>
          <SettingRow icon={<Timer size={16} />} label="Descanso padrão (seg)" description="Tempo inicial do timer">
            <select
              value={settings.defaultRestSeconds}
              onChange={event => update({ defaultRestSeconds: Number(event.target.value) })}
              className="bg-brand-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            >
              {[30, 45, 60, 90, 120, 150, 180, 240, 300].map(value => (
                <option key={value} value={value}>{value}s</option>
              ))}
            </select>
          </SettingRow>
          <SettingRow icon={<Timer size={16} />} label="Auto-iniciar timer" description="Dispara ao concluir série">
            <Toggle on={settings.autoStartTimer} onChange={value => update({ autoStartTimer: value })} />
          </SettingRow>
          <SettingRow icon={<Eye size={16} />} label="Mostrar RPE" description="Campo de esforço percebido">
            <Toggle on={settings.showRPE} onChange={value => update({ showRPE: value })} />
          </SettingRow>
          <SettingRow icon={<Trophy size={16} />} label="Badge de PR" description="Destaque ao bater recorde">
            <Toggle on={settings.showPRBadge} onChange={value => update({ showPRBadge: value })} />
          </SettingRow>
        </div>
      )}

      {tab === 'visual' && (
        <ThemeSelector isPremium={isPremium} onThemeChange={themeId => update({ themeId })} />
      )}

      {tab === 'dados' && (
        <ExportPanel plans={plans} history={history} streak={streak} isPremium={isPremium} />
      )}

      {tab === 'perfil' && (
        <div>
          <SettingRow icon={<User size={16} />} label="Nome de usuário">
            <input
              value={settings.username}
              onChange={event => update({ username: event.target.value })}
              placeholder="@seuapelido"
              className="bg-brand-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-36 text-right"
            />
          </SettingRow>
          <SettingRow icon={<Globe size={16} />} label="Perfil público" description="Permite compartilhar conquistas">
            <Toggle on={settings.publicProfile} onChange={value => update({ publicProfile: value })} />
          </SettingRow>

          <div className="mt-5 p-4 bg-brand-dark rounded-xl border border-white/10">
            <p className="text-xs text-brand-muted uppercase tracking-widest mb-3">Estatísticas da conta</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-brand-muted text-xs">Treinos</p>
                <p className="text-white font-bold tabular-nums">{history.length}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Streak máx.</p>
                <p className="text-white font-bold tabular-nums">{streak.longestStreak} dias</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Planos criados</p>
                <p className="text-white font-bold tabular-nums">{plans.length}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Dados salvos</p>
                <p className="text-white font-bold tabular-nums">{getStorageSizeKb()}kb</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza? Todos os dados serão apagados.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full mt-4 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all"
          >
            Resetar todos os dados
          </button>
        </div>
      )}
    </div>
  );
}
