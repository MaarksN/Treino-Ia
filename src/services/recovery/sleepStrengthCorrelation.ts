export interface SleepStrengthEntry {
  sleepHours: number;
  strengthScore: number;
}

export function calculateSleepStrengthCorrelation(entries: SleepStrengthEntry[]): number {
  if (entries.length < 3) return 0;
  const meanSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
  const meanStrength = entries.reduce((sum, e) => sum + e.strengthScore, 0) / entries.length;

  let numerator = 0;
  let sleepVariance = 0;
  let strengthVariance = 0;

  for (const entry of entries) {
    const sleepDiff = entry.sleepHours - meanSleep;
    const strengthDiff = entry.strengthScore - meanStrength;
    numerator += sleepDiff * strengthDiff;
    sleepVariance += sleepDiff ** 2;
    strengthVariance += strengthDiff ** 2;
  }

  const denominator = Math.sqrt(sleepVariance * strengthVariance);
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(3));
}
