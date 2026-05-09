import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { askAiCoach } from '../services/aiPersonalizationService';
import { AiCoachMessage, UserProfile, WorkoutPlan, WorkoutSession } from '../types';

interface Props {
  profile: UserProfile;
  plan: WorkoutPlan;
  sessions: WorkoutSession[];
}

export function CoachChat({ profile, plan, sessions }: Props) {
  const [messages, setMessages] = useState<AiCoachMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim() || loading) return;
    const text = question.trim();

    setMessages(prev => [...prev, { role: 'user', text, createdAt: Date.now() }]);
    setQuestion('');
    setLoading(true);

    try {
      const answer = await askAiCoach(text, profile, plan, sessions);
      setMessages(prev => [...prev, { role: 'assistant', text: answer, createdAt: Date.now() }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Não consegui conectar ao Coach IA agora. Verifique a chave Gemini e tente novamente.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light h-full">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-brand-neon" size={18} />
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Coach IA</h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-brand-muted font-mono border-l-2 border-brand-neon/40 pl-3">
            Pergunte sobre carga, técnica, recuperação, substituições ou progressão do treino atual.
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${message.createdAt}-${index}`}
            className={`px-4 py-3 text-sm font-mono border-2 ${
              message.role === 'user'
                ? 'bg-brand-dark border-brand-light/10 text-brand-light ml-8'
                : 'bg-brand-neon/10 border-brand-neon/40 text-brand-light mr-8'
            }`}
          >
            {message.text}
          </div>
        ))}

        {loading && <div className="text-sm text-brand-muted font-mono">Pensando...</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && handleAsk()}
          className="flex-1 bg-brand-dark px-4 py-3 text-sm border-2 border-brand-light/10 text-brand-light outline-none focus:border-brand-neon font-mono min-w-0"
          placeholder="Ex.: devo trocar agachamento por leg press hoje?"
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          aria-label="Enviar pergunta"
          title="Enviar pergunta"
          className="bg-brand-neon text-brand-dark border-brutal px-4 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
