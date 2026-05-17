export const DEFAULT_HYDRATION_COLOR_LEVEL = 3;
export const HYDRATION_CAMERA_GUARD_MESSAGE =
  'Erro de permissão: Acesso à câmera para hidratação está bloqueado (Item 89 Guard). O recurso de scanner automatizado não está disponível no momento por risco de privacidade. Faça o registro manual.';

export function getHydrationColorMessage(level: number): string {
  if (level <= 3) return 'Corrente amarela clara (ideal). Mantenha a hidratação.';
  if (level <= 5) return 'Corrente amarelada. Você precisa beber um pouco mais de água.';
  return 'Corrente escura (Alerta). Sinal de desidratação significativa. Beba água imediatamente.';
}
