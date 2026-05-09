import React, { useState, useMemo } from 'react';
import { WorkoutPlan, Exercise, WorkoutDay, WorkoutFeedback, WorkoutHistoryRecord } from '../types';
import { Target, RotateCcw, PlusCircle, Calendar, History, ChevronDown, Download, Printer, FileJson, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { CheckInModule } from './CheckInModule';
import { NutritionModule } from './NutritionModule';

interface Props {
  plan: WorkoutPlan;
  history: WorkoutPlan[];
  workoutHistory: WorkoutHistoryRecord[];
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onSelectHistory: (id: string) => void;
  onNew: () => void;
  onCompleteDay: (record: WorkoutHistoryRecord) => void;
  userProfile?: any;
}

export function WorkoutDashboard({ plan, history, workoutHistory, onUpdatePlan, onSelectHistory, onNew, onCompleteDay, userProfile }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleUpdateExercise = (dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
    const newDays = [...plan.days];
    newDays[dayIndex].exercises[exerciseIndex] = updatedExercise;
    onUpdatePlan({ ...plan, days: newDays });
  };

  const handleUpdateDayFeedback = (dayIndex: number, feedback: WorkoutFeedback) => {
    const newDays = [...plan.days];
    newDays[dayIndex].workoutFeedback = feedback;
    onUpdatePlan({ ...plan, days: newDays });
  };

  const handleFinishWorkout = (dayIndex: number) => {
    const day = plan.days[dayIndex];
    let volumeLoad = 0;
    day.exercises.forEach(exc => {
      const weight = exc.actualWeight || 0;
      let reps = 0;
      if (exc.actualReps) {
         reps = parseInt(exc.actualReps.replace(/[^0-9]/g, ''), 10) || 0;
      } else {
         reps = parseInt(exc.reps.replace(/[^0-9]/g, ''), 10) || 0;
      }
      volumeLoad += (weight * reps * exc.sets);
    });

    const record: WorkoutHistoryRecord = {
      id: Math.random().toString(36).substring(7),
      date: Date.now(),
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      focus: day.focus,
      volumeLoad,
      durationMinutes: 45, // roughly
      exercises: JSON.parse(JSON.stringify(day.exercises))
    };
    onCompleteDay(record);

    // Reset day for next week
    const newDays = [...plan.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      workoutFeedback: undefined,
      exercises: newDays[dayIndex].exercises.map(e => ({
        ...e,
        completed: false,
        actualWeight: undefined,
        actualReps: undefined,
        feedback: undefined,
        performanceNotes: undefined
      }))
    };
    onUpdatePlan({ ...plan, days: newDays });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('TREINO CONCLUÍDO! XP ADICIONADO! 💪💀');
  };

  const isDayCompleted = (day: WorkoutDay) => day.exercises.length > 0 && day.exercises.every(e => e.completed);

  const handlePrint = () => {
    window.print();
  };

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
          {userProfile && <NutritionModule profile={userProfile} />}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mt-6 md:mt-0 relative print:hidden">
          
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
                </div>
                {completed && (
                  <div className="mt-4 md:mt-0 flex items-center text-brand-neon font-bold uppercase tracking-widest bg-brand-neon/10 px-4 py-2 border-2 border-brand-neon">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Treino Concluído
                  </div>
                )}
              </div>

              {/* Exercises Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {day.exercises.map((exc, excIndex) => {
                  let previousStat = null;
                  for (let i = workoutHistory.length - 1; i >= 0; i--) {
                    const prevRec = workoutHistory[i];
                    const prevExc = prevRec.exercises.find(e => e.name === exc.name);
                    if (prevExc && (prevExc.actualWeight || prevExc.actualReps)) {
                      previousStat = { date: prevRec.date, weight: prevExc.actualWeight, reps: prevExc.actualReps };
                      break;
                    }
                  }

                  return (
                  <ExerciseCard 
                    key={exc.id || excIndex} 
                    exercise={exc} 
                    history={history}
                    workoutHistory={workoutHistory}
                    previousStat={previousStat}
                    onUpdate={(updated) => handleUpdateExercise(dayIndex, excIndex, updated)} 
                  />
                )})}
              </div>
              
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
                  
                  <div className="mt-8 flex justify-end">
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
    </div>
  );
}
