import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, NotebookPen, Send, UserPlus, Users } from 'lucide-react';
import { CoachPrivateNote, CoachStudent, CoachWorkoutAssignment, WorkoutPlan } from '../types';
import {
  addCoachStudentByUsername,
  assignWorkoutToStudent,
  createCoachNote,
  listCoachAssignments,
  listCoachNotes,
  listCoachStudents,
} from '../services/socialService';

interface Props {
  canInteract: boolean;
  onAuthRequired: () => void;
  currentPlan?: WorkoutPlan | null;
}

export function CoachConsole({ canInteract, onAuthRequired, currentPlan = null }: Props) {
  const [students, setStudents] = useState<CoachStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [notes, setNotes] = useState<CoachPrivateNote[]>([]);
  const [assignments, setAssignments] = useState<CoachWorkoutAssignment[]>([]);
  const [studentUsername, setStudentUsername] = useState('');
  const [note, setNote] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState(currentPlan?.planName || 'Treino da Semana');
  const [assignmentJson, setAssignmentJson] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedStudent = useMemo(
    () => students.find(row => row.student.id === selectedStudentId),
    [students, selectedStudentId],
  );

  const loadStudents = useCallback(async () => {
    if (!canInteract) return;
    setLoading(true);
    try {
      const rows = await listCoachStudents();
      setStudents(rows);
      setStatus('');
      setSelectedStudentId(current => current || rows[0]?.student.id || '');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar alunos.');
    } finally {
      setLoading(false);
    }
  }, [canInteract]);

  const loadStudentDetails = useCallback(async (studentId: string) => {
    if (!studentId || !canInteract) return;
    try {
      const [nextNotes, nextAssignments] = await Promise.all([
        listCoachNotes(studentId),
        listCoachAssignments(studentId),
      ]);
      setNotes(nextNotes);
      setAssignments(nextAssignments);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar histórico do aluno.');
    }
  }, [canInteract]);

  useEffect(() => {
    if (currentPlan) {
      setAssignmentTitle(currentPlan.planName);
    }
  }, [currentPlan]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadStudentDetails(selectedStudentId);
  }, [loadStudentDetails, selectedStudentId]);

  const requireInteraction = () => {
    if (canInteract) return true;
    onAuthRequired();
    setStatus('Entre e crie um perfil social para operar alunos.');
    return false;
  };

  const addStudent = async () => {
    if (!requireInteraction() || !studentUsername.trim()) return;
    setLoading(true);
    try {
      await addCoachStudentByUsername(studentUsername.trim());
      setStudentUsername('');
      setStatus('Aluno vinculado ao painel.');
      await loadStudents();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível vincular aluno.');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!requireInteraction() || !selectedStudentId || !note.trim()) return;
    try {
      await createCoachNote(selectedStudentId, note.trim());
      setNote('');
      setStatus('Nota privada salva.');
      await loadStudentDetails(selectedStudentId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível salvar a nota.');
    }
  };

  const getAssignmentPayload = () => {
    if (currentPlan) return currentPlan;
    if (!assignmentJson.trim()) throw new Error('Informe um JSON de treino ou selecione um plano atual.');

    try {
      return JSON.parse(assignmentJson);
    } catch {
      throw new Error('JSON do treino inválido.');
    }
  };

  const assignWorkout = async () => {
    if (!requireInteraction() || !selectedStudentId) return;

    try {
      await assignWorkoutToStudent({
        studentId: selectedStudentId,
        title: assignmentTitle,
        workout: getAssignmentPayload(),
      });
      setStatus('Treino atribuído ao aluno.');
      setAssignmentJson('');
      await loadStudentDetails(selectedStudentId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível atribuir o treino.');
    }
  };

  return (
    <section className="grid lg:grid-cols-[320px_1fr] gap-5">
      <aside className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h2 className="text-xl font-black text-white flex items-center gap-2 mb-5">
          <Users className="text-brand-neon" />
          Alunos
        </h2>

        <div className="flex gap-2 mb-5">
          <input
            value={studentUsername}
            onChange={event => setStudentUsername(event.target.value)}
            placeholder="username do aluno"
            className="min-w-0 flex-1 bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
          />
          <button
            type="button"
            onClick={addStudent}
            disabled={loading}
            className="bg-brand-neon text-brand-dark rounded-xl px-3 font-black disabled:opacity-50"
            aria-label="Adicionar aluno"
            title="Adicionar aluno"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
          </button>
        </div>

        <div className="space-y-2">
          {students.map(row => (
            <button
              key={row.student.id}
              type="button"
              onClick={() => setSelectedStudentId(row.student.id)}
              className={`w-full text-left rounded-2xl p-4 border ${
                selectedStudentId === row.student.id ? 'bg-brand-neon/10 border-brand-neon/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="font-bold text-white">{row.student.display_name}</p>
              <p className="text-xs text-brand-muted">
                @{row.student.username} · {row.student.current_streak}d · {row.student.total_workouts} treinos
              </p>
            </button>
          ))}
          {students.length === 0 && <p className="text-sm text-brand-muted">Nenhum aluno ativo encontrado.</p>}
        </div>
      </aside>

      <main className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h2 className="text-2xl font-black text-white mb-2">Painel do Coach</h2>
        <p className="text-brand-muted mb-4">
          {selectedStudent ? `Aluno selecionado: ${selectedStudent.student.display_name}` : 'Selecione um aluno para operar.'}
        </p>
        {status && <p className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">{status}</p>}

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <Summary label="Alunos ativos" value={students.length} />
          <Summary label="Notas privadas" value={notes.length} />
          <Summary label="Treinos atribuídos" value={assignments.length} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white/5 p-5">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <NotebookPen className="text-brand-neon" />
              Nota privada
            </h3>

            <textarea
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder="Observação clínica, adesão, dor, rotina ou ajuste de treino."
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white min-h-32 outline-none"
            />

            <button type="button" onClick={saveNote} className="mt-3 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
              Salvar nota
            </button>

            <div className="mt-4 space-y-2 max-h-44 overflow-y-auto">
              {notes.map(item => (
                <div key={item.id} className="rounded-xl bg-brand-dark border border-white/10 p-3">
                  <p className="text-sm text-white">{item.note}</p>
                  <p className="text-xs text-brand-muted mt-1">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <ClipboardList className="text-brand-neon" />
              Atribuir treino
            </h3>

            <input
              value={assignmentTitle}
              onChange={event => setAssignmentTitle(event.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none mb-3"
            />

            {!currentPlan && (
              <textarea
                value={assignmentJson}
                onChange={event => setAssignmentJson(event.target.value)}
                placeholder='{"days":[...]}'
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white min-h-32 outline-none mb-3 font-mono text-sm"
              />
            )}

            {currentPlan && (
              <p className="mb-3 rounded-xl border border-brand-neon/20 bg-brand-neon/10 p-3 text-sm text-brand-neon">
                O plano atual será enviado: {currentPlan.planName}
              </p>
            )}

            <button type="button" onClick={assignWorkout} className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2">
              <Send size={16} />
              Enviar treino
            </button>

            <div className="mt-4 space-y-2 max-h-44 overflow-y-auto">
              {assignments.map(item => (
                <div key={item.id} className="rounded-xl bg-brand-dark border border-white/10 p-3">
                  <p className="text-sm text-white font-bold">{item.title}</p>
                  <p className="text-xs text-brand-muted">{item.status} · {new Date(item.created_at).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs text-brand-muted">{label}</p>
      <strong className="text-2xl text-white">{value}</strong>
    </div>
  );
}
