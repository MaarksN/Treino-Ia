import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgressionSuggestion } from '../rules/progressionRules';
import { renderWithProviders } from '../test/renderWithProviders';
import type { WorkoutDay, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { ActiveWorkoutView } from './ActiveWorkoutView';

const mocks = vi.hoisted(() => ({
  useFeatureFlag: vi.fn(),
  useProgressionSuggestion: vi.fn(),
  acceptSuggestion: vi.fn(),
  rejectSuggestion: vi.fn(),
}));

vi.mock('../hooks/useFeatureFlag', () => ({
  useFeatureFlag: (...args: unknown[]) => mocks.useFeatureFlag(...args),
}));

vi.mock('../hooks/useProgressionSuggestion', () => ({
  useProgressionSuggestion: (...args: unknown[]) => mocks.useProgressionSuggestion(...args),
}));

vi.mock('../hooks/useApplyProgressionSuggestion', () => ({
  useApplyProgressionSuggestion: () => ({
    acceptSuggestion: mocks.acceptSuggestion,
    rejectSuggestion: mocks.rejectSuggestion,
    isDismissed: false,
  }),
}));

const baseDay: WorkoutDay = {
  id: 'day-1',
  dayName: 'Upper A',
  focus: 'Peito e costas',
  exercises: [
    {
      id: 'ex-1',
      name: 'Supino Reto',
      sets: 2,
      reps: '8-10',
      rest: '90s',
      muscleGroup: 'Peito',
      notes: 'Manter escapulas encaixadas.',
      videoUrl: 'https://example.test/supino',
    },
    {
      id: 'ex-2',
      name: 'Remada Curvada',
      sets: 3,
      reps: '10',
      rest: '120s',
      muscleGroup: 'Costas',
    },
  ],
};

const previousWorkout: WorkoutHistoryRecord = {
  id: 'history-1',
  date: 1779667200000,
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Upper A',
  focus: 'Peito e costas',
  volumeLoad: 1200,
  durationMinutes: 45,
  exercises: [
    {
      id: 'old-ex-1',
      name: 'Supino Reto',
      sets: 2,
      reps: '8',
      rest: '90s',
      actualWeight: 80,
      actualReps: '8',
      rpe: 8,
    },
  ],
};

const suggestion: ProgressionSuggestion = {
  exerciseId: 'ex-1',
  exerciseName: 'Supino Reto',
  previousLoad: 80,
  suggestedLoad: 82.5,
  delta: 2.5,
  action: 'increase',
  confidence: 'high',
  reason: 'Boa execução com esforço controlado.',
};

function cloneDay(day: WorkoutDay = baseDay): WorkoutDay {
  return JSON.parse(JSON.stringify(day)) as WorkoutDay;
}

function renderDayMode(overrides: Partial<Parameters<typeof ActiveWorkoutView>[0]> = {}) {
  const onComplete = vi.fn();
  const onCancel = vi.fn();
  const day = cloneDay();

  renderWithProviders(
    <ActiveWorkoutView
      day={day}
      workoutHistory={[previousWorkout]}
      onComplete={onComplete}
      onCancel={onCancel}
      voiceEnabled={false}
      {...overrides}
    />,
  );

  return { day, onComplete, onCancel };
}

describe('ActiveWorkoutView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useFeatureFlag.mockReturnValue(true);
    mocks.useProgressionSuggestion.mockReturnValue(null);
  });

  it('renders the active exercise with workout context and previous performance data', () => {
    renderDayMode();

    expect(screen.getByRole('heading', { name: /supino reto/i })).toBeInTheDocument();
    expect(screen.getByText('Upper A')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Series')).toBeInTheDocument();
    expect(screen.getByText('8-10')).toBeInTheDocument();
    expect(screen.getByText('90s')).toBeInTheDocument();
    expect(screen.getByText(/ultima vez: 80kg x 8/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver execução/i })).toHaveAttribute(
      'href',
      'https://example.test/supino',
    );
  });

  it('updates set metrics and performance notes through the rendered controls', () => {
    renderDayMode();

    fireEvent.change(screen.getAllByPlaceholderText('kg')[0], { target: { value: '82.5' } });
    fireEvent.change(screen.getAllByPlaceholderText('reps')[0], { target: { value: '9' } });
    fireEvent.change(screen.getByPlaceholderText(/nota rápida/i), {
      target: { value: 'Bar path consistente.' },
    });

    expect(screen.getAllByPlaceholderText('kg')[0]).toHaveValue(82.5);
    expect(screen.getAllByPlaceholderText('reps')[0]).toHaveValue(9);
    expect(screen.getByPlaceholderText(/nota rápida/i)).toHaveValue('Bar path consistente.');
  });

  it('advances between exercises and completes the day with updated completion state', () => {
    const { onComplete } = renderDayMode();

    fireEvent.click(screen.getByRole('button', { name: /concluir/i }));
    expect(screen.getByRole('heading', { name: /remada curvada/i })).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({
      id: 'day-1',
      exercises: [
        expect.objectContaining({ id: 'ex-1', completed: true }),
        expect.objectContaining({ id: 'ex-2', completed: true }),
      ],
    });
  });

  it('hides the progression suggestion card when the feature flag is disabled', () => {
    mocks.useFeatureFlag.mockReturnValue(false);
    mocks.useProgressionSuggestion.mockReturnValue(suggestion);

    renderDayMode();

    expect(mocks.useFeatureFlag).toHaveBeenCalledWith('smart_progression_engine');
    expect(screen.queryByTestId('progression-suggestion-card')).not.toBeInTheDocument();
  });

  it('renders the progression suggestion card and routes accept and dismiss actions to mocked hooks', () => {
    mocks.useProgressionSuggestion.mockReturnValue(suggestion);

    renderDayMode();

    expect(screen.getByTestId('progression-suggestion-card')).toBeInTheDocument();
    expect(screen.getByText('82.5kg')).toBeInTheDocument();
    expect(screen.getByText(/boa execução com esforço controlado/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('progression-accept-btn'));
    fireEvent.click(screen.getByTestId('progression-dismiss-btn'));

    expect(mocks.acceptSuggestion).toHaveBeenCalledTimes(1);
    expect(mocks.rejectSuggestion).toHaveBeenCalledTimes(1);
  });

  it('supports plan mode close and plan update callbacks without completing a day', () => {
    const onClose = vi.fn();
    const onUpdatePlan = vi.fn();
    const plan: WorkoutPlan = {
      id: 'plan-1',
      createdAt: 1779667200000,
      planName: 'Plano Upper',
      goalDescription: 'Forca',
      days: [cloneDay()],
    };

    renderWithProviders(
      <ActiveWorkoutView
        plan={plan}
        onClose={onClose}
        onUpdatePlan={onUpdatePlan}
        voiceEnabled={false}
      />,
    );

    fireEvent.change(screen.getAllByPlaceholderText('kg')[0], { target: { value: '85' } });
    expect(onUpdatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        days: [
          expect.objectContaining({
            exercises: expect.arrayContaining([
              expect.objectContaining({
                id: 'ex-1',
                setLogs: expect.arrayContaining([expect.objectContaining({ weight: 85 })]),
              }),
              expect.objectContaining({ id: 'ex-2' }),
            ]),
          }),
        ],
      }),
    );

    fireEvent.click(screen.getByTitle('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
