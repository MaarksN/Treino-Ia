import { ensureSafeDataMode } from '../utils/dataMode';
import { supabase } from './supabaseClient';

const MEMORY_KEY = '@TreinoApp:ai-memory';

export interface AiMemoryNote {
  id: string;
  note: string;
  createdAt: string;
  dataMode?: 'supabase' | 'mock_dev_only';
}

export interface AiMemoryLoadResult {
  data: AiMemoryNote[];
  dataMode: 'supabase' | 'mock_dev_only';
  warning?: string;
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

export async function loadAiMemoryCloud(): Promise<AiMemoryLoadResult> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session?.user) {
    return {
      data: loadAiMemory().map(note => ({ ...note, dataMode: ensureSafeDataMode('mock_dev_only') })),
      dataMode: ensureSafeDataMode('mock_dev_only'),
      warning: 'Memoria local apenas para desenvolvimento. Faca login para memoria real de 6 meses.',
    };
  }

  const { data, error } = await supabase
    .from('ai_long_term_memory')
    .select('id, content, created_at')
    .eq('user_id', sessionData.session.user.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return {
      data: loadAiMemory().map(note => ({ ...note, dataMode: ensureSafeDataMode('mock_dev_only') })),
      dataMode: ensureSafeDataMode('mock_dev_only'),
      warning: `Supabase indisponivel para memoria de IA: ${error.message}`,
    };
  }

  return {
    data: (data ?? []).map(row => ({
      id: row.id as string,
      note: row.content as string,
      createdAt: row.created_at as string,
      dataMode: 'supabase',
    })),
    dataMode: 'supabase',
  };
}

export async function addAiMemoryCloud(note: string): Promise<AiMemoryLoadResult> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session?.user) {
    addAiMemory(note);
    return loadAiMemoryCloud();
  }

  const { error } = await supabase
    .from('ai_long_term_memory')
    .insert({
      user_id: sessionData.session.user.id,
      memory_type: 'coach_note',
      content: note,
      source: 'user',
      confidence: 0.9,
    });

  if (error) {
    addAiMemory(note);
    return {
      data: loadAiMemory().map(item => ({ ...item, dataMode: ensureSafeDataMode('mock_dev_only') })),
      dataMode: ensureSafeDataMode('mock_dev_only'),
      warning: `Memoria salva localmente porque Supabase falhou: ${error.message}`,
    };
  }

  return loadAiMemoryCloud();
}
