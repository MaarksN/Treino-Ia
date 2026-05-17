import { memo, type PointerEvent, useCallback, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers3,
  Mic,
  StickyNote,
  AlertTriangle,
  X,
} from 'lucide-react';
import { type TrainingPlan } from '../../../services/database';
import { type ActiveExerciseDraft, type DraftSet } from '../types';
import { useRestTimer } from '../hooks/useRestTimer';
import {
  applyAutofillSuggestion,
  buildActiveWorkoutSummary,
  calculateSetVolume,
  getRpeCalculatorOptions,
  getRpeGuidance,
  parseRestSeconds,
} from '../services/activeWorkoutEngine';
import { getCriticalContrastClass } from '../../../utils/accessibilityContrast';
import { triggerHapticFeedback } from '../../../services/hapticFeedback';
import {
  getPictureInPictureGuard,
  requestPictureInPictureForVideo,
} from '../../../services/mediaPipService';
import {
  getWorkoutSwipeResult,
  shouldIgnoreWorkoutSwipeTarget,
  type SwipePoint,
} from '../services/activeWorkoutInteractions';
import {
  getAudioNoteGuard,
  getCameraFeedbackGuard,
} from '../../../services/workoutCameraFeedbackService';
import { OfflineMediaViewer } from './socialContent/OfflineMediaViewer';
import { RetroSoundToggle } from './socialContent/RetroSoundToggle';
import { retroSoundService } from '../services/socialContent/retroSoundService';
import { getExerciseTechniqueLabel } from '../services/workoutAuthoring';

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';
const labelClass = 'block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted';
const primaryActionClass = getCriticalContrastClass('primaryAction');
const activeSelectionClass = getCriticalContrastClass('activeSelection');
const RPE_OPTIONS = getRpeCalculatorOptions();

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

