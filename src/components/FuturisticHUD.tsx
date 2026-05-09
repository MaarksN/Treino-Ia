import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Moon, Clock, CalendarDays, MapPin, Zap, ShieldAlert, BadgeCheck } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
}

export function FuturisticHUD({ user }: Props) {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const mins = time.getMinutes().toString().padStart(2, '0');
  
  const isNight = hours < 6 || hours > 18;
  const WeatherIcon = isNight ? Moon : Sun;
  const weatherTemp = '24°C';

  const g = user.gamification || { xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, badges: [] };

  return (
    <div className="bg-brand-gray border-2 border-brand-light/20 p-4 md:p-6 mb-12 shadow-brutal-light rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 blur-2xl rounded-full"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 w-full items-center">
        
        {/* Time & Weather */}
        <div className="flex items-center gap-6 border-r-0 md:border-r-2 border-brand-light/10 pr-4">
          <div>
            <div className="flex items-center text-brand-neon font-display text-4xl font-black text-shadow-neon">
              <Clock className="w-6 h-6 mr-3 opacity-80" />
              {hours.toString().padStart(2, '0')}<span className="animate-pulse">:</span>{mins}
            </div>
            <p className="text-brand-muted font-mono text-[10px] uppercase tracking-widest mt-1">Sincronização Neural Global</p>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex flex-col justify-center border-r-0 md:border-r-2 border-brand-light/10 pr-4">
           <div className="flex items-center text-brand-light font-display text-2xl tracking-widest uppercase mb-1">
              <Zap className="w-5 h-5 mr-2 text-brand-neon" /> Lvl {g.level}
           </div>
           <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-brand-light/10 mb-1">
              <div className="h-full bg-brand-neon" style={{ width: `${(g.xp % 1000) / 10}%` }}></div>
           </div>
           <p className="text-[10px] font-mono text-brand-muted uppercase text-right w-full">{g.xp} XP Totais</p>
        </div>

        <div className="flex flex-col justify-center border-r-0 md:border-r-2 border-brand-light/10 pr-4">
           <div className="flex items-center text-brand-magenta font-display text-3xl font-black tracking-widest uppercase mb-1">
              <ShieldAlert className="w-6 h-6 mr-2" /> Streak: {g.currentStreak}
           </div>
           <p className="text-xs font-mono text-brand-light uppercase">🔥 Máx: {g.longestStreak}</p>
        </div>

        {/* Action / Badges */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-brand-light text-sm font-bold uppercase tracking-widest mb-3 font-mono">
            <BadgeCheck className="w-4 h-4 mr-2 text-brand-neon" /> Conquistas
          </div>
          <div className="flex gap-2">
            {g.badges && g.badges.length > 0 ? g.badges.slice(0, 3).map((b, i) => (
               <div key={i} className="w-10 h-10 rounded-full bg-brand-neon/20 border border-brand-neon flex items-center justify-center text-brand-neon font-bold text-xs" title={b}>
                 🏆
               </div>
            )) : (
               <span className="text-xs text-brand-muted uppercase font-mono">Destrua treinos para ganhar emblemas</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
