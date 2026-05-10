import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    throw new Error('Usuário não autenticado no Supabase.');
  }

  return data.user.id;
}
