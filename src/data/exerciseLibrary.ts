export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
  tags: string[];
  videoUrl?: string;
  isCustom?: boolean;
  aliases?: string[];
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: 'e001', name: 'Supino Reto com Barra', muscleGroup: 'Peito', movementPattern: 'Empurrar Horizontal', tags: ['peito', 'tríceps', 'ombro', 'barra'], videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', aliases: ['supino reto', 'bench press'] },
  { id: 'e002', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito Superior', movementPattern: 'Empurrar Inclinado', tags: ['peito', 'tríceps', 'halter'], aliases: ['supino inclinado'] },
  { id: 'e003', name: 'Agachamento Livre', muscleGroup: 'Quadríceps', movementPattern: 'Squat', tags: ['pernas', 'glúteo', 'barra'], videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8', aliases: ['agachamento', 'squat'] },
  { id: 'e004', name: 'Leg Press 45°', muscleGroup: 'Quadríceps', movementPattern: 'Squat Machine', tags: ['pernas', 'máquina'], aliases: ['leg press'] },
  { id: 'e005', name: 'Levantamento Terra', muscleGroup: 'Posterior', movementPattern: 'Hinge', tags: ['costas', 'glúteo', 'barra'], videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q', aliases: ['terra', 'deadlift'] },
  { id: 'e006', name: 'Puxada Frontal na Polia', muscleGroup: 'Costas', movementPattern: 'Puxar Vertical', tags: ['costas', 'bíceps', 'polia'], videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', aliases: ['puxada frontal', 'puxada alta', 'pulldown'] },
  { id: 'e007', name: 'Remada Curvada com Barra', muscleGroup: 'Costas', movementPattern: 'Puxar Horizontal', tags: ['costas', 'bíceps', 'barra'], videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', aliases: ['remada curvada', 'barbell row'] },
  { id: 'e008', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', movementPattern: 'Empurrar Vertical', tags: ['ombro', 'tríceps', 'halter'], aliases: ['desenvolvimento militar', 'overhead press'] },
  { id: 'e009', name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps', movementPattern: 'Flexão de Cotovelo', tags: ['bíceps', 'barra'] },
  { id: 'e010', name: 'Tríceps Testa com Barra EZ', muscleGroup: 'Tríceps', movementPattern: 'Extensão de Cotovelo', tags: ['tríceps', 'barra EZ'] },
  { id: 'e011', name: 'Stiff com Halteres', muscleGroup: 'Posterior de Coxa', movementPattern: 'Hinge', tags: ['pernas', 'glúteo', 'posterior', 'halter'] },
  { id: 'e012', name: 'Hip Thrust com Barra', muscleGroup: 'Glúteo', movementPattern: 'Extensão de Quadril', tags: ['glúteo', 'posterior', 'barra'] },
  { id: 'e013', name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', movementPattern: 'Flexão Plantar', tags: ['panturrilha'] },
  { id: 'e014', name: 'Prancha Frontal', muscleGroup: 'Core', movementPattern: 'Anti-extensão', tags: ['core', 'abdômen', 'peso corporal'] },
  { id: 'e015', name: 'Flexão de Braço', muscleGroup: 'Peito', movementPattern: 'Empurrar Horizontal', tags: ['peito', 'peso corporal', 'sem equipamento'] },
  { id: 'e016', name: 'Barra Fixa (Pull-up)', muscleGroup: 'Costas', movementPattern: 'Puxar Vertical', tags: ['costas', 'bíceps', 'peso corporal'] },
  { id: 'e017', name: 'Dip em Paralelas', muscleGroup: 'Tríceps', movementPattern: 'Empurrar Vertical', tags: ['tríceps', 'peito', 'peso corporal'] },
  { id: 'e018', name: 'Agachamento Búlgaro', muscleGroup: 'Quadríceps', movementPattern: 'Squat Unilateral', tags: ['pernas', 'unilateral', 'halter'] },
  { id: 'e019', name: 'Voador Peitoral na Máquina', muscleGroup: 'Peito', movementPattern: 'Adução Horizontal', tags: ['peito', 'máquina'] },
  { id: 'e020', name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros', movementPattern: 'Abdução de Ombro', tags: ['ombro', 'halter'] },
  { id: 'e021', name: 'Remada Unilateral com Halter', muscleGroup: 'Costas', movementPattern: 'Puxar Horizontal', tags: ['costas', 'unilateral', 'halter'] },
  { id: 'e022', name: 'Crucifixo com Halteres', muscleGroup: 'Peito', movementPattern: 'Adução Horizontal', tags: ['peito', 'halter'] },
  { id: 'e023', name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', movementPattern: 'Extensão de Joelho', tags: ['pernas', 'máquina'] },
  { id: 'e024', name: 'Mesa Flexora', muscleGroup: 'Posterior de Coxa', movementPattern: 'Flexão de Joelho', tags: ['pernas', 'posterior', 'máquina'] },
  { id: 'e025', name: 'Rosca Concentrada', muscleGroup: 'Bíceps', movementPattern: 'Flexão de Cotovelo', tags: ['bíceps', 'halter', 'isolado'] },
];

const FAVS_KEY = '@TreinoApp:favExercises';
const CUSTOM_KEY = '@TreinoApp:customExercises';

export function searchExercises(query: string, library: LibraryExercise[]) {
  const normalized = query.toLowerCase();
  return library.filter(exercise =>
    exercise.name.toLowerCase().includes(normalized) ||
    exercise.muscleGroup.toLowerCase().includes(normalized) ||
    exercise.movementPattern.toLowerCase().includes(normalized) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(normalized)) ||
    exercise.aliases?.some(alias => alias.toLowerCase().includes(normalized))
  );
}

export function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(exerciseId: string) {
  const favs = loadFavorites();
  const index = favs.indexOf(exerciseId);
  if (index === -1) favs.push(exerciseId);
  else favs.splice(index, 1);
  localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  return favs;
}

export function loadCustomExercises(): LibraryExercise[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomExercise(exercise: Omit<LibraryExercise, 'id'>) {
  const list = loadCustomExercises();
  const newExercise: LibraryExercise = { ...exercise, id: crypto.randomUUID(), isCustom: true };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify([...list, newExercise]));
  return newExercise;
}

export function getExerciseLibrary() {
  return [...EXERCISE_LIBRARY, ...loadCustomExercises()];
}

export function findExerciseLibraryEntry(exerciseName: string) {
  const normalized = exerciseName.toLowerCase();

  return getExerciseLibrary().find(item => {
    const names = [item.name, ...(item.aliases || [])].map(value => value.toLowerCase());
    return names.some(name => normalized.includes(name) || name.includes(normalized));
  });
}
