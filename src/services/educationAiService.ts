export function buildExerciseTip(exerciseName: string, level: string) {
  return `Para ${exerciseName}, nivel ${level}: controle a fase excentrica, mantenha amplitude sem dor e progrida carga apenas com tecnica estavel.`;
}

export function buildWarmupProtocol(muscle: string) {
  return [
    '5 min de cardio leve',
    `2 series leves do primeiro exercicio para ${muscle}`,
    '1 serie de aproximacao com 60-70% da carga alvo',
  ];
}

export function buildCooldownProtocol() {
  return ['Respiracao nasal por 2 min', 'Alongamento leve dos grupos treinados', 'Caminhada curta para baixar FC'];
}
