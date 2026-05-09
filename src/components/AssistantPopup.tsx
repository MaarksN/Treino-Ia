import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Lightbulb, Zap, X, BrainCircuit, Activity } from 'lucide-react';

const MESSAGES = [
  { icon: Droplet, title: 'HIDRATAÇÃO SISTÊMICA', text: '💧 Você bebeu água na última hora? Seus músculos precisam de H2O para sintetizar proteína. Beba agora.', color: 'text-brand-light', border: 'border-brand-light' },
  { icon: BrainCircuit, title: 'UPGRADE NEURAL', text: '🧠 Você sabia? A fase excêntrica (descida) causa mais microlesões musculares que a concêntrica. Controle a descida.', color: 'text-brand-magenta', border: 'border-brand-magenta' },
  { icon: Zap, title: 'NOVO HÁBITO', text: '⚡ Tente adicionar 5 minutos de mobilidade antes do treino. Articulações lubrificadas igualam a mais carga e menos lesões.', color: 'text-brand-neon', border: 'border-brand-neon' },
  { icon: Droplet, title: 'STATUS DE FLUIDOS', text: '🌊 Beba 500ml de água 2 horas antes de esmagar seus músculos para garantir um pump máximo e resistência.', color: 'text-brand-light', border: 'border-brand-light' },
  { icon: Activity, title: 'HACK DE RECUPERAÇÃO', text: '🔋 Dormir menos de 7 horas reduz sua síntese proteica. O sono é onde seus músculos crescem, não na academia.', color: 'text-brand-magenta', border: 'border-brand-magenta' },
];

export function AssistantPopup() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState<number | null>(null);

  useEffect(() => {
    const showRandomMessage = () => {
      const idx = Math.floor(Math.random() * MESSAGES.length);
      setCurrentMsgIndex(idx);
      
      // Hide after 10 seconds
      setTimeout(() => {
        setCurrentMsgIndex(null);
      }, 10000);
    };

    // Show first message quickly
    const initialTimer = setTimeout(showRandomMessage, 4000);
    
    // Then show messages every 45 seconds
    const interval = setInterval(showRandomMessage, 45000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentMsgIndex !== null && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
          className={`fixed bottom-6 right-6 max-w-xs w-[90%] md:w-full bg-brand-dark/90 backdrop-blur-md border border-r-4 ${MESSAGES[currentMsgIndex].border} p-4 shadow-brutal-neon z-[9999] clip-path-cyber`}
        >
          <button 
            onClick={() => setCurrentMsgIndex(null)}
            className="absolute top-2 right-2 text-brand-muted hover:text-brand-neon transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start mt-2">
            <div className={`mr-3 ${MESSAGES[currentMsgIndex].color}`}>
              {React.createElement(MESSAGES[currentMsgIndex].icon, { className: "w-6 h-6" })}
            </div>
            <div>
              <h4 className={`font-display font-black tracking-widest uppercase mb-1 ${MESSAGES[currentMsgIndex].color} text-lg`}>
                {MESSAGES[currentMsgIndex].title}
              </h4>
              <p className="text-xs font-mono text-brand-light leading-relaxed">
                {MESSAGES[currentMsgIndex].text}
              </p>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-neon to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-magenta to-transparent opacity-50"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
