import { StreakData, WorkoutHistoryEntry, WorkoutPlan } from '../types';

function cleanMarkdownCell(value: string | number | undefined): string {
  if (value === undefined || value === '') return '—';
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function csvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function generateWorkoutMarkdown(plan: WorkoutPlan): string {
  let md = `# ${plan.planName}\n\n`;
  md += `> Gerado em ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  md += `**Objetivo:** ${plan.goalDescription || '—'}\n`;
  md += `**Estrutura:** ${plan.days.length} dias de treino\n\n`;

  plan.days.forEach(day => {
    md += `## ${day.dayName} — ${day.focus}\n\n`;
    if (day.warmup) md += `**Aquecimento:** ${day.warmup}\n\n`;
    if (day.estimatedDuration) md += `**Duração estimada:** ${day.estimatedDuration}\n\n`;
    md += '| Exercício | Séries | Reps | Descanso | Observações |\n';
    md += '|-----------|--------|------|----------|-------------|\n';
    day.exercises.forEach(exercise => {
      md += `| ${cleanMarkdownCell(exercise.name)} | ${exercise.sets} | ${cleanMarkdownCell(exercise.reps)} | ${cleanMarkdownCell(exercise.rest)} | ${cleanMarkdownCell(exercise.notes || exercise.executionDetails)} |\n`;
    });
    if (day.cooldown) md += `\n**Cooldown:** ${day.cooldown}\n`;
    md += '\n';
  });

  return md;
}

export function generateHistoryCSV(history: WorkoutHistoryEntry[]): string {
  const header = ['Data', 'Plano', 'Foco', 'Exercícios', 'Concluídos', 'Volume (kg)', 'Duração (min)', 'Prontidão'].join(',');
  const rows = history.map(entry => [
    entry.date,
    entry.planName,
    entry.dayFocus,
    entry.exerciseCount,
    entry.completedCount,
    entry.totalVolume,
    entry.durationMinutes,
    entry.readinessScore,
  ].map(csvCell).join(','));

  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function generateJSONBackup(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}

export function importJSONBackup(json: string): Record<string, unknown> {
  return JSON.parse(json);
}

export function restoreFromBackup(backup: Record<string, unknown>) {
  Object.entries(backup).forEach(([key, value]) => {
    if (!key.startsWith('@TreinoApp:')) return;
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
}

export function buildAppBackup(
  plans: WorkoutPlan[],
  history: WorkoutHistoryEntry[],
  streak: StreakData
): Record<string, unknown> {
  return {
    '@TreinoApp:plans': plans,
    '@TreinoApp:workoutHistory': history,
    '@TreinoApp:streak': streak,
    '@TreinoApp:checkins': JSON.parse(localStorage.getItem('@TreinoApp:checkins') || '[]'),
    '@TreinoApp:prs': JSON.parse(localStorage.getItem('@TreinoApp:prs') || '[]'),
    '@TreinoApp:meals': JSON.parse(localStorage.getItem('@TreinoApp:meals') || '[]'),
    '@TreinoApp:badges': JSON.parse(localStorage.getItem('@TreinoApp:badges') || '[]'),
    '@TreinoApp:bodyMetrics': JSON.parse(localStorage.getItem('@TreinoApp:bodyMetrics') || '[]'),
    '@TreinoApp:settings': JSON.parse(localStorage.getItem('@TreinoApp:settings') || '{}'),
    '@TreinoApp:themeId': localStorage.getItem('@TreinoApp:themeId') || 'dark',
    exportedAt: new Date().toISOString(),
    version: '5.0',
  };
}
