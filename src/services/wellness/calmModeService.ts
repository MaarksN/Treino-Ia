export interface CalmModeState {
  isActive: boolean;
  step: 'breathe' | 'sit' | 'water' | 'reduce_intensity' | 'seek_help';
}

/**
 * Service to manage the "Calm Mode" state during workouts.
 *
 * SAFETY GUARD: This resource is for wellness support and does not replace medical or psychological care.
 * If you are at risk, seek immediate help.
 */
export function getInitialCalmModeState(): CalmModeState {
  return {
    isActive: false,
    step: 'breathe',
  };
}

export function activateCalmMode(): CalmModeState {
  return {
    isActive: true,
    step: 'breathe',
  };
}

export function deactivateCalmMode(): CalmModeState {
  return {
    isActive: false,
    step: 'breathe',
  };
}

export function advanceCalmModeStep(currentState: CalmModeState): CalmModeState {
  if (!currentState.isActive) return currentState;

  const steps: CalmModeState['step'][] = ['breathe', 'sit', 'water', 'reduce_intensity', 'seek_help'];
  const currentIndex = steps.indexOf(currentState.step);
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : currentState.step;

  return {
    ...currentState,
    step: nextStep,
  };
}
