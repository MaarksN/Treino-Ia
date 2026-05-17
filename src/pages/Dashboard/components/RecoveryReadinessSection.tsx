import { type ReactNode, useMemo, useState } from 'react';
import {
  Activity,
  BedDouble,
  Coffee,
  HeartPulse,
  Moon,
  Save,
  ShieldCheck,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { type WorkoutSession } from '../../../services/database';
import {
  buildSleepStrengthInsight,
  normalizeSleepHours,
  type SleepLogEntry,
} from '../../../services/recovery/sleepStrengthCorrelation';
import {
  buildRecoveryModeRecommendation,
  CAFFEINE_PRESETS,
  calculateAccumulatedRpeLoad,
  clampScale,
  createPainCheckin,
  getDateKey,
  normalizePainCheckin,
  PAIN_REGION_DEFINITIONS,
  summarizeCaffeine,
  summarizePainCheckin,
  type CaffeineEntry,
  type PainCheckin,
  type PainRegionKey,
  type PainRegionMap,
} from '../../../services/recovery/recoveryReadiness';

const PAIN_STORAGE_KEY = '@TreinoIA:recoveryReadiness:pain';
const CAFFEINE_STORAGE_KEY = '@TreinoIA:recoveryReadiness:caffeine';
const SLEEP_STORAGE_KEY = '@TreinoIA:recoveryReadiness:sleep';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readStorage<T>(key: string, fallback: T, normalize?: (value: unknown) => T): T {
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return normalize ? normalize(parsed) : parsed as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is best-effort and must never break the Dashboard.
  }
}

