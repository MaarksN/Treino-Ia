import { useState, useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';
import type { ProgressionSuggestion } from '../rules/progressionRules';

export function useApplyProgressionSuggestion(
  suggestion: ProgressionSuggestion | null,
  onApplyLoad: (newLoad: number) => void,
) {
  const { track } = useAnalytics();
  const [isDismissed, setIsDismissed] = useState(false);
  const trackedViewRef = useRef<string | null>(null);

  // Reset dismiss state when exercise changes
  useEffect(() => {
    setIsDismissed(false);
    trackedViewRef.current = null;
  }, [suggestion?.exerciseId]);

  // Track "viewed" event when a valid suggestion is shown
  useEffect(() => {
    if (
      !suggestion ||
      suggestion.action === 'insufficient_data' ||
      suggestion.suggestedLoad == null ||
      isDismissed
    ) {
      return;
    }

    const viewKey = `${suggestion.exerciseId}-${suggestion.suggestedLoad}`;
    if (trackedViewRef.current === viewKey) return;
    trackedViewRef.current = viewKey;

    track('progression_suggested', {
      exerciseId: suggestion.exerciseId,
      action: suggestion.action,
      confidence: suggestion.confidence,
      previousLoad: suggestion.previousLoad,
      suggestedLoad: suggestion.suggestedLoad,
      delta: suggestion.delta,
    });
  }, [suggestion, isDismissed, track]);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion || suggestion.suggestedLoad == null) return;

    onApplyLoad(suggestion.suggestedLoad);

    track('progression_accepted', {
      exerciseId: suggestion.exerciseId,
      action: suggestion.action,
      confidence: suggestion.confidence,
      previousLoad: suggestion.previousLoad,
      suggestedLoad: suggestion.suggestedLoad,
      delta: suggestion.delta,
    });

    setIsDismissed(true);
  }, [suggestion, onApplyLoad, track]);

  const rejectSuggestion = useCallback(() => {
    if (!suggestion) return;

    track('progression_rejected', {
      exerciseId: suggestion.exerciseId,
      action: suggestion.action,
      confidence: suggestion.confidence,
      previousLoad: suggestion.previousLoad,
      suggestedLoad: suggestion.suggestedLoad,
      delta: suggestion.delta,
    });

    setIsDismissed(true);
  }, [suggestion, track]);

  return {
    acceptSuggestion,
    rejectSuggestion,
    isDismissed,
  };
}
