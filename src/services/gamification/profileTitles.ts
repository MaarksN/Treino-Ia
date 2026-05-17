export function getProfileTitle(workoutsCompleted: number, streakDays: number): string {
  if (workoutsCompleted >= 40 || streakDays >= 30) return 'Monstro do Volume';
  if (workoutsCompleted >= 20 || streakDays >= 14) return 'Guardião da Forja';
  if (workoutsCompleted >= 10 || streakDays >= 7) return 'Atleta Consistente';
  return 'Iniciante da Forja';
}
