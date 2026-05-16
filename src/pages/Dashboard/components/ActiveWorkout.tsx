import React, { useState, useEffect } from 'react';
import { Clock, Calculator, AlertTriangle, Play, X, Check } from 'lucide-react';
import { type TrainingPlan } from '../../../services/database';
import { type ActiveExerciseDraft, type DraftSet } from '../types';

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';
const labelClass = 'block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted';

interface ActiveWorkoutProps {
  day: TrainingPlan['days'][number];
  activeDraft: ActiveExerciseDraft[];
  activeFeedback: string;
  saving: boolean;
  onCancel: () => void;
  onUpdateDraft: (index: number, patch: Partial<ActiveExerciseDraft>) => void;
  onUpdateDraftSet: (exerciseIndex: number, setIndex: number, patch: Partial<DraftSet>) => void;
  onFeedbackChange: (feedback: string) => void;
  onFinishWorkout: () => void;
}

function parseRestSeconds(rest: string): number {
  const match = rest.match(/\d+/);
  if (!match) return 60;
  let val = parseInt(match[0]);
  if (rest.toLowerCase().includes('min')) val *= 60;
  return val;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ActiveWorkout({
  day,
  activeDraft,
  activeFeedback,
  saving,
  onCancel,
  onUpdateDraft,
  onUpdateDraftSet,
  onFeedbackChange,
  onFinishWorkout,
}: ActiveWorkoutProps) {
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showRpeCalc, setShowRpeCalc] = useState<{eIdx: number, sIdx: number} | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(t => t !== null ? t - 1 : null);
      }, 1000);
    } else if (restTimer === 0) {
      // Toca um beep leve ou apenas limpa
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const handleSetCompletion = (eIdx: number, sIdx: number, exercise: ActiveExerciseDraft, checked: boolean) => {
    onUpdateDraftSet(eIdx, sIdx, { completed: checked });
    if (checked) {
      setRestTimer(parseRestSeconds(exercise.targetRest));
    }
  };

  const handleRpeCalcSelection = (eIdx: number, sIdx: number, rpe: string) => {
    onUpdateDraftSet(eIdx, sIdx, { rpe });
    setShowRpeCalc(null);
  };

  return (
    <main className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 md:py-12 relative pb-32">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Modo treino ativo</p>
            <h1 className="font-display text-6xl uppercase leading-none text-brand-light text-shadow-neon md:text-7xl">
              {day.focus}
            </h1>
            <p className="mt-3 font-mono text-sm text-brand-light/70">
              Registre a carga de cada série. O descanso automático inicia ao concluir uma série.
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

        <section className="space-y-6">
          {activeDraft.map((exercise, eIdx) => (
            <article key={exercise.exerciseId} className={`rounded-[28px] border-2 transition-all duration-300 ${exercise.completed ? 'glass-panel-neon border-brand-neon/50 scale-[1.01]' : 'bg-brand-gray border-brand-light/15 shadow-brutal-light'} p-5 md:p-6`}>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-display text-4xl uppercase leading-none text-brand-light">
                    {exercise.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                      Objetivo: {exercise.targetSets}x{exercise.targetReps} | {exercise.targetRest}
                    </span>
                    {exercise.plateauDetected && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-magenta/20 border border-brand-magenta text-brand-light px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3 text-brand-magenta" />
                        Platô Detectado
                      </span>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer bg-brand-dark/50 px-4 py-2 rounded-full border border-brand-light/10">
                  <span className="font-mono text-xs uppercase tracking-widest text-brand-light">Concluir Exercício</span>
                  <input
                    type="checkbox"
                    checked={exercise.completed}
                    onChange={event => onUpdateDraft(eIdx, { completed: event.target.checked })}
                    className="h-5 w-5 accent-brand-neon"
                  />
                </label>
              </div>

              {/* Tabela Estruturada de Séries */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs md:text-sm">
                  <thead>
                    <tr className="text-brand-muted uppercase tracking-widest border-b border-brand-light/10">
                      <th className="pb-3 px-2 font-normal">Série</th>
                      <th className="pb-3 px-2 font-normal">Carga (kg)</th>
                      <th className="pb-3 px-2 font-normal">Reps</th>
                      <th className="pb-3 px-2 font-normal">RPE</th>
                      <th className="pb-3 px-2 font-normal text-center">Feito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, sIdx) => (
                      <tr key={sIdx} className={`border-b border-brand-light/5 transition-colors ${set.completed ? 'bg-brand-neon/5' : 'hover:bg-brand-dark/50'}`}>
                        <td className="py-3 px-2 text-brand-light">{sIdx + 1}</td>
                        <td className="py-3 px-2">
                          <input
                            value={set.weight}
                            onChange={event => onUpdateDraftSet(eIdx, sIdx, { weight: event.target.value })}
                            inputMode="decimal"
                            className="w-16 md:w-20 rounded-[12px] border-2 border-brand-light/15 bg-brand-dark px-3 py-2 text-brand-light outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-neon"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            value={set.reps}
                            onChange={event => onUpdateDraftSet(eIdx, sIdx, { reps: event.target.value })}
                            inputMode="numeric"
                            className="w-16 md:w-20 rounded-[12px] border-2 border-brand-light/15 bg-brand-dark px-3 py-2 text-brand-light outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-neon"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-2 relative">
                          <div className="flex items-center gap-1">
                            <input
                              value={set.rpe}
                              onChange={event => onUpdateDraftSet(eIdx, sIdx, { rpe: event.target.value })}
                              inputMode="decimal"
                              className="w-14 rounded-[12px] border-2 border-brand-light/15 bg-brand-dark px-2 py-2 text-brand-light outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-neon"
                              placeholder="7"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRpeCalc({eIdx, sIdx})}
                              className="p-2 text-brand-muted hover:text-brand-neon transition-colors"
                              title="Calculadora RPE"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>

                            {/* RPE Popover */}
                            {showRpeCalc?.eIdx === eIdx && showRpeCalc?.sIdx === sIdx && (
                              <div className="absolute top-12 left-0 z-50 w-56 glass-panel p-4 rounded-[20px] shadow-2xl border border-brand-light/20">
                                <div className="flex justify-between items-center mb-3">
                                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-neon">Reps na Reserva (RIR)</p>
                                  <button onClick={() => setShowRpeCalc(null)} className="text-brand-muted hover:text-brand-light"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {[
                                    { rir: '0', rpe: '10', desc: 'Falha total' },
                                    { rir: '1', rpe: '9', desc: 'Mais 1 rep' },
                                    { rir: '2', rpe: '8', desc: 'Mais 2 reps' },
                                    { rir: '3', rpe: '7', desc: 'Mais 3 reps' },
                                    { rir: '4+', rpe: '6', desc: 'Aquecimento' }
                                  ].map(item => (
                                    <button
                                      key={item.rpe}
                                      type="button"
                                      onClick={() => handleRpeCalcSelection(eIdx, sIdx, item.rpe)}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-neon/20 transition-colors text-left"
                                    >
                                      <div>
                                        <span className="font-bold text-brand-light">RPE {item.rpe}</span>
                                        <span className="block text-[10px] text-brand-muted">{item.desc}</span>
                                      </div>
                                      <span className="text-brand-neon">RIR {item.rir}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <label className="relative inline-flex cursor-pointer items-center justify-center">
                            <input
                              type="checkbox"
                              checked={set.completed}
                              onChange={e => handleSetCompletion(eIdx, sIdx, exercise, e.target.checked)}
                              className="peer h-8 w-8 appearance-none rounded-[10px] border-2 border-brand-light/30 bg-brand-dark transition-all checked:border-brand-neon checked:bg-brand-neon"
                            />
                            <Check className="pointer-events-none absolute h-5 w-5 text-brand-dark opacity-0 transition-opacity peer-checked:opacity-100" />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              placeholder="Ex: treino pesado, platô no supino, ajustar próximo ciclo."
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

      {/* Floating Rest Timer */}
      {restTimer !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel-neon px-6 py-3 rounded-full flex items-center gap-4 animate-bounce-subtle">
          <Clock className={`w-6 h-6 ${restTimer === 0 ? 'text-brand-magenta animate-pulse' : 'text-brand-neon'}`} />
          <span className="font-mono text-2xl font-black tracking-widest text-brand-light">
            {formatTime(restTimer)}
          </span>
          {restTimer === 0 && (
            <span className="font-mono text-xs uppercase tracking-widest text-brand-magenta ml-2">Próxima série!</span>
          )}
          <button
            onClick={() => setRestTimer(null)}
            className="ml-4 bg-brand-dark/50 hover:bg-brand-dark rounded-full p-2 transition-colors border border-brand-light/10"
          >
            <X className="w-4 h-4 text-brand-light" />
          </button>
        </div>
      )}
    </main>
  );
}
