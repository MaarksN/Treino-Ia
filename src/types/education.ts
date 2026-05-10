export interface EducationExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  executionTips: string[];
  commonMistakes: string[];
  substitutes: string[];
}

export interface FitnessGlossaryTerm {
  term: string;
  definition: string;
  example: string;
}

export interface ScientificReference {
  title: string;
  topic: string;
  doi: string;
}
