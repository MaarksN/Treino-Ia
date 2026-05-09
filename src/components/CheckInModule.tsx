import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Navigation, Map } from 'lucide-react';

export function CheckInModule() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [statusMsg, setStatusMsg] = useState('');

  // Recover state if available (for persistency, a real app would use local storage)
  
  useEffect(() => {
    let interval: any;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setElapsedTime(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const handleCheckIn = () => {
    setStatusMsg('Buscando Satélites...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCheckInTime(new Date());
          setIsCheckedIn(true);
          setStatusMsg('');
        },
        (err) => {
          console.error("Location error:", err);
          // Still check in even without location
          setCheckInTime(new Date());
          setIsCheckedIn(true);
          setStatusMsg('GPS falhou. Treino iniciado manual.');
          setTimeout(() => setStatusMsg(''), 4000);
        }
      );
    } else {
      setCheckInTime(new Date());
      setIsCheckedIn(true);
    }
  };

  const handleCheckOut = () => {
    setStatusMsg(`Missão Cumprida em ${elapsedTime}! O pump foi salvo.`);
    setIsCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00:00');
    setTimeout(() => setStatusMsg(''), 5000);
  };

  return (
    <div className="bg-brand-dark border-4 border-brand-neon p-6 md:p-8 shadow-brutal-neon mb-12 relative overflow-hidden group">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 blur-3xl rounded-full group-hover:bg-brand-neon/10 transition-colors pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
        <div className="flex-1">
          <div className="inline-flex items-center text-brand-neon font-mono font-bold uppercase text-xs mb-3 bg-brand-neon/10 px-3 py-1 border border-brand-neon/30">
            <Navigation className="w-3 h-3 mr-2" /> Localização & Cronômetro
          </div>
          <h3 className="font-display font-black text-4xl md:text-5xl uppercase text-brand-light mb-3 tracking-tighter">Check-in de Fibras</h3>
          <p className="text-brand-muted font-mono text-sm max-w-lg mb-4">
            Sua academia é o seu templo. Registre seu local e cronometre o seu massacre diário contra as desculpas.
          </p>
          {statusMsg && <div className="text-brand-magenta font-mono text-xs font-bold bg-brand-magenta/10 px-3 py-2 border-l-2 border-brand-magenta animate-pulse uppercase">{statusMsg}</div>}
        </div>

        <div className="w-full lg:w-auto">
          {isCheckedIn ? (
            <div className="flex flex-col items-center lg:items-end gap-4 p-6 bg-brand-gray border-2 border-brand-neon/50">
              <div className="text-5xl md:text-6xl font-mono font-black text-brand-neon text-shadow-neon tracking-widest">
                {elapsedTime}
              </div>
              
              {location ? (
                <div className="flex items-center text-xs text-brand-light bg-brand-dark px-4 py-2 font-mono uppercase w-full justify-center">
                  <MapPin className="w-4 h-4 mr-2 text-brand-magenta shrink-0" />
                  <span className="truncate">L: {location.lat.toFixed(3)}, L: {location.lng.toFixed(3)}</span>
                </div>
              ) : (
                <div className="flex items-center text-xs text-brand-muted bg-brand-dark px-4 py-2 font-mono uppercase w-full justify-center">
                  <MapPin className="w-4 h-4 mr-2 text-brand-muted shrink-0" /> Local não rastreado
                </div>
              )}
              
              <button 
                onClick={handleCheckOut}
                className="bg-brand-magenta text-brand-light font-black uppercase tracking-widest px-8 py-4 w-full hover:bg-brand-light hover:text-brand-magenta transition-colors border-brutal text-lg flex items-center justify-center animate-bounce-subtle mt-2"
              >
                <CheckCircle className="w-6 h-6 mr-3" /> FAZER CHECK-OUT
              </button>
            </div>
          ) : (
            <button 
              onClick={handleCheckIn}
              className="bg-brand-neon text-brand-dark font-black uppercase text-xl md:text-2xl px-12 py-8 w-full hover:scale-[1.02] transition-transform border-brutal flex flex-col items-center justify-center gap-3 shadow-[8px_8px_0px_var(--color-brand-light)]"
            >
              <Map className="w-10 h-10" />
              INICIAR NA ARENA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
