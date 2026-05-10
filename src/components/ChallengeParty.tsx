import React, { useEffect, useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import { GroupChallenge } from '../types';
import { createGroupChallenge, listGroupChallenges } from '../services/socialService';

interface Props {
  groupId: string;
}

export function ChallengeParty({ groupId }: Props) {
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [name, setName] = useState('20 treinos no mês');
  const [target, setTarget] = useState(20);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setChallenges(await listGroupChallenges(groupId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar desafios.');
    }
  };

  useEffect(() => {
    load();
  }, [groupId]);

  const create = async () => {
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 86400000);

    try {
      await createGroupChallenge({
        groupId,
        name,
        description: 'Complete a meta coletiva com seus amigos.',
        target,
        metric: 'workouts',
        startsAt: now.toISOString().slice(0, 10),
        endsAt: end.toISOString().slice(0, 10),
        badgeReward: 'Badge Grupo Imparável',
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar desafio.');
    }
  };

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-5">
        <Flag className="text-brand-neon" />
        Desafios em Grupo
      </h2>

      {error && <p className="mb-3 text-sm text-yellow-300">{error}</p>}

      <div className="grid md:grid-cols-[1fr_140px_auto] gap-3 mb-5">
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        />

        <input
          type="number"
          value={target}
          onChange={event => setTarget(Number(event.target.value))}
          className="bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        />

        <button type="button" onClick={create} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2">
          <Plus size={16} />
          Criar
        </button>
      </div>

      <div className="space-y-3">
        {challenges.map(challenge => (
          <div key={challenge.id} className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white">{challenge.name}</p>
                <p className="text-sm text-brand-muted">{challenge.description}</p>
              </div>

              <div className="text-right">
                <p className="text-brand-neon font-black">{challenge.target}</p>
                <p className="text-xs text-brand-muted">{challenge.metric}</p>
              </div>
            </div>

            <p className="text-xs text-white/50 mt-3">
              {challenge.starts_at} até {challenge.ends_at} · recompensa: {challenge.badge_reward ?? 'sem badge'}
            </p>
          </div>
        ))}
        {challenges.length === 0 && <p className="text-sm text-brand-muted">Nenhum desafio coletivo criado ainda.</p>}
      </div>
    </section>
  );
}
