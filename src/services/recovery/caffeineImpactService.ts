export interface CaffeineEntry {
  source: string;
  mg: number;
  time: string;
}

export function estimateCaffeineWindow(mg: number): string {
  if (mg >= 300) return 'Impacto alto: evite consumir próximo ao sono.';
  if (mg >= 150) return 'Impacto moderado: prefira até 8h antes de dormir.';
  return 'Impacto leve: mantenha atenção ao horário de sono.';
}

export function isNearBedtime(caffeineTime: string, bedtimeHour = 22): boolean {
  const [hour] = caffeineTime.split(':').map(Number);
  return hour >= bedtimeHour - 8;
}
