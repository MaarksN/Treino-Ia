import { EXERCISE_LIBRARY, LibraryExercise, searchExercises } from '../data/exerciseLibrary';
import { CustomExerciseInput, ExerciseLibraryState } from '../types/trainingExecution';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const FAVS_KEY = '@TreinoApp:favExercises:mock_dev_only';
const CUSTOM_KEY = '@TreinoApp:customExercises:mock_dev_only';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function loadDevFavorites(): string[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAVS_KEY) || '[]');
  } catch {
    return [];
  }
}

function loadDevCustomExercises(): LibraryExercise[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDevCustomExercise(input: CustomExerciseInput): LibraryExercise {
  const exercise: LibraryExercise = {
    id: crypto.randomUUID(),
    name: input.name,
    muscleGroup: input.muscleGroup,
    movementPattern: input.movementPattern,
    tags: input.tags,
    videoUrl: input.videoUrl,
    isCustom: true,
  };
  if (!canUseStorage()) return exercise;

  const current = loadDevCustomExercises();
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify([...current, exercise]));
  return exercise;
}

function validateCustomExercise(input: CustomExerciseInput) {
  if (!input.name.trim()) throw new Error('Informe o nome do exercício.');
  if (input.name.trim().length < 3) throw new Error('O nome precisa ter ao menos 3 caracteres.');
  if (input.name.length > 80) throw new Error('O nome deve ter até 80 caracteres.');
  if (input.videoUrl && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(input.videoUrl)) {
    throw new Error('Use uma URL de vídeo segura do YouTube ou Vimeo.');
  }
}

async function getAuthUserId() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

export async function loadExerciseLibraryState(): Promise<ExerciseLibraryState> {
  const userId = await getAuthUserId();
  if (!userId) {
    return {
      dataMode: 'mock_dev_only',
      exercises: [...EXERCISE_LIBRARY, ...loadDevCustomExercises()],
      favoriteIds: loadDevFavorites(),
      warning: 'Supabase não está configurado ou o usuário não está autenticado; favoritos e customizados ficam só neste navegador.',
    };
  }

  const [{ data: custom, error: customError }, { data: favorites, error: favoritesError }] = await Promise.all([
    supabase.from('exercise_library_custom').select('*').order('created_at', { ascending: false }),
    supabase.from('exercise_favorites').select('exercise_id'),
  ]);

  if (customError) throw new Error(`Falha ao carregar exercícios customizados: ${customError.message}`);
  if (favoritesError) throw new Error(`Falha ao carregar favoritos: ${favoritesError.message}`);

  const customExercises: LibraryExercise[] = (custom || []).map(row => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    movementPattern: row.movement_pattern,
    tags: row.tags || [],
    videoUrl: row.video_url || undefined,
    isCustom: true,
  }));

  return {
    dataMode: 'supabase',
    exercises: [...EXERCISE_LIBRARY, ...customExercises],
    favoriteIds: (favorites || []).map(row => row.exercise_id),
  };
}

export async function toggleExerciseFavorite(exerciseId: string, currentFavoriteIds: string[]) {
  const userId = await getAuthUserId();
  const isFavorite = currentFavoriteIds.includes(exerciseId);

  if (!userId) {
    const next = isFavorite
      ? currentFavoriteIds.filter(id => id !== exerciseId)
      : [...currentFavoriteIds, exerciseId];
    if (canUseStorage()) window.localStorage.setItem(FAVS_KEY, JSON.stringify(next));
    return { dataMode: 'mock_dev_only' as const, favoriteIds: next };
  }

  if (isFavorite) {
    const { error } = await supabase.from('exercise_favorites').delete().eq('user_id', userId).eq('exercise_id', exerciseId);
    if (error) throw new Error(`Falha ao remover favorito: ${error.message}`);
    return { dataMode: 'supabase' as const, favoriteIds: currentFavoriteIds.filter(id => id !== exerciseId) };
  }

  const { error } = await supabase.from('exercise_favorites').insert({ user_id: userId, exercise_id: exerciseId });
  if (error) throw new Error(`Falha ao favoritar exercício: ${error.message}`);
  return { dataMode: 'supabase' as const, favoriteIds: [...currentFavoriteIds, exerciseId] };
}

export async function createCustomExercise(input: CustomExerciseInput) {
  const clean: CustomExerciseInput = {
    name: input.name.trim(),
    muscleGroup: input.muscleGroup.trim() || 'Custom',
    movementPattern: input.movementPattern.trim() || 'Livre',
    tags: input.tags.map(tag => tag.trim().toLowerCase()).filter(Boolean).slice(0, 12),
    videoUrl: input.videoUrl?.trim() || undefined,
  };
  validateCustomExercise(clean);

  const userId = await getAuthUserId();
  if (!userId) {
    return {
      dataMode: 'mock_dev_only' as const,
      exercise: saveDevCustomExercise(clean),
      warning: 'Exercício salvo em modo mock_dev_only porque não há sessão Supabase.',
    };
  }

  const { data, error } = await supabase
    .from('exercise_library_custom')
    .insert({
      user_id: userId,
      name: clean.name,
      muscle_group: clean.muscleGroup,
      movement_pattern: clean.movementPattern,
      tags: clean.tags,
      video_url: clean.videoUrl,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Falha ao criar exercício: ${error.message}`);

  return {
    dataMode: 'supabase' as const,
    exercise: {
      id: data.id,
      name: data.name,
      muscleGroup: data.muscle_group,
      movementPattern: data.movement_pattern,
      tags: data.tags || [],
      videoUrl: data.video_url || undefined,
      isCustom: true,
    } satisfies LibraryExercise,
  };
}

export function filterExerciseLibrary(
  exercises: LibraryExercise[],
  query: string,
  muscleFilter: string,
  patternFilter: string,
  showFavsOnly: boolean,
  favoriteIds: string[],
) {
  let list = query.length > 1 ? searchExercises(query, exercises) : exercises;
  if (muscleFilter !== 'Todos') list = list.filter(exercise => exercise.muscleGroup === muscleFilter);
  if (patternFilter !== 'Todos') list = list.filter(exercise => exercise.movementPattern === patternFilter);
  if (showFavsOnly) list = list.filter(exercise => favoriteIds.includes(exercise.id));
  return list;
}
