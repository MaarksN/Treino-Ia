import { memo, useCallback, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical, Layers3, Play } from 'lucide-react';
import {
  type ExerciseIntensityTechnique,
  type ExercisePrescription,
  type TrainingPlan,
} from '../../../services/database';
import { getCriticalContrastClass } from '../../../utils/accessibilityContrast';
import { getExerciseTechniqueLabel } from '../services/workoutAuthoring';

const primaryActionClass = getCriticalContrastClass('primaryAction');
const activeSelectionClass = getCriticalContrastClass('activeSelection');
const techniqueOptions: ExerciseIntensityTechnique[] = ['normal', 'superset', 'dropset'];

interface ExerciseCardProps {
  exercise: ExercisePrescription;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
  onTechniqueChange: (index: number, technique: ExerciseIntensityTechnique) => void;
  onNotesChange: (index: number, notes: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}

const ExerciseCard = memo(function ExerciseCard({
  exercise,
  index,
  isFirst,
  isLast,
  isDragging,
  onMove,
  onTechniqueChange,
  onNotesChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ExerciseCardProps) {
  const technique = exercise.intensityTechnique ?? 'normal';

  return (
    <article
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      className={`rounded-[24px] border-2 border-brand-light/15 bg-brand-dark p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-neon ${
        isDragging ? 'border-brand-neon opacity-70 shadow-brutal-neon' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">{exercise.muscleGroup}</p>
          <h3 className="mt-2 font-display text-4xl uppercase leading-none text-brand-light">{exercise.name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={isFirst}
            aria-label={`Mover ${exercise.name} para cima`}
            title="Mover para cima"
            className="rounded-full border border-brand-light/15 p-2 text-brand-muted transition-colors hover:border-brand-neon hover:text-brand-neon disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={isLast}
            aria-label={`Mover ${exercise.name} para baixo`}
            title="Mover para baixo"
            className="rounded-full border border-brand-light/15 p-2 text-brand-muted transition-colors hover:border-brand-neon hover:text-brand-neon disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <GripVertical className="h-5 w-5 cursor-grab text-brand-muted" aria-hidden="true" />
          <CheckCircle2 className="h-6 w-6 text-brand-neon" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 font-mono text-xs uppercase tracking-widest">
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Séries</p>
          <p className="mt-1 text-brand-light">{exercise.sets}</p>
        </div>
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Reps</p>
          <p className="mt-1 text-brand-light">{exercise.reps}</p>
        </div>
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Desc.</p>
          <p className="mt-1 text-brand-light">{exercise.rest}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-muted">
            <Layers3 className="h-3.5 w-3.5" />
            Técnica
          </span>
          <select
            value={technique}
            onChange={event => onTechniqueChange(index, event.target.value as ExerciseIntensityTechnique)}
            className="w-full rounded-[16px] border border-brand-light/15 bg-brand-gray px-3 py-3 font-mono text-xs uppercase tracking-widest text-brand-light outline-none transition-colors focus:border-brand-neon"
          >
            {techniqueOptions.map(option => (
              <option key={option} value={option}>
                {getExerciseTechniqueLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-brand-muted">
            Nota do exercício
          </span>
          <textarea
            value={exercise.notes}
            onChange={event => onNotesChange(index, event.target.value)}
            rows={3}
            className="mt-2 min-h-20 w-full resize-none rounded-[16px] border border-brand-light/15 bg-brand-gray px-3 py-3 font-mono text-xs leading-5 text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon"
            placeholder="Ajuste técnico, preferência, cuidado ou dica para este exercício."
          />
        </label>
      </div>
      {technique === 'superset' && exercise.supersetGroupId && (
        <p className="mt-3 rounded-[14px] border border-brand-neon/30 bg-brand-neon/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
          Grupo: {exercise.supersetGroupId}
        </p>
      )}
    </article>
  );
});

interface WeeklyPlanProps {
  plan: TrainingPlan;
  selectedDayIndex: number;
  selectedDay: TrainingPlan['days'][number] | null;
  onSelectDay: (index: number) => void;
  onStartWorkout: (index: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onUpdateExerciseTechnique: (exerciseIndex: number, technique: ExerciseIntensityTechnique) => void;
  onUpdateExerciseNotes: (exerciseIndex: number, notes: string) => void;
}

export const WeeklyPlan = memo(function WeeklyPlan({
  plan,
  selectedDayIndex,
  selectedDay,
  onSelectDay,
  onStartWorkout,
  onMoveExercise,
  onUpdateExerciseTechnique,
  onUpdateExerciseNotes,
}: WeeklyPlanProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetIndex: number) => {
    if (draggedIndex === null) return;
    onMoveExercise(draggedIndex, targetIndex);
    setDraggedIndex(null);
  }, [draggedIndex, onMoveExercise]);

  return (
    <section id="dashboard-plan" className="mb-8 rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-8 scroll-mt-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Plano semanal</p>
          <h2 className="font-display text-5xl uppercase text-brand-light">{plan.planName}</h2>
        </div>
        {selectedDay && (
          <button
            type="button"
            onClick={() => onStartWorkout(selectedDayIndex)}
            className={`rounded-[24px] border-2 px-6 py-3 font-mono text-xs uppercase tracking-widest shadow-brutal-neon transition-transform hover:scale-105 active:scale-95 ${primaryActionClass}`}
          >
            <Play className="mr-2 inline h-4 w-4 fill-current" />
            Iniciar treino
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {plan.days.map((day, index) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(index)}
            className={`rounded-[22px] border-2 p-4 text-left transition-all duration-200 active:scale-95 ${
              selectedDayIndex === index
                ? `${activeSelectionClass} animate-touch-pop`
                : 'border-brand-light/15 bg-brand-dark text-brand-light hover:-translate-y-0.5 hover:border-brand-neon'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-widest opacity-70">{day.dayName}</span>
            <span className="mt-1 block font-display text-3xl uppercase leading-none">{day.focus}</span>
          </button>
        ))}
      </div>

      {selectedDay && (
        <div className="grid gap-4 lg:grid-cols-2">
          {selectedDay.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              isFirst={index === 0}
              isLast={index === selectedDay.exercises.length - 1}
              isDragging={draggedIndex === index}
              onMove={onMoveExercise}
              onTechniqueChange={onUpdateExerciseTechnique}
              onNotesChange={onUpdateExerciseNotes}
              onDragStart={setDraggedIndex}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={() => setDraggedIndex(null)}
            />
          ))}
        </div>
      )}
    </section>
  );
});
