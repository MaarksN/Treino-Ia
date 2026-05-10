import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { generateGeminiContent } from '../services/geminiProxyClient';

interface Props {
  user: User;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AICoachChat({ user, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Fala, ${user.name.split(' ')[0]}! Aqui é a Inteligência Artificial Supremo. No meio do treino e bateu dúvida? Manda aqui. Como posso esmagar sua incerteza hoje? 💀` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMsg }] });

      const systemInstruction = "Você é o Coach Supremo IA. Você dá respostas curtas, diretas, ríspidas (mas engraçadas e motivacionais) sobre treino. Fale como um treinador old-school cibernético. Não de discursos longos. Aja rápido. Sempre termine com uma dica de ouro brutal e um emoji.";

      const response = await generateGeminiContent({
        model: "gemini-2.5-pro",
        contents,
        config: { systemInstruction }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Tive uma falha no sistema neural. Tente de novo! 🤖' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-4 right-4 w-80 md:w-96 shadow-brutal-neon border-2 border-brand-neon bg-brand-dark z-50 flex flex-col clip-path-cyber"
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        <div className="bg-brand-neon text-brand-dark p-3 flex justify-between items-center px-4 shrink-0">
          <div className="flex items-center font-black font-display tracking-widest uppercase">
            <Bot className="w-5 h-5 mr-2" /> IA Coach
          </div>
          <button onClick={onClose} className="hover:text-brand-light transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 text-sm font-mono flex items-start border-2 ${m.role === 'user' ? 'bg-brand-gray border-brand-light/20 text-brand-light' : 'bg-brand-neon/10 border-brand-neon text-brand-light'}`}>
                {m.role === 'model' && <Bot className="w-4 h-4 mr-2 shrink-0 border border-brand-neon rounded bg-brand-dark p-0.5" />}
                <p className="leading-relaxed">{m.text}</p>
                {m.role === 'user' && <UserIcon className="w-4 h-4 ml-2 shrink-0 text-brand-muted" />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="p-3 text-sm font-mono border-2 bg-brand-neon/10 border-brand-neon text-brand-light flex items-center">
                 <Bot className="w-4 h-4 mr-2 shrink-0" />
                 <div className="flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-brand-neon rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-brand-neon rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-brand-neon rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t-2 border-brand-light/10 flex shrink-0">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Dúvida sobre o treino..."
            className="flex-1 bg-brand-gray border-2 border-brand-light/20 focus:border-brand-neon text-brand-light px-3 py-2 text-sm font-mono outline-none transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="ml-2 bg-brand-neon text-brand-dark p-2 border-brutal transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
