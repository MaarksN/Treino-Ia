import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, WorkoutPlan, UserProfile } from '../types';
import { Dumbbell, Flame, Clock, CheckCircle, Edit2, Save, X, ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, Smile, Play, Pause, RotateCcw, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { suggestExerciseVariations } from '../services/geminiService';

interface Props {
  exercise: Exercise;
  history?: WorkoutPlan[];
  userProfile?: UserProfile;
  onUpdate: (updated: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, history, userProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(exercise);
  
  // Variations State
  const [showVariations, setShowVariations] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  
  // Timer State
  const [timerMode, setTimerMode] = useState<'idle' | 'work' | 'rest'>('idle');
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerMode !== 'idle') {
      interval = setInterval(() => {
        setTime(prev => {
          if (timerMode === 'rest' && prev <= 1) {
            setTimerMode('work');
            return 0;
          }
          return timerMode === 'rest' ? prev - 1 : prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerMode]);

  const toggleTimer = () => {
    if (timerMode === 'work') {
      // Start rest Mode
      setTimerMode('rest');
      const restSeconds = parseInt(exercise.rest) || 60;
      setTime(restSeconds);
    } else if (timerMode === 'rest') {
      // Resume work mode
      setTimerMode('work');
      setTime(0);
    } else {
      // Start work mode from idle
      setTimerMode('work');
      setTime(0);
    }
  };

  const resetTimer = () => {
    setTimerMode('idle');
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onUpdate({ ...exercise, ...editForm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(exercise);
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdate({ ...exercise, completed: !exercise.completed });
  };

  const updateFeedback = (feedback: Exercise['feedback']) => {
    onUpdate({ ...exercise, feedback: exercise.feedback === feedback ? null : feedback });
  };

  const fetchVariations = async () => {
    if (showVariations) {
      setShowVariations(false);
      return;
    }
    setShowVariations(true);
    if (variations.length > 0) return;
    
    setLoadingVariations(true);
    try {
      const res = await suggestExerciseVariations(exercise.name, userProfile);
      setVariations(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVariations(false);
    }
  };

  const FeedbackButton = ({ type, icon: Icon, label, activeColor }: { type: Exercise['feedback'], icon: any, label: string, activeColor: string }) => {
    const isActive = exercise.feedback === type;
    return (
      <button 
        onClick={() => updateFeedback(type)}
        title={label}
        className={`p-2 border-2 border-transparent transition-all ${isActive ? activeColor + ' bg-brand-light/10 border-brutal-neon shadow-brutal-neon' : 'text-brand-muted hover:bg-brand-light/5 border-brand-light/10'}`}
      >
        <Icon className="w-5 h-5 mx-auto mb-1" />
        <span className="text-[10px] uppercase font-bold block">{label}</span>
      </button>
    );
  };

  const chartData = useMemo(() => {
    if (!history) return [];
    const data: any[] = [];
    const chronologicalHistory = [...history].reverse();
    
    chronologicalHistory.forEach(plan => {
      plan.days.forEach(day => {
        const pastExc = day.exercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase() && e.actualWeight);
        if (pastExc) {
          data.push({
            date: new Date(plan.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            weight: pastExc.actualWeight,
          });
        }
      });
    });
    return data;
  }, [history, exercise.name]);

  if (isEditing) {
    return (
      <div className="bg-brand-gray border-brutal-neon p-5 relative shadow-brutal-neon">
        <h4 className="text-xs uppercase tracking-wider text-brand-neon font-bold mb-4 font-display">Editar Exercício</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Nome do Exercício</label>
            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-brand-dark px-3 py-2 text-sm border-2 border-brand-light/10 focus:border-brand-neon outline-none font-mono" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Séries</label>
              <input type="number" value={editForm.sets} onChange={e => setEditForm({...editForm, sets: Number(e.target.value)})} className="w-full bg-brand-dark px-3 py-2 text-sm border-2 border-brand-light/10 focus:border-brand-neon outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Reps</label>
              <input value={editForm.reps} onChange={e => setEditForm({...editForm, reps: e.target.value})} className="w-full bg-brand-dark px-3 py-2 text-sm border-2 border-brand-light/10 focus:border-brand-neon outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Descanso(s)</label>
              <input value={editForm.rest} onChange={e => setEditForm({...editForm, rest: e.target.value})} className="w-full bg-brand-dark px-3 py-2 text-sm border-2 border-brand-light/10 focus:border-brand-neon outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Observações (opcional)</label>
            <input value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-brand-dark px-3 py-2 text-sm border-2 border-brand-light/10 focus:border-brand-neon outline-none font-mono" />
          </div>
          <div className="flex space-x-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-brand-neon text-brand-dark py-2 border-brutal text-sm font-bold flex items-center justify-center uppercase">
              <Save className="w-4 h-4 mr-2" /> Salvar
            </button>
            <button onClick={handleCancel} className="flex-1 bg-brand-light/10 text-brand-light py-2 border-2 border-brand-light/20 text-sm font-bold flex items-center justify-center hover:bg-brand-light/20 uppercase">
              <X className="w-4 h-4 mr-2" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      initial={false}
      animate={{ 
        borderColor: exercise.completed ? '#ccff00' : 'rgba(255,255,255,0.2)',
        backgroundColor: exercise.completed ? 'rgba(204,255,0,0.02)' : 'var(--color-brand-dark)',
      }}
      transition={{ duration: 0.3 }}
      className={`p-5 flex flex-col justify-between group border-2 ${exercise.completed ? 'shadow-brutal-neon border-brand-neon' : 'shadow-brutal-light border-brand-light/20'}`}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display font-black text-2xl uppercase tracking-tight max-w-[75%] leading-tight text-brand-light">{exercise.name}</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-brand-muted hover:text-brand-magenta transition-colors" title="Editar Exercício">
              <Edit2 className="w-5 h-5" />
            </button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleComplete} 
              className={`p-1.5 transition-all border-2 ${exercise.completed ? 'bg-brand-neon text-brand-dark border-brand-dark' : 'bg-transparent text-brand-muted border-brand-light/20 hover:border-brand-neon hover:text-brand-neon'}`}
              title={exercise.completed ? 'Desmarcar' : 'Marcar como concluído'}
            >
              <CheckCircle className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
        {exercise.notes && (
          <p className="text-sm text-brand-muted mt-2 leading-relaxed bg-brand-gray/50 p-2 border-l-4 border-brand-neon">
            <span className="text-brand-neon font-bold mr-1">⚡</span> 
            {exercise.notes}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-brand-gray p-2 md:p-3 border-2 border-brand-light/10 group-hover:border-brand-light/30 transition-colors">
          <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1 flex items-center">
            <Dumbbell className="w-3 h-3 mr-1 text-brand-neon" /> Séries
          </p>
          <p className="font-mono font-bold text-lg md:text-xl text-brand-light">{exercise.sets}</p>
        </div>
        <div className="bg-brand-gray p-2 md:p-3 border-2 border-brand-light/10 group-hover:border-brand-light/30 transition-colors">
          <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1 flex items-center">
            <Flame className="w-3 h-3 mr-1 text-brand-magenta" /> Reps
          </p>
          <p className="font-mono font-bold text-lg md:text-xl text-brand-light">{exercise.reps}</p>
        </div>
        <div className="col-span-2 bg-brand-gray p-2 md:p-3 border-2 border-brand-neon/30 flex items-center justify-between">
          <div>
             <p className="text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1 flex items-center">
               <Clock className="w-3 h-3 mr-1 text-brand-neon" /> Cronômetro
             </p>
             <p className={`font-mono font-bold text-xl ${timerMode === 'rest' ? 'text-brand-magenta animate-pulse' : 'text-brand-neon'}`}>
               {timerMode === 'idle' ? `${exercise.rest}s REST` : formatTime(time)}
             </p>
          </div>
          <div className="flex space-x-2">
            <button onClick={toggleTimer} className={`p-2 rounded-none border-2 border-brand-neon text-brand-neon hover:bg-brand-neon hover:text-brand-dark transition-colors`}>
               {timerMode === 'idle' || timerMode === 'rest' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={resetTimer} className="p-2 border-2 border-brand-light/20 text-brand-light hover:bg-brand-light/10 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {(exercise.executionDetails || exercise.concentricPhase || exercise.eccentricPhase) && (
        <div className="mb-4 bg-brand-gray/30 border-2 border-brand-light/10 p-4 space-y-3">
          {exercise.executionDetails && (
            <div>
              <h5 className="font-display uppercase text-brand-neon text-sm tracking-wider mb-1">🔥 Execução:</h5>
              <p className="text-xs text-brand-light leading-relaxed">{exercise.executionDetails}</p>
            </div>
          )}
          {(exercise.concentricPhase || exercise.eccentricPhase) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-brand-light/10">
              {exercise.concentricPhase && (
                 <div>
                   <h5 className="font-display uppercase text-brand-magenta text-sm tracking-wider mb-1">💪 Fase Concêntrica:</h5>
                   <p className="text-[10px] text-brand-muted leading-relaxed">{exercise.concentricPhase}</p>
                 </div>
              )}
              {exercise.eccentricPhase && (
                 <div>
                   <h5 className="font-display uppercase text-brand-neon text-sm tracking-wider mb-1">🛡️ Fase Excêntrica:</h5>
                   <p className="text-[10px] text-brand-muted leading-relaxed">{exercise.eccentricPhase}</p>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {exercise.completed && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t-2 border-brand-neon mt-auto overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-bold text-brand-muted tracking-wider">
            <span>Progresso Real</span>
            <TrendingUp className="w-3 h-3 text-brand-neon" />
          </div>
          
          {chartData.length > 1 && (
            <div className="mb-4 h-24 w-full relative group">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#ccff00', borderRadius: '0px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    itemStyle={{ color: '#ccff00' }}
                    labelStyle={{ color: '#fff', marginBottom: '4px' }}
                  />
                  <Line type="stepAfter" dataKey="weight" stroke="#ccff00" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#ccff00', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Carga Real (kg)</label>
              <input 
                type="number" 
                placeholder="Ex: 20" 
                value={exercise.actualWeight || ''}
                onChange={e => onUpdate({ ...exercise, actualWeight: Number(e.target.value) })}
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-3 py-2 text-sm font-mono text-brand-neon outline-none focus:border-brand-neon focus:shadow-brutal-neon transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-brand-muted mb-1 font-bold">Reps Reais</label>
              <input 
                type="text" 
                placeholder="Ex: 10,10,8" 
                value={exercise.actualReps || ''}
                onChange={e => onUpdate({ ...exercise, actualReps: e.target.value })}
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-3 py-2 text-sm font-mono text-brand-light outline-none focus:border-brand-neon focus:shadow-brutal-neon transition-all"
              />
            </div>
          </div>

          <div className="mb-4">
             <label className="block text-[10px] text-brand-muted mb-1 uppercase font-bold">Como foi o exercício?</label>
             <div className="flex justify-between gap-2">
               <FeedbackButton type="easy" icon={Smile} label="Fácil" activeColor="text-brand-neon" />
               <FeedbackButton type="good" icon={ThumbsUp} label="Ideal" activeColor="text-brand-light" />
               <FeedbackButton type="hard" icon={ThumbsDown} label="Difícil" activeColor="text-brand-magenta" />
               <FeedbackButton type="painful" icon={AlertTriangle} label="Dor" activeColor="text-red-500" />
             </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-brand-light/10">
            <button 
              onClick={fetchVariations}
              className="w-full flex items-center justify-between px-4 py-3 bg-brand-neon/5 border-2 border-brand-neon/50 text-brand-neon hover:bg-brand-neon/10 transition-colors uppercase font-bold text-xs"
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" /> 
                Sugestões da IA (Variações)
              </div>
              {showVariations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {showVariations && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {loadingVariations ? (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-light/20 animate-pulse">
                        <Zap className="w-8 h-8 text-brand-neon mb-2" />
                        <p className="text-xs uppercase font-mono text-brand-muted">Conectando à Forja Neural...</p>
                      </div>
                    ) : variations.length > 0 ? (
                      variations.map((v, i) => (
                        <div key={i} className="bg-brand-dark border-l-4 border-brand-neon p-3 flex flex-col group">
                           <div className="flex items-start justify-between mb-1">
                             <h6 className="font-bold text-sm text-brand-light leading-tight">{v.name}</h6>
                             <span className={`text-[9px] uppercase font-bold px-2 py-0.5 ml-2 whitespace-nowrap ${v.difficulty === 'Easier' ? 'bg-brand-light/10 text-brand-light' : v.difficulty === 'Harder' ? 'bg-brand-magenta/20 text-brand-magenta' : 'bg-brand-neon/20 text-brand-neon'}`}>
                               {v.difficulty === 'Easier' ? 'Regressão' : v.difficulty === 'Harder' ? 'Progressão' : 'Alternativa'}
                             </span>
                           </div>
                           <p className="text-xs text-brand-muted mt-1 leading-relaxed">{v.description}</p>
                           
                           <button 
                             onClick={() => {
                               onUpdate({ ...exercise, name: v.name, executionDetails: v.description });
                               setShowVariations(false);
                             }}
                             className="mt-3 text-xs uppercase font-bold bg-brand-neon/10 text-brand-neon hover:bg-brand-neon hover:text-brand-dark py-1.5 transition-colors opacity-0 group-hover:opacity-100"
                           >
                             Trocar Exercício Atual
                           </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-brand-muted text-center py-4">Nenhuma variação encontrada.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
