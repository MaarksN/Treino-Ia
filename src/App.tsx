import React, { useState, useEffect } from 'react';
import { AnamnesisForm } from './components/AnamnesisForm';
import { WorkoutDashboard } from './components/WorkoutDashboard';
import { RegistrationForm } from './components/RegistrationForm';
import { HomeMenu } from './components/HomeMenu';
import { ImportWorkoutView } from './components/ImportWorkoutView';
import { generateWorkoutPlan, extractWorkoutFromFile } from './services/geminiService';
import { User, UserProfile, WorkoutPlan } from './types';
import { Activity, Dumbbell, Globe2, Moon, Sun } from 'lucide-react';

type ViewState = 'loading' | 'registration' | 'home' | 'anamnesis' | 'import' | 'dashboard';

import { AssistantPopup } from './components/AssistantPopup';

import { GlobalFeed } from './components/GlobalFeed';
import { MusicPlayer } from './components/MusicPlayer';
import { CheckInModule } from './components/CheckInModule';
import { FuturisticHUD } from './components/FuturisticHUD';
import { AICoachChat } from './components/AICoachChat';
import { BotMessageSquare } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryRecord[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoachChat, setShowCoachChat] = useState(false);

  // For tab navigation when a user is logged in
  const [activeTab, setActiveTab] = useState<'my_workouts' | 'global_feed'>('my_workouts');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('@TreinoApp:theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem('@TreinoApp:user');
    const savedPlans = localStorage.getItem('@TreinoApp:plans');
    const savedHistory = localStorage.getItem('@TreinoApp:history');
    const savedTheme = localStorage.getItem('@TreinoApp:theme');

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    if (savedHistory) {
      setWorkoutHistory(JSON.parse(savedHistory));
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
            setCurrentPlanId(parsed[0].id);
            setView('dashboard');
            return;
          }
        } catch (e) {
          console.error("Failed to restore plans");
        }
      }
      setView('home');
    } else {
      setView('registration');
    }
  }, []);

  const handleRegister = (newUser: User) => {
    localStorage.setItem('@TreinoApp:user', JSON.stringify(newUser));
    setUser(newUser);
    
    // Attempt to request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (newUser.profile && plans.length > 0) {
      setView('dashboard');
    } else {
      setView('home');
    }
  };

  const saveNewPlan = (generatedPlan: WorkoutPlan) => {
    const newPlans = [generatedPlan, ...plans];
    setPlans(newPlans);
    setCurrentPlanId(generatedPlan.id);
    localStorage.setItem('@TreinoApp:plans', JSON.stringify(newPlans));
    setView('dashboard');
  };

  const handleAnamnesisSubmit = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateWorkoutPlan(profile, plans);
      saveNewPlan(generatedPlan);
      
      if (user) {
         const updatedUser = { ...user, profile };
         setUser(updatedUser);
         localStorage.setItem('@TreinoApp:user', JSON.stringify(updatedUser));
         
         if ('Notification' in window && Notification.permission === 'default') {
           Notification.requestPermission().catch(() => {});
         } else if ('Notification' in window && Notification.permission === 'granted' && profile.preferredTime) {
           new Notification('Treino IA Gerado', {
             body: `Lembrete diário configurado para as ${profile.preferredTime}.`,
             icon: '/vite.svg'
           });
         }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWorkout = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const importedPlan = await extractWorkoutFromFile(base64, mimeType);
      saveNewPlan(importedPlan);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar. A imagem ou PDF estava legível?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(newPlans);
    localStorage.setItem('@TreinoApp:plans', JSON.stringify(newPlans));
  };

  const handleCompleteDay = (record: WorkoutHistoryRecord) => {
    const newHistory = [...workoutHistory, record];
    setWorkoutHistory(newHistory);
    localStorage.setItem('@TreinoApp:history', JSON.stringify(newHistory));
    
    if (user) {
      const g = user.gamification || { xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, badges: [] };
      const newXp = g.xp + 150 + record.exercises.length * 10;
      const today = new Date().setHours(0,0,0,0);
      let newStreak = g.currentStreak;
      
      if (g.lastWorkoutDate) {
         const diff = today - new Date(g.lastWorkoutDate).setHours(0,0,0,0);
         if (diff === 86400000) newStreak += 1; // 1 day
         else if (diff > 86400000) newStreak = 1; // Reset
      } else {
         newStreak = 1;
      }
      const updatedUser = { 
        ...user, 
        gamification: {
          ...g,
          xp: newXp,
          level: Math.floor(newXp / 1000) + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(g.longestStreak, newStreak),
          lastWorkoutDate: Date.now()
        } 
      };
      handleRegister(updatedUser);
    }
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-brand-neon rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 border-4 border-brand-magenta rounded-full animate-spin border-t-transparent"></div>
          <Dumbbell className="w-16 h-16 text-brand-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h2 className="font-display font-black text-6xl uppercase tracking-widest text-brand-light mb-2 text-shadow-neon">Inicializando</h2>
        <p className="text-brand-magenta font-mono font-bold uppercase tracking-widest animate-pulse">Carregando dados da forja...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans antialiased py-8 md:py-12 px-4 selection:bg-brand-neon selection:text-brand-dark transition-colors duration-500">
      
      {/* Header & Navbar */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-20">
        <div 
          onClick={() => { if(user) setView(plans.length > 0 ? 'dashboard' : 'home'); }}
          className={`flex items-center gap-3 transition-transform hover:scale-105 ${user ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="bg-brand-neon text-brand-dark p-2 rounded-2xl shadow-brutal-neon animate-pulse-glow">
            <Dumbbell className="w-8 h-8" />
          </div>
          <span className="font-display font-black text-4xl uppercase tracking-widest leading-none mt-1">TREINO<br/><span className="text-brand-neon text-shadow-neon">BRUTAL</span></span>
        </div>

        {user && view !== 'registration' && (
          <div className="flex items-center gap-4 bg-brand-gray border-2 border-brand-light/20 p-2 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            
            <div className="flex items-center gap-2 border-r-2 border-brand-light/20 pr-4">
               <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-brand-muted hover:text-brand-neon transition-colors" title="Toggle Theme">
                 {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <button onClick={() => setLanguage(l => l === 'PT' ? 'EN' : 'PT')} className="font-bold font-mono text-sm uppercase text-brand-muted hover:text-brand-neon transition-colors flex items-center">
                 <Globe2 className="w-4 h-4 mr-1" /> {language}
               </button>
            </div>

            <button 
              onClick={() => { setActiveTab('my_workouts'); setView(plans.length > 0 ? 'dashboard' : 'home'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${activeTab === 'my_workouts' && view !== 'global_feed' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Dumbbell className="w-4 h-4 mr-2" /> Meus Treinos
            </button>
            <button 
              onClick={() => { setActiveTab('global_feed'); setView('global_feed' as any); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'global_feed' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Globe2 className="w-4 h-4 mr-2" /> Comunidade
            </button>
            <div className="ml-2 pl-2 border-l-2 border-brand-light/20 flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-brand-neon object-cover shadow-[0_0_10px_var(--color-brand-neon)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-neon text-brand-dark flex items-center justify-center font-bold font-display text-xl uppercase shadow-[0_0_10px_var(--color-brand-neon)]">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {user && view !== 'registration' && view !== 'loading' && (
        <div className="max-w-5xl mx-auto">
          <FuturisticHUD user={user} />
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-brand-magenta text-brand-light border-4 border-brand-light p-4 flex items-center shadow-brutal-light font-mono font-bold">
          <Activity className="w-6 h-6 mr-4 shrink-0" />
          <p className="text-sm uppercase tracking-widest">{error}</p>
        </div>
      )}

      {view === 'registration' && (
        <RegistrationForm onRegister={handleRegister} />
      )}

      {view === 'home' && user && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          {plans.length > 0 && (
             <button onClick={() => setView('dashboard')} className="absolute -top-12 left-0 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar ao Treino Atual</button>
          )}
          <HomeMenu 
            user={user} 
            onCreateNew={() => setView('anamnesis')} 
            onImport={() => setView('import')} 
            onUpdateUser={handleRegister}
          />
        </div>
      )}

      {view === 'anamnesis' && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          <button onClick={() => setView(plans.length > 0 ? 'dashboard' : 'home')} className="absolute -top-10 left-4 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar</button>
          <AnamnesisForm onSubmit={handleAnamnesisSubmit} isLoading={isLoading} />
        </div>
      )}

      {view === 'import' && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          <button onClick={() => setView(plans.length > 0 ? 'dashboard' : 'home')} className="absolute -top-10 left-4 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar</button>
          <ImportWorkoutView 
            onImport={handleImportWorkout} 
            onCancel={() => setView(plans.length > 0 ? 'dashboard' : 'home')} 
            isLoading={isLoading} 
          />
        </div>
      )}

      {view === 'dashboard' && currentPlanId && (
        <WorkoutDashboard 
          plan={plans.find(p => p.id === currentPlanId)!} 
          history={plans}
          workoutHistory={workoutHistory}
          userProfile={user?.profile}
          onUpdatePlan={handleUpdatePlan}
          onSelectHistory={(id) => setCurrentPlanId(id)}
          onNew={() => setView('home')} 
          onCompleteDay={handleCompleteDay}
        />
      )}

      {view === 'global_feed' && (
        <GlobalFeed />
      )}

      <MusicPlayer />
      <AssistantPopup />
      
      {user && view === 'dashboard' && (
        <>
           {!showCoachChat && (
             <button 
               onClick={() => setShowCoachChat(true)}
               className="fixed bottom-6 left-6 bg-brand-neon text-brand-dark p-4 rounded-full shadow-brutal-neon border-brutal hover:scale-110 transition-transform z-40 flex items-center group"
             >
               <BotMessageSquare className="w-6 h-6" />
             </button>
           )}
           {showCoachChat && (
             <AICoachChat user={user} onClose={() => setShowCoachChat(false)} />
           )}
        </>
      )}
    </div>
  );
}

