import { DailyCheckin, ReadinessScore } from '../types';

const CHECKIN_KEY = '@TreinoApp:checkins';

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function calculateReadiness(checkin: DailyCheckin): ReadinessScore {
  const sleepScore = Math.min(checkin.sleepHours / 8, 1) * 35 + (checkin.sleepQuality / 5) * 10;
  const energyScore = (checkin.energyLevel / 10) * 25;
  const stressScore = ((10 - checkin.stressLevel) / 10) * 20;

  const sorenessValues = Object.values(checkin.sorenessMap);
  const avgSoreness = sorenessValues.length
    ? sorenessValues.reduce((sum, value) => sum + value, 0) / sorenessValues.length
    : 0;
  const sorenessScore = ((10 - avgSoreness) / 10) * 10;

  const total = Math.max(0, Math.min(100, Math.round(sleepScore + energyScore + stressScore + sorenessScore)));

  if (total >= 80) {
    return { score: total, label: 'Excelente', color: '#a3e635', recommendation: 'Treino completo', adjustedIntensity: 100 };
  }

  if (total >= 65) {
    return { score: total, label: 'Boa', color: '#84cc16', recommendation: 'Treino completo', adjustedIntensity: 90 };
  }

  if (total >= 50) {
    return { score: total, label: 'Moderada', color: '#f59e0b', recommendation: 'Treino moderado', adjustedIntensity: 75 };
  }

  if (total >= 35) {
    return { score: total, label: 'Baixa', color: '#fb923c', recommendation: 'Treino leve', adjustedIntensity: 50 };
  }

  return { score: total, label: 'Ruim', color: '#ef4444', recommendation: 'Descanso', adjustedIntensity: 20 };
}

export function getOvertrainingRisk(checkins: DailyCheckin[]): 'baixo' | 'médio' | 'alto' {
  const recent = checkins.slice(-7);
  if (recent.length < 3) return 'baixo';

  const avgEnergy = recent.reduce((sum, checkin) => sum + checkin.energyLevel, 0) / recent.length;
  const avgStress = recent.reduce((sum, checkin) => sum + checkin.stressLevel, 0) / recent.length;
  const avgSleep = recent.reduce((sum, checkin) => sum + checkin.sleepHours, 0) / recent.length;
  const highSoreness = recent.filter(checkin =>
    Object.values(checkin.sorenessMap).some(value => value >= 7)
  ).length;

  if (avgEnergy < 4 && avgStress > 7 && highSoreness >= 3) return 'alto';
  if (avgEnergy < 5.5 || avgSleep < 6 || highSoreness >= 2) return 'médio';
  return 'baixo';
}

export function checkSleepGoal(checkin: DailyCheckin): boolean {
  return checkin.sleepHours >= checkin.sleepGoalHours;
}

export function checkHydrationGoal(checkin: DailyCheckin, goalGlasses = 8): boolean {
  return checkin.hydrationGlasses >= goalGlasses;
}

export function loadCheckins(): DailyCheckin[] {
  return safeRead<DailyCheckin[]>(CHECKIN_KEY, []);
}

export function saveCheckin(checkin: DailyCheckin) {
  const all = loadCheckins();
  const index = all.findIndex(item => item.date === checkin.date);

  if (index >= 0) all[index] = checkin;
  else all.push(checkin);

  localStorage.setItem(CHECKIN_KEY, JSON.stringify(all));
}

export function getTodayCheckin(): DailyCheckin | null {
  const today = new Date().toISOString().slice(0, 10);
  return loadCheckins().find(checkin => checkin.date === today) || null;
}
