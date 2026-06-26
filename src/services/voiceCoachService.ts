/**
 * Item 53 — Voice Coach Service
 * Uses Web Speech API for hands-free guidance.
 */

export const voiceCoachService = {
  speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  },

  announceExercise(name: string, sets: number, reps: string) {
    this.speak(`Próximo exercício: ${name}. Objetivo: ${sets} séries de ${reps} repetições.`);
  },

  announceRestEnd() {
    this.speak('Descanso concluído. Prepare-se para a próxima série.');
  }
};
