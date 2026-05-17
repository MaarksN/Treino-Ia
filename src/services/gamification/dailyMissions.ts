const MISSION_POOL = [
  'Registrar água hoje',
  'Fazer 10 minutos de mobilidade',
  'Completar o treino planejado',
  'Registrar horas de sono',
  'Anotar percepção de energia',
];

export function getDailyMissions(seedDate: string, count = 3): string[] {
  const seed = seedDate.split('-').join('').split('').reduce((sum, char) => sum + Number(char), 0);
  const missions = [...MISSION_POOL].sort((a, b) => ((a.length + seed) % 7) - ((b.length + seed) % 7));
  return missions.slice(0, count);
}