export const ActiveWorkout = memo(function ActiveWorkout({
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
  const [showRpeCalc, setShowRpeCalc] = useState<{eIdx: number, sIdx: number} | null>(null);
  const [focusedExerciseIndex, setFocusedExerciseIndex] = useState(0);
  const swipeStartRef = useRef<SwipePoint | null>(null);
  const exerciseRefs = useRef<Array<HTMLElement | null>>([]);
  const { remainingSeconds, formatted, isRunning, isExpired, startRest, stopRest, resetRest } = useRestTimer(90);
  const summary = useMemo(() => buildActiveWorkoutSummary(activeDraft), [activeDraft]);
  const pipGuard = useMemo(() => getPictureInPictureGuard(), []);
  const cameraFeedbackGuard = useMemo(() => getCameraFeedbackGuard(), []);
  const audioNoteGuard = useMemo(() => getAudioNoteGuard(), []);

  const focusExercise = useCallback((index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), Math.max(activeDraft.length - 1, 0));
    setFocusedExerciseIndex(nextIndex);
    void triggerHapticFeedback('selection');
    window.requestAnimationFrame(() => {
      exerciseRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [activeDraft.length]);

  const handleSetCompletion = useCallback((eIdx: number, sIdx: number, exercise: ActiveExerciseDraft, checked: boolean) => {
    onUpdateDraftSet(eIdx, sIdx, { completed: checked });
    void triggerHapticFeedback(checked ? 'selection' : 'impact');
    if (checked) {
      retroSoundService.playBeep();
      startRest(parseRestSeconds(exercise.targetRest));
    }
  }, [onUpdateDraftSet, startRest]);

  const handleRpeCalcSelection = useCallback((eIdx: number, sIdx: number, rpe: string) => {
    onUpdateDraftSet(eIdx, sIdx, { rpe });
    void triggerHapticFeedback('selection');
    setShowRpeCalc(null);
  }, [onUpdateDraftSet]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' || shouldIgnoreWorkoutSwipeTarget(event.target)) {
      swipeStartRef.current = null;
      return;
    }

    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
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
  }, [activeDraft.length, focusExercise, focusedExerciseIndex]);

  return (
    <main
      className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 md:py-12 relative pb-32"
      onPointerCancel={() => { swipeStartRef.current = null; }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
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
        <section className="mb-6 rounded-[24px] border border-brand-light/15 bg-brand-dark/40 p-4 font-mono text-xs uppercase tracking-wider text-brand-light/85">
          <div className="grid gap-2 md:grid-cols-4">
            <p>Progresso: {summary.progress.completedExercises}/{summary.progress.totalExercises} ({summary.progress.percent}%)</p>
            <p>Tonelagem estimada: {Math.round(summary.tonnage.totalTonnage).toLocaleString('pt-BR')} kg</p>
            <p>Tonelagem concluída: {Math.round(summary.tonnage.completedTonnage).toLocaleString('pt-BR')} kg</p>
            <p>RPE médio: {summary.averageRpe > 0 ? summary.averageRpe : '-'}</p>
            <p>Carga percebida acumulada: {summary.accumulatedRpeLoad}</p>
          </div>
        </section>

        <section
          aria-label="Navegação do exercício em foco"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-brand-light/15 bg-brand-dark/40 p-3"
          data-swipe-ignore="true"
        >
          <button
            type="button"
            onClick={() => focusExercise(focusedExerciseIndex - 1)}
            disabled={focusedExerciseIndex === 0}
            aria-label="Exercício anterior"
            className="rounded-full border border-brand-light/20 p-3 text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="flex-1 text-center font-mono text-xs uppercase tracking-widest text-brand-light" aria-live="polite">
            Exercício {Math.min(focusedExerciseIndex + 1, activeDraft.length)}/{activeDraft.length}: {activeDraft[focusedExerciseIndex]?.name ?? '-'}
          </p>
          <div className="flex items-center gap-2">
            <RetroSoundToggle />
            {pipGuard.canRenderControl && (
              <button
                type="button"
                onClick={() => { void requestPictureInPictureForVideo(); }}
                className="rounded-full border border-brand-light/20 px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon"
              >
                PiP
              </button>
            )}
            <button
              type="button"
              onClick={() => focusExercise(focusedExerciseIndex + 1)}
              disabled={focusedExerciseIndex >= activeDraft.length - 1}
              aria-label="Próximo exercício"
              className="rounded-full border border-brand-light/20 p-3 text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section
          aria-label="Feedback experimental por câmera"
          className="mb-6 rounded-[24px] border border-brand-light/15 bg-brand-dark/40 p-4"
          data-swipe-ignore="true"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Camera className="mt-0.5 h-5 w-5 text-brand-magenta" />
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-brand-light">
                  Feedback por câmera
                </p>
                <p className="mt-1 font-mono text-xs leading-5 text-brand-light/65">
                  {cameraFeedbackGuard.reason}
                </p>
              </div>
            </div>
            <span className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${
              cameraFeedbackGuard.canStart
                ? 'border-brand-neon text-brand-neon'
                : 'border-brand-magenta text-brand-magenta'
            }`}>
              {cameraFeedbackGuard.canStart ? 'Adapter elegível' : 'Bloqueado'}
            </span>
          </div>
        </section>

        <section className="space-y-6">
          {activeDraft.map((exercise, eIdx) => (
            <article
              key={exercise.exerciseId}
              ref={node => { exerciseRefs.current[eIdx] = node; }}
              aria-current={focusedExerciseIndex === eIdx ? 'true' : undefined}
              className={`rounded-[28px] border-2 transition-all duration-300 ${
                exercise.completed ? 'glass-panel-neon border-brand-neon/50 scale-[1.01] animate-card-complete' : 'bg-brand-gray border-brand-light/15 shadow-brutal-light'
              } ${focusedExerciseIndex === eIdx ? 'ring-2 ring-brand-neon ring-offset-2 ring-offset-brand-dark' : ''} p-5 md:p-6`}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="font-display text-4xl uppercase leading-none text-brand-light">
                    {exercise.name}
                  </h3>
                  {focusedExerciseIndex === eIdx && (
                    <OfflineMediaViewer exerciseName={exercise.name} />
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                      Objetivo: {exercise.targetSets}x{exercise.targetReps} | {exercise.targetRest}
                    </span>
                    {(exercise.intensityTechnique ?? 'normal') !== 'normal' && (
                      <span className="flex items-center gap-1 rounded-full border border-brand-neon bg-brand-neon/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                        <Layers3 className="h-3 w-3" />
                        {getExerciseTechniqueLabel(exercise.intensityTechnique)}
                      </span>
                    )}
                    {exercise.plateauDetected && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-magenta/20 border border-brand-magenta text-brand-light px-3 py-1 font-mono text-[10px] uppercase tracking-widest" title={exercise.plateauReason}>
                        <AlertTriangle className="w-3 h-3 text-brand-magenta" />
                        Possível platô
                      </span>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer bg-brand-dark/50 px-4 py-2 rounded-full border border-brand-light/10">
                  <span className="font-mono text-xs uppercase tracking-widest text-brand-light">Concluir Exercício</span>
                  <input
                    type="checkbox"
                    checked={exercise.completed}
                    onChange={event => {
                      onUpdateDraft(eIdx, { completed: event.target.checked });
                      void triggerHapticFeedback(event.target.checked ? 'success' : 'impact');
                    }}
                    className="h-5 w-5 accent-brand-neon"
                  />
                </label>
              </div>

              {/* Tabela Estruturada de Séries */}
              <div className="overflow-x-auto" data-swipe-ignore="true">
                <table className="w-full text-left font-mono text-xs md:text-sm">
                  <thead>
                    <tr className="text-brand-muted uppercase tracking-widest border-b border-brand-light/10">
                      <th className="pb-3 px-2 font-normal">Série</th>
                      <th className="pb-3 px-2 font-normal">Carga (kg)</th>
                      <th className="pb-3 px-2 font-normal">Reps</th>
                      <th className="pb-3 px-2 font-normal">RPE</th>
                      <th className="pb-3 px-2 font-normal">Volume</th>
                      <th className="pb-3 px-2 font-normal text-center">Feito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, sIdx) => (
                      <tr key={sIdx} className={`border-b border-brand-light/5 transition-colors ${set.completed ? 'bg-brand-neon/5 animate-touch-pop' : 'hover:bg-brand-dark/50'}`}>
                        <td className="py-3 px-2 text-brand-light">{sIdx + 1}</td>
                        <td className="py-3 px-2">
                          <input
                            value={set.weight}
                            onChange={event => onUpdateDraftSet(eIdx, sIdx, { weight: event.target.value })}
                            inputMode="decimal"
                            className="w-16 md:w-20 rounded-[12px] border-2 border-brand-light/15 bg-brand-dark px-3 py-2 text-brand-light outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-neon"
                            placeholder="0"
                          />
                          {set.autofillSuggested && (
                            <div className="mt-1 flex flex-col gap-1">
                              <span className="text-[10px] text-brand-muted">
                                Sugestão: {set.suggestedWeight || '-'} kg / {set.suggestedReps || '-'} reps / RPE {set.suggestedRpe || '-'}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateDraftSet(eIdx, sIdx, applyAutofillSuggestion(set))}
                                className="text-left text-[10px] text-brand-neon transition-transform active:scale-95"
                              >
                                Aplicar sugestão
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateDraftSet(eIdx, sIdx, { autofillSuggested: false })}
                                className="text-left text-[10px] text-brand-muted transition-transform active:scale-95"
                              >
                                Ignorar
                              </button>
                            </div>
                          )}
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
                              className="p-2 text-brand-muted transition-all hover:scale-110 hover:text-brand-neon active:scale-95"
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
                                  {RPE_OPTIONS.map(item => (
                                    <button
                                      key={item.rpe}
                                      type="button"
                                      onClick={() => handleRpeCalcSelection(eIdx, sIdx, item.rpe)}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-neon/20 transition-all text-left active:scale-95"
                                    >
                                      <div>
                                        <span className="font-bold text-brand-light">RPE {item.rpe}</span>
                                        <span className="block text-[10px] text-brand-muted">{item.description}</span>
                                      </div>
                                      <span className="text-brand-neon">RIR {item.rirLabel}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-brand-muted">{getRpeGuidance(set.rpe).guidance}</p>
                        </td>
                        <td className="py-3 px-2 text-brand-light/80">
                          {calculateSetVolume(set) > 0 ? `${Math.round(calculateSetVolume(set)).toLocaleString('pt-BR')} kg` : '-'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <label className="relative inline-flex cursor-pointer items-center justify-center">
                            <input
                              type="checkbox"
                              checked={set.completed}
                              onChange={e => handleSetCompletion(eIdx, sIdx, exercise, e.target.checked)}
                              className="peer h-8 w-8 appearance-none rounded-[10px] border-2 border-brand-light/30 bg-brand-dark transition-all checked:scale-110 checked:border-brand-neon checked:bg-brand-neon active:scale-90"
                            />
                            <Check className="pointer-events-none absolute h-5 w-5 text-brand-dark opacity-0 transition-opacity peer-checked:opacity-100" />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_0.8fr]" data-swipe-ignore="true">
                <label>
                  <span className={`${labelClass} flex items-center gap-2`}>
                    <StickyNote className="h-3.5 w-3.5" />
                    Nota deste exercício
                  </span>
                  <textarea
                    value={exercise.exerciseNote ?? ''}
                    onChange={event => onUpdateDraft(eIdx, { exerciseNote: event.target.value })}
                    className={`${fieldClass} min-h-20 resize-none bg-brand-dark/50`}
                    placeholder="Ex: ombro pinçou, melhorou amplitude, ajustar pegada no próximo treino."
                  />
                </label>
                <div className="rounded-[18px] border border-brand-light/10 bg-brand-dark/40 p-4">
                  <div className="flex items-start gap-3">
                    <Mic className="mt-0.5 h-4 w-4 text-brand-muted" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                        Nota em áudio
                      </p>
                      <p className="mt-2 font-mono text-xs leading-5 text-brand-light/65">
                        {audioNoteGuard.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[28px] border-4 border-brand-magenta glass-panel-magenta p-6 shadow-brutal-magenta">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => startRest(90)} className="rounded-full border border-brand-light/20 px-4 py-2 font-mono text-[11px] uppercase">Iniciar descanso</button>
            <button type="button" onClick={resetRest} className="rounded-full border border-brand-light/20 px-4 py-2 font-mono text-[11px] uppercase">Reiniciar</button>
            <button type="button" onClick={stopRest} className="rounded-full border border-brand-light/20 px-4 py-2 font-mono text-[11px] uppercase">Parar</button>
          </div>
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
            className={`mt-5 w-full rounded-[24px] border-2 px-6 py-4 font-display text-3xl uppercase tracking-widest shadow-[0_0_30px_rgba(25,167,255,0.4)] backdrop-blur-md transition-transform hover:scale-[1.01] disabled:opacity-60 ${primaryActionClass}`}
          >
            {saving ? 'Salvando...' : 'Finalizar e ajustar plano'}
          </button>
        </section>
      </div>

      {/* Floating Rest Timer */}
      {(isRunning || isExpired) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel-neon px-6 py-3 rounded-full flex items-center gap-4 animate-bounce-subtle">
          <Clock className={`w-6 h-6 ${remainingSeconds === 0 ? 'text-brand-magenta animate-pulse' : 'text-brand-neon'}`} />
          <span className="font-mono text-2xl font-black tracking-widest text-brand-light">
            {formatted}
          </span>
          {remainingSeconds === 0 && (
            <span className="font-mono text-xs uppercase tracking-widest text-brand-magenta ml-2">Próxima série!</span>
          )}
          <button
            onClick={stopRest}
            className={`ml-4 rounded-full p-2 transition-colors border ${activeSelectionClass}`}
          >
            <X className="w-4 h-4 text-brand-dark" />
          </button>
        </div>
      )}
    </main>
  );
});
