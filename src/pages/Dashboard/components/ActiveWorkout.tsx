import React from 'react';
import { TrainingPlan, WorkoutExerciseLog } from '../../../services/database';

export type ActiveExerciseDraft = Omit<WorkoutExerciseLog, 'actualWeight' | 'actualReps' | 'rpe'> & {
  actualWeight: string;
  actualReps: string;
  rpe: string;
};

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';
const labelClass = 'block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted';

interface ActiveWorkoutProps {
  day: TrainingPlan['days'][number];
  activeDraft: ActiveExerciseDraft[];
  activeFeedback: string;
  saving: boolean;
  onCancel: () => void;
  onUpdateDraft: (index: number, patch: Partial<ActiveExerciseDraft>) => void;
  onFeedbackChange: (feedback: string) => void;
  onFinishWorkout: () => void;
}

export function ActiveWorkout({
  day,
  activeDraft,
  activeFeedback,
  saving,
  onCancel,
  onUpdateDraft,
  onFeedbackChange,
  onFinishWorkout,
}: ActiveWorkoutProps) {
  return (
    <main className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Modo treino ativo</p>
            <h1 className="font-display text-6xl uppercase leading-none text-brand-light text-shadow-neon md:text-7xl">
              {day.focus}
            </h1>
            <p className="mt-3 font-mono text-sm text-brand-light/70">
              Marque o que concluiu, registre carga/reps e finalize para ajustar a próxima recomendação.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border-2 border-brand-light/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
          >
            Voltar ao plano
          </button>
        </header>

        <section className="space-y-4">
          {activeDraft.map((exercise, index) => (
            <article key={exercise.exerciseId} className={`rounded-[28px] border-2 transition-all duration-300 ${exercise.completed ? 'glass-panel-neon border-brand-neon/50 scale-[1.01]' : 'bg-brand-gray border-brand-light/15 shadow-brutal-light'} p-5`}>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="relative mt-2">
                    <input
                      type="checkbox"
                      checked={exercise.completed}
                      onChange={event => onUpdateDraft(index, { completed: event.target.checked })}
                      className="peer h-6 w-6 appearance-none rounded-md border-2 border-brand-light/30 bg-brand-dark transition-all checked:border-brand-neon checked:bg-brand-neon"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-dark opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span>
                    <span className="block font-display text-4xl uppercase leading-none text-brand-light">
                      {exercise.name}
                    </span>
                    <span className="mt-2 block font-mono text-xs uppercase tracking-widest text-brand-muted">
                      {exercise.targetSets} séries | {exercise.targetReps} reps | descanso {exercise.targetRest}
                    </span>
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <label>
                    <span className={labelClass}>Carga kg</span>
                    <input
                      value={exercise.actualWeight}
                      onChange={event => onUpdateDraft(index, { actualWeight: event.target.value })}
                      inputMode="decimal"
                      className={`${fieldClass} bg-brand-dark/50`}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Reps</span>
                    <input
                      value={exercise.actualReps}
                      onChange={event => onUpdateDraft(index, { actualReps: event.target.value })}
                      inputMode="numeric"
                      className={`${fieldClass} bg-brand-dark/50`}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    <span className={labelClass}>RPE</span>
                    <input
                      value={exercise.rpe}
                      onChange={event => onUpdateDraft(index, { rpe: event.target.value })}
                      inputMode="decimal"
                      className={`${fieldClass} bg-brand-dark/50`}
                      placeholder="7"
                    />
                  </label>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[28px] border-4 border-brand-magenta glass-panel-magenta p-6 shadow-brutal-magenta">
          <label>
            <span className={labelClass}>Feedback rápido</span>
            <textarea
              value={activeFeedback}
              onChange={event => onFeedbackChange(event.target.value)}
              className={`${fieldClass} min-h-24 resize-none bg-brand-dark/50`}
              placeholder="Ex: treino pesado, joelho ok, supino poderia subir carga."
            />
          </label>
          <button
            type="button"
            onClick={onFinishWorkout}
            disabled={saving}
            className="mt-5 w-full rounded-[24px] border-2 border-brand-neon bg-brand-neon/90 px-6 py-4 font-display text-3xl uppercase tracking-widest text-brand-dark shadow-[0_0_30px_rgba(25,167,255,0.4)] backdrop-blur-md transition-transform hover:scale-[1.01] hover:bg-brand-neon disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Finalizar e ajustar plano'}
          </button>
        </section>
      </div>
    </main>
  );
}
