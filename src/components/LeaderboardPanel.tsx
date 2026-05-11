import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Weight } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { listGroupLeaderboard } from '../services/socialService';
import { formatSocialNumber } from '../utils/socialUtils';

interface Props {
  groupId: string;
}

export function LeaderboardPanel({ groupId }: Props) {
  const [metric, setMetric] = useState<'volume' | 'streak' | 'workouts'>('volume');
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listGroupLeaderboard(groupId, metric)
      .then(data => {
        setRows(data);
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Não foi possível carregar o ranking.'))
      .finally(() => setLoading(false));
  }, [groupId, metric]);

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Trophy className="text-brand-neon" />
          Ranking do Grupo
        </h2>

        <select
          value={metric}
          onChange={event => setMetric(event.target.value as typeof metric)}
          className="bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
        >
          <option value="volume">Volume semanal</option>
          <option value="streak">Streak</option>
          <option value="workouts">Treinos</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-yellow-300">{error}</p>}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.user_id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-neon/10 text-brand-neon flex items-center justify-center font-black">
                #{index + 1}
              </div>

              <div>
                <p className="font-bold text-white">{row.display_name}</p>
                <p className="text-xs text-brand-muted">@{row.username}</p>
              </div>
            </div>

            <div className="text-right">
              {metric === 'volume' && (
                <p className="font-black text-white flex items-center gap-1">
                  <Weight size={16} /> {formatSocialNumber(Number(row.total_volume))}kg
                </p>
              )}
              {metric === 'streak' && (
                <p className="font-black text-white flex items-center gap-1">
                  <Flame size={16} /> {row.current_streak}d
                </p>
              )}
              {metric === 'workouts' && <p className="font-black text-white">{row.total_workouts} treinos</p>}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-brand-muted">Carregando ranking...</p>}
        {!loading && rows.length === 0 && !error && <p className="text-sm text-brand-muted">Ranking ainda vazio.</p>}
      </div>
    </section>
  );
}
