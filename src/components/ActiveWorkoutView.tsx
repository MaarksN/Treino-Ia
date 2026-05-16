import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Video, X } from 'lucide-react';
import { Exercise, WorkoutDay, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { RestTimer } from './RestTimer';
import { SetTracker } from './SetTracker';

type DayModeProps = {
  day: WorkoutDay;
  workoutHistory?: WorkoutHistoryRecord[];
  onComplete: (completedDay: WorkoutDay) => void;
  onCancel: () => void;
  voiceEnabled?: boolean;
};

type PlanModeProps = {
  plan: WorkoutPlan;
  onClose: () => void;
  onUpdatePlan: (plan: WorkoutPlan) => void;
  voiceEnabled?: boolean;
};

type Props = DayModeProps | PlanModeProps;

const parseRest = (rest: string) => {
  const match = rest.match(/\d+/);
  return match ? Number(match[0]) : 90;
};

function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function cloneDay(day: WorkoutDay): WorkoutDay {
  return JSON.parse(JSON.stringify(day));
}

export function ActiveWorkoutView(props: Props) {
  const isPlanMode = 'plan' in props;
  const initialDay = isPlanMode ? null : props.day;
  const planDays = isPlanMode ? props.plan.days : null;
  const dayWorkoutHistory = isPlanMode ? undefined : props.workoutHistory;
  const [localDay, setLocalDay] = useState<WorkoutDay | null>(() => initialDay ? cloneDay(initialDay) : null);
  const [index, setIndex] = useState(0);
  const [restKey, setRestKey] = useState<number | undefined>(undefined);
  const [restSecs, setRestSecs] = useState(90);
  const spokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initialDay) return;
    setLocalDay(cloneDay(initialDay));
    setIndex(0);
  }, [initialDay]);

  const days = useMemo(
    () => isPlanMode ? planDays ?? [] : localDay ? [localDay] : [],
    [isPlanMode, localDay, planDays],
  );
  const entries = useMemo(() =>
    days.flatMap((day, dIdx) =>
      day.exercises.map((ex, eIdx) => ({ ex, dIdx, eIdx, day }))
    ),
  [days]);

  const current = entries[index];
  const total = entries.length;
  const progress = total ? ((index + 1) / total) * 100 : 0;
  const voiceEnabled = props.voiceEnabled;
  const workoutHistory = useMemo(
    () => isPlanMode ? [] : dayWorkoutHistory || [],
    [dayWorkoutHistory, isPlanMode],
  );

  const previousData = useMemo(() => {
    if (!current) return null;

    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      const found = workoutHistory[i].exercises.find(ex =>
        ex.name.toLowerCase() === current.ex.name.toLowerCase() &&
        (ex.actualWeight || ex.actualReps || ex.rpe || ex.setLogs?.length)
      );
      if (found) return found;
    }

    return null;
  }, [current, workoutHistory]);

  useEffect(() => {
    if (!current || !voiceEnabled) return;

    const spokenKey = `${current.ex.id}-${index}`;
    if (spokenRef.current === spokenKey) return;
    spokenRef.current = spokenKey;

    speakText(`${current.ex.name}. ${current.ex.sets} series de ${current.ex.reps}. Descanso de ${current.ex.rest}.`);
  }, [current, index, voiceEnabled]);

  const close = () => {
    if (isPlanMode) {
      props.onClose();
    } else {
      props.onCancel();
    }
  };

  const persistExercise = (updated: Exercise) => {
    if (!current) return null;

    if (isPlanMode) {
      const nextPlan: WorkoutPlan = {
        ...props.plan,
        days: props.plan.days.map((day, dIdx) =>
          dIdx === current.dIdx
            ? {
                ...day,
                exercises: day.exercises.map((ex, eIdx) => eIdx === current.eIdx ? updated : ex),
              }
            : day
        ),
      };
      props.onUpdatePlan(nextPlan);
      return nextPlan.days[current.dIdx];
    }

    if (!localDay) return null;

    const nextDay = {
      ...localDay,
      exercises: localDay.exercises.map((ex, eIdx) => eIdx === current.eIdx ? updated : ex),
    };
    setLocalDay(nextDay);
    return nextDay;
  };

  const completeAndNext = () => {
    if (!current) return;

    const updated = { ...current.ex, completed: true };
    const updatedDay = persistExercise(updated);
    setRestSecs(parseRest(current.ex.rest));
    setRestKey(Date.now());

    if (index < total - 1) {
      setIndex(value => value + 1);
      return;
    }

    if (!isPlanMode && updatedDay) {
      props.onComplete(updatedDay);
    }
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark text-brand-light flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <button onClick={close} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors" title="Fechar">
          <X size={20} />
        </button>

        <div className="text-center min-w-0">
          <p className="text-xs text-brand-muted uppercase tracking-widest truncate">
            {isPlanMode ? props.plan.planName : current.day.dayName}
          </p>
          <p className="text-sm font-bold text-white">{index + 1} / {total}</p>
        </div>

        <div className="w-10" />
      </div>

      <div className="w-full h-1.5 bg-white/10">
        <div
          className="h-full bg-brand-neon transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 p-5 md:p-8 max-w-3xl mx-auto w-full">
        <p className="text-brand-muted text-sm uppercase tracking-widest mb-2">
          {current.ex.muscleGroup || current.day.focus}
        </p>
        <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter text-brand-neon text-shadow-neon mb-4">
          {current.ex.name}
        </h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-brand-gray border-2 border-brand-light/10 p-4 text-center">
            <p className="text-2xl font-black text-brand-neon">{current.ex.sets}</p>
            <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest">Series</p>
          </div>
          <div className="bg-brand-gray border-2 border-brand-light/10 p-4 text-center min-w-0">
            <p className="text-2xl font-black text-white truncate">{current.ex.reps}</p>
            <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest">Reps</p>
          </div>
          <div className="bg-brand-gray border-2 border-brand-light/10 p-4 text-center min-w-0">
            <p className="text-2xl font-black text-white truncate">{current.ex.rest}</p>
            <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest">Descanso</p>
          </div>
        </div>

        {previousData && (
          <div className="mb-6 p-3 bg-brand-neon/10 border-2 border-brand-neon/30 text-xs font-mono text-brand-light/80">
            Ultima vez: {previousData.actualWeight ? `${previousData.actualWeight}kg` : '-'} x {previousData.actualReps || '-'}
          </div>
        )}

        {current.ex.notes && (
          <div className="mb-6 p-4 bg-white/5 border-2 border-white/10 text-sm text-white/70">
            {current.ex.notes}
          </div>
        )}

        {(current.ex.executionDetails || current.ex.concentricPhase || current.ex.eccentricPhase) && (
          <div className="mb-6 bg-brand-gray/50 border-2 border-brand-light/10 p-4 space-y-3 text-sm text-brand-light/80">
            {current.ex.executionDetails && <p>{current.ex.executionDetails}</p>}
            {current.ex.concentricPhase && <p className="text-brand-magenta">{current.ex.concentricPhase}</p>}
            {current.ex.eccentricPhase && <p className="text-brand-neon">{current.ex.eccentricPhase}</p>}
          </div>
        )}

        <div className="bg-brand-gray border-2 border-brand-light/10 p-4 mb-6">
          <SetTracker exercise={current.ex} onUpdate={(updated) => persistExercise(updated)} />
        </div>

        <textarea
          value={current.ex.performanceNotes || ''}
          onChange={event => persistExercise({ ...current.ex, performanceNotes: event.target.value })}
          rows={2}
          placeholder="Nota rápida do exercício..."
          className="w-full mb-6 bg-brand-gray border-2 border-brand-light/10 px-4 py-3 text-sm text-brand-light outline-none resize-none placeholder:text-brand-light/30 focus:border-brand-neon"
        />

        {current.ex.videoUrl && (
          <a
            href={current.ex.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-neon text-sm font-bold uppercase tracking-widest hover:text-brand-light transition-colors"
          >
            <Video size={16} /> Ver execução
          </a>
        )}
      </main>

      <footer className="p-5 border-t border-white/10">
        <div className="max-w-3xl mx-auto w-full flex gap-3">
          <button
            onClick={() => setIndex(value => Math.max(0, value - 1))}
            className="flex-1 py-4 bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
          >
            <ChevronLeft size={20} /> Anterior
          </button>

          <button
            onClick={completeAndNext}
            className="flex-[1.4] py-4 px-6 bg-brand-neon text-brand-dark font-black flex items-center justify-center gap-2 hover:bg-brand-neon-hover transition-colors"
          >
            <CheckCircle2 size={20} /> {index === total - 1 && !isPlanMode ? 'Finalizar' : 'Concluir'}
          </button>

          <button
            onClick={() => setIndex(value => Math.min(total - 1, value + 1))}
            className="flex-1 py-4 bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
          >
            Proximo <ChevronRight size={20} />
          </button>
        </div>

        <div className="max-w-3xl mx-auto mt-4">
          <RestTimer initialSeconds={restSecs} autoStartKey={restKey} onVoiceAlert={voiceEnabled} />
        </div>
      </footer>
    </div>
  );
}
