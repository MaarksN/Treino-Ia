export interface LongevityProjectionState {
  hasConsistencyIndicator: boolean;
  canShowFitnessAge: boolean;
  status: 'consistency_only' | 'deferred_high_risk' | 'foundation_created';
}

/**
 * Item 60 - Projeção de longevidade
 * Avoids claims. Creates consistency indicator/fitness age only if safe and well-labeled.
 */
export function checkLongevityProjectionGuard(consistencyScore: number): LongevityProjectionState {
  const isConsistent = consistencyScore > 80;

  return {
    hasConsistencyIndicator: isConsistent,
    canShowFitnessAge: false, // Too risky right now to show a calculated "age"
    status: 'foundation_created'
  };
}
