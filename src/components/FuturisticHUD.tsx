import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Moon, Clock, CalendarDays, MapPin } from 'lucide-react';

export function FuturisticHUD() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const mins = time.getMinutes().toString().padStart(2, '0');
  
  // Fake weather based on hour
  const isNight = hours < 6 || hours > 18;
  const WeatherIcon = isNight ? Moon : Sun;
  const weatherTemp = '24°C';

  // Fake short calendar data (last 7 days of workouts)
  const pastDays = [
    { day: 'Seg', trained: true },
    { day: 'Ter', trained: false },
    { day: 'Qua', trained: true },
    { day: 'Qui', trained: true },
    { day: 'Sex', trained: false },
    { day: 'Sáb', trained: true },
    { day: 'Dom', trained: false },
  ];

  return (
    <div className="bg-brand-gray border-2 border-brand-light/20 p-4 md:p-6 mb-12 shadow-brutal-light rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 blur-2xl rounded-full"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Time & Weather */}
        <div className="flex items-center gap-6 border-r-0 md:border-r-2 border-brand-light/10 pr-4">
          <div>
            <div className="flex items-center text-brand-neon font-display text-4xl md:text-5xl font-black text-shadow-neon">
              <Clock className="w-8 h-8 mr-3 opacity-80" />
              {hours.toString().padStart(2, '0')}<span className="animate-pulse">:</span>{mins}
            </div>
            <p className="text-brand-muted font-mono text-xs uppercase tracking-widest mt-1">Sincronização Neural Global</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 border-r-0 md:border-r-2 border-brand-light/10 pr-4">
           <div className="flex items-center text-brand-light font-display text-2xl tracking-widest uppercase">
              <WeatherIcon className="w-6 h-6 mr-3 text-brand-magenta" /> {weatherTemp} Atmosfera
           </div>
           <button 
             onClick={() => window.open('https://maps.google.com/?q=academia+proxima', '_blank')}
             className="flex items-center text-xs font-mono font-bold text-brand-dark bg-brand-magenta px-3 py-1.5 uppercase hover:bg-brand-light transition-colors w-max rounded-full"
           >
             <MapPin className="w-4 h-4 mr-2" /> Rota para a Forja
           </button>
        </div>

        {/* Weekly Streaks (Calendar) */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-brand-light text-sm font-bold uppercase tracking-widest mb-3 font-mono">
            <CalendarDays className="w-4 h-4 mr-2 text-brand-neon" /> Grade de Combate
          </div>
          <div className="flex justify-between gap-1">
            {pastDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${d.trained ? 'bg-brand-neon text-brand-dark border-brand-neon shadow-[0_0_10px_var(--color-brand-neon)]' : 'bg-brand-dark text-brand-muted border-brand-light/20'}`}>
                  {d.trained ? '✓' : ''}
                </div>
                <span className="text-[10px] text-brand-muted mt-1 uppercase font-mono font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
