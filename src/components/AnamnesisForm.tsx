import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Activity, Dumbbell, User, Target, CalendarDays, AlertTriangle } from 'lucide-react';

interface Props {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export function AnamnesisForm({ onSubmit, isLoading }: Props) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('@TreinoApp:draftProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      age: 25,
      gender: 'Masculino',
      weight: 70,
      height: 175,
      experienceLevel: 'Iniciante',
      goal: 'Hipertrofia (Ganho de Massa)',
      daysPerWeek: 3,
      injuries: '',
      timePerWorkout: 60,
      workoutLocation: 'Academia',
      secondaryFocus: '',
      preferredTime: '07:00'
    };
  });

  React.useEffect(() => {
    localStorage.setItem('@TreinoApp:draftProfile', JSON.stringify(profile));
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem('@TreinoApp:draftProfile');
    onSubmit(profile);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 mt-8 mb-12 bg-brand-gray border-4 border-brand-neon shadow-[8px_8px_0px_var(--color-brand-neon)] relative overflow-hidden group">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-neon/10 blur-3xl rounded-full pointer-events-none transition-colors group-hover:bg-brand-neon/20"></div>
      
      <div className="mb-10 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-neon text-brand-dark mb-6 border-brutal transition-transform hover:scale-105 shadow-[4px_4px_0px_#fff]">
          <Dumbbell className="w-12 h-12" />
        </div>
        <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter uppercase mb-2 text-brand-light text-shadow-neon">Mapeamento Inicial</h1>
        <p className="text-brand-magenta font-mono font-bold text-lg uppercase tracking-widest">Responda para a forja neural montar seu treino perfeito.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-brand-gray border-4 border-brand-neon p-6 md:p-10 shadow-brutal-neon">
        
        {/* Personal Info */}
        <div className="space-y-4">
          <h2 className="flex items-center text-2xl font-black uppercase tracking-widest text-brand-neon text-shadow-neon">
            <User className="w-6 h-6 mr-3" />
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Idade</label>
              <input 
                type="number" 
                name="age" 
                value={profile.age} 
                onChange={handleChange} 
                min="14" max="100" required
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Sexo</label>
              <select 
                name="gender" 
                value={profile.gender} 
                onChange={handleChange}
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Peso (kg)</label>
              <input 
                type="number" 
                name="weight" 
                value={profile.weight} 
                onChange={handleChange} 
                step="0.1" min="30" max="250" required
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Altura (cm)</label>
              <input 
                type="number" 
                name="height" 
                value={profile.height} 
                onChange={handleChange} 
                min="100" max="250" required
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Experience & Goal */}
        <div className="space-y-4 pt-6 border-t-2 border-brand-light/10">
          <h2 className="flex items-center text-2xl font-black uppercase tracking-widest text-brand-neon text-shadow-neon">
            <Target className="w-6 h-6 mr-3" />
            Objetivo e Nível
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Nível de Experiência</label>
              <div className="grid grid-cols-3 gap-2">
                {['Iniciante', 'Intermediário', 'Avançado'].map(level => (
                  <label key={level} className={`cursor-pointer border-2 py-4 text-center text-xs font-bold uppercase tracking-widest transition-colors ${profile.experienceLevel === level ? 'bg-brand-neon border-brand-neon text-brand-dark shadow-brutal-neon' : 'bg-brand-dark border-brand-light/20 text-brand-muted hover:border-brand-magenta hover:text-brand-magenta'}`}>
                    <input 
                      type="radio" 
                      name="experienceLevel" 
                      value={level}
                      checked={profile.experienceLevel === level}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 mt-4">Objetivo Principal</label>
              <select 
                name="goal" 
                value={profile.goal} 
                onChange={handleChange}
                className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono font-bold focus:outline-none focus:border-brand-neon transition-colors"
              >
                <option value="Hipertrofia (Ganho de Massa)">Hipertrofia (Ganho de Massa)</option>
                <option value="Emagrecimento (Perda de Gordura)">Emagrecimento (Perda de Gordura)</option>
                <option value="Resistência / Condicionamento">Resistência / Condicionamento</option>
                <option value="Força">Força (Powerlifting/Strongman)</option>
                <option value="Manutenção">Manutenção de Saúde</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routine & Limitations */}
        <div className="space-y-4 pt-6 border-t-2 border-brand-light/10">
          <h2 className="flex items-center text-2xl font-black uppercase tracking-widest text-brand-neon text-shadow-neon">
            <CalendarDays className="w-6 h-6 mr-3" />
            Rotina
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Dias por semana: <span className="text-brand-neon text-lg ml-2">{profile.daysPerWeek}</span></label>
              <input 
                type="range" 
                name="daysPerWeek" 
                min="1" 
                max="7" 
                value={profile.daysPerWeek} 
                onChange={handleChange}
                className="w-full accent-brand-neon h-3 bg-brand-dark rounded-none border border-brand-neon appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-brand-muted font-mono">
                <span>1 dia</span>
                <span>4 dias</span>
                <span>7 dias</span>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Tempo por Treino (Minutos): <span className="text-brand-neon text-lg ml-2">{profile.timePerWorkout}</span></label>
              <input 
                type="range" 
                name="timePerWorkout" 
                min="20" 
                max="120" 
                step="5"
                value={profile.timePerWorkout} 
                onChange={handleChange}
                className="w-full accent-brand-neon h-3 bg-brand-dark rounded-none border border-brand-neon appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-brand-muted font-mono">
                <span>20m</span>
                <span>120m</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Local de Treino</label>
                <select 
                  name="workoutLocation" 
                  value={profile.workoutLocation} 
                  onChange={handleChange}
                  className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
                >
                  <option value="Academia">Academia</option>
                  <option value="Casa (Com Equipamentos)">Casa (Com Equipamentos)</option>
                  <option value="Casa (Peso Corporal)">Casa (Peso Corporal)</option>
                  <option value="Calistenia/Parque">Calistenia/Parque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Horário Preferido</label>
                <input 
                  type="time" 
                  name="preferredTime" 
                  value={profile.preferredTime || '07:00'} 
                  onChange={handleChange} 
                  className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Foco Secundário (Opcional)</label>
                <input 
                  type="text" 
                  name="secondaryFocus" 
                  value={profile.secondaryFocus} 
                  onChange={handleChange} 
                  placeholder="Ex: Abdômen Trincado, Mobilidade..."
                  className="w-full bg-brand-dark border-2 border-brand-light/20 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-neon transition-colors"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">
                <AlertTriangle className="w-4 h-4 mr-2 text-brand-magenta" />
                Lesões ou Limitações
              </label>
              <textarea 
                name="injuries" 
                value={profile.injuries} 
                onChange={handleChange}
                placeholder="Ex: Dor no ombro direito, hérnia de disco..."
                rows={3}
                className="w-full bg-brand-dark border-2 border-brand-magenta/50 px-4 py-4 text-brand-light font-mono focus:outline-none focus:border-brand-magenta transition-colors resize-none placeholder:text-brand-light/20"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-8">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-neon hover:bg-brand-light text-brand-dark font-display font-black text-4xl uppercase tracking-tighter py-6 border-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group"
          >
            {isLoading ? (
              <>
                <Activity className="w-8 h-8 mr-3 animate-spin text-brand-magenta" />
                Sintetizando...
              </>
            ) : (
              'GERAR TREINO'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
