import React, { useEffect, useRef, useState } from 'react';
import { Bot, Mic, Send, User } from 'lucide-react';
import { CoachMessage, UserProfile, WorkoutPlan } from '../types';
import { sendCoachMessage } from '../services/aiCoachService';

const COACH_KEY = '@TreinoApp:coachHistory';

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type SpeechRecognitionLike = {
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  start: () => void;
};

function loadHistory(): CoachMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(COACH_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const QUICK_QUESTIONS = [
  'Como progredir mais rápido?',
  'Quantas proteínas preciso?',
  'Como evitar overtraining?',
  'Vale a pena fazer cardio?',
  'Como melhorar meu sono?',
  'O que comer pré-treino?',
];

interface Props {
  profile: UserProfile;
  currentPlan: WorkoutPlan | null;
  streak: number;
}

export function AICoach({ profile, currentPlan, streak }: Props) {
  const [messages, setMessages] = useState<CoachMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const persist = (nextMessages: CoachMessage[]) => {
    localStorage.setItem(COACH_KEY, JSON.stringify(nextMessages.slice(-40)));
  };

  const send = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await sendCoachMessage(text, messages, profile, currentPlan, streak);
      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: 'coach',
        content: response,
        timestamp: Date.now(),
      };
      const final = [...updated, coachMsg];
      setMessages(final);
      persist(final);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não consegui falar com o coach agora.';
      setError(message);
      persist(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta voz para texto.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(COACH_KEY);
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl flex flex-col min-h-[520px] h-[min(600px,80vh)]">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-neon/20 border border-brand-neon/40 flex items-center justify-center">
            <Bot size={20} className="text-brand-neon" />
          </div>
          <div>
            <p className="text-white font-bold">APEX Coach</p>
            <p className="text-brand-muted text-xs">IA especializada em treino</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse" />
          <span className="text-brand-neon text-xs">Online</span>
          <button type="button" onClick={clearHistory} className="text-brand-muted text-xs hover:text-white ml-3">
            Limpar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={48} className="text-brand-muted mx-auto mb-3" />
            <p className="text-white font-bold mb-1">Olá! Sou o APEX Coach.</p>
            <p className="text-brand-muted text-sm mb-4">Especialista em treino, periodização e performance. Pergunte qualquer coisa.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_QUESTIONS.map(question => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="px-3 py-1.5 rounded-full text-xs bg-brand-neon/10 border border-brand-neon/30 text-brand-neon hover:bg-brand-neon/20 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
              message.role === 'coach' ? 'bg-brand-neon/20 border border-brand-neon/40' : 'bg-white/10 border border-white/20'
            }`}
            >
              {message.role === 'coach' ? <Bot size={16} className="text-brand-neon" /> : <User size={16} className="text-white" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-brand-neon text-brand-dark font-semibold rounded-tr-sm'
                : 'bg-brand-dark border border-white/10 text-white/90 rounded-tl-sm'
            }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-neon/20 border border-brand-neon/40 flex items-center justify-center">
              <Bot size={16} className="text-brand-neon" />
            </div>
            <div className="bg-brand-dark border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(index => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-brand-neon"
                    style={{ animation: `bounce 1.2s ${index * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-brand-dark border border-white/10 rounded-xl px-4 py-2 focus-within:border-brand-neon/50 transition-all">
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Pergunte ao seu coach..."
            className="flex-1 bg-transparent text-white text-sm outline-none min-w-0"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleVoice}
            className={`p-1.5 rounded-lg transition-all ${listening ? 'text-red-400 animate-pulse' : 'text-brand-muted hover:text-white'}`}
            aria-label="Usar voz"
            title="Usar voz"
          >
            <Mic size={16} />
          </button>
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-brand-neon text-brand-dark disabled:opacity-30 transition-all"
            aria-label="Enviar"
            title="Enviar"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
