import React, { useEffect, useRef, useState } from 'react';
import { WorkoutDay, Exercise, WorkoutHistoryRecord } from '../types';
import { X, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  day: WorkoutDay;
  workoutHistory: WorkoutHistoryRecord[];
  onComplete: (completedDay: WorkoutDay) => void;
  onCancel: () => void;
}

function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function ActiveWorkoutView({ day, workoutHistory, onComplete, onCancel }: Props) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>(JSON.parse(JSON.stringify(day.exercises)));
  const spokenExerciseRef = useRef<string | null>(null);

  const currentExercise = activeExercises[currentExerciseIndex];

  useEffect(() => {
    if (!currentExercise || isResting) return;

    const spokenKey = `${currentExercise.id}-${currentExerciseIndex}`;
    if (spokenExerciseRef.current === spokenKey) return;

    spokenExerciseRef.current = spokenKey;
    speakText(`Próximo exercício: ${currentExercise.name}. ${currentExercise.sets} séries de ${currentExercise.reps}. Descanso de ${currentExercise.rest}.`);
  }, [currentExercise, currentExerciseIndex, isResting]);

  // Attempt to map previous status
  let prevWeight = '-';
  let prevReps = '-';
  const prevRecs = [...workoutHistory].sort((a, b) => b.date - a.date);
  for (const pr of prevRecs) {
    const pExc = pr.exercises.find(e => e.name === currentExercise?.name);
    if (pExc && (pExc.actualWeight || pExc.actualReps)) {
      if (pExc.actualWeight) prevWeight = pExc.actualWeight.toString();
      if (pExc.actualReps) prevReps = pExc.actualReps.toString();
      break;
    }
  }

  useEffect(() => {
    let interval: any;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(v => v - 1);
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
      try {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const handleNextExercise = () => {
    const newExs = [...activeExercises];
    newExs[currentExerciseIndex].completed = true;
    setActiveExercises(newExs);

    if (currentExerciseIndex < activeExercises.length - 1) {
      setCurrentExerciseIndex(v => v + 1);
      const nextEx = newExs[currentExerciseIndex + 1];
      const restSec = parseInt(currentExercise.rest.replace(/[^0-9]/g, '')) || 60;
      setRestTimeLeft(restSec);
      setIsResting(true);
    } else {
      onComplete({ ...day, exercises: newExs });
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const updateCurrentData = (field: 'actualWeight' | 'actualReps' | 'rpe', value: string) => {
    const newExs = [...activeExercises];
    if (field === 'actualWeight') {
       newExs[currentExerciseIndex].actualWeight = Number(value);
    } else if (field === 'rpe') {
       newExs[currentExerciseIndex].rpe = Number(value) || undefined;
    } else {
       newExs[currentExerciseIndex].actualReps = value;
    }
    setActiveExercises(newExs);
  };

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans text-white overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center">
           <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
             <X className="w-6 h-6" />
           </button>
           <div>
             <h2 className="text-sm text-brand-neon uppercase tracking-widest font-bold">TREINO ATIVO</h2>
             <p className="font-display text-2xl uppercase tracking-tighter">{day.dayName}: {day.focus}</p>
           </div>
        </div>
        <div className="font-mono text-sm opacity-50">
           {currentExerciseIndex + 1} / {activeExercises.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!isResting ? (
            <motion.div 
              key={`ex-${currentExercise.id}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-2xl text-center"
            >
               <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter mb-4 text-shadow-neon text-brand-neon">
                 {currentExercise.name}
               </h1>
               
               <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest opacity-50 mb-1">Séries</span>
                    <span className="text-3xl font-black font-mono">{currentExercise.sets}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest opacity-50 mb-1">Reps</span>
                    <span className="text-3xl font-black font-mono">{currentExercise.reps}</span>
                  </div>
               </div>

               {/* Logging inputs */}
               <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8 max-w-sm mx-auto shadow-2xl">
                 <p className="text-xs uppercase tracking-widest text-brand-magenta font-bold mb-4">Meta a Bater (Última vez: {prevWeight}kg x {prevReps})</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-[10px] uppercase opacity-50 mb-1 font-bold tracking-widest">Carga (kg)</label>
                     <input 
                       type="number" 
                       value={currentExercise.actualWeight || ''}
                       onChange={e => updateCurrentData('actualWeight', e.target.value)}
                       className="w-full bg-black/50 border border-white/20 p-4 text-center font-mono text-xl rounded-xl focus:border-brand-neon outline-none transition-colors"
                       placeholder={prevWeight}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase opacity-50 mb-1 font-bold tracking-widest">Reps Feitas</label>
                     <input 
                       type="text" 
                       value={currentExercise.actualReps || ''}
                       onChange={e => updateCurrentData('actualReps', e.target.value)}
                       className="w-full bg-black/50 border border-white/20 p-4 text-center font-mono text-xl rounded-xl focus:border-brand-neon outline-none transition-colors"
                       placeholder={currentExercise.reps}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase opacity-50 mb-1 font-bold tracking-widest">RPE</label>
                     <input 
                       type="number"
                       min={1}
                       max={10}
                       value={currentExercise.rpe || ''}
                       onChange={e => updateCurrentData('rpe', e.target.value)}
                       className="w-full bg-black/50 border border-white/20 p-4 text-center font-mono text-xl rounded-xl focus:border-brand-magenta outline-none transition-colors"
                       placeholder="8"
                     />
                   </div>
                 </div>
               </div>
               
               {currentExercise.executionDetails && (
                 <p className="text-sm font-mono opacity-60 mb-6 max-w-md mx-auto">{currentExercise.executionDetails}</p>
               )}
               
               <div className="mb-8">
                 <AnimatePresence>
                   {showCamera ? (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-brand-neon relative bg-black"
                     >
                       <div className="absolute top-2 left-2 px-2 py-1 bg-brand-magenta text-white font-bold font-mono text-[10px] uppercase tracking-widest z-10 animate-pulse">
                         REC - AVALIAÇÃO IA
                       </div>
                       <button onClick={() => setShowCamera(false)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full z-10 text-white hover:text-brand-magenta">
                         <X className="w-5 h-5" />
                       </button>
                       <div className="relative aspect-[3/4] w-full flex items-center justify-center border-b-2 border-brand-neon/30">
                         {/* Fake camera feed background */}
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                         {/* "Pose" skeleton lines */}
                         <div className="absolute inset-x-12 top-1/4 bottom-1/3 border-2 border-brand-neon/50 rounded-lg"></div>
                         <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-brand-neon rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_var(--color-brand-neon)]"></div>
                         
                         <div className="flex flex-col items-center justify-center text-brand-light z-10 relative mt-20">
                           <Camera className="w-12 h-12 text-brand-neon mb-2 animate-pulse" />
                           <p className="font-mono text-xs uppercase tracking-widest text-brand-neon font-bold text-center bg-black/50 p-2 rounded">Escaneando Músculo-Alvo...<br/>Alinhamento: 92%</p>
                         </div>
                       </div>
                     </motion.div>
                   ) : (
                     <button 
                       onClick={() => setShowCamera(true)}
                       className="flex items-center justify-center w-full max-w-sm mx-auto bg-brand-dark border-2 border-brand-neon text-brand-neon py-3 rounded-2xl hover:bg-brand-neon hover:text-black transition-colors font-bold uppercase tracking-widest text-sm relative group overflow-hidden"
                     >
                       <span className="absolute inset-0 w-full h-full bg-brand-neon/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                       <Camera className="w-5 h-5 mr-2" /> Ativar Câmera Neural (Postura IA)
                     </button>
                   )}
                 </AnimatePresence>
               </div>

               <button 
                 onClick={handleNextExercise}
                 className="w-full max-w-sm mx-auto bg-brand-neon text-black font-black font-display uppercase tracking-widest text-2xl py-6 rounded-3xl shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:scale-105 transition-transform flex items-center justify-center border-4 border-black ring-2 ring-brand-neon"
               >
                 {currentExerciseIndex === activeExercises.length - 1 ? 'FINALIZAR TREINO' : 'PRÓXIMO'} <ChevronRight className="w-8 h-8 ml-2" />
               </button>
            </motion.div>
          ) : (
            <motion.div 
              key={`rest-${currentExercise.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
               <h3 className="font-display uppercase tracking-widest text-4xl mb-8 text-brand-magenta">Descanso</h3>
               <div className="relative flex items-center justify-center w-64 h-64 mx-auto mb-12">
                 <div className="absolute inset-0 border-8 border-brand-magenta/20 rounded-full"></div>
                 <div className="absolute inset-0 border-8 border-brand-magenta rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
                 <span className="font-display text-8xl tabular-nums tracking-tighter text-shadow-magenta">
                   {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
                 </span>
               </div>
               
               <p className="text-sm font-mono uppercase opacity-50 tracking-widest mb-4">Próximo:</p>
               <h2 className="text-2xl font-black font-display uppercase text-brand-neon mb-12">
                 {activeExercises[currentExerciseIndex].name}
               </h2>

               <button 
                 onClick={handleSkipRest}
                 className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full font-bold uppercase tracking-widest transition-colors font-mono"
               >
                 Pular Descanso
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