function createLocalId(prefix: string) {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}_${crypto.randomUUID()}`
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeCaffeineEntries(value: unknown): CaffeineEntry[] {
  if (!Array.isArray(value)) return [];

  return value.map(item => {
    const row = asRecord(item);
    const amountMg = Math.max(0, Math.round(Number(row.amountMg)));
    const date = typeof row.date === 'string' ? row.date : getDateKey();
    const consumedAt = typeof row.consumedAt === 'string' ? row.consumedAt.slice(0, 5) : '08:00';

    return {
      id: typeof row.id === 'string' ? row.id : createLocalId('caffeine'),
      date,
      consumedAt,
      label: typeof row.label === 'string' ? row.label.slice(0, 48) : 'Cafeina',
      amountMg,
      createdAt: Number.isFinite(row.createdAt) ? Number(row.createdAt) : Date.now(),
    };
  }).filter(entry => entry.amountMg > 0);
}

function normalizeSleepLogs(value: unknown): SleepLogEntry[] {
  if (!Array.isArray(value)) return [];

  return value.map(item => {
    const row = asRecord(item);
    return {
      date: typeof row.date === 'string' ? row.date : getDateKey(),
      sleepHours: normalizeSleepHours(row.sleepHours),
      updatedAt: Number.isFinite(row.updatedAt) ? Number(row.updatedAt) : Date.now(),
    };
  }).filter(entry => entry.sleepHours > 0);
}

function getStatusClass(status: 'clear' | 'low' | 'moderate' | 'high' | 'none' | 'light' | 'very_high') {
  if (status === 'high' || status === 'very_high') return 'border-red-400/50 bg-red-500/10 text-red-200';
  if (status === 'moderate') return 'border-yellow-300/50 bg-yellow-400/10 text-yellow-100';
  if (status === 'low' || status === 'light') return 'border-brand-neon/50 bg-brand-neon/10 text-brand-neon';
  return 'border-brand-light/20 bg-brand-light/5 text-brand-light/80';
}

function RecoveryCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5 shadow-brutal-light">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-[18px] border-2 border-brand-neon/40 bg-brand-neon/10 p-2 text-brand-neon">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">{eyebrow}</p>
          <h3 className="mt-1 font-display text-3xl uppercase leading-none text-brand-light">{title}</h3>
        </div>
      </div>
      {children}
    </article>
  );
}

export function RecoveryReadinessSection({ history }: { history: WorkoutSession[] }) {
  const today = getDateKey();
  const [painCheckin, setPainCheckin] = useState<PainCheckin>(() => {
    const stored = readStorage(PAIN_STORAGE_KEY, createPainCheckin(today), value => normalizePainCheckin(value as Partial<PainCheckin>));
    return stored.date === today ? stored : createPainCheckin(today);
  });
  const [painDraft, setPainDraft] = useState<PainRegionMap>(() => ({ ...painCheckin.regions }));
  const [painNotes, setPainNotes] = useState(() => painCheckin.notes);
  const [caffeineEntries, setCaffeineEntries] = useState<CaffeineEntry[]>(() => (
    readStorage(CAFFEINE_STORAGE_KEY, [], normalizeCaffeineEntries)
  ));
  const [sleepLogs, setSleepLogs] = useState<SleepLogEntry[]>(() => (
    readStorage(SLEEP_STORAGE_KEY, [], normalizeSleepLogs)
  ));
  const todaySleep = sleepLogs.find(log => log.date === today);
  const [sleepHoursInput, setSleepHoursInput] = useState(() => String(todaySleep?.sleepHours ?? 7));
  const [customCaffeineMg, setCustomCaffeineMg] = useState('100');
  const [savedFeedback, setSavedFeedback] = useState('');

  const sleepInsight = useMemo(
    () => buildSleepStrengthInsight(sleepLogs, history),
    [history, sleepLogs]
  );
  const painSummary = useMemo(() => summarizePainCheckin(painCheckin), [painCheckin]);
  const caffeineSummary = useMemo(
    () => summarizeCaffeine(caffeineEntries, today),
    [caffeineEntries, today]
  );
  const rpeLoad = useMemo(() => calculateAccumulatedRpeLoad(history), [history]);
  const recoveryMode = useMemo(() => (
    buildRecoveryModeRecommendation({ history, painCheckin, caffeineEntries })
  ), [caffeineEntries, history, painCheckin]);

  const todayCaffeineEntries = caffeineEntries.filter(entry => entry.date === today);

  const updatePainDraft = (region: PainRegionKey, value: number) => {
    setPainDraft(current => ({ ...current, [region]: clampScale(value) }));
  };

  const savePainCheckin = () => {
    const next = normalizePainCheckin({
      date: today,
      regions: painDraft,
      notes: painNotes,
      updatedAt: Date.now(),
    });
    setPainCheckin(next);
    writeStorage(PAIN_STORAGE_KEY, next);
    setSavedFeedback('Check-in de dor salvo localmente.');
  };

  const saveSleepLog = () => {
    const sleepHours = normalizeSleepHours(sleepHoursInput);
    if (sleepHours <= 0) {
      setSavedFeedback('Informe horas de sono maiores que zero.');
      return;
    }

    const next = [
      { date: today, sleepHours, updatedAt: Date.now() },
      ...sleepLogs.filter(log => log.date !== today),
    ].slice(0, 60);

    setSleepLogs(next);
    writeStorage(SLEEP_STORAGE_KEY, next);
    setSavedFeedback('Sono salvo localmente.');
  };

  const addCaffeine = (label: string, amountMg: number) => {
    const safeAmount = Math.max(0, Math.round(amountMg));
    if (!safeAmount) {
      setSavedFeedback('Informe uma dose de cafeina maior que zero.');
      return;
    }

    const now = new Date();
    const nextEntry: CaffeineEntry = {
      id: createLocalId('caffeine'),
      date: today,
      consumedAt: now.toTimeString().slice(0, 5),
      label,
      amountMg: safeAmount,
      createdAt: now.getTime(),
    };
    const next = [nextEntry, ...caffeineEntries].slice(0, 80);
    setCaffeineEntries(next);
    writeStorage(CAFFEINE_STORAGE_KEY, next);
    setSavedFeedback(`${label} registrado localmente.`);
  };

  const removeCaffeineEntry = (id: string) => {
    const next = caffeineEntries.filter(entry => entry.id !== id);
    setCaffeineEntries(next);
    writeStorage(CAFFEINE_STORAGE_KEY, next);
    setSavedFeedback('Registro de cafeina removido.');
  };

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
            Recovery & Readiness
          </p>
          <h2 className="mt-2 font-display text-5xl uppercase leading-none text-brand-light md:text-6xl">
            Recuperacao do dia
          </h2>
        </div>
        <div className="rounded-full border-2 border-brand-light/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-light/70">
          Dados locais do navegador
        </div>
      </div>

      {savedFeedback && (
        <p className="mb-5 rounded-[18px] border-2 border-brand-neon/40 bg-brand-neon/10 px-4 py-3 font-mono text-xs text-brand-light">
          {savedFeedback}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <RecoveryCard icon={<Moon className="h-5 w-5" />} eyebrow="Item 31" title="Sono x forca">
          <div className={`mb-4 rounded-[18px] border-2 px-4 py-3 font-mono text-xs ${sleepInsight.status === 'negative'
            ? 'border-yellow-300/50 bg-yellow-400/10 text-yellow-100'
            : sleepInsight.status === 'positive'
              ? 'border-brand-neon/50 bg-brand-neon/10 text-brand-neon'
              : 'border-brand-light/20 bg-brand-light/5 text-brand-light/80'
          }`}>
            <p className="font-bold uppercase tracking-widest">{sleepInsight.label}</p>
            <p className="mt-2 leading-5">{sleepInsight.message}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="font-mono text-xs text-brand-muted">
              Sono hoje
              <input
                type="number"
                min={0}
                max={14}
                step={0.5}
                value={sleepHoursInput}
                onChange={event => setSleepHoursInput(event.target.value)}
                className="mt-2 w-full rounded-[14px] border-2 border-brand-light/15 bg-brand-gray px-3 py-2 text-brand-light outline-none focus:border-brand-neon"
              />
            </label>
            <button
              type="button"
              onClick={saveSleepLog}
              className="self-end rounded-[14px] border-2 border-brand-neon bg-brand-neon px-4 py-2 text-brand-dark"
              aria-label="Salvar sono"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 font-mono text-xs text-brand-muted">
            Amostras pareadas: {sleepInsight.sampleCount} | correlacao: {sleepInsight.correlation.toFixed(2)}
          </p>
        </RecoveryCard>

        <RecoveryCard icon={<HeartPulse className="h-5 w-5" />} eyebrow="Item 32" title="Mapa de dor">
          <div className={`mb-4 rounded-[18px] border-2 px-4 py-3 font-mono text-xs ${getStatusClass(painSummary.status)}`}>
            <p className="font-bold uppercase tracking-widest">{painSummary.label}</p>
            <p className="mt-2 leading-5">{painSummary.message}</p>
          </div>
          <div className="space-y-3">
            {PAIN_REGION_DEFINITIONS.map(region => (
              <div key={region.key} className="grid grid-cols-[104px_1fr_34px] items-center gap-3">
                <span className="font-mono text-xs text-brand-muted">{region.label}</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={painDraft[region.key]}
                  onChange={event => updatePainDraft(region.key, Number(event.target.value))}
                  className="w-full accent-brand-magenta"
                />
                <span className="text-right font-mono text-xs font-bold text-brand-light">
                  {painDraft[region.key]}
                </span>
              </div>
            ))}
          </div>
          <textarea
            rows={2}
            value={painNotes}
            onChange={event => setPainNotes(event.target.value.slice(0, 240))}
            placeholder="Notas opcionais"
            className="mt-4 w-full resize-none rounded-[14px] border-2 border-brand-light/15 bg-brand-gray px-3 py-2 font-mono text-xs text-brand-light outline-none placeholder:text-brand-muted focus:border-brand-neon"
          />
          <button
            type="button"
            onClick={savePainCheckin}
            className="mt-3 inline-flex items-center gap-2 rounded-[14px] border-2 border-brand-neon bg-brand-neon px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-dark"
          >
            <Save className="h-4 w-4" />
            Salvar dor
          </button>
        </RecoveryCard>

        <RecoveryCard icon={<Coffee className="h-5 w-5" />} eyebrow="Item 36" title="Cafeina">
          <div className={`mb-4 rounded-[18px] border-2 px-4 py-3 font-mono text-xs ${getStatusClass(caffeineSummary.level === 'none' ? 'none' : caffeineSummary.level)}`}>
            <p className="font-bold uppercase tracking-widest">{caffeineSummary.label}</p>
            <p className="mt-2 leading-5">{caffeineSummary.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CAFFEINE_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addCaffeine(preset.label, preset.amountMg)}
                className="rounded-[14px] border-2 border-brand-light/15 bg-brand-gray px-3 py-2 text-left font-mono text-xs text-brand-light transition-colors hover:border-brand-neon"
              >
                <span className="block text-brand-neon">{preset.amountMg} mg</span>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              min={1}
              max={600}
              value={customCaffeineMg}
              onChange={event => setCustomCaffeineMg(event.target.value)}
              className="rounded-[14px] border-2 border-brand-light/15 bg-brand-gray px-3 py-2 font-mono text-xs text-brand-light outline-none focus:border-brand-neon"
              aria-label="Cafeina customizada em mg"
            />
            <button
              type="button"
              onClick={() => addCaffeine('Dose customizada', Number(customCaffeineMg))}
              className="rounded-[14px] border-2 border-brand-neon bg-brand-neon px-4 py-2 text-brand-dark"
              aria-label="Adicionar cafeina"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 font-mono text-xs text-brand-muted">
            Total hoje: <span className="text-brand-light">{caffeineSummary.totalMg} mg</span>
            {caffeineSummary.lateMg > 0 && (
              <span> | tarde: <span className="text-brand-light">{caffeineSummary.lateMg} mg</span></span>
            )}
          </div>
          {todayCaffeineEntries.length > 0 && (
            <div className="mt-3 space-y-2">
              {todayCaffeineEntries.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-center justify-between gap-2 rounded-[14px] border-2 border-brand-light/10 px-3 py-2 font-mono text-xs text-brand-light/80">
                  <span>{entry.consumedAt} | {entry.label} | {entry.amountMg} mg</span>
                  <button
                    type="button"
                    onClick={() => removeCaffeineEntry(entry.id)}
                    className="text-brand-muted hover:text-brand-magenta"
                    aria-label="Remover cafeina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </RecoveryCard>

        <RecoveryCard icon={<BedDouble className="h-5 w-5" />} eyebrow="Item 37" title="Day off">
          <div className={`mb-4 rounded-[18px] border-2 px-4 py-3 font-mono text-xs ${recoveryMode.mode === 'day_off'
            ? 'border-red-400/50 bg-red-500/10 text-red-200'
            : recoveryMode.mode === 'active_recovery' || recoveryMode.mode === 'adjusted_training'
              ? 'border-yellow-300/50 bg-yellow-400/10 text-yellow-100'
              : recoveryMode.mode === 'train'
                ? 'border-brand-neon/50 bg-brand-neon/10 text-brand-neon'
                : 'border-brand-light/20 bg-brand-light/5 text-brand-light/80'
          }`}>
            <p className="font-bold uppercase tracking-widest">{recoveryMode.label}</p>
            <p className="mt-2 leading-5">{recoveryMode.message}</p>
          </div>
          {recoveryMode.reasons.length > 0 ? (
            <ul className="space-y-2 font-mono text-xs text-brand-light/75">
              {recoveryMode.reasons.map(reason => (
                <li key={reason} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-neon" />
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs leading-5 text-brand-muted">
              O card usa apenas historico local, dor e cafeina registrados nesta secao.
            </p>
          )}
        </RecoveryCard>

        <RecoveryCard icon={<TrendingUp className="h-5 w-5" />} eyebrow="Item 39" title="RPE acumulado">
          <div className={`mb-4 rounded-[18px] border-2 px-4 py-3 font-mono text-xs ${getStatusClass(rpeLoad.level === 'very_high' ? 'very_high' : rpeLoad.level === 'none' ? 'none' : rpeLoad.level)}`}>
            <p className="font-bold uppercase tracking-widest">{rpeLoad.label}</p>
            <p className="mt-2 leading-5">{rpeLoad.message}</p>
          </div>
          <div className="mb-3 h-3 overflow-hidden rounded-full border border-brand-light/15 bg-brand-gray">
            <div
              className="h-full rounded-full bg-brand-neon"
              style={{ width: `${Math.min(100, Math.round((rpeLoad.totalLoad / 1800) * 100))}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="rounded-[14px] border-2 border-brand-light/10 px-3 py-2">
              <p className="text-brand-muted">Carga</p>
              <p className="text-brand-light">{rpeLoad.totalLoad}</p>
            </div>
            <div className="rounded-[14px] border-2 border-brand-light/10 px-3 py-2">
              <p className="text-brand-muted">Sessoes</p>
              <p className="text-brand-light">{rpeLoad.sessionCount}</p>
            </div>
            <div className="rounded-[14px] border-2 border-brand-light/10 px-3 py-2">
              <p className="text-brand-muted">RPE medio</p>
              <p className="text-brand-light">{rpeLoad.averageSessionRpe}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 font-mono text-xs text-brand-muted">
            <Activity className="h-4 w-4" />
            Janela: ultimos {rpeLoad.windowDays} dias
          </p>
        </RecoveryCard>
      </div>
    </section>
  );
}
