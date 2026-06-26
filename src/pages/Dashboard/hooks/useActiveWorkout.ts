import { useCallback, useEffect, useRef, useState } from 'react';
import { type ActiveExerciseDraft, type DraftSet } from '../types';
import { useRestTimer } from './useRestTimer';
import {
  parseRestSeconds,
} from '../services/activeWorkoutEngine';
import { triggerHapticFeedback } from '../../../services/hapticFeedback';
import {
  getWorkoutSwipeResult,
  shouldIgnoreWorkoutSwipeTarget,
} from '../services/activeWorkoutInteractions';
import { retroSoundService } from '../services/socialContent/retroSoundService';
import { voiceCoachService } from '../../../services/voiceCoachService';

interface UseActiveWorkoutProps {
  activeDraft: ActiveExerciseDraft[];
  showMediaEnhancements: boolean;
  onUpdateDraftSet: (exerciseIndex: number, setIndex: number, patch: Partial<DraftSet>) => void;
}

export function useActiveWorkout({
  activeDraft,
  showMediaEnhancements,
  onUpdateDraftSet,
}: UseActiveWorkoutProps) {
  const [showRpeCalc, setShowRpeCalc] = useState<{ eIdx: number; sIdx: number } | null>(null);
  const [focusedExerciseIndex, setFocusedExerciseIndex] = useState(0);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const exerciseRefs = useRef<Array<HTMLElement | null>>([]);

  const { remainingSeconds, formatted, isRunning, isExpired, startRest, stopRest, resetRest } =
    useRestTimer(90);

  useEffect(() => {
    if (isExpired && showMediaEnhancements) {
      voiceCoachService.announceRestEnd();
    }
  }, [isExpired, showMediaEnhancements]);

  const focusExercise = useCallback(
    (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), Math.max(activeDraft.length - 1, 0));
      setFocusedExerciseIndex(nextIndex);
      void triggerHapticFeedback('selection');

      const exercise = activeDraft[nextIndex];
      if (exercise && showMediaEnhancements) {
        voiceCoachService.announceExercise(exercise.name, exercise.targetSets, exercise.targetReps);
      }

      window.requestAnimationFrame(() => {
        exerciseRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    },
    [activeDraft, showMediaEnhancements],
  );

  const handleSetCompletion = useCallback(
    (eIdx: number, sIdx: number, exercise: ActiveExerciseDraft, checked: boolean) => {
      onUpdateDraftSet(eIdx, sIdx, { completed: checked });
      void triggerHapticFeedback(checked ? 'selection' : 'impact');
      if (checked) {
        if (showMediaEnhancements) retroSoundService.playBeep();
        startRest(parseRestSeconds(exercise.targetRest));
      }
    },
    [onUpdateDraftSet, showMediaEnhancements, startRest],
  );

  const handleRpeCalcSelection = useCallback(
    (eIdx: number, sIdx: number, rpe: string) => {
      onUpdateDraftSet(eIdx, sIdx, { rpe });
      void triggerHapticFeedback('selection');
      setShowRpeCalc(null);
    },
    [onUpdateDraftSet],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' || shouldIgnoreWorkoutSwipeTarget(event.target as HTMLElement)) {
      swipeStartRef.current = null;
      return;
    }

    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) return;

      const result = getWorkoutSwipeResult(
        start,
        { x: event.clientX, y: event.clientY },
        focusedExerciseIndex,
        activeDraft.length,
      );

      if (result.action !== 'none') {
        focusExercise(result.nextIndex);
      }
    },
    [activeDraft.length, focusExercise, focusedExerciseIndex],
  );

  return {
    showRpeCalc,
    setShowRpeCalc,
    focusedExerciseIndex,
    exerciseRefs,
    remainingSeconds,
    formatted,
    isRunning,
    isExpired,
    focusExercise,
    handleSetCompletion,
    handleRpeCalcSelection,
    handlePointerDown,
    handlePointerUp,
    stopRest,
    resetRest,
    startRest,
  };
}
