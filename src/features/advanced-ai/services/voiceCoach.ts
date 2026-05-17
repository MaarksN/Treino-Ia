export interface VoiceCoachOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function speakSafely(options: VoiceCoachOptions): void {
  // Safe adapter for TTS/Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = options.lang || 'pt-BR';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed, falling back to text only', e);
    }
  } else {
    console.warn('Speech synthesis not supported in this environment');
  }
}
