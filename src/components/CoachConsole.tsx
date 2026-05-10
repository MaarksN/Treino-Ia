import React, { useEffect, useState } from 'react';
import { ClipboardList, NotebookPen, Send, Users } from 'lucide-react';
import { CoachStudent } from '../types';
import { assignWorkoutToStudent, createCoachNote, listCoachStudents } from '../services/socialService';

export function CoachConsole() {
  const [students, setStudents] = useState<CoachStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [note, setNote] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('Treino da Semana');
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      const rows = await listCoachStudents();
      setStudents(rows);
      setStatus('');
      if (!selectedStudentId && rows[0]) setSelectedStudentId(rows[0].student.id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar alunos.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveNote = async () => {
    if (!selectedStudentId || !note.trim()) return;

    try {
      await createCoachNote(selectedStudentId, note.trim());
      setNote('');
      setStatus('Nota privada salva.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível salvar a nota.');
    }
  };

  const assignWorkout = async () => {
    if (!selectedStudentId) return;

    try {
      await assignWorkoutToStudent({
        studentId: selectedStudentId,
        title: assignmentTitle,
        workout: {
          source: 'coach_console',
          assignedAt: new Date().toISOString(),
          blocks: [
            { name: 'Aquecimento', exercises: ['mobilidade geral', 'ativação'] },
            { name: 'Treino principal', exercises: ['supino', 'remada', 'agachamento'] },
          ],
        },
      });
      setStatus('Treino atribuído ao aluno.');
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
                {row.student.current_streak}d streak · {row.student.total_workouts} treinos
              </p>
            </button>
          ))}
          {students.length === 0 && <p className="text-sm text-brand-muted">Nenhum aluno ativo encontrado.</p>}
        </div>
      </aside>

      <main className="bg-brand-gray rounded-3xl border border-white/10 p-5">
        <h2 className="text-2xl font-black text-white mb-2">Dashboard do Coach</h2>
        <p className="text-brand-muted mb-4">
          Acompanhe alunos, registre notas privadas e atribua treinos diretamente.
        </p>
        {status && <p className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">{status}</p>}

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-brand-muted">Alunos ativos</p>
            <strong className="text-2xl text-white">{students.length}</strong>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-brand-muted">Maior streak</p>
            <strong className="text-2xl text-white">{Math.max(0, ...students.map(item => item.student.current_streak))}d</strong>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-brand-muted">Volume total</p>
            <strong className="text-2xl text-white">
              {students.reduce((sum, item) => sum + Number(item.student.total_volume), 0)}kg
            </strong>
          </div>
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
              placeholder="Ex.: aluno relatou desconforto no joelho; reduzir volume de quadríceps."
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white min-h-32 outline-none"
            />

            <button type="button" onClick={saveNote} className="mt-3 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black">
              Salvar nota
            </button>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <ClipboardList className="text-brand-neon" />
              Atribuir treino
            </h3>

            <input
              value={assignmentTitle}
              onChange={event => setAssignmentTitle(event.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            />

            <button type="button" onClick={assignWorkout} className="mt-3 bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2">
              <Send size={16} />
              Enviar treino
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}
