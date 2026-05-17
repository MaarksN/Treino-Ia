export type Chronotype = 'morning_lark' | 'night_owl' | 'intermediate';

export interface ChronobiologyProfile {
  chronotype: Chronotype;
  optimalWorkoutWindow: string; // e.g., "06:00 - 10:00"
  currentRecommendation: string;
}

// Simplified assessment based on wake up time preference
export const assessChronotype = (preferredWakeUpHour: number): ChronobiologyProfile => {
  if (preferredWakeUpHour < 7) {
    return {
      chronotype: 'morning_lark',
      optimalWorkoutWindow: '06:00 - 10:00',
      currentRecommendation: 'Seu pico de energia costuma ser matutino. Treinos intensos são ideais pela manhã.'
    };
  }

  if (preferredWakeUpHour >= 9) {
    return {
      chronotype: 'night_owl',
      optimalWorkoutWindow: '16:00 - 20:00',
      currentRecommendation: 'Seu pico de energia é vespertino/noturno. Evite treinos muito intensos pouco antes de dormir.'
    };
  }

  return {
    chronotype: 'intermediate',
    optimalWorkoutWindow: '10:00 - 16:00',
    currentRecommendation: 'Seu perfil é intermediário. Flexível, mas final de tarde pode render bem para força.'
  };
};

export const getTimeBasedSuggestion = (profile: ChronobiologyProfile, currentHour: number): string | null => {
  if (profile.chronotype === 'night_owl' && currentHour < 8) {
    return "Treino matutino pode ser mais desafiador para seu cronotipo. Foque no aquecimento.";
  }
  if (profile.chronotype === 'morning_lark' && currentHour > 19) {
    return "Treino noturno pode afetar seu sono. Considere uma intensidade menor.";
  }
  return null;
};
