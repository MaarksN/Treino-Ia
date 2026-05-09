export interface ExerciseLibraryItem {
  name: string;
  videoUrl: string;
  muscleGroup: string;
  aliases?: string[];
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    name: 'Supino Reto',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    muscleGroup: 'Peito',
    aliases: ['supino reto com barra', 'bench press'],
  },
  {
    name: 'Agachamento Livre',
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    muscleGroup: 'Quadríceps',
    aliases: ['agachamento', 'squat'],
  },
  {
    name: 'Puxada Frontal',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    muscleGroup: 'Costas',
    aliases: ['pulldown', 'puxada alta'],
  },
  {
    name: 'Levantamento Terra',
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    muscleGroup: 'Posterior e costas',
    aliases: ['terra', 'deadlift'],
  },
  {
    name: 'Remada Curvada',
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    muscleGroup: 'Costas',
    aliases: ['barbell row', 'remada com barra'],
  },
  {
    name: 'Desenvolvimento Militar',
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    muscleGroup: 'Ombros',
    aliases: ['military press', 'overhead press'],
  },
];

export function findExerciseLibraryEntry(exerciseName: string) {
  const normalized = exerciseName.toLowerCase();

  return EXERCISE_LIBRARY.find(item => {
    const names = [item.name, ...(item.aliases || [])].map(value => value.toLowerCase());
    return names.some(name => normalized.includes(name) || name.includes(normalized));
  });
}
