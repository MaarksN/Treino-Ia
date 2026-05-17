export function getOfflineMediaForExercise(exerciseName: string): string | null {
  const normalized = exerciseName.toLowerCase().trim();

  // Return SVG placeholder code matching certain keywords
  if (normalized.includes('supino') || normalized.includes('chest') || normalized.includes('peito')) {
    return '<svg viewBox="0 0 100 100" class="w-full h-full text-brand-neon"><rect x="10" y="45" width="80" height="10" rx="5" fill="currentColor"/><circle cx="20" cy="50" r="15" fill="currentColor" opacity="0.5"/><circle cx="80" cy="50" r="15" fill="currentColor" opacity="0.5"/></svg>';
  }

  if (normalized.includes('agachamento') || normalized.includes('squat') || normalized.includes('leg')) {
    return '<svg viewBox="0 0 100 100" class="w-full h-full text-brand-magenta"><path d="M50 20 L50 80 M30 80 L70 80 M30 20 L70 20 M20 40 L80 40 M20 60 L80 60" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>';
  }

  if (normalized.includes('remada') || normalized.includes('row') || normalized.includes('costas') || normalized.includes('pull')) {
    return '<svg viewBox="0 0 100 100" class="w-full h-full text-brand-light"><path d="M20 50 Q 50 20 80 50 T 80 50" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><circle cx="50" cy="50" r="10" fill="currentColor"/></svg>';
  }

  if (normalized.includes('desenvolvimento') || normalized.includes('press') || normalized.includes('ombro')) {
    return '<svg viewBox="0 0 100 100" class="w-full h-full text-brand-neon"><path d="M50 80 L50 20 M20 20 L80 20 M30 50 L70 50" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>';
  }

  // Generic placeholder for unknown exercises
  return '<svg viewBox="0 0 100 100" class="w-full h-full text-brand-muted"><rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="10 5"/><circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.3"/></svg>';
}
