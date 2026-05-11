import React, { useEffect, useMemo, useState } from 'react';
import {
  DailyCheckin,
  Exercise,
  RecoveryCheckin,
  UserProfile,
  WorkoutDay,
  WorkoutFeedback,
  WorkoutHistoryRecord,
  WorkoutPlan,
  WorkoutSession,
} from '../types';
import { Target, PlusCircle, History, ChevronDown, Download, Printer, FileJson, FileText, CheckCircle2, Play, Brain, Activity, Flame, BarChart3, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { CheckInModule } from './CheckInModule';
import { NutritionModule } from './NutritionModule';
import { ActiveWorkoutView } from './ActiveWorkoutView';
import { RestTimer } from './RestTimer';
import { CoachChat } from './CoachChat';
import { ProgressCharts } from './ProgressCharts';
import { WeeklyReportCard } from './WeeklyReportCard';
import { ReadinessCard } from './ReadinessCard';
import { WeeklyInsightsCard } from './WeeklyInsightsCard';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { QuickWorkoutCard } from './QuickWorkoutCard';
import { generateQuickWorkout } from '../services/geminiService';
import {
  adaptWeeklyPlan,
  adjustBySleepAndStress,
  adjustWorkoutForAvailableTime,
  adjustWorkoutForRecovery,
  generateAdvancedWorkoutPlan,
  generateDayVariations,
  generateDeloadAdvice,
  generateLoadProgressionAdvice,
  generateMacrocycle,
  generateMicrocycles,
  generatePremiumPostWorkoutFeedback,
  predictPlateau,
  recommendIdealFrequency,
  recommendWeeklyVolume,
  suggestAdvancedMethods,
  suggestExerciseAlternatives as suggestContextualExerciseAlternatives,
} from '../services/aiPersonalizationService';
import { getRecoveryScore } from '../services/recoveryService';
import { getTrackedExerciseNames } from '../services/analyticsService';
import { detectPlateau, shouldSuggestDeload } from '../utils/workoutMetrics';
import { getJSON, STORAGE_KEYS, updateWorkoutStreak, WorkoutStreak } from '../utils/storage';
import { extractAndSavePRsFromPlan, getPRForExercise } from '../utils/prUtils';
import { calculateReadiness as calculateDailyReadiness, getOvertrainingRisk } from '../utils/readinessUtils';
import {
  buildWorkoutRecord,
  buildWorkoutSession,
  dataModeLabel,
  extractPersonalRecords,
  persistWorkoutExecution,
  resetCompletedDay,
} from '../services/workoutExecutionService';

interface Props {
  plan: WorkoutPlan;
  history: WorkoutPlan[];
  workoutHistory: WorkoutHistoryRecord[];
  sessions: WorkoutSession[];
  profile: UserProfile | null;
  recoveryCheckin: RecoveryCheckin | null;
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onSaveSession: (session: WorkoutSession) => void;
  onSaveRecoveryCheckin: (checkin: RecoveryCheckin) => void;
  onSelectHistory: (id: string) => void;
  onNew: () => void;
  onCompleteDay: (record: WorkoutHistoryRecord) => void;
  onSaveNewPlan?: (plan: WorkoutPlan) => void;
  onStartActiveWorkout?: () => void;
  voiceEnabled?: boolean;
  onVoiceEnabledChange?: (enabled: boolean) => void;
  dailyCheckin?: DailyCheckin | null;
  allDailyCheckins?: DailyCheckin[];
  userProfile?: UserProfile;
}

const parseRestToSeconds = (rest: string) => {
  const match = rest.match(/\d+/);
  return match ? Number(match[0]) : 90;
};

const RECOVERY_FIELDS = [
  { key: 'sorenessLevel', label: 'Dor' },
  { key: 'stressLevel', label: 'Stress' },
  { key: 'energyLevel', label: 'Energia' },
] as const;

function createDefaultReadiness(profile: UserProfile | null): RecoveryCheckin {
  const parsedSleep = Number(profile?.sleepHours || 7);

  return {
    sleepHours: Number.isFinite(parsedSleep) ? parsedSleep : 7,
    stressLevel: profile?.stressLevel === 'Alto' ? 8 : profile?.stressLevel === 'Baixo' ? 3 : 5,
    sorenessLevel: 4,
    energyLevel: 7,
    timestamp: Date.now(),
  };
}

function formatAiPanelResult(result: unknown): string {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return 'Sem resposta estruturada.';

  const maybeStructured = result as { data?: unknown; audit?: { reason?: string; deterministicFlags?: string[] } };
  if (!('data' in maybeStructured)) return JSON.stringify(result, null, 2);

  const flags = maybeStructured.audit?.deterministicFlags?.length
    ? `\n\nAuditoria: ${maybeStructured.audit.deterministicFlags.join(', ')}`
    : maybeStructured.audit?.reason
      ? `\n\nAuditoria: ${maybeStructured.audit.reason}`
      : '';

  return `${JSON.stringify(maybeStructured.data, null, 2)}${flags}`;
}

function getAutomaticWarmup(day: WorkoutDay): string {
  const focus = `${day.focus} ${day.exercises.map(exercise => exercise.muscleGroup || exercise.name).join(' ')}`.toLowerCase();
  if (focus.includes('perna') || focus.includes('quadr') || focus.includes('glúte') || focus.includes('posterior')) {
    return '5 min de cardio leve, mobilidade de quadril/tornozelo e 2 séries progressivas do primeiro exercício.';
  }
  if (focus.includes('costas') || focus.includes('pux')) {
    return '3-5 min de cardio leve, ativações escapulares e 2 séries leves de puxada/remada.';
  }
  if (focus.includes('peito') || focus.includes('ombro') || focus.includes('empurr')) {
    return 'Mobilidade torácica, rotação externa com elástico e 2 séries progressivas do primeiro empurrar.';
  }
  return '5 min leve, mobilidade das articulações principais e 1-2 séries progressivas do primeiro exercício.';
}

function getRecommendedCooldown(day: WorkoutDay): string {
  const focus = `${day.focus} ${day.exercises.map(exercise => exercise.muscleGroup || exercise.name).join(' ')}`.toLowerCase();
  if (focus.includes('perna') || focus.includes('quadr') || focus.includes('glúte')) {
    return 'Respiração nasal 2 min, alongamento de flexores do quadril, glúteos, posteriores e panturrilhas.';
  }
  if (focus.includes('costas')) {
    return 'Respiração 2 min, mobilidade torácica, lat stretch e liberação leve de trapézio.';
  }
  return 'Respiração 2 min, mobilidade leve da cadeia treinada e alongamentos confortáveis de 20-30s.';
}

export function WorkoutDashboard({
  plan,
  history,
  workoutHistory,
  sessions,
  profile,
  recoveryCheckin: savedRecoveryCheckin,
  onUpdatePlan,
  onSaveSession,
  onSaveRecoveryCheckin,
  onSelectHistory,
  onNew,
  onCompleteDay,
  onSaveNewPlan,
  onStartActiveWorkout: _onStartActiveWorkout,
  voiceEnabled: controlledVoiceEnabled,
  onVoiceEnabledChange,
  dailyCheckin,
  allDailyCheckins = [],
  userProfile,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerKey, setTimerKey] = useState<number | undefined>(undefined);
  const [localVoiceEnabled, setLocalVoiceEnabled] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [quickWorkoutLoading, setQuickWorkoutLoading] = useState(false);
  const [streak, setStreak] = useState<WorkoutStreak>(() =>
    getJSON<WorkoutStreak>(STORAGE_KEYS.streak, { count: 0, lastDate: null })
  );
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [dailyReadiness, setDailyReadiness] = useState<RecoveryCheckin>(() =>
    savedRecoveryCheckin || createDefaultReadiness(profile)
  );
  const [recoveryAdvice, setRecoveryAdvice] = useState('');
  const [loadingRecoveryAdvice, setLoadingRecoveryAdvice] = useState(false);
  const [aiPanel, setAiPanel] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const voiceEnabled = controlledVoiceEnabled ?? localVoiceEnabled;
  const toggleVoiceEnabled = () => {
    const next = !voiceEnabled;
    setLocalVoiceEnabled(next);
    onVoiceEnabledChange?.(next);
  };

  useEffect(() => {
    if (savedRecoveryCheckin) {
      setDailyReadiness(savedRecoveryCheckin);
    }
  }, [savedRecoveryCheckin]);

  const exerciseOptions = useMemo(() => {
    const tracked = getTrackedExerciseNames(history, workoutHistory);
    if (tracked.length) return tracked;

    return Array.from(new Set(plan.days.flatMap(day => day.exercises.map(ex => ex.name))));
  }, [history, plan.days, workoutHistory]);

  useEffect(() => {
    if (!exerciseOptions.length) return;
    if (!selectedExerciseName || !exerciseOptions.includes(selectedExerciseName)) {
      setSelectedExerciseName(exerciseOptions[0]);
    }
  }, [exerciseOptions, selectedExerciseName]);

  const recoveryScore = useMemo(() => getRecoveryScore(dailyReadiness), [dailyReadiness]);
  const dailyReadinessScore = useMemo(() => dailyCheckin ? calculateDailyReadiness(dailyCheckin) : null, [dailyCheckin]);
  const overtrainingRisk = useMemo(() => getOvertrainingRisk(allDailyCheckins), [allDailyCheckins]);
  const chartExerciseName = selectedExerciseName || exerciseOptions[0] || '';
  const plateauStatus = chartExerciseName ? detectPlateau(history, chartExerciseName, workoutHistory) : null;
  const deloadSuggested = shouldSuggestDeload(plan);

  const getPreviousExerciseStat = (exerciseName: string) => {
    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      const prevRec = workoutHistory[i];
      const prevExc = prevRec.exercises.find(ex => ex.name.toLowerCase() === exerciseName.toLowerCase());
      if (prevExc && (prevExc.actualWeight || prevExc.actualReps || prevExc.rpe)) {
        return {
          date: prevRec.date,
          weight: prevExc.actualWeight,
          reps: prevExc.actualReps,
          rpe: prevExc.rpe,
        };
      }
    }
    return null;
  };

  const getPreviousExerciseData = (exerciseName: string): Exercise | null => {
    for (let i = workoutHistory.length - 1; i >= 0; i--) {
      const found = workoutHistory[i].exercises.find(ex =>
        ex.name.toLowerCase() === exerciseName.toLowerCase() &&
        (ex.actualWeight || ex.actualReps || ex.rpe || ex.setLogs?.length)
      );
      if (found) return found;
    }

    for (const historicPlan of history.filter(item => item.id !== plan.id)) {
      const found = historicPlan.days
        .flatMap(day => day.exercises)
        .find(ex =>
          ex.name.toLowerCase() === exerciseName.toLowerCase() &&
          (ex.actualWeight || ex.actualReps || ex.rpe || ex.setLogs?.length)
        );
      if (found) return found;
    }

    return null;
  };

  const handleUpdateExercise = (dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
    const newDays = [...plan.days];
    newDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
    onUpdatePlan({ ...plan, days: newDays });
  };

  const handleExerciseUpdateWithRest = (
    dayIndex: number,
    exerciseIndex: number,
    currentExercise: Exercise,
    updatedExercise: Exercise
  ) => {
    const previousStat = getPreviousExerciseStat(currentExercise.name);
    const isNewlyCompleted = !currentExercise.completed && Boolean(updatedExercise.completed);
    const nextExercise: Exercise = isNewlyCompleted && previousStat
      ? {
          ...updatedExercise,
          actualWeight: updatedExercise.actualWeight || previousStat.weight,
          actualReps: updatedExercise.actualReps || previousStat.reps,
          rpe: updatedExercise.rpe || previousStat.rpe,
        }
      : updatedExercise;

    handleUpdateExercise(dayIndex, exerciseIndex, nextExercise);

    if (isNewlyCompleted) {
      setRestSeconds(parseRestToSeconds(updatedExercise.rest));
      setTimerKey(Date.now());
      setStreak(updateWorkoutStreak());
    }
  };

  const handleRecoveryAdvice = async () => {
    setLoadingRecoveryAdvice(true);
    try {
      const advice = await adjustWorkoutForRecovery(plan, dailyReadiness);
      setRecoveryAdvice(advice);
    } catch {
      setRecoveryAdvice('Não consegui gerar o ajuste agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setLoadingRecoveryAdvice(false);
    }
  };

  const runAiAction = async (action: () => Promise<unknown>) => {
    setAiLoading(true);
    try {
      setAiPanel(formatAiPanelResult(await action()));
    } catch {
      setAiPanel('Não consegui executar esta ação agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickWorkout = async (
    type: 'express' | 'bodyweight' | 'equipment' | 'goal',
    value?: string
  ) => {
    setQuickWorkoutLoading(true);
    try {
      const generated = await generateQuickWorkout(
        type,
        value || profile?.goal,
        profile?.equipment || profile?.gymType || profile?.workoutLocation
      );

      if (onSaveNewPlan) {
        onSaveNewPlan(generated);
      } else {
        onUpdatePlan({ ...generated, id: plan.id });
      }
    } catch {
      setAiPanel('Não consegui gerar o treino rápido agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setQuickWorkoutLoading(false);
    }
  };

  const buildSessionFromDay = (day: WorkoutDay, durationMinutes = 45): WorkoutSession =>
    buildWorkoutSession(plan, day, durationMinutes, dailyReadiness);

  const saveCurrentSession = (dayIndex = 0) => {
    const day = plan.days[dayIndex];
    if (!day) return null;

    const session = buildSessionFromDay(day);
    onSaveSession(session);
    return session;
  };

  const handleSaveReadiness = () => {
    const updated = { ...dailyReadiness, timestamp: Date.now() };
    setDailyReadiness(updated);
    onSaveRecoveryCheckin(updated);
  };

  const handleUpdateDayFeedback = (dayIndex: number, feedback: WorkoutFeedback) => {
    const newDays = [...plan.days];
    newDays[dayIndex].workoutFeedback = feedback;
    onUpdatePlan({ ...plan, days: newDays });
  };

  const handleFinishWorkout = async (dayIndex: number) => {
    const day = plan.days[dayIndex];
    const record = buildWorkoutRecord(plan, day, 45);
    const session = buildSessionFromDay(day, record.durationMinutes);
    const newPRs = extractAndSavePRsFromPlan({
      ...plan,
      days: plan.days.map((item, index) => index === dayIndex ? day : item),
    });
    const personalRecords = extractPersonalRecords(plan, day);

    setSaveError('');
    setSaveStatus('Salvando execução...');
    try {
      const result = await persistWorkoutExecution({ record, session, personalRecords });
      setSaveStatus(
        newPRs.length
          ? `Treino salvo em ${dataModeLabel(result.dataMode)}. PR batido em: ${newPRs.join(', ')}.`
          : `Treino salvo em ${dataModeLabel(result.dataMode)}.`
      );
      if (result.warning) setSaveError(result.warning);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível persistir no backend.');
      setSaveStatus('Treino salvo no estado local da tela, com pendência de sincronização.');
    }

    onCompleteDay(record);
    onSaveSession(session);

    const newDays = [...plan.days];
    newDays[dayIndex] = resetCompletedDay(newDays[dayIndex]);
    onUpdatePlan({ ...plan, days: newDays });
    setStreak(updateWorkoutStreak());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  const startActiveWorkout = (dayIndex: number) => {
    setActiveDayIndex(dayIndex);
  };

  const handleCompleteActiveWorkout = async (completedDay: WorkoutDay) => {
    setActiveDayIndex(null);
    const record = buildWorkoutRecord(plan, completedDay, 45);
    const session = buildSessionFromDay(completedDay, record.durationMinutes);
    const newPRs = extractAndSavePRsFromPlan({
      ...plan,
      days: plan.days.map((item, index) => index === activeDayIndex ? completedDay : item),
    });
    const personalRecords = extractPersonalRecords(plan, completedDay);

    setSaveError('');
    setSaveStatus('Salvando execução...');
    try {
      const result = await persistWorkoutExecution({ record, session, personalRecords });
      setSaveStatus(
        newPRs.length
          ? `Treino ativo salvo em ${dataModeLabel(result.dataMode)}. PR batido em: ${newPRs.join(', ')}.`
          : `Treino ativo salvo em ${dataModeLabel(result.dataMode)}.`
      );
      if (result.warning) setSaveError(result.warning);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível persistir no backend.');
      setSaveStatus('Treino ativo salvo no estado local da tela, com pendência de sincronização.');
    }

    onCompleteDay(record);
    onSaveSession(session);

    const newDays = [...plan.days];
    newDays[activeDayIndex!] = resetCompletedDay(completedDay);
    onUpdatePlan({ ...plan, days: newDays });
    setStreak(updateWorkoutStreak());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeDayIndex !== null) {
    return (
      <ActiveWorkoutView 
        day={plan.days[activeDayIndex]} 
        workoutHistory={workoutHistory}
        onComplete={handleCompleteActiveWorkout}
        onCancel={() => setActiveDayIndex(null)}
        voiceEnabled={voiceEnabled}
      />
    );
  }

  const isDayCompleted = (day: WorkoutDay) => day.exercises.length > 0 && day.exercises.every(e => e.completed);

  const handlePrint = () => {
    window.print();
  };

  const allDaysCompleted = plan.days.every(isDayCompleted);

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `treino_${plan.planName.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadText = () => {
    let text = `${plan.planName}\n${plan.goalDescription}\n\n`;
    plan.days.forEach(day => {
      text += `--- ${day.dayName}: ${day.focus} ---\n`;
      day.exercises.forEach(exc => {
        text += `- ${exc.name}: ${exc.sets} séries | ${exc.reps} reps | Descanso: ${exc.rest}\n`;
      });
      text += '\n';
    });
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `treino_${plan.planName.replace(/\s+/g, '_').toLowerCase()}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <CheckInModule />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter uppercase text-brand-light mb-2 text-shadow-neon">
            {plan.planName}
          </h1>
          <div className="flex items-center text-brand-neon font-medium">
            <Target className="w-5 h-5 mr-3" />
            <p className="max-w-2xl text-sm md:text-base leading-relaxed text-brand-light/90">
              {plan.goalDescription}
            </p>
          </div>
          {(userProfile || profile) && <NutritionModule profile={(userProfile || profile)!} />}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mt-6 md:mt-0 relative print:hidden">
          <button
            onClick={() => startActiveWorkout(0)}
            className="w-full md:w-auto px-5 py-2.5 rounded-full bg-brand-neon text-brand-dark text-xs font-black uppercase tracking-widest border border-brand-neon hover:bg-transparent hover:text-brand-neon transition-colors flex items-center justify-center min-w-[180px]"
          >
            <Play className="w-4 h-4 mr-2 fill-current" /> Treino ativo
          </button>

          <button
            onClick={() => setShowLibrary(true)}
            className="w-full md:w-auto px-5 py-2.5 rounded-full bg-brand-light/5 border border-brand-light/10 text-xs font-bold uppercase tracking-widest text-brand-light hover:bg-brand-light/10 transition-colors flex items-center justify-center min-w-[150px]"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Biblioteca
          </button>

          <button
            onClick={toggleVoiceEnabled}
            className={`w-full md:w-auto px-4 py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center ${voiceEnabled ? 'bg-brand-neon/10 border-brand-neon text-brand-neon' : 'bg-brand-light/5 border-brand-light/10 text-brand-light'}`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
            Voz
          </button>
          
          <div className="relative">
            <button 
              onClick={() => { setShowExport(!showExport); setShowHistory(false); }}
              className="w-full md:w-auto px-5 py-2.5 rounded-full bg-brand-neon/10 border border-brand-neon/50 text-xs font-bold uppercase tracking-widest text-brand-neon hover:bg-brand-neon hover:text-brand-dark transition-colors flex items-center justify-center min-w-[150px]"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </button>
            {showExport && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-brand-gray border border-brand-light/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <button onClick={() => { handlePrint(); setShowExport(false); }} className="w-full text-left px-4 py-3 flex items-center border-b border-brand-light/5 hover:bg-brand-light/5 text-sm font-bold text-brand-light transition-colors">
                  <Printer className="w-4 h-4 mr-2 text-brand-muted" /> Salvar PDF
                </button>
                <button onClick={() => { downloadJSON(); setShowExport(false); }} className="w-full text-left px-4 py-3 flex items-center border-b border-brand-light/5 hover:bg-brand-light/5 text-sm font-bold text-brand-light transition-colors">
                  <FileJson className="w-4 h-4 mr-2 text-brand-muted" /> Exportar JSON
                </button>
                <button onClick={() => { downloadText(); setShowExport(false); }} className="w-full text-left px-4 py-3 flex items-center hover:bg-brand-light/5 text-sm font-bold text-brand-light transition-colors">
                  <FileText className="w-4 h-4 mr-2 text-brand-muted" /> Exportar Texto
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowHistory(!showHistory); setShowExport(false); }}
              className="w-full md:w-auto px-5 py-2.5 rounded-full bg-brand-light/5 border border-brand-light/10 text-xs font-bold uppercase tracking-widest text-brand-light hover:bg-brand-light/10 transition-colors flex items-center justify-between min-w-[180px]"
            >
              <span className="flex items-center"><History className="w-4 h-4 mr-2" /> Histórico ({history.length})</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {showHistory && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-brand-gray border border-brand-light/10 rounded-2xl shadow-2xl overflow-hidden z-50">
               <div className="max-h-60 overflow-y-auto">
                 {history.map(p => (
                   <button 
                     key={p.id} 
                     onClick={() => { onSelectHistory(p.id); setShowHistory(false); }}
                     className={`w-full text-left px-4 py-3 flex flex-col border-b border-brand-light/5 hover:bg-brand-light/5 transition-colors ${p.id === plan.id ? 'bg-brand-neon/10' : ''}`}
                   >
                     <span className="text-sm font-bold text-brand-light truncate">{p.planName}</span>
                     <span className="text-xs text-brand-muted">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                   </button>
                 ))}
               </div>
               <div className="p-2 border-t border-brand-light/10 bg-black/20">
                 <button onClick={() => { onNew(); setShowHistory(false); }} className="w-full py-2 rounded-xl text-xs font-bold text-brand-dark bg-brand-neon hover:bg-brand-neon-hover flex items-center justify-center uppercase">
                   <PlusCircle className="w-4 h-4 mr-2" />
                   Novo Treino
                 </button>
               </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
          <div className="flex items-center gap-2 text-brand-magenta mb-3">
            <Flame className="w-5 h-5" />
            <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Streak</h3>
          </div>
          <div className="font-display text-5xl text-brand-neon text-shadow-neon">{streak.count}</div>
          <p className="font-mono text-xs uppercase text-brand-muted mt-2">
            Último treino: {streak.lastDate ? new Date(streak.lastDate).toLocaleDateString('pt-BR') : 'ainda não registrado'}
          </p>
        </div>

        <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-neon" />
              <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Recuperação</h3>
            </div>
            <span className="font-mono text-sm text-brand-neon">{Math.round(recoveryScore.score)}/100</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-[10px] uppercase font-bold text-brand-muted">
              Sono
              <input
                type="number"
                min={0}
                max={12}
                value={dailyReadiness.sleepHours}
                onChange={event => setDailyReadiness(prev => ({ ...prev, sleepHours: Number(event.target.value) }))}
                className="mt-1 w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-brand-light font-mono outline-none focus:border-brand-neon"
              />
            </label>
            {RECOVERY_FIELDS.map(({ key, label }) => (
              <label key={key} className="text-[10px] uppercase font-bold text-brand-muted">
                {label}: {dailyReadiness[key]}
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={dailyReadiness[key]}
                  onChange={event => setDailyReadiness(prev => ({ ...prev, [key]: Number(event.target.value) }))}
                  className="mt-2 w-full accent-brand-neon"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveReadiness}
              className="bg-brand-light/10 text-brand-light border-2 border-brand-light/20 py-2 font-black uppercase tracking-widest text-xs hover:border-brand-neon hover:text-brand-neon transition-colors"
            >
              Salvar prontidão
            </button>
            <button
              type="button"
              onClick={handleRecoveryAdvice}
              disabled={loadingRecoveryAdvice}
              className="bg-brand-neon text-brand-dark border-brutal py-2 font-black uppercase tracking-widest text-xs disabled:opacity-50"
            >
              Ajustar hoje
            </button>
          </div>
        </div>

        <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-brand-neon" />
            <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Sinais IA</h3>
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div className={`border-l-2 pl-3 ${deloadSuggested ? 'border-brand-magenta text-brand-magenta' : 'border-brand-neon text-brand-light/80'}`}>
              {deloadSuggested ? 'Sinais de fadiga detectados. Considere deload.' : 'Deload não indicado pelos dados atuais.'}
            </div>
            {plateauStatus && (
              <div className={`border-l-2 pl-3 ${plateauStatus.plateau ? 'border-brand-magenta text-brand-magenta' : 'border-brand-neon text-brand-light/80'}`}>
                {chartExerciseName}: {plateauStatus.reason}
              </div>
            )}
            {dailyReadinessScore && (
              <div className="border-l-2 pl-3 border-brand-neon text-brand-light/80">
                Prontidão diária: {dailyReadinessScore.label} ({dailyReadinessScore.score}/100) - risco {overtrainingRisk}
              </div>
            )}
          </div>
        </div>
      </div>

      {(loadingRecoveryAdvice || recoveryAdvice) && (
        <div className="mb-8 bg-brand-dark border-2 border-brand-neon p-5 shadow-brutal-neon whitespace-pre-wrap font-mono text-sm text-brand-light print:hidden">
          {loadingRecoveryAdvice ? 'Gerando ajuste...' : recoveryAdvice}
        </div>
      )}

      {(saveStatus || saveError) && (
        <div className="mb-8 bg-brand-dark border-2 border-brand-neon p-5 shadow-brutal-neon font-mono text-sm print:hidden">
          {saveStatus && <p className="text-brand-neon uppercase tracking-widest">{saveStatus}</p>}
          {saveError && <p className="text-yellow-400 mt-2">{saveError}</p>}
        </div>
      )}

      <div className="mb-8 print:hidden">
        <QuickWorkoutCard onSelect={handleQuickWorkout} />
        {quickWorkoutLoading && (
          <div className="mt-3 bg-brand-dark border-2 border-brand-neon p-4 font-mono text-sm text-brand-neon uppercase tracking-widest">
            Gerando treino rápido...
          </div>
        )}
      </div>

      <div className="mb-12 print:hidden">
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(() => generateAdvancedWorkoutPlan(profile, sessions))}>
            Anamnese avançada
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => adaptWeeklyPlan(plan, sessions))}>
            Adaptação semanal
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => generateLoadProgressionAdvice(plan, sessions))}>
            Progressão de carga
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => predictPlateau(plan, sessions))}>
            Predição de platô
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => generateDeloadAdvice(plan, sessions))}>
            Deload inteligente
          </button>
          <button
            className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors"
            onClick={() => runAiAction(() => {
              const firstExercise = plan.days.flatMap(day => day.exercises)[0]?.name || 'exercício principal';
              return suggestContextualExerciseAlternatives(
                firstExercise,
                profile?.equipment || profile?.gymType || profile?.workoutLocation || '',
                profile?.injuries || ''
              );
            })}
          >
            Substituições
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(() => recommendWeeklyVolume(profile))}>
            Volume semanal
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => adjustWorkoutForAvailableTime(plan, 45))}>
            Ajustar para 45 min
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => adjustWorkoutForRecovery(plan, dailyReadiness))}>
            Ajustar por recuperação
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(async () => JSON.stringify(await generateMacrocycle(profile), null, 2))}>
            Macrociclo anual
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(async () => JSON.stringify(await generateMicrocycles(profile, profile.goal), null, 2))}>
            Microciclos
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(() => suggestAdvancedMethods(profile))}>
            Métodos avançados
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => profile && runAiAction(() => recommendIdealFrequency(profile))}>
            Frequência ideal
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => adjustBySleepAndStress(plan, profile?.sleepHours || String(dailyReadiness.sleepHours), profile?.stressLevel || 'Médio'))}>
            Sono/estresse
          </button>
          <button className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors" onClick={() => runAiAction(() => generateDayVariations(plan, 'Hoje estou cansado, sem muito tempo e com academia cheia.'))}>
            Variações do dia
          </button>
          <button
            className="bg-white/10 border-2 border-brand-light/10 p-3 text-sm text-brand-light font-bold uppercase hover:border-brand-neon transition-colors"
            onClick={() => runAiAction(async () => {
              const session = sessions[sessions.length - 1] || saveCurrentSession(0);
              if (!session) return 'Sem sessão disponível para análise.';
              return JSON.stringify(await generatePremiumPostWorkoutFeedback(session, plan), null, 2);
            })}
          >
            Devolutiva pós-treino
          </button>
        </div>

        <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-2">Painel de IA</h3>
          <div className="text-sm text-brand-light/80 whitespace-pre-wrap font-mono">
            {aiLoading ? 'Analisando...' : aiPanel || (profile ? 'Escolha uma ação acima.' : 'Complete a anamnese para liberar todas as ações de perfil.')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 print:hidden">
        {profile ? <CoachChat profile={profile} plan={plan} sessions={sessions} /> : <ReadinessCard checkin={dailyReadiness} />}
        <WeeklyReportCard plans={history} workoutHistory={workoutHistory} />
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-neon" />
              <span className="font-mono text-xs uppercase tracking-widest text-brand-muted">Histórico de carga</span>
            </div>
            {exerciseOptions.length > 0 && (
              <select
                value={chartExerciseName}
                onChange={event => setSelectedExerciseName(event.target.value)}
                className="bg-brand-gray border-2 border-brand-light/10 text-brand-light text-xs font-mono px-3 py-2 outline-none focus:border-brand-neon max-w-[220px]"
              >
                {exerciseOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </div>
          {chartExerciseName && (
            <ProgressCharts plans={history} workoutHistory={workoutHistory} exerciseName={chartExerciseName} />
          )}
        </div>
        <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-3">Recuperação aplicada</h3>
          <p className="font-mono text-sm text-brand-light/80">
            Estado atual: <span className="text-brand-neon">{recoveryScore.label}</span>. Use o ajuste do dia para reduzir volume, manter progressão ou avançar com prudência.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12 print:hidden">
        <ReadinessCard checkin={dailyReadiness} />
        {profile ? (
          <WeeklyInsightsCard profile={profile} sessions={sessions} />
        ) : (
          <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
            <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-2">Insights da semana</h3>
            <p className="text-brand-muted text-sm font-mono">Complete a anamnese para gerar insights personalizados.</p>
          </div>
        )}
      </div>

      {allDaysCompleted && (
        <div className="mb-12 bg-brand-neon/10 border-2 border-brand-neon p-6 md:p-8 rounded-3xl shadow-brutal-neon flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/10 blur-3xl rounded-full pointer-events-none"></div>
           <div>
             <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter text-brand-light text-shadow-neon mb-2">Semana Concluída!</h2>
             <p className="font-mono text-brand-light/80 text-sm max-w-xl">
               Sua inteligência artificial coletou os dados de carga, repetições e percepção de esforço desta semana. 
               Podemos gerar o próximo microciclo aplicando sobrecarga progressiva, ou uma semana de deload se os dados indicarem fadiga nervosa.
             </p>
           </div>
           <div className="flex flex-col gap-3 shrink-0 relative z-10 w-full md:w-auto">
             <button onClick={() => onNew()} className="px-6 py-3 bg-brand-neon text-brand-dark font-black font-display uppercase tracking-widest text-xl shadow-lg border-2 border-brand-neon hover:bg-white hover:border-white transition-colors">
               Gerar Próxima Semana
             </button>
             <button onClick={() => onNew()} className="px-6 py-3 bg-transparent text-brand-neon font-black font-display uppercase tracking-widest text-lg border-2 border-brand-neon hover:bg-brand-neon/20 transition-colors">
               Forçar Deload
             </button>
           </div>
        </div>
      )}

      {/* Days grid */}
      <div className="space-y-12">
        {plan.days.map((day, dayIndex) => {
          const completed = isDayCompleted(day);
          
          return (
          <div key={dayIndex} className={`bg-brand-gray/50 border-4 p-6 md:p-8 relative ${completed ? 'border-brand-neon' : 'border-brand-light/10'}`}>
            {/* Background numeral */}
            <div className="absolute -top-10 -right-6 font-display text-[150px] leading-none text-brand-light/[0.02] pointer-events-none select-none">
              {(dayIndex + 1).toString().padStart(2, '0')}
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-light/10 pb-6">
                <div>
                  <div className="inline-block bg-brand-magenta text-brand-light px-3 py-1 font-bold uppercase tracking-widest mb-3 border-2 border-brand-magenta shadow-[2px_2px_0px_#fff]">
                    {day.dayName}
                  </div>
                  <h2 className="font-display font-black text-5xl uppercase tracking-tighter text-brand-neon text-shadow-neon">{day.focus}</h2>
                  {day.estimatedDuration && (
                    <p className="mt-2 font-mono text-xs uppercase tracking-widest text-brand-muted">
                      Duração estimada: {day.estimatedDuration}
                    </p>
                  )}
                </div>
                {completed ? (
                  <div className="mt-4 md:mt-0 flex items-center text-brand-neon font-bold uppercase tracking-widest bg-brand-neon/10 px-4 py-2 border-2 border-brand-neon">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Treino Concluído
                  </div>
                ) : (
                  <button 
                    onClick={() => startActiveWorkout(dayIndex)}
                    className="mt-4 md:mt-0 flex items-center justify-center bg-brand-neon text-brand-dark px-6 py-3 font-black uppercase tracking-widest border-2 border-brand-neon hover:bg-transparent hover:text-brand-neon transition-colors shadow-brutal-neon"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" /> Modo Treino Ativo
                  </button>
                )}
              </div>

              {(day.warmup || day.exercises.length > 0) && (
                <div className="mb-6 p-4 bg-orange-500/10 border-2 border-orange-500/20">
                  <p className="text-xs uppercase tracking-widest text-orange-400 mb-1 font-black">
                    {day.warmup ? 'Aquecimento' : 'Aquecimento automático'}
                  </p>
                  <p className="text-sm text-brand-light/80 font-mono">{day.warmup || getAutomaticWarmup(day)}</p>
                </div>
              )}

              {/* Exercises Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {day.exercises.map((exc, excIndex) => {
                  const previousStat = getPreviousExerciseStat(exc.name);
                  const previousData = getPreviousExerciseData(exc.name);
                  const previousPR = getPRForExercise(exc.name);

                  return (
                  <ExerciseCard 
                    key={exc.id || excIndex} 
                    exercise={exc} 
                    history={history}
                    workoutHistory={workoutHistory}
                    userProfile={userProfile || profile || undefined}
                    previousStat={previousStat}
                    previousData={previousData}
                    previousPR={previousPR}
                    onUpdate={(updated) => handleExerciseUpdateWithRest(dayIndex, excIndex, exc, updated)} 
                  />
                )})}
              </div>

              {(day.cooldown || day.exercises.length > 0) && (
                <div className="mt-6 p-4 bg-blue-500/10 border-2 border-blue-500/20">
                  <p className="text-xs uppercase tracking-widest text-blue-400 mb-1 font-black">
                    {day.cooldown ? 'Cooldown' : 'Cooldown e mobilidade recomendados'}
                  </p>
                  <p className="text-sm text-brand-light/80 font-mono">{day.cooldown || getRecommendedCooldown(day)}</p>
                </div>
              )}
              
              {/* Workout Feedback (Appears when day is complete) */}
              {completed && (
                <div className="mt-12 p-6 bg-brand-dark border-4 border-brand-magenta shadow-brutal-magenta">
                  <h3 className="font-display uppercase tracking-widest text-2xl text-brand-light mb-2 flex items-center">
                    🏁 Relatório Pós-Treino
                  </h3>
                  <p className="text-brand-muted text-sm font-mono mb-6">Como foi o treino? Salve os dados para otimizar a próxima sessão.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <label className="block text-xs uppercase font-bold text-brand-light mb-3">Nível de Dificuldade Hoje (1-10)</label>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={day.workoutFeedback?.difficulty || 5}
                        onChange={(e) => handleUpdateDayFeedback(dayIndex, { ...day.workoutFeedback, difficulty: Number(e.target.value) } as WorkoutFeedback)}
                        className="w-full accent-brand-magenta"
                      />
                      <div className="flex justify-between text-[10px] text-brand-muted uppercase font-bold mt-2 font-mono">
                        <span>1 - Fácil</span>
                        <span className="text-brand-magenta text-lg">{day.workoutFeedback?.difficulty || 5}</span>
                        <span>10 - Morte</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs uppercase font-bold text-brand-light mb-3">Resumo em Uma Palavra (ou Emoji)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 🥵 Destruído"
                        value={day.workoutFeedback?.feeling || ''}
                        onChange={(e) => handleUpdateDayFeedback(dayIndex, { ...day.workoutFeedback, feeling: e.target.value } as WorkoutFeedback)}
                        className="w-full bg-brand-gray border-2 border-brand-light/20 p-3 text-brand-light font-mono outline-none focus:border-brand-magenta"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase font-bold text-brand-light mb-3">Comentários Adicionais</label>
                    <textarea 
                      rows={3} 
                      placeholder="Ex: Senti a lombar no Terra, preciso focar na técnica..."
                      value={day.workoutFeedback?.comments || ''}
                      onChange={(e) => handleUpdateDayFeedback(dayIndex, { ...day.workoutFeedback, comments: e.target.value } as WorkoutFeedback)}
                      className="w-full bg-brand-gray border-2 border-brand-light/20 p-3 text-brand-light font-mono outline-none focus:border-brand-magenta resize-none"
                    />
                  </div>
                  
                  <div className="mt-8 flex flex-col md:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const session = saveCurrentSession(dayIndex);
                        setSaveStatus(session ? 'Sessão salva para a IA.' : 'Nenhuma sessão disponível para salvar.');
                        setSaveError('');
                      }}
                      className="px-6 py-4 bg-brand-light/10 text-brand-light font-black font-display uppercase tracking-widest text-lg border-2 border-brand-light/20 hover:border-brand-neon hover:text-brand-neon transition-colors"
                    >
                      SALVAR SESSÃO PARA IA
                    </button>
                    <button 
                      onClick={() => handleFinishWorkout(dayIndex)}
                      className="px-8 py-4 bg-brand-neon text-brand-dark font-black font-display uppercase tracking-widest text-xl shadow-lg border-2 border-brand-neon hover:bg-brand-neon-hover hover:scale-105 transition-transform"
                    >
                      FINALIZAR & SALVAR TREINO
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
      <RestTimer initialSeconds={restSeconds} autoStartKey={timerKey} onVoiceAlert={voiceEnabled} />
      {showLibrary && <ExerciseLibraryModal onClose={() => setShowLibrary(false)} />}
    </div>
  );
}
