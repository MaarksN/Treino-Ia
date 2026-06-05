import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function createMissingSupabaseClient(): SupabaseClient<Database> {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY antes de usar recursos de rede.',
        );
      },
    },
  ) as SupabaseClient<Database>;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createMissingSupabaseClient();

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    throw new Error('Usuário não autenticado no Supabase.');
  }

  return data.user.id;
}
