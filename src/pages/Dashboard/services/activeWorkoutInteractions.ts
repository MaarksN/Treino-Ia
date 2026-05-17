export interface SwipePoint {
  x: number;
  y: number;
}

export type WorkoutSwipeAction = 'previous' | 'next' | 'none';

export interface WorkoutSwipeResult {
  action: WorkoutSwipeAction;
  nextIndex: number;
  reason?: 'too_short' | 'vertical_scroll' | 'boundary' | 'empty';
}

const MIN_HORIZONTAL_DISTANCE = 72;
const MAX_VERTICAL_DISTANCE = 56;

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'label',
  'select',
  'textarea',
  '[role="button"]',
  '[data-swipe-ignore="true"]',
].join(',');

export function shouldIgnoreWorkoutSwipeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

export function getWorkoutSwipeResult(
  start: SwipePoint,
  end: SwipePoint,
  currentIndex: number,
  totalExercises: number,
): WorkoutSwipeResult {
  if (totalExercises < 1) {
    return { action: 'none', nextIndex: currentIndex, reason: 'empty' };
  }

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaY) > MAX_VERTICAL_DISTANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
    return { action: 'none', nextIndex: currentIndex, reason: 'vertical_scroll' };
  }

  if (Math.abs(deltaX) < MIN_HORIZONTAL_DISTANCE) {
    return { action: 'none', nextIndex: currentIndex, reason: 'too_short' };
  }

  const action: WorkoutSwipeAction = deltaX < 0 ? 'next' : 'previous';
  const nextIndex = action === 'next'
    ? Math.min(totalExercises - 1, currentIndex + 1)
    : Math.max(0, currentIndex - 1);

  if (nextIndex === currentIndex) {
    return { action: 'none', nextIndex: currentIndex, reason: 'boundary' };
  }

  return { action, nextIndex };
}
