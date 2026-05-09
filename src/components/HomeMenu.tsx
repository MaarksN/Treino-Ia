import React, { useState } from 'react';
import { User } from '../types';
import { Wand2, UploadCloud, Bell, BellRing, Activity, Trophy, Timer, Zap } from 'lucide-react';

interface Props {
  user: User;
  onCreateNew: () => void;
  onImport: () => void;
  onUpdateUser: (user: User) => void;
}

export function HomeMenu({ user, onCreateNew, onImport, onUpdateUser }: Props) {
  const [notiMessage, setNotiMessage] = useState('');

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setNotiMessage("Seu navegador não suporta notificações.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        onUpdateUser({ ...user, notificationsEnabled: true });
        setNotiMessage("Lembretes ativados!");
        new Notification("Treino Inteligente", { body: "Você será lembrado dos seus treinos!" });
      } else {
        setNotiMessage("Permissão negada.");
      }
    } catch (e) {
      setNotiMessage("Erro ao ativar.");
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-8">
      
      <div className="bg-brand-gray border-4 border-brand-light shadow-[8px_8px_0px_var(--color-brand-light)] p-8 md:p-12 text-center mb-12 relative overflow-hidden group hover:border-brand-neon transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 blur-3xl rounded-full group-hover:bg-brand-neon/15 transition-colors pointer-events-none"></div>
        <h1 className="font-display font-black text-7xl md:text-9xl tracking-tighter uppercase mb-4 text-brand-light relative z-10 transition-transform text-shadow-neon">
          E aí, <span className="text-brand-neon bg-brand-dark px-4 py-2 border-2 border-brand-neon inline-block mt-2 md:mt-0 shadow-brutal-neon">{user.name.split(' ')[0]}</span>!
        </h1>
        <p className="text-brand-magenta font-mono font-bold text-xl md:text-2xl relative z-10 uppercase tracking-widest mt-6">O que vamos destruir hoje?</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-brand-dark border-2 border-brand-neon p-6 text-center hover:bg-brand-neon/5 transition-colors cursor-default">
          <Activity className="w-8 h-8 text-brand-neon mx-auto mb-3 opacity-80" />
          <h4 className="text-brand-light font-display text-4xl font-black">12</h4>
          <p className="text-[10px] text-brand-muted uppercase font-mono tracking-widest mt-1">Treinos</p>
        </div>
        <div className="bg-brand-dark border-2 border-brand-magenta p-6 text-center hover:bg-brand-magenta/5 transition-colors cursor-default">
          <Timer className="w-8 h-8 text-brand-magenta mx-auto mb-3 opacity-80" />
          <h4 className="text-brand-light font-display text-4xl font-black">14<span className="text-xl">h</span></h4>
          <p className="text-[10px] text-brand-muted uppercase font-mono tracking-widest mt-1">Tempo na Forja</p>
        </div>
        <div className="bg-brand-dark border-2 border-brand-light p-6 text-center hover:bg-brand-light/5 transition-colors cursor-default">
          <Zap className="w-8 h-8 text-brand-light mx-auto mb-3 opacity-80" />
          <h4 className="text-brand-light font-display text-4xl font-black">2.5<span className="text-xl">k</span></h4>
          <p className="text-[10px] text-brand-muted uppercase font-mono tracking-widest mt-1">Kcal Queimadas</p>
        </div>
        <div className="bg-brand-dark border-2 border-brand-neon p-6 text-center bg-brand-neon/5 hover:bg-brand-neon/10 transition-colors cursor-default">
          <Trophy className="w-8 h-8 text-brand-neon mx-auto mb-3 opacity-80" />
          <h4 className="text-brand-light font-display text-4xl font-black">+5<span className="text-xl">%</span></h4>
          <p className="text-[10px] text-brand-muted uppercase font-mono tracking-widest mt-1">Evolução de Cargas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <button 
          onClick={onCreateNew}
          className="bg-brand-dark border-4 border-brand-neon hover:bg-brand-neon group transition-all p-10 flex flex-col items-center justify-center shadow-[6px_6px_0px_var(--color-brand-neon)] hover:scale-[1.02]"
        >
          <div className="w-24 h-24 bg-brand-neon text-brand-dark flex items-center justify-center mb-6 border-brutal group-hover:bg-brand-dark group-hover:text-brand-neon transition-colors shadow-brutal-light group-hover:shadow-brutal-neon">
            <Wand2 className="w-12 h-12" />
          </div>
          <h2 className="font-display font-black text-5xl uppercase tracking-tighter mb-3 text-brand-light group-hover:text-brand-dark transition-colors text-shadow-neon group-hover:text-shadow-none">Criar com IA</h2>
          <p className="text-brand-muted font-mono text-sm px-4 text-center group-hover:text-brand-dark/80 transition-colors">Faça uma avaliação. Deixe o algoritmo esculpir uma rotina insana perfeitamente para você.</p>
        </button>

        <button 
          onClick={onImport}
          className="bg-brand-dark border-4 border-brand-magenta hover:bg-brand-magenta group transition-all p-10 flex flex-col items-center justify-center shadow-[6px_6px_0px_var(--color-brand-magenta)] hover:scale-[1.02]"
        >
          <div className="w-24 h-24 bg-brand-magenta text-brand-light flex items-center justify-center mb-6 border-brutal group-hover:bg-brand-dark group-hover:text-brand-magenta transition-colors shadow-brutal-light group-hover:shadow-brutal-magenta">
            <UploadCloud className="w-12 h-12" />
          </div>
          <h2 className="font-display font-black text-5xl uppercase tracking-tighter mb-3 text-brand-light group-hover:text-brand-dark transition-colors text-shadow-neon group-hover:text-shadow-none">Importar Treino</h2>
          <p className="text-brand-muted font-mono text-sm px-4 text-center group-hover:text-brand-dark/80 transition-colors">Envie uma foto da sua ficha atual. O sistema traduz e otimiza instantaneamente.</p>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-brand-dark border-4 border-brand-light shadow-[6px_6px_0px_var(--color-brand-light)]">
        <div className="text-center md:text-left mb-6 md:mb-0 max-w-sm">
          <h3 className="font-display font-black text-3xl uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start text-brand-light">
            <Bell className="w-8 h-8 mr-3 text-brand-neon" /> Lembretes Sádicos
          </h3>
          <p className="text-brand-muted font-mono text-sm">Receba notificações implacáveis para nunca pular os dias de perna.</p>
          {notiMessage && <p className="text-xs text-brand-magenta font-mono font-bold mt-4 bg-brand-magenta/10 p-2 inline-block animate-pulse">{notiMessage}</p>}
        </div>
        
        {user.notificationsEnabled ? (
          <div className="flex items-center text-brand-dark bg-brand-neon font-black uppercase text-xl px-8 py-5 border-brutal">
            <BellRing className="w-8 h-8 mr-4" />
            Ativadas
          </div>
        ) : (
          <button 
            onClick={enableNotifications}
            className="px-8 py-5 bg-brand-light text-brand-dark border-brutal hover:bg-brand-neon transition-all hover:scale-105 font-black uppercase tracking-widest text-xl shadow-brutal-light"
          >
            Ativar Agora
          </button>
        )}
      </div>
    </div>
  );
}
