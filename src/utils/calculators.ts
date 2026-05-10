export function estimateOneRepMax(weightKg: number, reps: number) {
  return Math.round(weightKg * (1 + reps / 30));
}

export function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function estimateVo2Max(distanceMeters: number, minutes: number) {
  const metersPerMinute = distanceMeters / Math.max(1, minutes);
  return Number((0.2 * metersPerMinute + 3.5).toFixed(1));
}

export function estimateHeartRateZones(age: number) {
  const maxHr = 220 - age;
  return {
    zone1: `${Math.round(maxHr * 0.5)}-${Math.round(maxHr * 0.6)} bpm`,
    zone2: `${Math.round(maxHr * 0.6)}-${Math.round(maxHr * 0.7)} bpm`,
    zone3: `${Math.round(maxHr * 0.7)}-${Math.round(maxHr * 0.8)} bpm`,
    zone4: `${Math.round(maxHr * 0.8)}-${Math.round(maxHr * 0.9)} bpm`,
    zone5: `${Math.round(maxHr * 0.9)}-${maxHr} bpm`,
  };
}
