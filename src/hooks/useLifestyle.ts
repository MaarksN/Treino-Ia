import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  quality: number;
  notes?: string;
}

export function useSleepEntries(days = 7) {
  return useQuery({
    queryKey: ['lifestyle', 'sleep', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(days);

      if (error) throw error;
      return data as SleepEntry[];
    },
  });
}

export function useSaveSleepMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<SleepEntry, 'id'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sleep_entries')
        .upsert([{ ...entry, user_id: session.user.id }], { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle', 'sleep'] });
    },
  });
}
