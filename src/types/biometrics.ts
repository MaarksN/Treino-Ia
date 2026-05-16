export type BiometricDataMode = 'supabase' | 'mock_dev_only';

export interface BiometricPersistenceMeta {
  dataMode: BiometricDataMode;
  reason?: string;
  syncedAt: string;
}

export interface BiometricQueryResult<T> {
  data: T;
  meta: BiometricPersistenceMeta;
}

export interface BiometricSnapshot {
  wearableSessions: WearableSession[];
  hydrationEntries: HydrationEntry[];
  hydrationGoal: HydrationGoal;
  sleepEntries: SleepEntry[];
  cycleEntries: CycleEntry[];
  poseAnalyses: PoseAnalysis[];
}

export interface HeartRateReading {
  bpm: number;
  timestamp: number;
}

export interface WearableSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  avgHR: number;
  maxHR: number;
  minHR: number;
  readings: HeartRateReading[];
  deviceName: string;
  calories?: number;
  hrZones: HRZones;
}

export interface HRZones {
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

// Pose detection

export interface PoseAnalysis {
  id: string;
  exerciseName: string;
  date: string;
  repCount: number;
  formScore: number;
  issues: string[];
  tips: string[];
  keyAngles: Record<string, number>;
  thumbnail?: string;
}

// Ciclo hormonal

export type MenstrualPhase = 'menstrual' | 'folicular' | 'ovulação' | 'lútea';

export interface CycleEntry {
  id: string;
  startDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
}

export interface CycleDay {
  date: string;
  phase: MenstrualPhase;
  dayOfCycle: number;
  energyExpected: 'baixa' | 'moderada' | 'alta' | 'máxima';
  trainingRecommendation: string;
  nutritionTip: string;
}

// Hidratacao

export interface HydrationEntry {
  id: string;
  date: string;
  time: string;
  amountMl: number;
  type: 'água' | 'isotônico' | 'whey' | 'café' | 'outro';
}

export interface HydrationGoal {
  dailyMl: number;
  remindEveryMinutes: number;
}

// Sono

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  deepSleepPct?: number;
  remSleepPct?: number;
}

// Social real & comunidade
