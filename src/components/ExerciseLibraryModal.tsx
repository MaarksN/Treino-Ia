import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Star, X } from 'lucide-react';
import { LibraryExercise } from '../data/exerciseLibrary';
import {
  createCustomExercise,
  filterExerciseLibrary,
  loadExerciseLibraryState,
  toggleExerciseFavorite,
} from '../services/exerciseLibraryService';
import { DataMode } from '../types/trainingExecution';

const MUSCLE_GROUPS = ['Todos', 'Peito', 'Peito Superior', 'Costas', 'Quadríceps', 'Posterior de Coxa', 'Ombros', 'Bíceps', 'Tríceps', 'Glúteo', 'Core', 'Panturrilha'];
const MOVEMENT_PATTERNS = ['Todos', 'Empurrar Horizontal', 'Empurrar Vertical', 'Puxar Vertical', 'Puxar Horizontal', 'Squat', 'Hinge', 'Core', 'Extensão de Joelho', 'Flexão de Cotovelo'];

interface Props {
  onClose: () => void;
}

export function ExerciseLibraryModal({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [patternFilter, setPatternFilter] = useState('Todos');
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [allExercises, setAllExercises] = useState<LibraryExercise[]>([]);
  const [dataMode, setDataMode] = useState<DataMode>('mock_dev_only');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', movementPattern: '', tags: '', videoUrl: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadExerciseLibraryState()
      .then(state => {
        if (!mounted) return;
        setAllExercises(state.exercises);
        setFavIds(state.favoriteIds);
        setDataMode(state.dataMode);
        setStatus(state.warning || '');
        setError('');
      })
      .catch(() => {
        if (!mounted) return;
        setError('Não foi possível carregar a biblioteca de exercícios.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return filterExerciseLibrary(allExercises, query, muscleFilter, patternFilter, showFavsOnly, favIds);
  }, [allExercises, favIds, muscleFilter, patternFilter, query, showFavsOnly]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const result = await toggleExerciseFavorite(id, favIds);
      setFavIds(result.favoriteIds);
      setDataMode(result.dataMode);
      setStatus(result.dataMode === 'mock_dev_only' ? 'Favorito salvo em dataMode: "mock_dev_only".' : 'Favorito sincronizado.');
    } catch {
      setError('Não foi possível atualizar o favorito.');
    }
  };

  const handleSaveCustom = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createCustomExercise({
        name: newExercise.name.trim(),
        muscleGroup: newExercise.muscleGroup.trim() || 'Custom',
        movementPattern: newExercise.movementPattern.trim() || 'Livre',
        tags: newExercise.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        videoUrl: newExercise.videoUrl.trim() || undefined,
      });
      setAllExercises(current => [...current, result.exercise]);
      setDataMode(result.dataMode);
      setStatus(result.warning || `Exercício criado em ${result.dataMode}.`);
      setShowCustomForm(false);
      setNewExercise({ name: '', muscleGroup: '', movementPattern: '', tags: '', videoUrl: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o exercício.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end md:items-center justify-center p-4">
      <div className="bg-brand-gray border-2 border-brand-light/10 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-brutal-neon">
        <div className="flex items-center justify-between p-5 border-b-2 border-brand-light/10">
          <h2 className="font-display text-3xl uppercase tracking-widest text-brand-light">Biblioteca de Exercícios</h2>
          <button type="button" onClick={onClose} className="p-2 bg-brand-dark border-2 border-brand-light/10 text-brand-light hover:text-brand-neon">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b-2 border-brand-light/10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${dataMode === 'supabase' ? 'text-brand-neon' : 'text-yellow-400'}`}>
              dataMode: "{dataMode}"
            </span>
            {status && <span className="text-[10px] text-brand-muted font-mono">{status}</span>}
          </div>

          <div className="flex items-center gap-2 bg-brand-dark border-2 border-brand-light/10 px-4 py-2">
            <Search size={16} className="text-brand-muted" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar exercício, músculo ou tag..."
              className="flex-1 bg-transparent text-brand-light outline-none text-sm font-mono min-w-0"
            />
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {MUSCLE_GROUPS.map(group => (
              <button
                key={group}
                type="button"
                onClick={() => setMuscleFilter(group)}
                className={`px-3 py-1 text-xs border-2 transition-all ${muscleFilter === group ? 'border-brand-neon text-brand-neon bg-brand-neon/10' : 'border-brand-light/10 text-brand-muted'}`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 flex-wrap">
            {MOVEMENT_PATTERNS.map(pattern => (
              <button
                key={pattern}
                type="button"
                onClick={() => setPatternFilter(pattern)}
                className={`px-3 py-1 text-xs border-2 transition-all ${patternFilter === pattern ? 'border-brand-magenta text-brand-magenta bg-brand-magenta/10' : 'border-brand-light/10 text-brand-muted'}`}
              >
                {pattern}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setShowFavsOnly(value => !value)}
              className={`flex items-center gap-1 text-xs px-3 py-1 border-2 transition-all ${showFavsOnly ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-brand-light/10 text-brand-muted'}`}
            >
              <Star size={12} /> Favoritos
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm(value => !value)}
              className="flex items-center gap-1 text-xs px-3 py-1 border-2 border-brand-light/10 text-brand-muted hover:border-brand-neon hover:text-brand-neon transition-all"
            >
              <Plus size={12} /> Criar exercício
            </button>
          </div>
        </div>

        {showCustomForm && (
          <div className="p-4 border-b-2 border-brand-light/10 bg-brand-dark/50 space-y-3">
            <p className="text-sm font-bold text-brand-light uppercase">Novo exercício</p>
            <input placeholder="Nome" value={newExercise.name} onChange={event => setNewExercise(value => ({ ...value, name: event.target.value }))} className="w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="Grupo muscular" value={newExercise.muscleGroup} onChange={event => setNewExercise(value => ({ ...value, muscleGroup: event.target.value }))} className="w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="Padrão de movimento" value={newExercise.movementPattern} onChange={event => setNewExercise(value => ({ ...value, movementPattern: event.target.value }))} className="w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="Tags (vírgula separado)" value={newExercise.tags} onChange={event => setNewExercise(value => ({ ...value, tags: event.target.value }))} className="w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <input placeholder="URL de vídeo (YouTube/Vimeo)" value={newExercise.videoUrl} onChange={event => setNewExercise(value => ({ ...value, videoUrl: event.target.value }))} className="w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon" />
            <button type="button" onClick={handleSaveCustom} disabled={saving} className="bg-brand-neon text-brand-dark px-5 py-2 border-brutal font-bold text-sm uppercase disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {error && (
            <div className="text-center text-brand-magenta py-6 font-mono text-sm">{error}</div>
          )}

          {loading && (
            <div className="text-center text-brand-muted py-10 font-mono">Carregando biblioteca...</div>
          )}

          {!loading && filtered.map(exercise => (
            <div key={exercise.id} className="flex items-center justify-between gap-3 p-3 border-2 border-brand-light/10 bg-brand-dark hover:border-brand-neon/40 transition-all">
              <div className="min-w-0">
                <p className="text-brand-light font-semibold text-sm">{exercise.name}</p>
                <p className="text-brand-muted text-xs mt-0.5">{exercise.muscleGroup} · {exercise.movementPattern}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {exercise.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[10px] text-brand-light/40 border border-brand-light/10 px-2 py-0.5">{tag}</span>
                  ))}
                  {exercise.isCustom && <span className="text-[10px] text-brand-neon border border-brand-neon/30 px-2 py-0.5">custom</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {exercise.videoUrl && (
                  <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-neon text-xs hover:underline">vídeo</a>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(exercise.id)}
                  className={`p-2 transition-all ${favIds.includes(exercise.id) ? 'text-yellow-400' : 'text-brand-muted hover:text-yellow-400'}`}
                  title={favIds.includes(exercise.id) ? 'Remover favorito' : 'Favoritar'}
                >
                  <Star size={15} fill={favIds.includes(exercise.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="text-center text-brand-muted py-10 font-mono">Nenhum exercício encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
