import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, MessageCircle, Plus, Users } from 'lucide-react';
import { SocialProfile, TrainingGroup, TrainingGroupMessage } from '../types';
import {
  createGroup,
  joinGroupByInvite,
  listGroupMessages,
  listMyGroups,
  sendGroupMessage,
  subscribePresence,
  subscribeToGroupMessages,
} from '../services/socialService';
import { createGroupInviteUrl, timeAgo } from '../utils/socialUtils';
import { ChallengeParty } from './ChallengeParty';
import { LeaderboardPanel } from './LeaderboardPanel';

interface Props {
  currentProfile: SocialProfile | null;
}

export function GroupHub({ currentProfile }: Props) {
  const [groups, setGroups] = useState<TrainingGroup[]>([]);
  const [selected, setSelected] = useState<TrainingGroup | null>(null);
  const [messages, setMessages] = useState<TrainingGroupMessage[]>([]);
  const [message, setMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [status, setStatus] = useState('');

  const inviteUrl = useMemo(() => selected ? createGroupInviteUrl(selected.invite_code) : '', [selected]);

  const loadGroups = useCallback(async () => {
    try {
      const rows = await listMyGroups();
      setGroups(rows);
      setStatus('');
      setSelected(current => current || rows[0] || null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar grupos.');
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selected) return;
    try {
      setMessages(await listGroupMessages(selected.id));
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar mensagens.');
    }
  }, [selected]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selected) return undefined;

    loadMessages();
    const messagesChannel = subscribeToGroupMessages(selected.id, loadMessages);
    let presenceChannel: ReturnType<typeof subscribePresence> | null = null;

    if (currentProfile) {
      presenceChannel = subscribePresence(selected.id, currentProfile);
    }

    return () => {
      messagesChannel.unsubscribe();
      presenceChannel?.unsubscribe();
    };
  }, [currentProfile, loadMessages, selected]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const group = await createGroup({
        name: newGroupName.trim(),
        description: 'Grupo privado de treino',
        isPrivate: true,
      });
      setNewGroupName('');
      await loadGroups();
      setSelected(group);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível criar grupo.');
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    try {
      await joinGroupByInvite(inviteCode.trim());
      setInviteCode('');
      await loadGroups();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível entrar no grupo.');
    }
  };

  const send = async () => {
    if (!selected || !message.trim()) return;

    try {
      await sendGroupMessage(selected.id, message.trim());
      setMessage('');
      await loadMessages();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível enviar mensagem.');
    }
  };

  return (
    <section className="grid lg:grid-cols-[320px_1fr] gap-5">
      <aside className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Users className="text-brand-neon" />
          Grupos
        </h2>

        {status && <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">{status}</p>}

        <div className="mt-5 space-y-3">
          <input
            value={newGroupName}
            onChange={event => setNewGroupName(event.target.value)}
            placeholder="Nome do novo grupo"
            className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />

          <button type="button" onClick={handleCreateGroup} className="w-full bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center justify-center gap-2">
            <Plus size={16} />
            Criar grupo
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={inviteCode}
            onChange={event => setInviteCode(event.target.value)}
            placeholder="Código de convite"
            className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />

          <button type="button" onClick={handleJoin} className="w-full bg-white/10 text-white rounded-xl px-4 py-3 font-bold">
            Entrar por convite
          </button>
        </div>

        <div className="mt-6 space-y-2">
          {groups.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelected(group)}
              className={`w-full text-left rounded-2xl p-4 border ${
                selected?.id === group.id ? 'bg-brand-neon/10 border-brand-neon/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="font-bold text-white">{group.name}</p>
              <p className="text-xs text-brand-muted">{group.description}</p>
            </button>
          ))}
        </div>
      </aside>

      <main className="space-y-5">
        <div className="bg-brand-gray rounded-3xl border border-white/10 p-5 min-h-[560px]">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{selected.name}</h3>
                  <p className="text-sm text-brand-muted">{selected.description}</p>
                  <p className="text-xs text-brand-neon mt-1">Presença online ativa via Realtime</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(inviteUrl)}
                  className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copiar convite
                </button>
              </div>

              <div className="space-y-3 max-h-[390px] overflow-y-auto">
                {messages.map(row => (
                  <div key={row.id} className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs text-brand-muted">
                      @{row.author?.username ?? 'atleta'} · {timeAgo(row.created_at)}
                    </p>
                    <p className="text-white">{row.body}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-sm text-brand-muted">Nenhuma mensagem ainda.</p>}
              </div>

              <div className="flex gap-2 mt-5">
                <input
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  placeholder="Mensagem para o grupo..."
                  className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none min-w-0"
                />

                <button type="button" onClick={send} className="bg-brand-neon text-brand-dark rounded-xl px-5 font-black flex items-center gap-2">
                  <MessageCircle size={16} />
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-brand-muted">
              Crie ou selecione um grupo para começar.
            </div>
          )}
        </div>

        {selected && (
          <div className="grid xl:grid-cols-2 gap-5">
            <LeaderboardPanel groupId={selected.id} />
            <ChallengeParty groupId={selected.id} />
          </div>
        )}
      </main>
    </section>
  );
}
