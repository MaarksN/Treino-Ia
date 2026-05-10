export interface AdaptiveExercise {
  limitation: string;
  muscle: string;
  replacement: string;
  cue: string;
}

export const ADAPTIVE_EXERCISES: AdaptiveExercise[] = [
  {
    limitation: 'cadeirante',
    muscle: 'Peito',
    replacement: 'Supino com halteres em banco acessivel',
    cue: 'Estabilize escapulas e use amplitude confortavel.',
  },
  {
    limitation: 'ombro sensivel',
    muscle: 'Ombros',
    replacement: 'Elevacao lateral parcial com cabo',
    cue: 'Mantenha polegar levemente acima e sem dor.',
  },
  {
    limitation: 'joelho sensivel',
    muscle: 'Quadriceps',
    replacement: 'Leg press com amplitude reduzida',
    cue: 'Controle a descida e evite colapso do joelho.',
  },
  {
    limitation: 'sem equipamento',
    muscle: 'Costas',
    replacement: 'Remada invertida em mesa firme',
    cue: 'Puxe cotovelos para tras e mantenha tronco rigido.',
  },
];
