const MEMORY_KEY = '@TreinoApp:ai-memory';

export interface AiMemoryNote {
  id: string;
  note: string;
  createdAt: string;
}

export function addAiMemory(note: string) {
  const next: AiMemoryNote = {
    id: crypto.randomUUID(),
    note,
    createdAt: new Date().toISOString(),
  };

  const notes = loadAiMemory();
  localStorage.setItem(MEMORY_KEY, JSON.stringify([next, ...notes].slice(0, 200)));
  return next;
}

export function loadAiMemory(): AiMemoryNote[] {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]') as AiMemoryNote[];
  } catch {
    return [];
  }
}
