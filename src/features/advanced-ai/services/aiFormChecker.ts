export interface AIFormCheckerResult {
  isAvailable: boolean;
  score: number;
  feedback: string[];
  blockedReason?: string;
}

export function evaluateFormSafely(videoData: unknown): AIFormCheckerResult {
  // Foundation adapter: MediaPipe/WASM is not yet initialized in the environment.
  // This acts as a safe feature guard.
  return {
    isAvailable: false,
    score: 0,
    feedback: [],
    blockedReason: 'blocked_external_dependency',
  };
}
