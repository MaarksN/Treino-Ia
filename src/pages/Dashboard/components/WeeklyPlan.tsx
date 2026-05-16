import { Play, CheckCircle2 } from 'lucide-react';
import { type TrainingPlan, type ExercisePrescription } from '../../../services/database';

function ExerciseCard({ exercise }: { exercise: ExercisePrescription }) {
  return (
    <article className="rounded-[24px] border-2 border-brand-light/15 bg-brand-dark p-5 transition-colors hover:border-brand-neon">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">{exercise.muscleGroup}</p>
          <h3 className="mt-2 font-display text-4xl uppercase leading-none text-brand-light">{exercise.name}</h3>
        </div>
        <CheckCircle2 className="h-6 w-6 text-brand-neon" />
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
      <p className="mt-4 font-mono text-xs leading-6 text-brand-light/65">{exercise.notes}</p>
    </article>
  );
}

interface WeeklyPlanProps {
  plan: TrainingPlan;
  selectedDayIndex: number;
  selectedDay: TrainingPlan['days'][number] | null;
  onSelectDay: (index: number) => void;
  onStartWorkout: (index: number) => void;
}

export function WeeklyPlan({
  plan,
  selectedDayIndex,
  selectedDay,
  onSelectDay,
  onStartWorkout,
}: WeeklyPlanProps) {
  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Plano semanal</p>
          <h2 className="font-display text-5xl uppercase text-brand-light">{plan.planName}</h2>
        </div>
        {selectedDay && (
          <button
            type="button"
            onClick={() => onStartWorkout(selectedDayIndex)}
            className="rounded-[24px] border-2 border-brand-neon bg-brand-neon px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-neon transition-transform hover:scale-105"
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
            className={`rounded-[22px] border-2 p-4 text-left transition-colors ${
              selectedDayIndex === index
                ? 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon'
                : 'border-brand-light/15 bg-brand-dark text-brand-light hover:border-brand-neon'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-widest opacity-70">{day.dayName}</span>
            <span className="mt-1 block font-display text-3xl uppercase leading-none">{day.focus}</span>
          </button>
        ))}
      </div>

      {selectedDay && (
        <div className="grid gap-4 lg:grid-cols-2">
          {selectedDay.exercises.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </section>
  );
}
